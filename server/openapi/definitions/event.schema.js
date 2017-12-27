module.exports = {
    type: 'object',
    required: [
        'title',
        'startTime',
        'endTime'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        title: {
            description: 'Short title for the event',
            type: 'string',
            example: 'Trivia Night'
        },
        description: {
            description: 'A longer description of the event',
            type: 'string',
            example: 'Come put your random knowledge to the test.'
        },
        url: {
            description: 'URL of an image for the event',
            type: 'string',
            example: 'http://www.sheilacallaham.com/wp-content/uploads/2013/10/piglet.jpg'
        },
        startTime: {
            description: 'Date and time when the event starts',
            type: 'string',
            format: 'date-time',
            example: '2017-12-20T19:00:00'
        },
        endTime: {
            description: 'Date and time when the event ends',
            type: 'string',
            format: 'date-time',
            example: '2017-12-20T21:00:00'
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        }
    },
};
