const environment = require('./config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restify = require('restify');
const bunyan = require('bunyan');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');

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

// main middleware/plugins
server.use(restify.plugins.bodyParser({
    mapParams: false
}));
server.use(restify.plugins.queryParser());
// server.use(restify.plugins.gzipResponse());
// server.pre(restify.pre.sanitizePath());


// TODO: Authentication
// https://gist.github.com/yoitsro/8693021/b43fd1c8ee79a9b3bcc0701bc07b84c4fc809c07
const user = {
    username: 'test-user',
    passwordHash: 'bcrypt-hashed-password',
    id: 1
};

/**
 * Something
 * @param {string} usernameOrId foo
 * @param {string} cb foo
 */
function findUser(usernameOrId, cb) {// TODO: this would obviously be on the User model
    if (usernameOrId == user.username) {
        cb(null, user);
    } else if (usernameOrId == user.id) {
        cb(null, user);
    } else {
        cb('No user by that name, fucker', null);
    }
}

const sessions = require('client-sessions');
server.use(sessions({
    cookieName: 'session', // cookie name dictates the key name added to the request object
    secret: 'ewrewrwerew', //  TODO: environment. should be a large unguessable string
    duration: 60 * 1000, // how long the session will stay valid in ms
    cookie: {
        path: '/',
        ephemeral: true
    }
}));

server.use(passport.initialize());
server.use(passport.session());

// I think This is how a user gets serialized to a session token
passport.serializeUser(function(user, done) {
    console.log(`passport.serializeUser`, user);
    done(null, user.id);
});

// I think This is how a user gets deserialized when a session token is sent in the header
passport.deserializeUser(function(id, done) {
    // Look the user up in the database and return the user object
    findUser(id, (err, foundUser) => {
        if (err) {
            console.assert('deserializeUser: findUser error');
            return done(new restifyErrors.InternalServerError(err));
        }

        // User not found
        if (!foundUser) {
            console.log('deserializeUser: User not found');
            return done(new restifyErrors.Unauthorized(err), false);
        }

        return done(null, foundUser);
    });
});

// user local username/password authentication
passport.use(new PassportLocalStrategy({session: true},
    function(username, password, done) {// TODO: move this verify function into middleware/auth.js
        console.log('user verify function');
        findUser(username, (err, foundUser) => {
            if (err) {
                console.assert('verify callback: findUser error');
                return done(new restifyErrors.InternalServerError(err));
            }

            // User not found
            if (!foundUser) {
                console.log('User not found');
                return done(new restifyErrors.Unauthorized(err), false);
            }
            return done(null, foundUser);

            // Always use hashed passwords and fixed time comparison
            // bcrypt.compare(password, foundUser.passwordHash, (err, isValid) => {
            //     if (err) {
            //         console.log('error thrown in bcrypt compare');
            //         return done(new restifyErrors.InternalServerError(err));
            //     }
            //     if (!isValid) {
            //         console.log('password otherwise invalid');
            //         return done(new restifyErrors.UnauthorizedError, false);
            //     }
            //     console.log('found user and password matched');
            //     return done(null, foundUser);
            // });
        });
    }
));

server.post('/login', passport.authenticate('local', {session: false}), (req, res, next) => {
    // must call req.logIn() to establish the session
    req.logIn(req.user, (err) => {
        if (err) {
            return next(new restifyErrors.InternalServerError(err));
        }
        if (req.session) {
            console.log('login req session ', req.session);
        }
        if (res.cookies) {
            console.log('login response cookies ', req.cookies);
        }

        res.send(200, {success: 'Logged in'});
        return next();
    });
});
// server.post('/login', (req, res, next) => {
//     passport.authenticate('local', function(err, loggedInUser) {
//         if (err) {
//             return next(new restifyErrors.InternalServerError(err));
//         }

//         // Technically, the user should exist at this point, but if not, check
//         if (!loggedInUser) {
//             return next(new restifyErrors.UnauthorizedError('Please check your credentials and try again.'));
//         }

//         // TODO: Log the user in
//         req.user = loggedInUser;
//         console.log(req.isAuthenticated());
//         if (req.session) {
//             req.session.userId = loggedInUser.id;
//         } else {
//             req.session = {userId: loggedInUser.id};
//         }

//         if (loggedInUser.username) {
//             res.send(200, {success: 'Welcome ' + loggedInUser.username + '!'});
//             return next();
//         }

//         res.send(200, {success: 'Welcome!'});
//         return next();
//     })(req, res, next);
// });

server.get('/profile', (req, res, next) => {
    if (req.cookies) {
        console.log('profile request cookies ', req.cookies);
    }
    if (req.session) {
        console.log('profile session ', req.session);
    }
    if (!req.isAuthenticated()) {
        console.log('unauthenticated user trying to access profile');
        return next(new restifyErrors.UnauthorizedError('Stop trying to access profile, you imposter!'));
    }


    res.send(200, {user: req.user});
    return next();
});
// END: Authentication sandbox


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
