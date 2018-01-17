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
     * Get a single user by their id.
     * @param {string} id the id of the user to find
     * @return {Promise} resolved with the found user
     */
    findById(id) {
        return UserModel.findOne({_id: id});
    }

    /**
     * Get all users whose status == 'active'
     * @return {Promise} resolved with the found user
     */
    findAllActive() {
        return UserModel.find({status: 'active'});
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
            return next(new resstifyErrors.ForbiddenError('Missing parameter(s).'));
        }

        // password validation
        UserModel.validatePassword(password, function(err, isValid) {
            if (err) {
                promise.reject(new restifyErrors.ForbiddenError(err)); // NOTE: I might want to handle this differently. Not sure, yet.
            }

            // simple test for email, since there's no more perfect validation than an email loop.
            if (username.match(/@{1}/) === null) {
                promise.reject(new restifyErrors.ForbiddenError('Username must be a valid email'));
            }

            UserModel.create({
                username: username,
                passwordHash: password, // our schema pre(save) handler will hash it
                status: 'created'
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
                    const verifyLink = 'https://blmenuboard.com/#/verify/' + (encodeURIComponent(new Buffer(username).toString('base64')));
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
                        promise.resolve(result);
                    });
                }, (err) => {
                    promise.reject(new restifyErrors.InternalServerError(err));
                });
        });

        return promise;
    }

    /**
     * Used to verify that a username / password combo is connected to a real user
     * @param {*} username a possible user's username
     * @param {*} password a possible user's password
     * @param {*} next a callback to use to verify or reject a user
     */
    static verifyUser(username, password, next) {
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
