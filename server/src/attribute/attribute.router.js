const restifyErrors = require('restify-errors');
const AttributeController = require('./attribute.controller');

/**
 * attributeRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    const controller = new AttributeController();

    /**
     * Respond to the get one or get many attributes request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     * @return {*}
     */
    function getAttributes(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findAttributes(req.params.id || null, 'name value')
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

    // get one or many attributes
    server.get('/attribute/:id', getAttributes);
    server.get('/attribute/', getAttributes);

    // create a new attribute
    server.post('/attribute', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        // TODO:
        return next();
    });

    // udpate an attribute
    server.put('/attribute/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        // TODO:
        return next();
    });

    // delete an attribute
    server.del('/attribute/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.deleteAttribute(req.params.id)
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
