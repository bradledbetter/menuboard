const crypto = require('crypto');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const UserModel = require('./user.model');

/**
 * Controller for users, duh.
 * @class UserController
 */
class UserController {
    /**
     * Get a user or all active users. For use with the GET /user route
     * @param {string?} id (optional) user id
     * @param {string?} fields (optional) fields to select on the users
     * @return {Promise} resolved with the user data, rejected on error
     */
    findUsers(id, fields) {
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
    createUser(username, password) {
        return new Promise((resolve, reject) => {
            // expect a username and password
            if (!username || !password || username === '' || password === '') {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                // password validation
                UserModel.validatePassword(password, (err, isValid) => {
                    if (err) {
                        return reject(new restifyErrors.ForbiddenError('Invalid credentials'));
                    }

                    // simple test for email, since there's no more perfect validation than an email loop.
                    if (username.match(/@{1}/) === null) {
                        return reject(new restifyErrors.ForbiddenError('Invalid credentials'));
                    }

                    crypto.randomBytes(32, (err, buf) => {
                        if (err) {
                            logger.error('Could not create random bytes: ', err);
                            return next(new restifyErrors.InternalServerError(err));
                        }
                        const code = buf.toString('hex');

                        UserModel
                            .create({
                                username: username,
                                passwordHash: password, // our schema pre(save) handler will hash it
                                status: 'created',
                                verifyCode: code
                            })
                            .exec()
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
                                const verifyLink = 'https://menuviz.com/#/verify/' + encodeURIComponent(code);
                                const mailOptions = {
                                    from: 'Brad Ledbetter <brad@thirstynomadbrewing.com>',
                                    to: newUser.username,
                                    subject: 'MenuBoard - Verify your email address',
                                    text: 'Follow the link below to verify your email address: \n' + verifyLink,
                                    html: 'Follow the link below to verify your email address: <br><a href=\'' + verifyLink + '\'>' + verifyLink + '</a>'
                                };

                                transporter.sendMail(mailOptions, (err, info) => {
                                    if (err) {
                                        logger.error('Error sending account verification email: ', err);
                                        return reject(new restifyErrors.InternalServerError('Could not send verification email'));
                                    }

                                    logger.info('Sent account verification email: ', info);
                                    resolve('Success');
                                });
                            }, (err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            })
                            .catch((err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            });
                    });
                });
            }
        });
    }

    /**
     * Update a user.
     * @param {string} userId the id of the user to change
     * @param {object} newUser an object with only the updated fields
     * @return {Promise} resolved on success, rejected on errors
     */
    updateUser(userId, newUser) {
        return new Promise((resolve, reject) => {
            // expect a userId
            if (typeof userId !== 'string' || userId === '') {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                UserModel
                    .findOne({_id: userId})
                    .exec()
                    .then((foundUser) => {
                        // password validation
                        UserModel.validatePassword(newUser.password, (err, isValid) => {
                            if (err) {
                                return reject(new restifyErrors.ForbiddenError());
                            }
                            foundUser.passwordHash = newUser.password;

                            // simple test for email, since there's no more perfect validation than an email loop.
                            if (newUser.username.match(/@{1}/) === null) {
                                return reject(new restifyErrors.ForbiddenError());
                            }
                            foundUser.username = newUser.username;

                            if (['active', 'inactive'].includes(newUser.status)) {
                                foundUser.status = newUser.status;
                            }

                            foundUser.save()
                                .then(() => {
                                    logger.info('Updated user with id: ', userId);
                                    resolve('Success');
                                }, (err) => {
                                    reject(new restifyErrors.InternalServerError(err));
                                })
                                .catch((err) => {
                                    reject(new restifyErrors.InternalServerError(err));
                                });
                        });
                    },
                        (err) => {
                            reject(new restifyErrors.InternalServerError(err));
                        })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Check a verify code and activate a user if it matches.
     * @param {string} code the verify code from when the user was created
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    verifyUser(code) {
        return new Promise((resolve, reject) => {
            if (!code || typeof code != 'string' || code === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                // find the user by code
                UserModel
                    .findOne({verifyCode: code, status: 'created'})
                    .exec()
                    .then((foundUser) => {
                        // activate the user
                        foundUser.status = 'active';
                        foundUser.save()
                            .then((result) => {
                                resolve('Verified');
                            }, (err) => {
                                reject(new restifyErrors.ForbiddenError(err));
                            });
                    }, (err) => {
                        reject(new restifyErrors.ForbiddenError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * "Deletes" a user. Actually just sets status to 'inactive'
     * @param {string} userId the id of the user to delete
     * @return {Promise}  resolved with a message on success, or rejected with an error
     */
    deleteUser(userId) {
        return new Promise((resolve, reject) => {
            if (!userId || typeof userId != 'string' || userId === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                // find the user by id
                UserModel.findOne({_id: userId})
                    .then((foundUser) => {
                        // deactivate the user
                        foundUser.status = 'inactive';
                        foundUser.save()
                            .then((result) => {
                                resolve('Success');
                            }, (err) => {
                                reject(new restifyErrors.ForbiddenError(err));
                            });
                    }, (err) => {
                        reject(new restifyErrors.ForbiddenError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Used to verify that a username / password combo is connected to a real user
     * @param {*} username a possible user's username
     * @param {*} password a possible user's password
     * @param {*} next a callback to use to verify or reject a user
     */
    static verifyLogin(username, password, next) {
        UserModel
            .findOne({username: username})
            .exec()
            .then((foundUser) => {
                // User not found
                if (!foundUser) {
                    return next(new restifyErrors.UnauthorizedError(), false);
                }

                // Check the supplied password
                foundUser.comparePassword(password, (isValid) => {
                    if (!isValid) {
                        logger.info('Invalid password in verifyUser for user id ' + foundUser._id);
                        return next(new restifyErrors.UnauthorizedError, false);
                    }

                    return next(null, foundUser);
                });
            },
                (err) => {
                    return next(new restifyErrors.InternalServerError(err));
                })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }
}

module.exports = UserController;
