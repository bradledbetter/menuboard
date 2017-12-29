const endpoints = require('../../config/endpoints.js');
const {
    AUTHORIZATION
} = require('../../config/params');

module.exports = {
    [`/${endpoints.SLIDESHOW}`]: {
        get: {
            summary: 'Returns a list of slideshows',
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
                                            $ref: '#/components/schemas/SlideshowSchema',
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
            summary: 'Create a slideshow',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SlideshowSchema',
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
                                $ref: '#/components/schemas/SlideshowSchema'
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

    [`/${endpoints.SLIDESHOW}/{slideshowId}`]: {
        get: {
            tags: [],
            summary: 'Returns a slideshow by ID',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideshowId',
                    in: 'path',
                    description: 'Slideshow ID',
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
                                $ref: '#/components/schemas/SlideshowSchema'
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
            summary: 'Update slideshow data',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideshowId',
                    in: 'path',
                    description: 'Slideshow ID',
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
                            $ref: '#/components/schemas/SlideshowSchema',
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
                                $ref: '#/components/schemas/SlideshowSchema'
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
            summary: 'Soft delete a slideshow',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` },
                {
                    name: 'slideshowId',
                    in: 'path',
                    description: 'Slideshow ID',
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
