const UserPasswordModel = require('./user-password.model');

describe('UserPasswordModel', () => {
    describe('validatePassword', () => {
        it('should let a valid password through', (done) => {
            UserPasswordModel.validatePassword('aA!1234567890xxxx')
                .then((val) => {
                    expect(val).toEqual(true);
                    done();
                });
        });

        it('should reject a password that is missing features', (done) => {
            UserPasswordModel.validatePassword('')
                .catch((error) => {
                    expect(error.message).toEqual('Invalid password');
                    return UserPasswordModel.validatePassword('A!1234567890XXXX');
                })
                .catch((error) => {
                    expect(error.message).toEqual('Invalid password');
                    return UserPasswordModel.validatePassword('a!1234567890xxxx');
                })
                .catch((error) => {
                    expect(error.message).toEqual('Invalid password');
                    return UserPasswordModel.validatePassword('aAfwefwefweFWEfxxxx');
                })
                .catch((error) => {
                    expect(error.message).toEqual('Invalid password');
                    done();
                });
        });
    });
});
