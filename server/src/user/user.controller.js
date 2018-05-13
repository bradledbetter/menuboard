const crypto = require('crypto');
const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const UserModel = require('./user.model');
const UserPasswordModel = require('./user-password.model');
const Promise = require('bluebird');

const cryptoRandomBytes = Promise.promisify(crypto.randomBytes, {context: crypto});

/**
 * Get a user or all active users. For use with the GET /user route
 * @param {string?} id (optional) user id
 * @param {string?} fields (optional) fields to select on the users
 * @return {Promise} resolved with the user data, rejected on error
 */
function findUsers(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = UserModel.findOne({_id: id});
    } else {
        query = UserModel.find({status: 'active'});
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new user.
 * @param {string} username new username
 * @param {string} password new password
 * @return {Promise} resolved on success, rejected on errors
 */
function createUser(username, password) {
    // expect a username and password
    if (!username || !password || username === '' || password === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    // password validation
    return UserPasswordModel.validatePassword(password)
        .then((isMatch) => {
            if (!isMatch) {
                return Promise.reject(new restifyErrors.UnauthorizedError('Invalid login'));
            }

            // simple test for email, since there's no more perfect validation than an email loop.
            if (username.match(/@{1}/) === null) {
                return Promise.reject(new restifyErrors.ForbiddenError('Invalid credentials'));
            }

            return isMatch;
        })
        .then(() => cryptoRandomBytes(32).then((buf) => buf.toString('hex')))
        .catch((err) => {
            logger.error('Could not create random bytes: ', err);
            throw err;
        })
        .then((hexCode) => {
            return UserModel
                .create({
                    username: username,
                    status: 'created',
                    verifyCode: hexCode
                });
        })
        .then((newUser) => {
            // create user-password document, resolve with new user to pass down the chain
            return UserPasswordModel
                .create({
                    userId: newUser._id,
                    passwordHash: password
                })
                .then(() => {
                    return Promise.resolve(newUser);
                });
        })
        .then((newUser) => {
            // send account verification email
            const aws = require('aws-sdk');
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                SES: new aws.SES({
                    region: environment.aws.region,
                    apiVersion: environment.aws.ses.apiVersion,
                    accessKeyId: environment.aws.credentials.accessKeyId,
                    secretAccessKey: environment.aws.credentials.secretAccessKey
                }),
                sendingRate: environment.aws.ses.sendingRate
            });

            // TODO: come up with a better way to do this client domain thing.
            const verifyLink = `https://menuviz.com/#/verify/${encodeURIComponent(newUser.verifyCode)}`;
            const mailOptions = {
                from: 'Brad Ledbetter <brad@thirstynomadbrewing.com>',
                to: newUser.username,
                subject: 'MenuBoard - Verify your email address',
                text: `Follow the link below to verify your email address: \n${verifyLink}`,
                html: `Follow the link below to verify your email address: <br><a href="${verifyLink}">${verifyLink}</a>`
            };

            const transporterSendMail = Promise.promisify(transporter.sendMail, {context: transporter});
            return transporterSendMail(mailOptions)
                .then((info) => {
                    logger.info('Sent account verification email: ', info);
                    return 'Success';
                })
                .catch((err) => {
                    logger.error('Error sending account verification email: ', err);
                    throw new restifyErrors.InternalServerError('Could not send verification email');
                });
        })
        .catch((err) => {
            logger.error('Error creating user:', err);
            throw new restifyErrors.InternalServerError();
        });
}

/**
 * Update a user.
 * NOTE: password cannot be changed with this method.
 * @param {string} userId the id of the user to change
 * @param {object} newUser an object with only the updated fields
 * @return {Promise} resolved on success, rejected on errors
 */
function updateUser(userId, newUser) {
    // expect a userId
    if (typeof userId !== 'string' || userId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    // validate password, then find a user
    return UserModel
        .findOne({_id: userId})
        .then((foundUser) => {
            // simple test for email, since there's no more perfect validation than an email loop.
            if (newUser.username.match(/@{1}/) === null) {
                throw new Error(`User.updateUser: didn't recognize username as an email address: ${newUser.username}`);
            }
            foundUser.username = newUser.username;

            if (['active', 'inactive'].includes(newUser.status)) {
                foundUser.status = newUser.status;
            }

            return foundUser.save();
        })
        .then(() => {
            logger.info('Updated user with id: ', userId);
            return 'Success';
        })
        .catch((err) => {
            logger.warn(`Failed updating user ${err}`);
            throw new restifyErrors.InternalServerError();
        });
}
/**
 * Change a user's password.
 * @param {string} userId the id of the user to change
 * @param {string} newPassword an object with only the updated fields
 * @return {Promise} resolved on success, rejected on errors
 */
function changePassword(userId, newPassword) {
    // expect a userId
    if (isNil(userId) || !(userId instanceof mongoose.Types.ObjectId)) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    // find user, if they exist and are active then validate, then save
    return UserModel
        .findOne({_id: userId})
        .then((newUser) => {
            if (!newUser || newUser.status != 'active') {
                return Promise.reject(new restifyErrors.ForbiddenError());
            }

            return UserPasswordModel.validatePassword(newPassword);
        })
        .then((isMatch) => {
            if (!isMatch) {
                return Promise.reject(new restifyErrors.ForbiddenError('Invalid password.'));
            }

            return UserPasswordModel.findOne({_id: userId});
        })
        .then((foundUserPassword) => {
            foundUserPassword.passwordHash = newPassword;
            return foundUserPassword.save();
        })
        .then(() => {
            logger.info('Updated user with id: ', userId);
            return 'Success';
        })
        .catch((err) => {
            logger.warn(`Failed changing password ${err}`);
            throw new restifyErrors.InternalServerError();
        });
}

/**
 * Check a verify code and activate a user if it matches.
 * @param {string} code the verify code from when the user was created
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function verifyUser(code) {
    if (!code || typeof code != 'string' || code === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // find the user by code
    return UserModel
        .findOne({verifyCode: code, status: 'created'})
        .then((foundUser) => {
            // activate the user
            foundUser.status = 'active';
            return foundUser.save();
        })
        .then((user) => {
            logger.info(`Verified user with id ${user._id}`);
            return 'Verified';
        });
}

/**
 * "Deletes" a user. Actually just sets status to 'inactive'
 * @param {string} userId the id of the user to delete
 * @return {Promise}  resolved with a message on success, or rejected with an error
 */
function deleteUser(userId) {
    if (!userId || typeof userId != 'string' || userId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // find the user by id
    return UserModel
        .findOne({_id: userId})
        .then((foundUser) => {
            // deactivate the user
            foundUser.status = 'inactive';
            return foundUser.save();
        })
        .then((user) => {
            logger.info(`Deactivated user with id ${user._id}`);
            return 'Success';
        });
}

/**
 * Used to verify that a username / password combo is connected to a real user
 * @param {*} username a possible user's username
 * @param {*} password a possible user's password
 * @param {*} next a callback to use to verify or reject a user
 * @return {Promise} included for testing. The callback progresses the route.
 */
function verifyLogin(username, password, next) {
    // NOTE: included return for testing. The callback progresses the route.
    return UserModel
        .findOne({username: username})
        .then((foundUser) => {
            // User not found
            if (!foundUser) {
                throw new Error(`Could not find user with username ${username}`);
            }

            // Check the supplied password
            return foundUser.comparePassword(password);
        })
        .then((foundUser) => {
            return next(null, foundUser);
        })
        .catch((err) => {
            logger.warn(`Could not verify login: ${err}`);
            return next(new restifyErrors.InternalServerError(), false);
        });
}

module.exports = {
    findUsers,
    createUser,
    updateUser,
    changePassword,
    deleteUser,
    verifyUser,
    verifyLogin
};
