module.exports = {
    environment: 'default',
    server: {
        port: 7531
    },
    redis: {
        host: 'localhost',
        port: 6753,
        path: null,
        url: null
    },
    mongoose: {
        hosts: ['localhost:27017'],
        dbName: 'gomenuboard'
    },
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        app: {
            name: 'GoMenuBoard Logger',
            code: 'GMENUB',
            env: process.env.NODE_ENV,
            build: null
        },
        logger: 'bl.gomenuboard'
    }
};
