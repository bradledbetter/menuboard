module.exports = {
    type: 'object',
    required: [
        'name'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91'
        },
        name: {
            description: 'The name of the slide type. Must be unique',
            type: 'string',
            example: 'Menu'
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        }
    },
};
