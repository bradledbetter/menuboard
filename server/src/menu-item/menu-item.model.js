const mongoose = require('mongoose');
const safeStringPattern = require('../config/constants').regex.safeString;

const MenuItemSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true,
        match: safeStringPattern
    },
    description: {
        type: String,
        trim: true,
        match: safeStringPattern
    },
    prices: [
        {
            label: {
                type: String,
                required: true,
                match: safeStringPattern
            },
            price: {
                type: Number
            }
        }
    ],
    attributes: [
        {
            name: {
                type: String,
                required: true,
                trim: true,
                unique: true,
                index: true,
                match: safeStringPattern
            },
            value: {
                type: String,
                required: true,
                trim: true,
                index: true,
                match: safeStringPattern
            }
        }
    ],
    isActive: {
        type: Boolean,
        required: true,
        index: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
