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
     */
    function getSlides(req, res, next) {
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
    server.get('/slide/:id', passport.authenticate('jwt', {session: false}), getSlides);
    server.get('/slide/', passport.authenticate('jwt', {session: false}), getSlides);

    // create a new slide
    server.post('/slide', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.put('/slide/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.del('/slide/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
