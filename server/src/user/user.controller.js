// const bcrypt = require('bcryptjs');// TODO: for when we're actually comparing passwords
const restifyErrors = require('restify-errors');
const UserModel = require('./user.model');

/**
 * Controller for users, duh.
 * @class UserController
 */
class UserController {
    /**
     * Get a single user by their id. Just a sample for now.
     * @param {string} id the id of the user to find
     * @return {Promise} resolved with the found user
     */
    getUserById(id) {
        return UserModel.findUserById(id);
    }

    /**
     * Used to verify that a username / password combo is connected to a real user
     * @param {*} username a possible user's username
     * @param {*} password a possible user's password
     * @param {*} next a callback to use to verify or reject a user
     */
    static verifyUser(username, password, next) {
        UserModel.findUser(username)
            .then((foundUser) => {
                // User not found
                if (!foundUser) {
                    return next(new restifyErrors.Unauthorized(err), false);
                }
                return next(null, foundUser);

                // Always use hashed passwords and fixed time comparison
                // bcrypt.compare(password, foundUser.passwordHash, (err, isValid) => {
                //     if (err) {
                //         console.log('error thrown in bcrypt compare');
                //         return next(new restifyErrors.InternalServerError(err));
                //     }
                //     if (!isValid) {
                //         console.log('password otherwise invalid');
                //         return next(new restifyErrors.UnauthorizedError, false);
                //     }
                //     console.log('found user and password matched');
                //     return next(null, foundUser);
                // });
            },
            (err) => {
                return next(new restifyErrors.InternalServerError(err));
            })
            .catch((err) => {
                return next(new restifyErrors.InternalServerError(err));
            });
    }
}

module.exports = UserController;
