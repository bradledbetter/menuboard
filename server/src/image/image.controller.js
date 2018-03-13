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
        if (!data.label) {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
        }

        return ImageModel
            .create({
                label: data.label,
                url: data.url
            })
            .then((newImage) => {
                logger.info(`Created new image with id: ${newImage._id}`);
                return 'Success';
            });
    }

    /**
     * Update an existing image.
     * @param {string} imageId id of the image to change
     * @param {ImageModel} newImage image data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateImage(imageId, newImage) {
        // expect a userId
        if (typeof imageId !== 'string' || imageId === '') {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
        }

        return ImageModel
            .findOne({_id: imageId})
            .then((foundImage) => {
                if (newImage.label && newImage.label !== '') {
                    foundImage.label = newImage.label;
                }

                if (newImage.url && newImage.url !== '') {
                    foundImage.url = newImage.url;
                }

                return foundImage.save();
            })
            .then(() => {
                logger.info(`Updated image with id: ${imageId}`);
                return 'Success';
            });
    }

    /**
     * Deletes a image.
     * @param {string} imageId the id of the image to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteImage(imageId) {
        if (typeof imageId !== 'string' || imageId === '') {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
        }

        return ImageModel
            .findOne({_id: imageId})
            .then((foundImage) => {
                return foundImage.delete();
            }).then(() => {
                logger.info(`Deleted image with id ${imageId}`);
                return 'Success';
            });
    }
}

module.exports = ImageController;
