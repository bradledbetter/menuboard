module.exports = {
    type: 'object',
    required: [
        'status'
    ],
    properties: {
        status: {
            type: 'integer',
            default: 200,
        },
    },
};
