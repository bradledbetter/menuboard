const UserModel = require('./user.model');

describe('UserModel', () => {
    describe('validatePassword', () => {
        it('should let a valid password through', (done) => {
            UserModel.validatePassword('aA!1234567890xxxx')
                .then((val) => {
                    expect(val).toEqual(true);
                    done();
                });
        });

        it('should reject a password that is missing features', (done) => {
            UserModel.validatePassword('')
                .catch((error) => {
                    expect(error).toEqual('Invalid password');
                    return UserModel.validatePassword('A!1234567890XXXX');
                })
                .catch((error) => {
                    expect(error).toEqual('Invalid password');
                    return UserModel.validatePassword('a!1234567890xxxx');
                })
                .catch((error) => {
                    expect(error).toEqual('Invalid password');
                    UserModel.validatePassword('aAfwefwefweFWEfxxxx');
                    done();
                });
        });
    });
});
