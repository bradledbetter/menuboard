const UserController = require('./user.controller');
// const restifyErrors = require('restify-errors');
// const logger = require('../services/logger.service');
const userRouter = require('./user.router');
const restify = require('restify');

xdescribe('User router', () => {
    const user = {
        _id: '1',
        username: 'bob@bob.com',
        passwordHash: 'dddd',
        status: 'active'
    };
    // let controller;
    // const sinon = require('sinon');
    const supertest = require('supertest');
    const server = restify.createServer();
    server.use(restify.plugins.bodyParser({
        mapParams: false
    }));
    // TODO: I now realize that without a singleton/DI, this can't work, because I can't spy on the one the router creates.
    const controller = new UserController();

    describe(' GET /profile ', () => {
        let request;
        let authenticated = true;

        beforeEach(() => {
            // TODO: how to mock req in a better way? superagent?https://github.com/visionmedia/superagent
            server.use(function(req, rest, next) {
                req.isAuthenticated = () => authenticated;
                req.user = user;
                next();
            });
            userRouter(server);
            request = supertest(server);
        });

        it('should respond with the logged in user', (done) => {
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

        it('should return an error if not authenticated', (done) => {
            authenticated = false;
            request
                .get('/profile')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err) => {
                    expect(err).toBe(null);
                    done();
                });
        });
    });

    describe('POST /user/register ', () => {
        beforeEach(() => {
            userRouter(server);
            request = supertest(server);
        });

        it('should create a new at the register endpoint', (done) => {
            spyOn(controller, 'createUser').and.callFake((username, password) => {

                return {
                    then: (callback) => {
                        callback('success');
                        return {
                            catch: () => {}
                        };
                    }
                };
            });

            request
                .post('/user/register')
                .send({
                    username: 'bob',
                    password: 'bob'
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err) => {
                    expect(err).toBe(null);
                    done();
                });
        });
    });
    describe('GET /user/verify/:code ', () => {});
    describe('POST /user ', () => {});
    describe('GET /user ', () => {});
    describe('GET /user/:id ', () => {});
    describe('DELETE /user/:id ', () => {});
});
