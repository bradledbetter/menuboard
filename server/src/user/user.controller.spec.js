const UserModel = require('./user.model');
const UserController = require('./user.controller');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');

describe('UserController', function() {
    let controller;
    const verifyCode = '1';
    const userPassword = 'ddd';
    const user = {
        _id: '1',
        username: 'brad@brad.com',
        passwordHash: userPassword,
        verifyCode: verifyCode,
        status: 'active',
        save: jasmine.createSpy('user.save').and.returnValue({
            then: function(success) {
                success('bla');
            }
        }),
        comparePassword: jasmine.createSpy('user.comparePassword').and.callFake(function(password, callback) {
            callback(password === userPassword);
        })
    };

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

    describe('createUser', function() {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        const crypto = require('crypto');
        const nodemailer = require('nodemailer');

        beforeEach(function() {
            spyOn(global, 'Promise').and.callFake(function(callback) {
                callback(myResolve, myReject);
            });

            spyOn(crypto, 'randomBytes').and.callFake(function(num, callback) {
                const buffer = new Buffer('1'.repeat(num));
                if (typeof callback === 'function') {
                    callback(null, buffer);
                } else {
                    return buffer;
                }
            });

            spyOn(UserModel, 'create').and.callFake(function(params) {
                return {
                    then: function(callback) {
                        callback(user);
                        return {catch: function() {}};
                    }
                };
            });

            spyOn(nodemailer, 'createTransport').and.returnValue({
                sendMail: function(optoins, callback) {
                    callback(null, {});
                }
            });
        });

        afterEach(function() {
            myResolve.calls.reset();
            myReject.calls.reset();
        });

        it('should be able to create a new user with a valid password', function() {
            spyOn(UserModel, 'validatePassword').and.callFake(function(pass, callback) {
                callback(null, true);
            });

            controller.createUser(user.username, user.passwordHash);
            expect(UserModel.validatePassword).toHaveBeenCalled();
            // expect(crypto.randomBytes).toHaveBeenCalled();
            expect(UserModel.create).toHaveBeenCalled();
            expect(nodemailer.createTransport).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should reject creating a user where the userame or password is missing', function() {
            spyOn(UserModel, 'validatePassword').and.callFake(function(pass, callback) {
                callback(null, true);
            });

            controller.createUser('', user.passwordHash);
            expect(UserModel.validatePassword).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            myReject.calls.reset();

            controller.createUser(user.username);
            expect(UserModel.validatePassword).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
        });

        it('should reject creating a new user with an invalid password', function() {
            spyOn(UserModel, 'validatePassword').and.callFake(function(pass, cb) {
                cb('bad password', false);
            });

            controller.createUser('bob', user.passwordHash);
            expect(UserModel.validatePassword).toHaveBeenCalled();
            expect(UserModel.create).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
        });
    });

    describe('verifyUser', function() {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(function() {
            spyOn(global, 'Promise').and.callFake(function(callback) {
                callback(myResolve, myReject);
            });
        });

        afterEach(function() {
            myResolve.calls.reset();
            myReject.calls.reset();
            user.save.calls.reset();
        });

        it('should be verify a user verifcation code', function() {
            spyOn(UserModel, 'findOne').and.callFake(function() {
                return {
                    then: function(callback) {
                        callback(user);
                        return {
                            catch: function() {}
                        };
                    }
                };
            });
            controller.verifyUser(verifyCode);
            expect(UserModel.findOne).toHaveBeenCalled();
            expect(user.save).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should be reject a bad user verifcation code', function() {
            spyOn(UserModel, 'findOne').and.callFake(function() {
                return {
                    then: function(success, failure) {
                        failure('Invalid verification code.');
                        return {
                            catch: function() {}
                        };
                    }
                };
            });
            controller.verifyUser();
            expect(UserModel.findOne).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            myReject.calls.reset();

            controller.verifyUser(verifyCode);
            expect(UserModel.findOne).toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            expect(user.save).not.toHaveBeenCalled();
        });
    });

    describe('verifyLogin', function() {
        const next = jasmine.createSpy('next');

        afterEach(function() {
            next.calls.reset();
            user.comparePassword.calls.reset();
        });

        it('should verify a login attempt', function() {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: function(success) {
                    success(user);
                    return {
                        catch: function() {}
                    };
                }
            });

            UserController.verifyLogin(user.username, userPassword, next);
            expect(user.comparePassword).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(null, user);
        });

        it('should be reject a login on nonexistent user', function() {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: function(success) {
                    success(null);
                    return {
                        catch: function() {}
                    };
                }
            });
            UserController.verifyLogin(user.username, userPassword, next);
            expect(user.comparePassword).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.UnauthorizedError), false);
        });

        it('should be reject a login on unmatched password', function() {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: function(success) {
                    success(user);
                    return {
                        catch: function() {}
                    };
                }
            });
            spyOn(logger, 'info');

            UserController.verifyLogin(user.username, '', next);
            expect(user.comparePassword).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.UnauthorizedError), false);
        });
    });
});
