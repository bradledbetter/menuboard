const UserModel = require('./user.model');
const restifyErrors = require('restify-errors');

describe('UserModel', () => {
    describe('comparePassword', () => {
        const bcrypt = require('bcryptjs');
        const user = new UserModel({username: 'bob@bob', passwordHas: '324324', status: 'active'});
        const next = jasmine.createSpy('next');

        afterEach(() => {
            next.calls.reset();
        });

        it('should call the "next" callback with true when there is a match', () => {
            spyOn(bcrypt, 'compare').and.callFake((password, hash, callback) => {
                callback(null, true);
            });

            user.comparePassword('foo', next);
            expect(next).toHaveBeenCalledWith(true);
        });

        it('should call the "next" callback with error when there is no a match', () => {
            const logger = require('../services/logger.service');
            spyOn(logger, 'error');
            spyOn(bcrypt, 'compare').and.callFake((password, hash, callback) => {
                callback('no match', false);
            });

            user.comparePassword('foo', next);
            expect(next).toHaveBeenCalledWith(jasmine.any(restifyErrors.UnauthorizedError));
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('validatePassword', () => {
        const next = jasmine.createSpy('next').and.callFake(() => {});

        afterEach(() => {
            next.calls.reset();
        });

        it('should let a valid password through', () => {
            UserModel.validatePassword('aA!1234567890xxxx', next);
            expect(next).toHaveBeenCalledWith(null, true);
        });

        it('should reject a password that is missing features', () => {
            UserModel.validatePassword('', next);
            expect(next).toHaveBeenCalledWith('Invalid password', false);
            next.calls.reset();

            UserModel.validatePassword('A!1234567890XXXX', next);
            expect(next).toHaveBeenCalledWith('Invalid password', false);
            next.calls.reset();

            UserModel.validatePassword('a!1234567890xxxx', next);
            expect(next).toHaveBeenCalledWith('Invalid password', false);
            next.calls.reset();

            UserModel.validatePassword('aAfwefwefweFWEfxxxx', next);
            expect(next).toHaveBeenCalledWith('Invalid password', false);
            next.calls.reset();
        });
    });
});
