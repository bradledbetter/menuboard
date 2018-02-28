const mongoose = require('mongoose');
const regex = require('../config/constants').regex;

const ImageSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true,
        match: regex.safeString
    },
    url: {
        type: String,
        required: true,
        trim: true,
        match: regex.URL
    }
});

module.exports = mongoose.model('Image', ImageSchema);
