const endpoints = require('../../constants/endpoints.js');
const {
    AUTHORIZATION
} = require('../../constants/params');

module.exports = {
    [`/${endpoints.LOGOUT}`]: {
        post: {
            tags: [],
            summary: 'Logout',
            parameters: [
                { $ref: `#/components/parameters/${AUTHORIZATION}` }
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
