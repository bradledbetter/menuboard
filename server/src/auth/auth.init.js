const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
// TODO: thinking about switching to tokens and bearer auth, but I'm not sure what that really gains me,
// except for decoupling from web browsers as clients.
const sessions = require('client-sessions');
const user = require('../user/');

// https://gist.github.com/yoitsro/8693021/b43fd1c8ee79a9b3bcc0701bc07b84c4fc809c07

/**
 * Connect up passport and sessions to the server
 * @param {Server} server restify server
 */
function initAuth(server) {
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
        user.model.findUser(id)
            .then((foundUser) => {
                // User not found
                if (!foundUser) {
                    return next(new restifyErrors.UnauthorizedError(err), false);
                }

                return next(null, foundUser);
            },
            (err) => {
                return next(new restifyErrors.InternalServerError(err));
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // user local username/password authentication

    passport.use(new PassportLocalStrategy({session: true}, user.controller.verifyUser));
}

module.exports = initAuth;
