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
 * @param {Event} data new event
 * @return {Promise} resolved on success, rejected on errors
 */
function createEvent(data) {
    // moment likes to soft fail, so we need to check timezone here to pass a failure up the chain
    if (!moment.tz.zone(data.timeZone)) {
        return Promise.reject(new restifyErrors.ForbiddenError('Invalid time zone.'));
    }

    const event = {
        title: data.title,
        description: data.description || '',
        startTime: moment.tz(data.startTime, dateFormat, data.timeZone).utc().toDate(),
        endTime: moment.tz(data.endTime, dateFormat, data.timeZone).utc().toDate(),
        venue: data.venue,
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
 * @param {Event} newEvent event data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateEvent(eventId, newEvent) {
    // expect an eventId
    if (typeof eventId !== 'string' || eventId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    // moment likes to soft fail, so we need to check timezone here to pass a failure up the chain
    if (!moment.tz.zone(newEvent.timeZone)) {
        return Promise.reject(new restifyErrors.ForbiddenError('Invalid time zone.'));
    }

    // TODO: venue
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
            foundEvent.venue = newEvent.venue;
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
