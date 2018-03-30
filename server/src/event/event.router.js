const restifyErrors = require('restify-errors');
const controller = require('./event.controller');

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
     * @return {*}
     */
    function getEvents(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

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
    server.get('/event/:id', getEvents);
    server.get('/event/', getEvents);

    // create a new event
    server.post('/event', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

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
    server.put('/event/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

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
    server.del('/event/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

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
