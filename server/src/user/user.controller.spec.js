// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./user.controller', {'../services/logger.service': mockLogger});

const UserModel = require('./user.model');
const UserController = require('./user.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('UserController', () => {
    let controller;
    const verifyCode = '1';
    const userPassword = 'ddd';
    const user = {
        _id: '1',
        username: 'brad@brad.com',
        passwordHash: userPassword,
        verifyCode: verifyCode,
        status: 'active'
    };
    user.save = jasmine.createSpy('user.save').and.returnValue(Promise.resolve(user));
    user.comparePassword = jasmine.createSpy('user.comparePassword')
        .and.callFake((password) => {
            if (password === userPassword) {
                return Promise.resolve(user);
            } else {
                return Promise.reject(new Error);
            }
        });
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    beforeEach(() => {
        controller = new UserController();
    });

    it('should be able to find one or many users', () => {
        spyOn(UserModel, 'find').and.returnValue(fakeQuery);
        spyOn(UserModel, 'findOne').and.returnValue(fakeQuery);

        controller.findUsers('1', ['username']);
        expect(UserModel.findOne).toHaveBeenCalled();

        controller.findUsers(null, ['username']);
        expect(UserModel.find).toHaveBeenCalled();
    });

    describe('createUser', () => {
        const crypto = require('crypto');
        const nodemailer = require('nodemailer');

        beforeEach(() => {
            spyOn(crypto, 'randomBytes').and.callFake((num, callback) => {
                const buffer = new Buffer('1'.repeat(num));
                if (typeof callback === 'function') {
                    callback(null, buffer);
                } else {
                    return buffer;
                }
            });

            spyOn(UserModel, 'create').and.returnValue(Promise.resolve(user));

            spyOn(nodemailer, 'createTransport').and.returnValue({
                sendMail: (optoins, callback) => {
                    callback(null, {});
                }
            });
        });

        it('should be able to create a new user with a valid password', (done) => {
            spyOn(UserModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            controller.createUser(user.username, user.passwordHash)
                .then(() => {
                    expect(UserModel.validatePassword).toHaveBeenCalled();
                    expect(UserModel.create).toHaveBeenCalled();
                    expect(nodemailer.createTransport).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject creating a user where the userame or password is missing', (done) => {
            spyOn(UserModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            controller.createUser('', user.passwordHash)
                .catch((error) => {
                    expect(UserModel.validatePassword).not.toHaveBeenCalled();
                    UserModel.validatePassword.calls.reset();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    return controller.createUser(user.username);
                })
                .catch((error) => {
                    expect(UserModel.validatePassword).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should reject creating a new user with an invalid password', (done) => {
            spyOn(UserModel, 'validatePassword').and.returnValue(Promise.reject(new Error('bad password')));
            controller.createUser('bob', user.passwordHash)
                .catch((error) => {
                    expect(UserModel.validatePassword).toHaveBeenCalled();
                    expect(UserModel.create).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('updateUser', () => {
        const newUser = {
            username: 'kellie@hightimes.com',
            password: '1Apoopypants!',
            status: 'inactive'
        };

        beforeEach(() => {
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
            mockLogger.warn.calls.reset();
            user.save.calls.reset();
            user.username = 'brad@brad.com';
            user.status = 'active';
            user.passwordHash = userPassword;
        });

        it('should save an updated user with valid fields', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            spyOn(UserModel, 'validatePassword').and.returnValue(Promise.resolve(true));

            controller.updateUser('1', newUser)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                    expect(user.save).toHaveBeenCalled();
                    expect(user.username).toEqual(newUser.username);
                    expect(user.status).toEqual(newUser.status);
                    done();
                });
        });

        it('should not save an updated user with invalid fields', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));

            let badPassword = true;
            spyOn(UserModel, 'validatePassword').and.callFake((pass) => {
                if (badPassword) {
                    return Promise.reject('error');
                } else {
                    return Promise.resolve(true);
                }
            });

            let tmp = '';
            controller.updateUser('1', newUser)
                .catch((error) => {
                    expect(user.save).not.toHaveBeenCalled();
                    expect(user.username).not.toEqual(newUser.username);
                    expect(user.status).not.toEqual(newUser.status);
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(mockLogger.warn).toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.InternalServerError));

                    mockLogger.info.calls.reset();
                    mockLogger.warn.calls.reset();
                    tmp = newUser.username; // eslint-disable-line
                    newUser.username = 'baddata';
                    badPassword = false;
                    return controller.updateUser('1', newUser);
                })
                .catch((error) => {
                    expect(user.save).not.toHaveBeenCalled();
                    expect(user.username).not.toEqual(newUser.username);
                    expect(user.status).not.toEqual(newUser.status);
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(mockLogger.warn).toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.InternalServerError));

                    mockLogger.info.calls.reset();
                    mockLogger.warn.calls.reset();
                    newUser.username = tmp;
                    newUser.status = 'dead';
                    return controller.updateUser('1', newUser);
                })
                .then(() => {
                    expect(user.save).toHaveBeenCalled();
                    expect(user.username).toEqual(newUser.username);
                    expect(user.status).not.toEqual(newUser.status);
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                    done();
                });
        });

        it('should not save a user that does not exist', (done) => {
            controller.updateUser('', newUser)
                .catch((error) => {
                    expect(user.save).not.toHaveBeenCalled();
                    expect(user.username).not.toEqual(newUser.username);
                    expect(user.status).not.toEqual(newUser.status);
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('verifyUser', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            user.save.calls.reset();
        });

        it('should verify a user verifcation code', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            controller.verifyUser(verifyCode)
                .then(() => {
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(user.save).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject a bad user verifcation code', (done) => {
            const errMsg = 'Invalid verification code.';
            spyOn(UserModel, 'findOne').and.returnValue(Promise.reject(new Error(errMsg)));
            controller.verifyUser()
                .catch((error) => {
                    expect(UserModel.findOne).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));

                    mockLogger.info.calls.reset();
                    return controller.verifyUser(verifyCode);
                })
                .catch((error) => {
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(user.save).not.toHaveBeenCalled();
                    expect(error.message).toEqual(errMsg);
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('deleteUser', () => {
        afterEach(() => {
            user.save.calls.reset();
            mockLogger.info.calls.reset();
        });

        it('should delete a user by setting its status to inactive', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            controller.deleteUser(user._id)
                .then(() => {
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(user.status).toEqual('inactive');
                    expect(user.save).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a user if no id provided', (done) => {
            spyOn(UserModel, 'findOne');
            controller.deleteUser()
                .catch((error) => {
                    expect(UserModel.findOne).not.toHaveBeenCalled();
                    expect(user.save).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('verifyLogin', () => {
        const next = jasmine.createSpy('next');

        afterEach(() => {
            next.calls.reset();
            user.comparePassword.calls.reset();
        });

        it('should verify a login attempt', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            UserController.verifyLogin(user.username, userPassword, next)
                .then(() => {
                    expect(user.comparePassword).toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(null, user);
                    done();
                });
        });

        it('should reject a login on nonexistent user', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(null));
            UserController.verifyLogin(user.username, userPassword, next)
                .catch(() => {
                    expect(user.comparePassword).not.toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.InternalServerError), false);
                    expect(mockLogger.warn).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject a login on unmatched password', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            UserController.verifyLogin(user.username, '', next)
                .catch(() => {
                    expect(user.comparePassword).toHaveBeenCalled();
                    expect(mockLogger.warn).toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.InternalServerError), false);
                    done();
                });
        });
    });
});
