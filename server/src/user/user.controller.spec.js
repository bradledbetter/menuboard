// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./user.controller', {'../services/logger.service': mockLogger});

const UserModel = require('./user.model');
const UserPasswordModel = require('./user-password.model');
const controller = require('./user.controller');
const restifyErrors = require('restify-errors');
const mongoose = require('mongoose');
const Promise = require('bluebird');

describe('UserController', () => {
    const verifyCode = '1';
    const originalPassword = 'dD1!dD1!dD1!';
    const user = {
        _id: new mongoose.Types.ObjectId(),
        username: 'brad@brad.com',
        verifyCode: verifyCode,
        status: 'active'
    };
    user.save = jasmine.createSpy('user.save').and.returnValue(Promise.resolve(user));
    user.comparePassword = jasmine.createSpy('user.comparePassword')
        .and.callFake((password) => {
            if (password === originalPassword) {
                return Promise.resolve(user);
            } else {
                return Promise.reject(new Error('OMG!'));
            }
        });
    const userPassword = {
        userId: user._id,
        passwordHash: originalPassword
    };
    userPassword.save = jasmine.createSpy('userPassword.save').and.returnValue(Promise.resolve(userPassword));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

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
            spyOn(UserPasswordModel, 'create').and.returnValue(Promise.resolve(userPassword));

            spyOn(nodemailer, 'createTransport').and.returnValue({
                sendMail: (optoins, callback) => {
                    callback(null, {});
                }
            });
        });

        it('should be able to create a new user with a valid password', (done) => {
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            controller.createUser(user.username, originalPassword)
                .then(() => {
                    expect(UserPasswordModel.validatePassword).toHaveBeenCalled();
                    expect(UserModel.create).toHaveBeenCalled();
                    expect(nodemailer.createTransport).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject creating a user where the userame or password is missing', (done) => {
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            controller.createUser('', originalPassword)
                .catch((error) => {
                    expect(UserPasswordModel.validatePassword).not.toHaveBeenCalled();
                    UserPasswordModel.validatePassword.calls.reset();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    expect(UserModel.create).not.toHaveBeenCalled();
                    UserModel.create.calls.reset();
                    expect(UserPasswordModel.create).not.toHaveBeenCalled();
                    UserPasswordModel.create.calls.reset();
                    return controller.createUser(user.username);
                })
                .catch((error) => {
                    expect(UserPasswordModel.validatePassword).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should reject creating a new user with an invalid password', (done) => {
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.reject(new Error('bad password')));
            controller.createUser('bob', originalPassword)
                .catch((error) => {
                    expect(UserPasswordModel.validatePassword).toHaveBeenCalled();
                    expect(UserModel.create).not.toHaveBeenCalled();
                    expect(UserPasswordModel.create).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('updateUser', () => {
        const newUser = {
            username: 'kellie@hightimes.com',
            password: '1AFewfwfwfonoubiub!',
            status: 'inactive'
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            mockLogger.warn.calls.reset();
            user.save.calls.reset();
            user.username = 'brad@brad.com';
            user.status = 'active';
        });

        it('should save an updated user with valid fields', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));

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

            let tmp = newUser.username; // eslint-disable-line
            newUser.username = 'baddata';
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

    describe('changePassword', () => {
        const newPassword = 'foo';

        afterEach(() => {
            mockLogger.info.calls.reset();
            mockLogger.warn.calls.reset();
            userPassword.save.calls.reset();
        });

        it('should be able to change a password for a user', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            spyOn(UserPasswordModel, 'findOne').and.returnValue(Promise.resolve(userPassword));
            controller.changePassword(user._id, newPassword)
                .then(()=>{
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(UserPasswordModel.validatePassword).toHaveBeenCalled();
                    expect(UserPasswordModel.findOne).toHaveBeenCalled();
                    expect(userPassword.passwordHash).toEqual(newPassword);
                    expect(userPassword.save).toHaveBeenCalled();
                    done();
                });
        });

        it('should not change a password for an inactive user', (done) => {
            user.status = 'inactive';
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            spyOn(UserPasswordModel, 'findOne');
            controller.changePassword(user._id, newPassword)
                .catch((error)=>{
                    expect(error).toEqual(jasmine.any(restifyErrors.InternalServerError));
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(UserPasswordModel.validatePassword).not.toHaveBeenCalled();
                    expect(UserPasswordModel.findOne).not.toHaveBeenCalled();
                    expect(userPassword.save).not.toHaveBeenCalled();
                    user.status = 'active';
                    done();
                });
        });

        it('should not change a password for a user that doesn\'t exist', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(null));
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.resolve(true));
            spyOn(UserPasswordModel, 'findOne');
            controller.changePassword(null, newPassword)
                .catch((error) => {
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    expect(UserModel.findOne).not.toHaveBeenCalled();
                    UserModel.findOne.calls.reset();
                    expect(UserPasswordModel.validatePassword).not.toHaveBeenCalled();
                    UserPasswordModel.validatePassword.calls.reset();
                    expect(userPassword.save).not.toHaveBeenCalled();
                    userPassword.save.calls.reset();
                    return controller.changePassword(user._id, newPassword);
                })
                .catch((error) => {
                    expect(error).toEqual(jasmine.any(restifyErrors.InternalServerError));
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(UserPasswordModel.validatePassword).not.toHaveBeenCalled();
                    expect(UserPasswordModel.findOne).not.toHaveBeenCalled();
                    expect(userPassword.save).not.toHaveBeenCalled();
                    done();
                });
        });

        it('should not change a password to one that isn\'t valid', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            spyOn(UserPasswordModel, 'validatePassword').and.returnValue(Promise.reject(new Error('error')));
            spyOn(UserPasswordModel, 'findOne');
            controller.changePassword(user._id, newPassword)
                .catch((error) => {
                    expect(error).toEqual(jasmine.any(restifyErrors.InternalServerError));
                    expect(UserModel.findOne).toHaveBeenCalled();
                    expect(UserPasswordModel.validatePassword).toHaveBeenCalled();
                    expect(UserPasswordModel.findOne).not.toHaveBeenCalled();
                    expect(userPassword.save).not.toHaveBeenCalled();
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
            spyOn(UserModel, 'findOne').and.callFake(() => {
                return Promise.reject(new Error(errMsg));
            });
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
            controller.deleteUser(user._id.toHexString())
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
            controller.verifyLogin(user.username, originalPassword, next)
                .then(() => {
                    expect(user.comparePassword).toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(null, user);
                    done();
                });
        });

        it('should reject a login on nonexistent user', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(null));
            controller.verifyLogin(user.username, originalPassword, next)
                .catch(() => {
                    expect(user.comparePassword).not.toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.InternalServerError), false);
                    expect(mockLogger.warn).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject a login on unmatched password', (done) => {
            spyOn(UserModel, 'findOne').and.returnValue(Promise.resolve(user));
            controller.verifyLogin(user.username, '', next)
                .catch(() => {
                    expect(user.comparePassword).toHaveBeenCalled();
                    expect(mockLogger.warn).toHaveBeenCalled();
                    expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.InternalServerError), false);
                    done();
                });
        });
    });
});
