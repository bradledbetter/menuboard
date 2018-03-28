const restifyErrors = require('restify-errors');
const controller = require('./menu-item.controller');

/**
 * Menu Item Router - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many menu items request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     * @return {*}
     */
    function getMenuItems(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findMenuItems(req.params.id || null, 'label description prices attributes isActive')
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many menu-items
    server.get('/menu-item/:id', getMenuItems);
    server.get('/menu-item/', getMenuItems);

    // create a new menu-item
    server.post('/menu-item', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.createMenuItem(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an menu-item
    server.put('/menu-item/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.updateMenuItem(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an menu-item
    server.del('/menu-item/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.deleteMenuItem(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
