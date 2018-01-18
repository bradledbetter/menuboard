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
     * @return {Promise} resolved with the user data, rejected on error
     */
    findUsers(id) {
        const promise = new Promise();
        if (id && typeof id === 'string' && id !== '') {
            UserModel.findOne({_id: id})
                .then((user) => {
                    promise.resolve(user);
                }, (err) => {
                    promise.reject(new restifyErrors.InternalServerError(err));
                });
        } else {
            UserModel.find({status: 'active'})
                .then((users) => {
                    promise.resolve(user);
                }, (err) => {
                    promise.reject(new restifyErrors.InternalServerError(err));
                });
        }

        return promise;
    }

    /**
     * Create a new user.
     * @param {string} username new username
     * @param {string} password new password
     * @return {Promise} resolved on success, rejected on errors
     */
    createUser(username, password) {
        const promise = new Promise();
        // expect a username and password
        if (!username || !password) {
            promise.reject(new resstifyErrors.ForbiddenError('Missing parameter(s).'));
        } else {
            // password validation
            UserModel.validatePassword(password, function(err, isValid) {
                if (err) {
                    promise.reject(new restifyErrors.ForbiddenError(err)); // NOTE: I might want to handle this differently. Not sure, yet.
                }

                // simple test for email, since there's no more perfect validation than an email loop.
                if (username.match(/@{1}/) === null) {
                    promise.reject(new restifyErrors.ForbiddenError('Username must be a valid email'));
                }

                crypto.randomBytes(32, (err, buf) => {
                    if (err) {
                        logger.error('Could not create random bytes: ', err);
                        return next(new restifyErrors.InternalServerError(err));
                    }
                    const code = buf.toString('hex');

                    UserModel.create({
                        username: username,
                        passwordHash: password, // our schema pre(save) handler will hash it
                        status: 'created',
                        verifyCode: code
                    })
                        .then((result) => {
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
                                to: username,
                                subject: 'MenuBoard - Verify your email address',
                                text: 'Follow the link below to verify your email address: \n' + verifyLink,
                                html: 'Follow the link below to verify your email address: <br><a href=\'' + verifyLink + '\'>' + verifyLink + '</a>'
                            };

                            transporter.sendMail(mailOptions, function(err, info) {
                                if (err) {
                                    logger.error('Error sending account verification email: ' + util.inspect(err));
                                    promise.reject(new restifyErrors.InternalServerError('Could not send verification email'));
                                }

                                logger.info('Sent account verification email: ' + util.inspect(info));
                                promise.resolve('Success');
                            });
                        }, (err) => {
                            promise.reject(new restifyErrors.InternalServerError(err));
                        });
                });
            });
        }

        return promise;
    }

    /**
     * Check a verify code and activate a user if it matches.
     * @param {string} code the verify code from when the user was created
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    verifyUser(code) {
        const promise = new Promise();
        if (!code || typeof code != 'string' || code === '') {
            promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
        } else {
            // find the user by code
            UserModel.findOne({verifyCode: code})
                .then((foundUser) => {
                    // activate the user
                    foundUser.status = 'active';
                    foundUser.save()
                        .then((result) => {
                            promise.resolve('Verified');
                        }, (err) => {
                            promise.reject(new restifyErrors.ForbiddenError(err));
                        });
                }, (err) => {
                    promise.reject(new restifyErrors.ForbiddenError(err));
                });
        }
        return promise;
    }

    /**
     * Used to verify that a username / password combo is connected to a real user
     * @param {*} username a possible user's username
     * @param {*} password a possible user's password
     * @param {*} next a callback to use to verify or reject a user
     */
    static verifyLogin(username, password, next) {
        UserModel.findOne({username: username})
            .then((foundUser) => {
                // User not found
                if (!foundUser) {
                    return next(new restifyErrors.Unauthorized(err), false);
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
