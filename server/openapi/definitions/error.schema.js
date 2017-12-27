module.exports = {
    type: 'object',
    required: [
        'status',
        'error'
    ],
    properties: {
        status: {
            type: 'integer',
            example: 401,
        },
        error: {
            type: 'string',
            default: 'Not Authorized',
            example: 'Not Authorized'
        },
        description: {
            type: 'string',
            description: 'Further details about the error, mainly useful for debugging.',
            example: 'You must first login to access this resource.'
        },
    },
};
