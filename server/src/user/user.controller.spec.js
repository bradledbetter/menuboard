const UserModel = require('./user.model');
const UserController = require('./user.controller');
const nodemailer = require('nodemailer');

describe('UserController', function() {
    let controller;
    // const verifyCode = '1';
    // const user = {
    //     _id: '1',
    //     username: 'brad@brad.com',
    //     passwordHash: 'ddd',
    //     verifyCode: verifyCode,
    //     status: 'active'
    // };
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

        let promise = controller.findUsers(1, ['username']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(UserModel.findOne).toHaveBeenCalled();

        promise = controller.findUsers(null, ['username']);
        expect(promise).toEqual();
        expect(UserModel.find).toHaveBeenCalled();
    });

    it('should be able to create a new user', function() {
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
