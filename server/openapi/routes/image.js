const endpoints = require('../constants/endpoints.js');
const {
    AUTHORIZATION
} = require('../constants/params');

module.exports = {
    [`/${endpoints.IMAGE}`]: {
        get: {
            summary: 'Returns a list of images',
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
                                            $ref: '#/components/schemas/ImageSchema',
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
            summary: 'Create a image',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ImageSchema',
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
                                $ref: '#/components/schemas/ImageSchema'
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

    [`/${endpoints.IMAGE}/{imageId}`]: {
        get: {
            tags: [],
            summary: 'Returns a image by ID',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'imageId',
                    in: 'path',
                    description: 'Image ID',
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
                                $ref: '#/components/schemas/ImageSchema'
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
            summary: 'Update image data',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'imageId',
                    in: 'path',
                    description: 'Image ID',
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
                            $ref: '#/components/schemas/ImageSchema',
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
                                $ref: '#/components/schemas/ImageSchema'
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
            summary: 'Soft delete a image',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'imageId',
                    in: 'path',
                    description: 'Image ID',
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
