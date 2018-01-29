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
    const server = restify.createServer();

    // beforeEach(function() {
    // controller = new UserController();
    // });

    describe(' GET /profile ', function() {
        let request;
        let authenticated = true;

        beforeEach(function() {
            // TODO: how to mock req in a better way? superagent?https://github.com/visionmedia/superagent
            server.use(function(req, rest, next) {
                req.isAuthenticated = () => authenticated;
                req.user = user;
                next();
            });
            userRouter(server);
            request = supertest(server);
        });

        it('should respond with the logged in user', function(done) {
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

        it('should return an error if not authenticated', function(done) {
            authenticated = false;
            supertest(server)
                .get('/profile')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err) => {
                    expect(err).toBe(null);// TODO: this is horse shit. Find something better
                    done();
                });
        });
    });

    describe('POST /user/register ', function() {});
    describe('GET /user/verify/:code ', function() {});
    describe('POST /user ', function() {});
    describe('GET /user ', function() {});
    describe('GET /user/:id ', function() {});
    describe('DELETE /user/:id ', function() {});
});
