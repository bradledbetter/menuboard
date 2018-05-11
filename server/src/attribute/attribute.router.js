const restifyErrors = require('restify-errors');
const controller = require('./attribute.controller');
const passport = require('passport');

/**
 * attributeRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many attributes request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getAttributes(req, res, next) {
        controller.findAttributes(req.params.id || null, 'name value')
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many attributes
    server.get('/attribute/:id', passport.authenticate('jwt', {session: false}), getAttributes);
    server.get('/attribute/', passport.authenticate('jwt', {session: false}), getAttributes);

    // create a new attribute
    server.post('/attribute', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.createAttribute(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an attribute
    server.put('/attribute/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updateAttribute(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an attribute
    server.del('/attribute/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteAttribute(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
