const endpoints = require('../constants/endpoints.js');

module.exports = {
    [`/${endpoints.LOGIN}`]: {
        post: {
            tags: [],
            summary: 'Login',
            parameters: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: [
                                'username',
                                'password'
                            ],
                            properties: {
                                username: {
                                    description: 'User login name',
                                    type: 'string',
                                    example: 'bob'
                                },
                                password: {
                                    description: 'User password',
                                    type: 'string',
                                    example: 'password'
                                }
                            }
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
                                $ref: '#/components/schemas/UserSchema'
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
