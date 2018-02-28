const restifyErrors = require('restify-errors');
const ImageController = require('./image.controller');

/**
 * Image Router - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    const controller = new ImageController();

    /**
     * Respond to the get one or get many images request
     * @param {object} req request object
     * @param {object} res response object
     * @param {function} next callback
     * @return {*}
     */
    function getImages(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.findImages(req.params.id || null, 'label url')
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

    // get one or many images
    server.get('/image/:id', getImages);
    server.get('/image/', getImages);

    // create a new image
    server.post('/image', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.createImage(req.body)
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

    // TODO: upload a file and create an image record
    server.post('/image/upload', (req, res, next) => {
        // NOTE: req.body contains form fields, while req.file contains file data
        // https://medium.com/technoetics/handling-file-upload-in-nodejs-7a4bb9f09a27
        next(new restifyErrors.NotFoundError);
    });

    // udpate an image
    server.put('/image/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.updateImage(req.params.id, req.body)
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

    // delete an image
    server.del('/image/:id', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next(new restifyErrors.UnauthorizedError('Unauthorized'));
        }

        controller.deleteImage(req.params.id)
            .then((result) => {
                // TODO: after we fold in S3 for image storage, we'll need to delete the im from there
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
