const restifyErrors = require('restify-errors');
const controller = require('./user.controller');

/**
 * userRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    // this is a fake route that we're just using for testing.
    server.get('/profile', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        res.send(200, {user: req.user});
        return next();
    });

    /**
     * Wrap controller create user because there are two places we need to use it in slightly different ways
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function createUser(req, res, next) {
        controller.createUser(req.body.username, req.body.password)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // set up the register route.
    server.post('/user/register', createUser);

    // create a new user when we're logged in. Check auth then make the user
    server.post('/user', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        createUser(req, res, next);
    });

    // set up the /verify route to verify a registered user
    server.get('/user/verify/:code', (req, res, next) => {
        controller.verifyUser(req.params.code)
            .then((result) => {
                res.send(200, result);
                next();
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // update a user
    server.put('/user/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.updateUser(req.params.id, req.body)
            .then((foundUser) => {
                res.send(200, result);
                next();
            },
                (err) => {
                    next(new restifyErrors.InternalServerError(err));
                })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });

        return next();
    });


    /**
     * Respond to the get one or get many users request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     * @return {*}
     */
    function getUsers(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findUsers(req.params.id || null, 'username status')
            .then((result) => {
                res.send(200, result);
                next();
            },
                (err) => {
                    next(new restifyErrors.InternalServerError(err));
                })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many users
    server.get('/user/:id', getUsers);
    server.get('/user/', getUsers);

    // soft delete a user
    server.del('/user/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.deleteUser(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // change a password
    server.put('/user/change-password/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.changePassword(req.params.id, req.body.password)
            .then((result) => {
                res.send(200, result);
                next();
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};

