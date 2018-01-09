const passport = require('passport');
const restifyErrors = require('restify-errors');

/**
 * Bind paths to functions that handle them
 * @param {Server} server restify server
 */
module.exports = (server) => {
    // set up the login route
    server.post('/login', passport.authenticate('local', {session: true}), (req, res, next) => {
        req.logIn((err) => {
            if (err) {
                return next(new restifyErrors.InternalServerError(err));
            }
            res.send(200, {success: 'Logged in'});
            return next();
        });
    });

    // TODO: set up the logout route
    // TODO: ?set up the register route? Or should that be on user?
};
