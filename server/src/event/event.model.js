const mongoose = require('mongoose');
const regex = require('../config/constants').regex;
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');
const moment = require('moment-timezone');

/* NOTE:
In future, we might want to attach a location to an event. We'd make that a separate document, I think, as we'd want a label and latitude
and longitude so it can be mapped. We might also want an address so we don't have to geocode each time. Or we might want an address instead
of lat, lng and pass the address to a map link.
*/
const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    url: {
        type: String,
        required: true,
        trim: true,
        match: regex.URL
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    endTime: {
        type: Date,
        default: Date.now()
    },
    timeZone: {// timezone that the event occurs in
        type: String,
        required: true,
        default: 'America/New_York'
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'
    },
    isActive: {
        type: Boolean,
        required: true,
        index: true
    }
});

EventSchema.plugin(htmlSanitizer, {exclude: ['url']});

/**
 * Check that the timezone is something that moment can understand
 * @return {Promise} resolved with true if it's valid, rejected with an Error if not
 */
function validateTimezone() {/* istanbul ignore next: Too simple to bother with unit test, IMO */
    if (!moment.tz.zone(this.timeZone)) {
        return Promise.reject(new Error('Invalid time zone.'));
    }
    return Promise.resolve(true);
}
EventSchema.pre('validate', validateTimezone);

module.exports = mongoose.model('Event', EventSchema);
