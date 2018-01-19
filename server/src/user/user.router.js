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

    // set up the register route.
    server.post('/user/register', (req, res, next) => {
        controller.createUser(req.body.username, req.body.password)
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

    // create a new user when we're logged in
    server.post('/user', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        res.send(200, {});
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
                next(err);
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many users
    server.get('/user/:id', getUsers);
    server.get('/user/', getUsers);
};

