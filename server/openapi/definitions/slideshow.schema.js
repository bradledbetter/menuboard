module.exports = {
    type: 'object',
    required: [
        'description',
        'slides'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91'
        },
        description: {
            description: 'A description of the slideshow for human consumption, not in the UI.',
            type: 'string',
            example: 'Our fantastic slideshow'
        },
        slides: {
            description: 'The slides in this slideshow.',
            type: 'array',
            items: {
                $ref: '#/components/schemas/SlideSchema'
            }
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        },
        isPrimary: {
            description: 'If isPrimary is true, it will be in the list of default slideshows when the client loads. ' +
            'Which of the primary slideshows is selected first is not yet defined.',
            type: 'boolean',
            example: true
        }
    },
};
