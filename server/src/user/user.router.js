const restifyErrors = require('restify-errors');
const controller = require('./user.controller');
const passport = require('passport');

/**
 * userRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    // this is a useless route that's used for testing authenticated routes
    server.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.post('/user', passport.authenticate('jwt', {session: false}), createUser);

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
    server.put('/user/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
     */
    function getUsers(req, res, next) {
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
    server.get('/user/:id', passport.authenticate('jwt', {session: false}), getUsers);
    server.get('/user/', passport.authenticate('jwt', {session: false}), getUsers);

    // soft delete a user
    server.del('/user/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.put('/user/change-password/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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

