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
        dbName: 'menuboard'
    },
    logDirectory,
    logTimeFormat: 'MM/DD/YYYY HH:mm:ss A',
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        app: {
            name: 'MenuBoard Logger',
            code: 'MENUB',
            env: process.env.NODE_ENV,
            build: null
        },
        logger: 'bl.menuboard'
    }
};
