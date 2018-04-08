const mongoose = require('mongoose');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const SlideshowSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slides: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slide'
    }],
    isActive: {
        type: Boolean,
        required: true,
        index: true
    },
    isPrimary: {
        type: Boolean,
        required: true,
        index: true
    }
});

SlideshowSchema.plugin(htmlSanitizer);

module.exports = mongoose.model('Slideshow', SlideshowSchema);
