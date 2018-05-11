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
     */
    function getMenuItems(req, res, next) {
        controller.findMenuItems(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many menu-items
    server.get('/menu-item/:id', passport.authenticate('jwt', {session: false}), getMenuItems);
    server.get('/menu-item/', passport.authenticate('jwt', {session: false}), getMenuItems);

    // create a new menu-item
    server.post('/menu-item', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.put('/menu-item/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
    server.del('/menu-item/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
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
