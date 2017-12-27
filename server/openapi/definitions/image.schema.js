module.exports = {
    type: 'object',
    required: [
        'url'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        url: {
            description: 'URL of the image',
            type: 'string',
            example: 'http://www.sheilacallaham.com/wp-content/uploads/2013/10/piglet.jpg'
        }
    },
};
