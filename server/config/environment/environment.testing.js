const bunyan = require('bunyan');
const path = require('path');

const logDirectory = process.env.MB_LOG_DIRECTORY || '/_logs/menuboard';

// put together the db host string
const dbHostString = 'mongodb://localhost:27017/';

module.exports = {
    session: {
        secret: '903r209w342p4iofg4f9g4tg0934209erfoin',
        timeout: 60 * 60 * 1000
    },
    cors: {
        allowHeaders: [
            'X-Requested-With',
            'XSRF-TOKEN',
            'Accept',
            'Content-Type',
            'Authorization'
        ],
        allowedOrigins: [
            'http://localhost:4200'
        ]
    },
    aws: {
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY || '',
            secretAccessKey: process.env.AWS_SECRET_KEY || ''
        },
        ses: {
            apiVersion: '2010-12-01',
            sendingRate: 1
        },
        s3: {
            bucket: 'menuboard-upload-bucket',
            maxFileSizeBytes: 25000,
            allowedExtensions: new Set([
                'png',
                'jpg',
                'jpeg',
                'gif'
            ]),
            signatureVersion: 'v4',
            signatureExpiration: 180 // file upload signature expiration in seconds
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
        dbName: 'menuboardtest'
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