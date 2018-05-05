const Promise = require('bluebird');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
// NOTE: I could switch to tokens and bearer auth instead of cookies.
// That mainly gains decoupling from web browsers as clients.
const sessions = require('client-sessions');
const userController = require('../user/user.controller');

// https://gist.github.com/yoitsro/8693021/b43fd1c8ee79a9b3bcc0701bc07b84c4fc809c07

/**
 * Connect up passport and sessions to the server
 * @param {Server} server restify server
 */
function initAuth(server) {
    server.use(sessions({
        cookieName: 'session', // cookie name dictates the key name added to the request object - NOTE: *only works if it is 'session'*
        secret: environment.session.secret, // should be a large unguessable string
        duration: environment.session.timeout, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 1, // re-up the cookie duration if a request is made within 1 minute of expiration,
        cookie: {
            path: '/', // cookie will only be sent to requests under '/api'
            ephemeral: false, // when true, cookie expires when the browser closes
            httpOnly: false, // when true, cookie is not accessible from javascript
            secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
        }
    }));

    server.use(passport.initialize());
    server.use(passport.session());

    // This is how a user gets serialized to a session cookie
    passport.serializeUser(function(user, next) {
        next(null, user._id); // this is what gets saved to the session cookie
    });

    // This is how a user gets deserialized when a session cookie is sent
    passport.deserializeUser(function(id, next) {
        // Look the user up in the database and return the user object
        userController
            .findUsers(id, 'username status')
            .then((foundUser) => {
                // User not found
                if (!foundUser) {
                    return next(new restifyErrors.UnauthorizedError(err), false);
                }

                // Promise.resolve here fixes "Warning: a promise was created in a handler but was not returned from it"
                return Promise.resolve(next(null, foundUser));
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // user local username/password authentication
    passport.use(new PassportLocalStrategy({session: true}, userController.verifyLogin));
}

module.exports = initAuth;
