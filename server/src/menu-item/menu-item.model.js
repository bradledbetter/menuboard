const mongoose = require('mongoose');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const MenuItemSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    prices: [
        {
            label: {
                type: String,
                required: true
            },
            price: {
                type: Number
            }
        }
    ],
    attributes: [
        {
            label: {
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
        }
    ],
    isActive: {
        type: Boolean,
        required: true,
        index: true
    }
});

MenuItemSchema.plugin(htmlSanitizer);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
