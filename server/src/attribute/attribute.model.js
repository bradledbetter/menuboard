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

module.exports = mongoose.model('Attribe', AttributeSchema);
