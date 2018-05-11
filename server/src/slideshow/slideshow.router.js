const restifyErrors = require('restify-errors');
const controller = require('./slideshow.controller');

/**
 * slideshowRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many slideshows request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getSlideshows(req, res, next) {
        controller.findSlideshows(req.params.id || null)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many slideshows
    server.get('/slideshow/:id', passport.authenticate('jwt', {session: false}), getSlideshows);
    server.get('/slideshow/', passport.authenticate('jwt', {session: false}), getSlideshows);

    // create a new slideshow
    server.post('/slideshow', (req, res, next) => {
        controller.createSlideshow(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an slideshow
    server.put('/slideshow/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updateSlideshow(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an slideshow
    server.del('/slideshow/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteSlideshow(req.params.id)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
