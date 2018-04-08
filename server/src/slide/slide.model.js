const mongoose = require('mongoose');
const regex = require('../config/constants').regex;
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const SlideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    templateUrl: {
        type: String,
        required: true,
        trim: true,
        match: regex.URL
    },
    slideType: {
        type: String,
        required: true,
        enum: ['event feed', 'image feed', 'menu', 'image']
    },
    isActive: {
        type: Boolean,
        required: true,
        index: true
    }
});

SlideSchema.plugin(htmlSanitizer, {exclude: ['templateUrl', 'slideType']});

module.exports = mongoose.model('Slide', SlideSchema);
