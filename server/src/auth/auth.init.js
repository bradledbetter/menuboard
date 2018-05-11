const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
const userController = require('../user/user.controller');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * Connect up passport and sessions to the server
 * @param {Server} server restify server
 */
function initAuth(server) {
    server.use(passport.initialize());

    // extract the jwt from Authorization header, decrypt, and pass along payload
    passport.use(new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: environment.session.secret
        },
        function(user, next) {
            if (!user) {
                throw new restifyErrors.UnauthorizedError();
            }

            // Pass the user along
            next(null, user);
        }
    ));

    // user local username/password authentication - delegate to user controller
    passport.use(new PassportLocalStrategy({session: false}, userController.verifyLogin));
}

module.exports = initAuth;
