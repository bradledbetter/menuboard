module.exports = {
    type: 'object',
    required: [
        'label',
        'slideType',
        'data',
        'templateUrl'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91'
        },
        label: {
            description: 'A label for the slide. May or may not show up in the UI.',
            type: 'string',
            example: 'Super Pale Ale'
        },
        slideType: {
            $ref: '#/components/schemas/SlideTypeSchema'
        },
        data: {
            description: 'The underlying data that feeds into the slide. References a document such as a menu.',
            type: 'string',
            example: '5849483ef75224dc90794e91'
        },
        templateUrl: {
            description: 'URL of the template for rendering the slide. Assumed relative to server root if URL is relative.',
            type: 'string',
            example: '/templates/beer-menu.html'
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        }
    },
};
