const passport = require('passport');
const jwt = require('jsonwebtoken');
const restifyErrors = require('restify-errors');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const logger = require('../services/logger.service');

/**
 * Bind paths to functions that handle them
 * @param {Server} server restify server
 */
module.exports = (server) => {
    // set up the login route
    // https://medium.com/front-end-hacking/learn-using-jwt-with-passport-authentication-9761539c4314
    server.post('/login', function(req, res, next) {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if (err) {
                logger.error(err);
                throw new restifyErrors.UnauthorizedError();
            }

            if (!user) {
                logger.error('Login error: user not found.');
                throw new restifyErrors.UnauthorizedError();
            }

            // pull out only the fields we want to expose with an IEFE
            user = (({_id, username, status}) => ({_id, username, status}))(user);

            req.login(user, {session: false}, (err) => {
                if (err) {
                    logger.error(err);
                    throw new restifyErrors.UnauthorizedError();
                }

                // generate a signed son web token with the contents of user object and return it in the response
                const token = jwt.sign(user, environment.session.secret);
                res.send(200, {user, token});
                next();
            });
        })(req, res);
    });


    // set up the logout route
    server.post('/logout', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        req.logout();
        res.send(200, {success: 'Logged out'});
        return next();
    });
};
