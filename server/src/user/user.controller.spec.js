const UserModel = require('./user.model');
const UserController = require('./user.controller');

describe('UserController', function() {
    let controller;
    const verifyCode = '1';
    const user = {
        _id: '1',
        username: 'brad@brad.com',
        passwordHash: 'ddd',
        verifyCode: verifyCode,
        status: 'active'
    };
    // const fakeModelPromise = {
    //     select: function() {},
    //     exec: function() {}
    // };

    beforeEach(function() {
        controller = new UserController();
    });

    it('should be able to find one or many users', function() {
        spyOn(UserModel, 'find').and.callThrough();
        spyOn(UserModel, 'findOne').and.callThrough();

        let promise = controller.findUsers('1', ['username']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(UserModel.findOne).toHaveBeenCalled();

        promise = controller.findUsers(null, ['username']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(UserModel.find).toHaveBeenCalled();
    });

    it('should be able to create a new user with a valid password', function() {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        spyOn(global, 'Promise').and.callFake(function(callback) {
            callback(myResolve, myReject);
        });

        spyOn(UserModel, 'validatePassword').and.callFake(function(pass, callback) {
            callback(null, true);
        });

        const fakeBuffer = {
            toString: function() {
                return verifyCode;
            }
        };
        const crypto = require('crypto');
        spyOn(crypto, 'randomBytes').and.callFake(function(num, callback) {
            callback(null, fakeBuffer);
        });

        spyOn(UserModel, 'create').and.callFake(function(params) {
            return {
                then: function(callback) {
                    callback(user);
                    return {catch: function() {}};
                }
            };
        });

        const nodemailer = require('nodemailer');
        spyOn(nodemailer, 'createTransport').and.returnValue({
            sendMail: function(optoins, callback) {
                callback(null, {});
            }
        });

        controller.createUser(user.username, user.passwordHash);
        expect(UserModel.validatePassword).toHaveBeenCalled();
        expect(crypto.randomBytes).toHaveBeenCalled();
        expect(UserModel.create).toHaveBeenCalled();
        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(myResolve).toHaveBeenCalled();
        expect(myReject).not.toHaveBeenCalled();
    });

    it('should reject creating a new user with an invalid password', function() {
        spyOn(UserModel, 'validatePassword').and.callFake(function(pass, cb) {
            cb('bad password', false);
        });
        expect(false).toBe(true);
    });

    it('should be verify a user verifcation code', function() {
        expect(false).toBe(true);
    });

    it('should be reject a bad user verifcation code', function() {
        expect(false).toBe(true);
    });

    it('should verify a login attempt', function() {
        expect(false).toBe(true);
    });

    it('should be reject a bad login', function() {
        expect(false).toBe(true);
    });

});
