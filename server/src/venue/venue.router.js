const restifyErrors = require('restify-errors');
const controller = require('./venue.controller');

/**
 * venueRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many venues request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getVenues(req, res, next) {
        controller.findVenues(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many venues
    server.get('/venue/:id', passport.authenticate('jwt', {session: false}), getVenues);
    server.get('/venue/', passport.authenticate('jwt', {session: false}), getVenues);

    // create a new venue
    server.post('/venue', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.createVenue(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an venue
    server.put('/venue/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updatevenue(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an venue
    server.del('/venue/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteVenue(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
