const mongoose = require('mongoose');
const AttributeSchema = require('../attribute/attribute.model').schema;

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
                type: Number,
                default: 0.0,
                required: true
            }
        }
    ],
    attributes: [AttributeSchema],
    isActive: {
        type: boolean,
        required: true,
        index: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
