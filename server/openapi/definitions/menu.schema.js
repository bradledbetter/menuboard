module.exports = {
    type: 'object',
    required: [
        'title',
        'menuItems'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        title: {
            description: 'Menu title, or short description, not seen in the UI',
            type: 'string',
            example: 'Beer Menu'
        },
        description: {
            description: 'A longer description of the menu, generally not seen in the UI',
            type: 'string',
            example: 'A list of beers on tap'
        },
        menuItems: {
            description: 'The menu items that are on this menu.',
            type: 'array',
            items: {
                $ref: '#/components/schemas/MenuItemSchema'
            }
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        }
    },
};
