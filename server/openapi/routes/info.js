const endpoints = require('../../config/endpoints.js');

module.exports = {
    [`/${endpoints.INFO}`]: {
        post: {
            tags: [],
            summary: 'Info - get some basic info on the server and check if it is running',
            parameters: [],
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    code: {
                                        description: 'A string with no spaces that serves as a short descriptor.',
                                        type: 'string',
                                        example: 'menuboard-server',
                                    },
                                    name: {
                                        description: 'A name for the app',
                                        type: 'string',
                                        example: 'MenuBoard Server'
                                    },
                                    description: {
                                        description: 'A short description of the app',
                                        type: 'string',
                                        example: 'Server for a simple digital menuboard intended for small taprooms',
                                    },
                                    version: {
                                        description: 'The version of the app',
                                        type: 'string',
                                        example: '0.1.0',
                                    },
                                    appDateUTC: {
                                        description: 'The build date in UTC for the referenced version',
                                        type: 'string',
                                        example: ''
                                    },
                                    statusCode: {
                                        description: 'A status code for the running server',
                                        type: 'number',
                                        example: 1
                                    },
                                    statusMessage: {
                                        description: 'A string descriptor for the status code',
                                        type: 'string',
                                        example: 'healthy'
                                    },
                                    url: {
                                        description: 'The server url',
                                        type: 'string',
                                        example: 'http://localhost:7531'
                                    },
                                    info: {
                                        description: 'Additional information',
                                        type: 'string'
                                    },
                                    serverTimestampUTC: {
                                        description: 'Current timestamp in UTC when the info request was processed',
                                        type: 'string',
                                        example: '2017-12-29T18:18:40.662Z'
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
    },

};
