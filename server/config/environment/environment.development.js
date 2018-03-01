const bunyan = require('bunyan');
const path = require('path');

const logDirectory = process.env.MB_LOG_DIRECTORY || '/_logs/menuboard';

// put together the db host string
const dbUser = process.env.MB_DB_USER || '';
const dbPassword = process.env.MB_DB_PASS || '';
const dbHost = process.env.MB_DB_HOST || 'localhost';
const dbPort = '' + (process.env.MB_DB_PORT || '27017');
const dbHostString = 'mongodb://'
    + dbUser
    + (dbPassword ? `:${dbPassword}` : '')
    + (dbUser ? '@' : '')
    + dbHost
    + (dbPort ? `:${dbPort}` : '') + '/';

module.exports = {
    session: {
        secret: process.env.MB_SESSION_SECRET || '903r209w342p4iofg4f9g4tg0934209erfoin',
        timeout: 60 * 60 * 1000
    },
    aws: {
        region: 'us-west-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY || '',
            secretAccessKey: process.env.AWS_SECRET_KEY || ''
        },
        ses: {
            apiVersion: '2010-12-01',
            sendingRate: 1
        }
    },
    saltWorkFactor: 10,
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
        host: dbHostString,
        dbName: 'menuboard'
    },
    logDirectory,
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
