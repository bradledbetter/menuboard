const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const EventModel = require('./event.model');
const moment = require('moment');
const dateFormat = require('../config/constants').incomingDateFormat;
const Promise = require('bluebird');

/**
 * Get an event or all active events. For use with the GET /event route
 * @param {string?} id (optional) event id
 * @param {string?} fields (optional) fields to select on the events
 * @return {Promise} resolved with the data, rejected on error
 */
function findEvents(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = EventModel.findOne({_id: id});
    } else {
        query = EventModel.find();
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new event.
 * @param {{title: string, description: string, url: string, startTime: string, endTime: string, isActive: boolean}} data new event
 * @return {Promise} resolved on success, rejected on errors
 */
function createEvent(data) {
    const event = {
        title: data.title,
        description: data.description || '',
        startTime: moment.tz(data.startTime, dateFormat, data.timeZone).utc().toDate(),
        endTime: moment.tz(data.endTime, dateFormat, data.timeZone).utc().toDate(),
        timeZone: data.timeZone,
        isActive: (data.isActive === undefined || data.isActive === null) ? true : data.isActive
    };

    return EventModel
        .create(event)
        .then((newEvent) => {
            logger.info(`Created new event with id: ${newEvent._id}`);
            return 'Success';
        });
}

/**
 * Update an existing event.
 * @param {string} eventId id of the event to change
 * @param {{title: string, description: string, url: string, startTime: string, endTime: string, isActive: boolean}} newEvent event data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateEvent(eventId, newEvent) {
    // expect a userId
    if (typeof eventId !== 'string' || eventId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return EventModel
        .findOne({_id: eventId})
        .then((foundEvent) => {
            foundEvent.title = newEvent.title || foundEvent.title;
            foundEvent.description = newEvent.description || '';
            foundEvent.startTime = newEvent.startTime ?
                moment.tz(newEvent.startTime, dateFormat, newEvent.timeZone).utc().toDate() : foundEvent.startTime;
            foundEvent.endTime = newEvent.endTime ?
                moment.tz(newEvent.endTime, dateFormat, newEvent.timeZone).utc().toDate() : foundEvent.endTime;
            foundEvent.timeZone = newEvent.timeZone;
            foundEvent.isActive = !!newEvent.isActive;

            return foundEvent.save();
        })
        .then(() => {
            logger.info(`Updated event with id: ${eventId}`);
            return 'Success';
        });
}

/**
 * Deletes an event. Will not allow deleting an event that is in use
 * @param {string} eventId the id of the event to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteEvent(eventId) {
    if (!eventId || typeof eventId != 'string' || eventId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // first, find if the event exists in a event-item already
    return EventModel
        .findOne({_id: eventId})
        .then((foundEvent) => {
            return foundEvent.delete();
        })
        .then(() => {
            logger.info('Deleted event with id: ', eventId);
            return 'Succcess';
        });
}

module.exports = {
    findEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
