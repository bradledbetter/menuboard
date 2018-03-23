const mongoose = require('mongoose');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const AttributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    value: {
        type: String,
        required: true,
        trim: true,
        index: true
    }
});

AttributeSchema.plugin(htmlSanitizer);

module.exports = mongoose.model('Attribute', AttributeSchema);
