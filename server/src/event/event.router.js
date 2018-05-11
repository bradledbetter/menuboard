const restifyErrors = require('restify-errors');
const controller = require('./event.controller');
const passport = require('passport');

/**
 * eventRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many events request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getEvents(req, res, next) {
        controller.findEvents(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many events
    server.get('/event/:id', passport.authenticate('jwt', {session: false}), getEvents);
    server.get('/event/', passport.authenticate('jwt', {session: false}), getEvents);

    // create a new event
    server.post('/event', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.createEvent(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an event
    server.put('/event/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updateEvent(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an event
    server.del('/event/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteEvent(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
