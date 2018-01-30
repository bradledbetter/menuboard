const userRouter = require('./user.router');
const restify = require('restify');

describe('User router', () => {
    const user = {
        _id: '1',
        username: 'bob@bob.com',
        passwordHash: 'dddd',
        status: 'active'
    };

    const supertest = require('supertest');
    const server = restify.createServer();
    server.use(restify.plugins.bodyParser({
        mapParams: false
    }));

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
            // TODO: proxyquire to override UserController
            const proxyquire = require('proxyquire');
            class UserControllerMock {
                createUser = jasmine.createSpy('UserController.createUser').and.callFake((/*username, password*/) => {
                    console.log('FAKE createUser');
                    return {
                        then: (callback) => {
                            callback('Success');
                            return {
                                catch: () => {}
                            };
                        }
                    };
                });
            }
            proxyquire('./user.router', {
                './user.controller': UserControllerMock
            });

            userRouter(server);
            request = supertest(server);
        });

        fit('should create a new at the register endpoint', (done) => {

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
