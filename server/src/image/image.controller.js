const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const ImageModel = require('./image.model');

/**
 * Controller for images
 * @class ImageController
 */
class ImageController {
    /**
     * Get an image or all images. For use with the GET /image route
     * @param {string?} id (optional) image id
     * @param {string?} fields (optional) fields to select on the images
     * @return {Promise} resolved with the data, rejected on error
     */
    findImages(id, fields) {
        let query;
        if (id && typeof id === 'string' && id !== '') {
            query = ImageModel.findOne({_id: id});
        } else {
            query = ImageModel.find();
        }

        if (typeof fields === 'string' && fields !== '') {
            query.select(fields);
        }

        return query.exec();
    }

    /**
     * Create a new image.
     * @param {ImageModel} data image data
     * @return {Promise} resolved on success, rejected on errors
     */
    createImage(data) {
        return new Promise((resolve, reject) => {
            if (!data.label) {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                ImageModel
                    .create({
                        label: data.label,
                        url: data.url
                    })
                    .exec()
                    .then((success) => {
                        resolve('Success');
                    }, (err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Update an existing image.
     * @param {string} imageId id of the image to change
     * @param {ImageModel} newImage image data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateImage(imageId, newImage) {
        return new Promise((resolve, reject) => {
            // expect a userId
            if (typeof imageId !== 'string' || imageId === '') {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                ImageModel
                    .findOne({_id: imageId})
                    .exec()
                    .then((foundImage) => {
                        if (newImage.label && newImage.label !== '') {
                            foundImage.label = newImage.label;
                        }

                        if (newImage.url && newImage.url !== '') {
                            foundImage.url = newImage.url;
                        }

                        foundImage.save()
                            .then(() => {
                                logger.info('Updated image with id: ', imageId);
                                resolve('Success');
                            }, (err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            })
                            .catch((err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            });
                    }, (err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Deletes a image.
     * @param {string} imageId the id of the image to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteImage(imageId) {
        return new Promise((resolve, reject) => {
            if (typeof imageId !== 'string' || imageId === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                ImageModel
                    .findOne({_id: imageId})
                    .exec()
                    .then(
                        (foundImage) => {
                            foundImage.delete()
                                .then((result) => {
                                    resolve('Success');
                                }, (err) => {
                                    reject(new restifyErrors.ForbiddenError(err));
                                });
                        }, (err) => {
                            reject(new restifyErrors.ForbiddenError(err));
                        })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }
}

module.exports = ImageController;
