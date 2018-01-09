// a fake user for testing until I get real models going
const user = {
    username: 'test-user',
    passwordHash: 'bcrypt-hashed-password',
    _id: '1'
};

/**
 * A fake user class to use unitl we get our models set up
 * @class User
 */
class User {
    /**
     * Make a new User
     */
    constructor() {

    }

    /**
     * Find a user by id
     * @param {*} input placeholder for consistency
     * @return {Promise}
     */
    static findUserById(input) {
        return Promise.resolve(user);
    }

    /**
     * General find single user
     * @param {*} input placeholder for consistencyt
     * @return {Promise}
     */
    static findUser(input) {
        return Promise.resolve(user);
    }
}

module.exports = User;
