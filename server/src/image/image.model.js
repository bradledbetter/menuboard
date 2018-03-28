const mongoose = require('mongoose');
const regex = require('../config/constants').regex;
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const ImageSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true,
        match: regex.URL
    }
});

ImageSchema.plugin(htmlSanitizer, {exclude: ['url']});

module.exports = mongoose.model('Image', ImageSchema);
