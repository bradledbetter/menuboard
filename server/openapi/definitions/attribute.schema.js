module.exports = {
    type: 'object',
    required: [
        'name',
        'value'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        name: {
            description: 'Name of the attribute',
            type: 'string',
            example: 'IBU'
        },
        value: {
            description: 'The value of the attribute',
            type: 'string',
            example: '20'
        }
    },
};
