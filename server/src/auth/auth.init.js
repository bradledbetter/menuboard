const Promise = require('bluebird');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
// NOTE: I could switch to tokens and bearer auth instead of cookies.
// That mainly gains decoupling from web browsers as clients.
const sessions = require('client-sessions');
const UserController = require('../user/user.controller');

// https://gist.github.com/yoitsro/8693021/b43fd1c8ee79a9b3bcc0701bc07b84c4fc809c07

/**
 * Connect up passport and sessions to the server
 * @param {Server} server restify server
 */
function initAuth(server) {
    const controller = new UserController();
    server.use(sessions({
        cookieName: 'session', // cookie name dictates the key name added to the request object - *only works if it is 'session'*
        secret: environment.session.secret, // should be a large unguessable string
        duration: environment.session.timeout // how long the session will stay valid in ms
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
        controller
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

    passport.use(new PassportLocalStrategy({session: true}, UserController.verifyLogin));
}

module.exports = initAuth;
