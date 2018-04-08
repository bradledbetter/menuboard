const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const SlideshowModel = require('./slideshow.model');
const Promise = require('bluebird');
const isNil = require('lodash/isNil');

/**
 * Get an slideshow or all active slideshows. For use with the GET /slideshow route
 * @param {string?} id (optional) slideshow id
 * @param {string?} fields (optional) fields to select on the slideshows
 * @return {Promise} resolved with the data, rejected on error
 */
function findSlideshows(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = SlideshowModel.findOne({_id: id});
    } else {
        query = SlideshowModel.find();
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new slideshow.
 * @param {Slideshow} data slideshow data
 * @return {Promise} resolved on success, rejected on errors
 */
function createSlideshow(data) {
    if (!data.description) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    const slideshow = {
        description: data.description,
        slides: data.slides,
        isActive: isNil(data.isActive) ? true : data.isActive,
        isPrimary: isNil(data.isPrimary) ? true : data.isPrimary
    };

    return SlideshowModel
        .create(slideshow)
        .then((newSlideshow) => {
            logger.info(`Created new slideshow with id: ${newSlideshow._id}`);
            return 'Success';
        });
}

/**
 * Update an existing slideshow.
 * @param {string} slideshowId id of the slideshow to change
 * @param {Slideshow} newSlideshow slideshow data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateSlideshow(slideshowId, newSlideshow) {
    // expect a userId
    if (typeof slideshowId !== 'string' || slideshowId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    if (!newSlideshow.description) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return SlideshowModel
        .findOne({_id: slideshowId})
        .then((foundSlideshow) => {
            foundSlideshow.description = newSlideshow.description || foundSlideshow.description;
            foundSlideshow.slides = newSlideshow.slides || foundSlideshow.slides;
            foundSlideshow.isActive = isNil(newSlideshow.isActive) ? true : newSlideshow.isActive;
            foundSlideshow.isPrimary = isNil(newSlideshow.isPrimary) ? true : newSlideshow.isPrimary;

            return foundSlideshow.save();
        })
        .then(() => {
            logger.info(`Updated slideshow with id: ${slideshowId}`);
            return 'Success';
        });
}

/**
 * Deletes an slideshow. Will not allow deleting an slideshow that is in use
 * @param {string} slideshowId the id of the slideshow to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteSlideshow(slideshowId) {
    if (!slideshowId || typeof slideshowId != 'string' || slideshowId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    return SlideshowModel
        .findOne({_id: slideshowId})
        .then((foundSlideshow) => {
            return foundSlideshow.delete();
        })
        .then(() => {
            logger.info('Deleted slideshow with id: ', slideshowId);
            return 'Succcess';
        });
}

module.exports = {
    findSlideshows,
    createSlideshow,
    updateSlideshow,
    deleteSlideshow
};
