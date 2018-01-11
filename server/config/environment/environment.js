const bunyan = require('bunyan');
const path = require('path');

const logDirectory = '/_logs/menuboard';

module.exports = {
    session: {
        secret: process.env.MB_SESSION_SECRET || '903r209w342p4iofg4f9g4tg0934209erfoin',
        timeout: 60 * 60 * 1000
    },
    environment: 'default',
    server: {
        proto: 'http',
        host: 'localhost',
        port: 7531
    },
    redis: {
        host: 'localhost',
        port: 6753,
        path: null,
        url: null
    },
    mongoose: {
        host: 'localhost:27017',
        dbName: 'menuboard'
    },
    logDirectory: '/var/log/menuboard',
    logTimeFormat: 'MM/DD/YYYY HH:mm:ss A',
    logger: {
        name: 'bl.menuboard-server',
        streams: [{
            level: bunyan.INFO,
            type: 'rotating-file',
            path: path.resolve(logDirectory, 'menuboard-server.log'),
            period: '1d', // daily rotation
            count: 3 // keep 3 back copies
        }, {
            level: bunyan.ERROR,
            stream: process.stderr
        }],
        serializers: bunyan.stdSerializers
    }
};
