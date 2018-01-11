const passport = require('passport');
const restifyErrors = require('restify-errors');

/**
 * Bind paths to functions that handle them
 * @param {Server} server restify server
 */
module.exports = (server) => {
    // set up the login route
    server.post('/login', passport.authenticate('local', {session: true}), (req, res, next) => {
        // TODO: this is causing next shouldn't be called more than once.
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError());
        }

        res.send(200, {success: 'Logged in'});
        return next();
    });

    // TODO: set up the logout route
    // TODO: ?set up the register route? Or should that be on user?
};
