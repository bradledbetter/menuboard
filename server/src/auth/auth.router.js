const passport = require('passport');
const restifyErrors = require('restify-errors');

/**
 * Bind paths to functions that handle them
 * @param {Server} server restify server
 */
module.exports = (server) => {
    // set up the login route
    server.post('/login', passport.authenticate('local', {session: true}), (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError());
        }

        res.send(200, {success: 'Logged in'});
        return next();
    });

    // set up the logout route
    server.post('/logout', (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.send(200, {success: 'Logged out'});
            return next();
        } else {
            req.logout();
            req.session.destroy(function(err) {
                if (err) {
                    return next(new restifyErrors.InternalServerError(err));
                }
                res.send(200, {success: 'Logged out'});
                return next();
            });
        }
    });
};
