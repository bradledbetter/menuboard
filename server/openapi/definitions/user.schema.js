module.exports = {
    type: 'object',
    required: [
        'name'
    ],
    properties: {
        _id: {
            description: 'Record ID',
            type: 'string',
            example: '5849483ef75224dc90794e91',
        },
        username: {
            description: 'User login name',
            type: 'string',
            example: 'bob'
        },
        passwordHash: {
            description: 'Salted hash of user passsword',
            type: 'string',
            example: 'foewh0243nnotreallyf04glkg90vlkwjfrew'
        },
        isActive: {
            description: 'Only active users can login',
            type: 'boolean'
        }
    },
};
