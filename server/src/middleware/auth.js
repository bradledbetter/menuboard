const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
// TODO: thinking about switching to tokens and bearer auth, but I'm not sure what that really gains me, 
// except for decoupling from web browsers as clients.
const sessions = require('client-sessions');

// const bcrypt = require('bcryptjs');// TODO: for when we're actually comparing passwords
const restifyErrors = require('restify-errors');

// https://gist.github.com/yoitsro/8693021/b43fd1c8ee79a9b3bcc0701bc07b84c4fc809c07
const user = {
    username: 'test-user',
    passwordHash: 'bcrypt-hashed-password',
    _id: '1'
};
/**
 * A fake user class to use unitl we get our models set up
 * @class User
 */
class User {
    /**
     * Make a new User
     */
    constructor() {

    }

    /**
     * Find a user by id
     * @param {*} input placeholder for consistency
     * @return {Promise}
     */
    static findUserById(input) {
        return Promise.resolve(user);
    }

    /**
     * General find single user
     * @param {*} input placeholder for consistencyt
     * @return {Promise}
     */
    static findUser(input) {
        return Promise.resolve(user);
    }

    /**
     * Used to verify that a username / password combo is connected to a real user
     * @param {*} username a possible user's username
     * @param {*} password a possible user's password
     * @param {*} done a callback to use to verify or reject a user
     */
    static verifyUser(username, password, done) {
        console.log('user verify function');
        User.findUser(username).then((err, foundUser) => {
            if (err) {
                console.assert('verify callback: findUser error');
                return done(new restifyErrors.InternalServerError(err));
            }

            // User not found
            if (!foundUser) {
                console.log('User not found');
                return done(new restifyErrors.Unauthorized(err), false);
            }
            return done(null, foundUser);

            // Always use hashed passwords and fixed time comparison
            // bcrypt.compare(password, foundUser.passwordHash, (err, isValid) => {
            //     if (err) {
            //         console.log('error thrown in bcrypt compare');
            //         return done(new restifyErrors.InternalServerError(err));
            //     }
            //     if (!isValid) {
            //         console.log('password otherwise invalid');
            //         return done(new restifyErrors.UnauthorizedError, false);
            //     }
            //     console.log('found user and password matched');
            //     return done(null, foundUser);
            // });
        });
    }
}

/**
 * Connect up passport and sessions to the server
 * @param {Server} server restify server
 */
function connectAuth(server) {
    server.use(sessions({
        cookieName: 'session', // cookie name dictates the key name added to the request object - *only works if it is 'session'*
        secret: environment.session.secret, // should be a large unguessable string
        duration: environment.session.timeout // how long the session will stay valid in ms
    }));

    server.use(passport.initialize());
    server.use(passport.session());

    // This is how a user gets serialized to a session cookie
    passport.serializeUser(function(user, done) {
        console.log(`passport.serializeUser ${user.username}`);
        done(null, user._id); // this is what gets saved to the cookie
    });

    // This is how a user gets deserialized when a session cookie is sent
    passport.deserializeUser(function(id, done) {
        console.log('passport.deserializeUser id: ', id);
        // Look the user up in the database and return the user object
        findUser(id, (err, foundUser) => {
            if (err) {
                console.assert('deserializeUser: findUser error');
                return done(new restifyErrors.InternalServerError(err));
            }

            // User not found
            if (!foundUser) {
                console.log('deserializeUser: User not found');
                return done(new restifyErrors.Unauthorized(err), false);
            }

            return done(null, foundUser);
        });
    });

    // user local username/password authentication
    passport.use(new PassportLocalStrategy({session: true}, User.verifyUser));

    // TODO: I think this needs to be elsewhere?
    server.post('/login', passport.authenticate('local', {session: true}), (req, res, next) => {
        console.log('login route handler');
        if (req.session) {
            console.log('login session ', req.session);
        }
        res.send(200, {success: 'Logged in'});
        return next();
    });
}

module.exports = connectAuth;