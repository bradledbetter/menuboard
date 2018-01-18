const passport = require('passport');
const restifyErrors = require('restify-errors');
const UserController = require('./user.controller');

/**
 * userRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    const controller = new UserController();

    // TODO: checking if I actually need the req.isAuthenticated call, or if the passport.authenticate call is sufficient
    // this is a fake route that we're just using for testing.
    server.get('/profile', passport.authenticate('local', {session: true}), (req, res, next) => {
        // if (!req.isAuthenticated()) {
        // return next(new restifyErrors.UnauthorizedError('Stop trying to access profile, you imposter!'));
        // }

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
            });
    });

    // set up the /verify route to verify a registered user
    server.post('/user/verify/:code', (req, res, next) => {
        controller.verifyUser(req.code)
            .then((result) => {
                res.send(200, result);
                next();
            }, (err) => {
                next(err);
            });
    });

    // create a new user when we're logged in
    server.post('/user', passport.authenticate('local', {session: true}), (req, res, next) => {
        res.send(200, {});
        return next();
    });

    // get one or many users TODO: does this need to be 2 separate routes, or will restify handle it like angular does?
    server.get('/user/:id', passport.authenticate('local', {session: true}), (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findUsers(req.id)
            .then((result) => {
                res.send(200, result);
                next();
            },
            (err) => {
                next(err);
            });
    });
};

