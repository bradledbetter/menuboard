const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const Promise = require('bluebird');

const bcryptGenSalt = Promise.promisify(bcrypt.genSalt, {context: bcrypt});
const bcryptHash = Promise.promisify(bcrypt.hash, {context: bcrypt});

const UserPasswordSchema = new mongoose.Schema({
    userId: {
        type: mongoos.Schema.Types.ObjectId,
        ref: 'User'
    },
    passwordHash: {
        type: String,
        required: true,
        trim: true,
        ignoreUnicoding: true
    }
});

/**
 * Middleware to encrypt password before saving. Doing it this way since we're using an asynchronous call on bcrypt.
 * We could do it with a virtual field/setter, but then we'd need to use synchronous calls which may slow down the app.
 */
/* istanbul ignore next: I can't find a way to test this. */
UserPasswordSchema.pre('save', function(next) {
    const userPassword = this;

    if (!userPassword.isModified('passwordHash')) {
        return next();
    }

    bcryptGenSalt(environment.saltWorkFactor)
        .then((salt) => {
            return bcryptHash(userPassword.passwordHash, salt);
        })
        .then((hash) => {
            userPassword.passwordHash = hash;
            next();
            return true;
        })
        .catch((err) => {
            logger.warn(`Bcrypt error generating salt or hashing: ${err}`);
            throw new restifyErrors.InternalServerError();
        });
});

/**
 * Check that the password meets our minimum requirements
 * @param {String} password to check
 * @return {Promise} resolved with true on success, rejected with message on error
 */
UserSchema.statics.validatePassword = function(password) {
    let error = null;
    const mustHave = /0|1|2|3|4|5|6|7|8|9|@|#|\$|%|\^|&|\*|\(|\)|_|\+|-|=/;

    // At least 12 characters
    if (password.length < 12) {
        // errors.length = 'Password must be at least 12 characters long.';
        error = 'Invalid password';
    }

    // at least one of 0 - 9, @, #, $, %, ^, &, *, (, ), _, +, -, =
    if (password.match(mustHave) === null) {
        // errors.specialChars = 'Password must contain at least one of 0 - 9, @, #, $, %, ^, &, *, (, ), _, +, -, =';
        error = 'Invalid password';
    }

    // at least one UPPER case character
    if (password.match(/[A-Z]/) === null) {
        // errors.upperCase = 'Password must contain at least one UPPER case character';
        error = 'Invalid password';
    }

    // at least one lower case character
    if (password.match(/[a-z]/) === null) {
        // errors.lowerCase = 'Password must contain at least one LOWER case character';
        error = 'Invalid password';
    }

    if (error === null) {
        return Promise.resolve(true);
    }
    return Promise.reject(new restifyErrors.InternalServerError(error));
};

module.exports = mongoose.model('UserPassword', UserPasswordSchema);