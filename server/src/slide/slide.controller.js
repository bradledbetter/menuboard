const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const SlideModel = require('./slide.model');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const isNil = require('lodash/isNil');

/**
 * Get an slide or all active slides. For use with the GET /slide route
 * @param {string?} id (optional) slide id
 * @param {string?} fields (optional) fields to select on the slides
 * @return {Promise} resolved with the data, rejected on error
 */
function findSlides(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = SlideModel.findOne({_id: id});
    } else {
        query = SlideModel.find();
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new slide.
 * @param {Slide} data slide data
 * @return {Promise} resolved on success, rejected on errors
 */
function createSlide(data) {
    if (!data.title || !mongoose.Types.ObjectId.isValid(data.data)) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    const slide = {
        title: data.title,
        data: data.data,
        templateUrl: data.templateUrl,
        slideType: data.slideType,
        isActive: isNil(data.isActive) ? true : data.isActive
    };

    return SlideModel
        .create(slide)
        .then((newSlide) => {
            logger.info(`Created new slide with id: ${newSlide._id}`);
            return 'Success';
        });
}

/**
 * Update an existing slide.
 * @param {string} slideId id of the slide to change
 * @param {Slide} newSlide slide data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateSlide(slideId, newSlide) {
    // expect a userId
    if (typeof slideId !== 'string' || slideId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    if (!newSlide.title || !mongoose.Types.ObjectId.isValid(newSlide.data)) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return SlideModel
        .findOne({_id: slideId})
        .then((foundSlide) => {
            foundSlide.title = newSlide.title || foundSlide.title;
            foundSlide.newSlide = newSlide.newSlide || foundSlide.newSlide;
            foundSlide.templateUrl = newSlide.templateUrl || foundSlide.templateUrl;
            foundSlide.slideType = newSlide.slideType || foundSlide.slideType;
            foundSlide.isActive = isNil(newSlide.isActive) ? true : newSlide.isActive;

            return foundSlide.save();
        })
        .then(() => {
            logger.info(`Updated slide with id: ${slideId}`);
            return 'Success';
        });
}

/**
 * Deletes an slide. Will not allow deleting an slide that is in use
 * @param {string} slideId the id of the slide to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteSlide(slideId) {
    if (!slideId || typeof slideId != 'string' || slideId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // TODO: first, find if the slide exists in a slideshow already
    // return SlideshowModel.find({'slides._id':slideId})
    return SlideModel
        .findOne({_id: slideId})
        .then((foundSlide) => {
            return foundSlide.delete();
        })
        .then(() => {
            logger.info('Deleted slide with id: ', slideId);
            return 'Succcess';
        });
}

module.exports = {
    findSlides,
    createSlide,
    updateSlide,
    deleteSlide
};
