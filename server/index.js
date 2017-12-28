const environment = require('./environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restify = require('restify');
const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');

// listen for exit signals
const myexit = (type) => {
    console.log(`Received '${type}' signal/event. Exiting...`);
    process.exit();
};

process.on('SIGINT', () => {
    myexit('SIGINT');
});
process.on('SIGTERM', () => {
    myexit('SIGTERM');
});
process.on('SIGHUP', () => {
    myexit('SIGHUP');
});


// set up logging
log = bunyan.createLogger(environment.logger);

// check for certificate and key paths
let serverCert;
let serverKey;
if (process.env.TAPSERVE_CERT_PATH && process.env.TAPSERVE_KEY_PATH) {
    serverCert = process.env.TAPSERVE_CERT_PATH;
    serverKey = process.env.TAPSERVE_KEY_PATH;
}

// create server
server = restify.createServer({
    certificate: serverCert,
    key: serverKey,
    name: 'menuboard-server',
    log: log,
    formatters: {
        'application/json': (req, res, body, cb) => {
            if (body instanceof Error) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                return cb(null, body.stack);
            }

            res.setHeader('Cache-Control', 'must-revalidate');

            // Does the client *explicitly* accepts application/json?
            const sendPlainText = (req.header('Accept').split(/, */).indexOf('application/json') === -1);

            // Send as plain text
            if (sendPlainText) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            }

            // Send as JSON
            if (!sendPlainText) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }

            if (Buffer.isBuffer(body)) {
                return cb(null, body.toString('base64'));
            }

            return cb(null, JSON.stringify(body));
        }
    }
});

// CORS handling
const corsHost = '*';
const corsHeaders = ['X-Requested-With', 'XSRF-TOKEN', 'Accept', 'Content-Type', 'Authorization'];
const allowedOrigins = ['http://localhost', 'http://192.168.7.31'];
server.use(restify.CORS({
    origins: allowedOrigins, // [corsHost],
    credentials: true,
    headers: corsHeaders
}));

/**
 * Send CORS headers
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next callback
 */
function corsResponse(req, res, next) {
    if (allowedOrigins.indexOf(req.headers.origin) > -1) {
        corsHost = req.headers.origin;
    } else {
        corsHost = allowedOrigins[0];
    }
    res.setHeader('Access-Control-Allow-Origin', corsHost); // TODO: update this
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', corsHeaders.join(',')); // I don't think I need those X- ones
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    next();
}
server.opts(/\.*/, corsResponse);

server.use(restify.bodyParser({
    mapParams: false
}));
server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());

// Default error handler. Personalize according to your needs.
server.on('uncaughtException', (req, res, route, err) => {
    log.error('Error! uncaughtException', err.stack);
    res.send(500, err);
});

// debug info on each request
server.on('after', restify.auditLogger({
    log: log
}));

// TODO: routes

console.log('Environment: %s', process.env.NODE_ENV);


server.listen(environment.server.port, () => {
    console.log('%s listening at %s', server.name, server.url);
    log.info('log - %s listening at %s', server.name, server.url);
});
