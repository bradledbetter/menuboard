const UserModel = require('./user.model');
const UserController = require('./user.controller');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');

describe('UserController', () => {
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
            then: (success) => {
                success('bla');
            }
        }),
        comparePassword: jasmine.createSpy('user.comparePassword').and.callFake((password, callback) => {
            callback(password === userPassword);
        })
    };

    beforeEach(() => {
        controller = new UserController();
    });

    it('should be able to find one or many users', () => {
        spyOn(UserModel, 'find').and.callThrough();
        spyOn(UserModel, 'findOne').and.callThrough();

        let promise = controller.findUsers('1', ['username']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(UserModel.findOne).toHaveBeenCalled();

        promise = controller.findUsers(null, ['username']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(UserModel.find).toHaveBeenCalled();
    });

    describe('createUser', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        const crypto = require('crypto');
        const nodemailer = require('nodemailer');

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(crypto, 'randomBytes').and.callFake((num, callback) => {
                const buffer = new Buffer('1'.repeat(num));
                if (typeof callback === 'function') {
                    callback(null, buffer);
                } else {
                    return buffer;
                }
            });

            spyOn(UserModel, 'create').and.callFake((params) => {
                return {
                    then: (callback) => {
                        callback(user);
                        return {catch: () => {}};
                    }
                };
            });

            spyOn(nodemailer, 'createTransport').and.returnValue({
                sendMail: (optoins, callback) => {
                    callback(null, {});
                }
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
        });

        it('should be able to create a new user with a valid password', () => {
            spyOn(UserModel, 'validatePassword').and.callFake((pass, callback) => {
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

        it('should reject creating a user where the userame or password is missing', () => {
            spyOn(UserModel, 'validatePassword').and.callFake((pass, callback) => {
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

        it('should reject creating a new user with an invalid password', () => {
            spyOn(UserModel, 'validatePassword').and.callFake((pass, cb) => {
                cb('bad password', false);
            });

            controller.createUser('bob', user.passwordHash);
            expect(UserModel.validatePassword).toHaveBeenCalled();
            expect(UserModel.create).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
        });
    });

    describe('verifyUser', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            user.save.calls.reset();
        });

        it('should verify a user verifcation code', () => {
            spyOn(UserModel, 'findOne').and.callFake(() => {
                return {
                    then: (callback) => {
                        callback(user);
                        return {
                            catch: () => {}
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

        it('should reject a bad user verifcation code', () => {
            spyOn(UserModel, 'findOne').and.callFake(() => {
                return {
                    then: (success, failure) => {
                        failure('Invalid verification code.');
                        return {
                            catch: () => {}
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

    describe('deleteUser', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            user.save.calls.reset();
        });

        it('should delete a user by setting its status to inactive', () => {
            spyOn(UserModel, 'findOne').and.callFake(() => {
                return {
                    then: (callback) => {
                        callback(user);
                        return {
                            catch: () => {}
                        };
                    }
                };
            });
            controller.deleteUser(user._id);
            expect(UserModel.findOne).toHaveBeenCalled();
            expect(user.status).toEqual('inactive');
            expect(user.save).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalledWith('Success');
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should not delete a user if no id provided', () => {
            spyOn(UserModel, 'findOne');
            controller.deleteUser();
            expect(UserModel.findOne).not.toHaveBeenCalled();
            expect(user.save).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });
    });

    describe('verifyLogin', () => {
        const next = jasmine.createSpy('next');

        afterEach(() => {
            next.calls.reset();
            user.comparePassword.calls.reset();
        });

        it('should verify a login attempt', () => {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: (success) => {
                    success(user);
                    return {
                        catch: () => {}
                    };
                }
            });

            UserController.verifyLogin(user.username, userPassword, next);
            expect(user.comparePassword).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(null, user);
        });

        it('should be reject a login on nonexistent user', () => {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: (success) => {
                    success(null);
                    return {
                        catch: () => {}
                    };
                }
            });
            UserController.verifyLogin(user.username, userPassword, next);
            expect(user.comparePassword).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.UnauthorizedError), false);
        });

        it('should be reject a login on unmatched password', () => {
            spyOn(UserModel, 'findOne').and.returnValue({
                then: (success) => {
                    success(user);
                    return {
                        catch: () => {}
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
