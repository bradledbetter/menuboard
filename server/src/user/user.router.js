const restifyErrors = require('restify-errors');
const UserController = require('./user.controller');

/**
 * userRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    const controller = new UserController();

    // this is a fake route that we're just using for testing.
    server.get('/profile', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Stop trying to access profile, you imposter!'));
        }

        res.send(200, {user: req.user});
        return next();
    });

    // get one or many users
    server.get('/user/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        if (req.id && typeof req.id === 'string' && req.id !== '') {
            controller
                .findById(req.id)
                .then((user) => {
                    res.send(200, user);
                    return next();
                }, (err) => {
                    return next(err);
                });
        } else {
            controller
                .findAllACtive()
                .then((users) => {
                    res.send(200, users);
                    return next();
                }, (err) => {
                    return next(err);
                });
        }
    });
};

