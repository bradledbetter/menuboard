const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const VenueModel = require('./venue.model');
const EventModel = require('../event/event.model');
const Promise = require('bluebird');

/**
 * Get an venue or all active venues. For use with the GET /venue route
 * @param {string?} id (optional) venue id
 * @param {string?} fields (optional) fields to select on the venues
 * @return {Promise} resolved with the data, rejected on error
 */
function findVenues(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = VenueModel.findOne({_id: id});
    } else {
        query = VenueModel.find();
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new venue.
 * @param {Venue} data new venue
 * @return {Promise} resolved on success, rejected on errors
 */
function createVenue(data) {
    const venue = {
        label: data.label,
        address: data.address || '',
        latitude: data.latitude,
        longitude: data.longitude
    };

    return VenueModel
        .create(venue)
        .then((newVenue) => {
            logger.info(`Created new venue with id: ${newVenue._id}`);
            return 'Success';
        });
}

/**
 * Update an existing venue.
 * @param {string} venueId id of the venue to change
 * @param {Venue} newVenue venue data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateVenue(venueId, newVenue) {
    // expect an venueId
    if (typeof venueId !== 'string' || venueId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return VenueModel
        .findOne({_id: venueId})
        .then((foundVenue) => {
            foundVenue.label = newVenue.label || foundVenue.label;
            foundVenue.address = newVenue.address || foundVenue.address;
            foundVenue.latitude = newVenue.latitude || foundVenue.latitude;
            foundVenue.longitude = newVenue.longitude || foundVenue.longitude;

            return foundVenue.save();
        })
        .then(() => {
            logger.info(`Updated venue with id: ${venueId}`);
            return 'Success';
        });
}

/**
 * Deletes an venue. Will not allow deleting an venue that is in use
 * @param {string} venueId the id of the venue to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteVenue(venueId) {
    if (!venueId || typeof venueId != 'string' || venueId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // check to see if it's on an event and reject if it is
    return EventModel
        .findOne({venue: {_id: venueId}})
        .then((foundEvent) => {
            if (foundEvent) {
                const eventStart = moment.utc(foundEvent.startDate).tz(foundEvent.timeZone).format('MM/DD/YY');
                return Promise.reject(new restifyErrors.ForbiddenError(`Cannot delete. Venue used for event ${foundEvent.label} on ${eventStart}`)); // eslint-disable-line max-len
            }

            return VenueModel
                .findOne({_id: venueId})
                .then((foundVenue) => {
                    return foundVenue.delete();
                })
                .then(() => {
                    logger.info('Deleted venue with id: ', venueId);
                    return 'Succcess';
                });
        });
}

module.exports = {
    findVenues,
    createVenue,
    updateVenue,
    deleteVenue
};
