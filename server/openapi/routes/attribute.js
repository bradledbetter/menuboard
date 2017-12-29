const endpoints = require('../../config/endpoints.js');
const {
    AUTHORIZATION
} = require('../../config/params');

module.exports = {
    [`/${endpoints.ATTRIBUTE}`]: {
        get: {
            summary: 'Returns a list of attributes',
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
                                            $ref: '#/components/schemas/AttributeSchema',
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
            summary: 'Create a attribute',
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
                            $ref: '#/components/schemas/AttributeSchema',
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
                                $ref: '#/components/schemas/AttributeSchema'
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

    [`/${endpoints.ATTRIBUTE}/{attributeId}`]: {
        get: {
            tags: [],
            summary: 'Returns a attribute by ID',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'attributeId',
                    in: 'path',
                    description: 'Attribute ID',
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
                                $ref: '#/components/schemas/AttributeSchema'
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
            summary: 'Update attribute data',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'attributeId',
                    in: 'path',
                    description: 'Attribute ID',
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
                            $ref: '#/components/schemas/AttributeSchema',
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
                                $ref: '#/components/schemas/AttributeSchema'
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
            summary: 'Soft delete a attribute',
            parameters: [
                {
                    $ref: `#/components/parameters/${AUTHORIZATION}`
                },
                {
                    name: 'attributeId',
                    in: 'path',
                    description: 'Attribute ID',
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
