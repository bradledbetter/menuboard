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
                res.send(200, {user: req.user});
                return next();
            }, (err) => {
                return next(err);
            });
    });

    // TODO: set up the /verify route to verify a registered user
    server.post('/user/verify', (req, res, next) => {
        return next();
    });

    // create a new user when we're logged in
    server.post('/user', passport.authenticate('local', {session: true}), (req, res, next) => {
        return next();
    });

    // get one or many users TODO: does this need to be 2 separate routes?
    server.get('/user/:id', passport.authenticate('local', {session: true}), (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }
        // TODO: encapsulate this better in controller

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

