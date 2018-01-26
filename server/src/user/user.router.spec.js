// const UserController = require('./user.controller');
// const restifyErrors = require('restify-errors');
// const logger = require('../services/logger.service');
const userRouter = require('./user.router');
const restify = require('restify');

describe('User router', () => {
    const user = {
        _id: '1',
        username: 'bob@bob.com',
        passwordHash: 'dddd',
        status: 'active'
    };
    // let controller;
    // const sinon = require('sinon');
    const supertest = require('supertest');

    const server = restify.createServer({
        formatters: {
            'application/json': (req, res, body) => {
                if (body instanceof Error) {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    return body.stack;
                }

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

    // beforeEach(function() {
    // controller = new UserController();
    // });

    describe(' GET /profile ', function() {
        let request;

        beforeEach(function() {
            // TODO: how to mock req in a better way? superagent?https://github.com/visionmedia/superagent
            server.use(function(req, rest, next) {
                req.isAuthenticated = () => true;
                req.user = user;
                next();
            });
            userRouter(server);
            request = supertest(server);
        });

        fit('should respond with the logged in user', function(done) {
            request
                .get('/profile')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    expect(err).toBe(null);
                    expect(res.body).toEqual({user: user});
                    done();
                });
        });
    });
});
