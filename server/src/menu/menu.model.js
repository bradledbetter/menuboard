const mongoose = require('mongoose');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const MenuSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        match: safeStringPattern
    },
    isActive: {
        type: Boolean,
        required: true,
        index: true
    },
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }]
});

MenuSchema.plugin(htmlSanitizer);

module.exports = mongoose.model('Menu', MenuSchema);
