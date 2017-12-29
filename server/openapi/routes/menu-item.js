const endpoints = require('../../config/endpoints.js');
const {
    AUTHORIZATION
} = require('../../config/params');

module.exports = {
    [`/${endpoints.MENUITEM}`]: {
        get: {
            summary: 'Returns a list of menu items',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                }
            ],
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/MenuItemSchema',
                                        },
                                    },
                                    total: {
                                        type: 'number',
                                        example: 1,
                                    },
                                },
                            },
                        },
                    },
                },
                'default': {
                    description: 'Error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorSchema',
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: [],
            summary: 'Create a menu item',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/MenuItemSchema',
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MenuItemSchema'
                            }
                        }
                    }
                },
                'default': {
                    description: 'Error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorSchema',
                            },
                        },
                    },
                },
            },
        },
    },

    [`/${endpoints.MENUITEM}/{menuItemId}`]: {
        get: {
            tags: [],
            summary: 'Returns a menu item by ID',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'menuItemId',
                    in: 'path',
                    description: 'Menu Item ID',
                    required: true,
                    schema: {
                        type: 'string',
                    }
                },
            ],
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MenuItemSchema'
                            }
                        }
                    }
                },
                'default': {
                    description: 'Error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorSchema',
                            },
                        },
                    },
                },
            },
        },
        put: {
            tags: [''],
            summary: 'Update menu item data',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'menuItemId',
                    in: 'path',
                    description: 'Menu Item ID',
                    required: true,
                    schema: {
                        type: 'string'
                    }
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/MenuItemSchema',
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MenuItemSchema'
                            }
                        }
                    }
                },
                'default': {
                    description: 'Error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorSchema',
                            },
                        },
                    },
                },
            },
        },
        delete: {
            tags: [''],
            summary: 'Soft delete a menu item',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'menuItemId',
                    in: 'path',
                    description: 'Menu Item ID',
                    required: true,
                    schema: {
                        type: 'string'
                    }
                },
            ],
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessSchema'
                            }
                        }
                    }
                },
                'default': {
                    description: 'Error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorSchema',
                            },
                        },
                    },
                },
            },
        },
    },
};
