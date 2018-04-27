const restifyErrors = require('restify-errors');
const controller = require('./slide.controller');

/**
 * slideRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many slides request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     * @return {*}
     */
    function getSlides(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findSlides(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many slides
    server.get('/slide/:id', getSlides);
    server.get('/slide/', getSlides);

    // create a new slide
    server.post('/slide', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.createSlide(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an slide
    server.put('/slide/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.updateSlide(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an slide
    server.del('/slide/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.deleteSlide(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
