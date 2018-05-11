const restifyErrors = require('restify-errors');
const controller = require('./menu.controller');

/**
 * menuRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many menus request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getMenus(req, res, next) {
        controller.findMenus(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many menus
    server.get('/menu/:id', passport.authenticate('jwt', {session: false}), getMenus);
    server.get('/menu/', passport.authenticate('jwt', {session: false}), getMenus);

    // create a new menu
    server.post('/menu', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.createMenu(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an menu
    server.put('/menu/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updateMenu(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an menu
    server.del('/menu/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteMenu(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
