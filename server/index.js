const environment = require('./config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const logger = require('./src/services/logger.service');
const db = require('./src/services/db.service');

// my routes, controllers, models
const auth = require('./src/auth/');
const info = require('./src/info/');
const user = require('./src/user/');
const menuItem = require('./src/menu-item/');
const menu = require('./src/menu/');
const image = require('./src/image/');
const venue = require('./src/venue/');
const event = require('./src/event/');
const slide = require('./src/slide/');
const slideshow = require('./src/slideshow/');

// listen for exit signals
const myexit = (type) => {
    db.disconnect();
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

// Make sure we log unhandled promise rejections, as they can hint at bigger problems
process.on('unhandledRejection', (err) => {
    const message = 'Unhandled Promise Rejection: ';
    console.error(message, err);
    logger.error(message, err);
});

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
    log: logger,
    formatters: {
        'application/json': (req, res, body) => {
            if (body instanceof Error) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                return body.stack;
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
                return body.toString('base64');
            }

            return JSON.stringify(body);
        }
    }
});

// CORS handling
const corsHeaders = environment.cors.allowHeaders;
const allowedOrigins = environment.cors.allowedOrigins;
if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:4200'); // for dev
}

const cors = corsMiddleware({
    origins: allowedOrigins,
    allowHeaders: corsHeaders,
    exposeHeaders: ['Content-Type', 'Location']
    // vary: ['Origin'],
    // allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS']
    // res.setHeader('Access-Control-Allow-Credentials', true);
});

server.pre(cors.preflight);
server.use(cors.actual);

// Various error/exception handling
// Default error handler. Personalize according to your needs.
server.on('uncaughtException', (req, res, route, err) => {
    logger.error(err);
    res.send(500, err.message);
});

// debug info on each request
server.on('after', restify.plugins.auditLogger({
    log: logger,
    event: 'after'
}));

// main middleware/plugins
server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonBodyParser());
server.use(restify.plugins.gzipResponse());
server.pre(restify.pre.sanitizePath());

// authentication
auth.init(server);

// routes
auth.router(server);
info.router(server);
user.router(server);
menuItem.router(server);
menu.router(server);
image.router(server);
venue.router(server);
event.router(server);
slide.router(server);
slideshow.router(server);

// start listening
try {
    db.connect();

    console.log(`Environment: ${process.env.NODE_ENV}`);
    server.listen(environment.server.port, () => {
        const message = `${server.name} listening at ${server.url}`;
        console.log(message);
        logger.info(message);
    });
} catch (ex) {
    logger.error(ex);
    console.error('Failed to start server: ', ex);
    myexit('MANUAL');
}
