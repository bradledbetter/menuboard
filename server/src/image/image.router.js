const restifyErrors = require('restify-errors');
const ImageController = require('./image.controller');
const Busboy = require('busboy');

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
        // another option that I don't like for this use case: https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/
        // NOTE: req.body contains form fields, while req.file contains file data
        // https://github.com/mscdex/busboy
        try {
            const busboy = new Busboy({headers: req.headers});
        } catch (ex) {
            return next(new restifyErrors.InternalServerError(ex));
        }

        // handle file stream
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });

            file.on('end', function() {
                console.log('File [' + fieldname + '] Finished');
            });
        });

        // handle fields
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        });

        busboy.on('finish', function() {
            console.log('Done parsing form!');
            res.send(200, {Connection: 'close'});
            next();
        });

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
