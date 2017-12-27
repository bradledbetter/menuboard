module.exports = {
    type: 'object',
    required: [
        'label',
        'prices'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        label: {
            description: 'Menu item label, usually shows up in UI',
            type: 'string',
            example: 'Super Pale Ale'
        },
        description: {
            description: 'A longer description of the menu item, could be seen in the UI',
            type: 'string',
            example: 'A traditional American Pale Ale with a cherry on top.'
        },
        prices: {
            description: 'Prices of the item for each variant. There must be at least one.',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: {
                        description: 'The name for the variant.',
                        type: 'string',
                        example: 'Pint'
                    },
                    price: {
                        description: 'The price of the variant. Not assuming a currency.',
                        type: 'number',
                        format: 'float',
                        example: 5.5
                    }
                }
            }
        },
        attributes: {
            description: 'Additional details specific to the menu item.',
            type: 'array',
            items: {
                $ref: '#/components/schemas/AttributeSchema'
            }
        },
        isActive: {
            description: 'If isActive is false, this record won\'t show up in queries unless it is specifically filtered for',
            type: 'boolean',
            example: true
        }
    },
};
