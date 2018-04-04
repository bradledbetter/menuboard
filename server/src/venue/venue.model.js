const mongoose = require('mongoose');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const VenueSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true,
        index: true,
        minlength: 3
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    latitude: {
        type: Number,
        required: true,
        min: -90.0,
        max: 90.0
    },
    longitude: {
        type: Number,
        required: true,
        min: -180.0,
        max: 180.0
    }
});

VenueSchema.plugin(htmlSanitizer);

module.exports = mongoose.model('Venue', VenueSchema);
