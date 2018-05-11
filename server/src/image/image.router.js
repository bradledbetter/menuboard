const restifyErrors = require('restify-errors');
const controller = require('./image.controller');

/**
 * Image Router - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    /**
     * Respond to the get one or get many images request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     */
    function getImages(req, res, next) {
        controller.findImages(req.params.id || null, 'label url')
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    }

    // get one or many images
    server.get('/image/:id', passport.authenticate('jwt', {session: false}), getImages);
    server.get('/image/', passport.authenticate('jwt', {session: false}), getImages);

    // create a new image
    server.post('/image', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.createImage(req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // udpate an image
    server.put('/image/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.updateImage(req.params.id, req.body)
            .then((result) => {
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });

    // delete an image
    server.del('/image/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        controller.deleteImage(req.params.id)
            .then((result) => {
                // TODO: after we fold in S3 for image storage, we'll need to delete the image from there
                res.send(200, result);
                next();
            })
            .catch((err) => {
                next(new restifyErrors.InternalServerError(err));
            });
    });
};
