const endpoints = require('../constants/endpoints.js');
const {
    AUTHORIZATION
} = require('../constants/params');

module.exports = {
    [`/${endpoints.SLIDETYPE}`]: {
        get: {
            summary: 'Returns a list of slide types',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` }
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
                                            $ref: '#/components/schemas/SlideTypeSchema',
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
                default: {
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
            summary: 'Create a slide type',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SlideTypeSchema',
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
                                $ref: '#/components/schemas/SlideTypeSchema'
                            }
                        }
                    }
                },
                default: {
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

    [`/${endpoints.SLIDETYPE}/{slideTypeId}`]: {
        get: {
            tags: [],
            summary: 'Returns a slide type by ID',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideTypeId',
                    in: 'path',
                    description: 'Slide type ID',
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
                                $ref: '#/components/schemas/SlideTypeSchema'
                            }
                        }
                    }
                },
                default: {
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
            summary: 'Update slide type data',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideTypeId',
                    in: 'path',
                    description: 'Slide type ID',
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
                            $ref: '#/components/schemas/SlideTypeSchema',
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
                                $ref: '#/components/schemas/SlideTypeSchema'
                            }
                        }
                    }
                },
                default: {
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
            summary: 'Soft delete a slide type',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideTypeId',
                    in: 'path',
                    description: 'Slide type ID',
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
                default: {
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
