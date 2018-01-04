const environment = require('./config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restify = require('restify');
const bunyan = require('bunyan');

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
/**
 * Send CORS headers
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next callback
 */
server.pre((req, res, next) => {
    let corsHost = '*';
    const corsHeaders = ['X-Requested-With', 'XSRF-TOKEN', 'Accept', 'Content-Type', 'Authorization'];
    const allowedOrigins = ['http://localhost', 'http://192.168.7.31'];

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
});

// TODO: Authentication

const user = {
    username: 'test-user',
    passwordHash: 'bcrypt-hashed-password',
    id: 1
};

// TODO: use to authenticate requests post-login
// passport.use(new BearerStrategy(
//     function (token, done) {
//         User.findOne({ token: token }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) { return done(null, false); }
//             return done(null, user, { scope: 'all' });
//         });
//     }
// ));
// server.get('/profile',
//     passport.authenticate('bearer', { session: false }),
//     function (req, res) {
//         res.json(req.user);
//     });

/**
 * Something
 * @param {string} username foo
 * @param {string} cb foo
 */
function findUser(username, cb) {
    if (username == user.username) {
        cb(null, user);
    } else {
        cb('No user by that name, fucker', null);
    }
}

passport.use(new PassportLocalJSONStrategy(
    function(username, password, done) {
        findUser(username, (err, foundUser) => {
            if (err) {
                console.assert('findUser error');
                return done(err);
            }

            // User not found
            if (!foundUser) {
                console.log('User not found');
                return done(null, false);
            }

            // Always use hashed passwords and fixed time comparison
            bcrypt.compare(password, foundUser.passwordHash, (err, isValid) => {
                if (err) {
                    console.log('password did not match');
                    return done(err);
                }
                if (!isValid) {
                    console.log('password otherwise invalid');
                    return done(null, false);
                }
                console.log('foundUser found and password matched ');
                return done(null, foundUser);
            });
        });
    }
));

server.post('/login', passport.authenticate('local'), (req, res, next) => {
    return next(new restifyErrors.InternalServerError);
});
// END: Authentication sandbox

// other middleware/plugins
server.use(restify.plugins.bodyParser({
    mapParams: false
}));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.gzipResponse());
server.pre(restify.pre.sanitizePath());

// Default error handler. Personalize according to your needs.
server.on('uncaughtException', (req, res, route, err) => {
    log.error('Error! uncaughtException', err.stack);
    res.send(500, err);
});

// debug info on each request
server.on('after', restify.plugins.auditLogger({
    log: log,
    event: 'after'
}));

// routes
const info = require('./src/info/');
info.router(server);

// start listening
console.log('Environment: %s', process.env.NODE_ENV);
server.listen(environment.server.port, () => {
    console.log('%s listening at %s', server.name, server.url);
    log.info('log - %s listening at %s', server.name, server.url);
});
