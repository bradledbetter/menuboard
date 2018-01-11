const restifyErrors = require('restify-errors');

/**
 * userRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    // this is a fake route that we're just using for testing.
    server.get('/profile', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Stop trying to access profile, you imposter!'));
        }

        res.send(200, {user: req.user});
        return next();
    });
};

