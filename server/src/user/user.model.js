const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true,
        trim: true,
        ignoreUnicoding: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            'created', // account exists in the database
            'active', // email verified - user can now login
            'inactive' // account is no longer active
        ],
        default: 'created'
    },
    verifyCode: {
        type: String
    }
});

/**
 * Middleware to encrypt password before saving. Doing it this way since we're using an asynchronous call on bcrypt.
 * We could do it with a virtual field/setter, but then we'd need to use synchronous calls which may slow down the app.
 */
UserSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('passwordHash')) {
        return next();
    }

    bcrypt.genSalt(environment.saltWorkFactor, function(err, salt) {
        if (err) {
            return next(new restifyErrors.InternalServerError(err));
        }

        bcrypt.hash(user.passwordHash, salt, function(err, hash) {
            if (err) {
                return next(new restifyErrors.UnauthorizedError(err));
            }
            user.passwordHash = hash;
            next();
        });
    });
});

/**
 * Compare an input password to the password hash
 * @param {String} password to check
 * @param {Function} cb callback
 */
UserSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.passwordHash, function(err, isMatch) {
        if (err || !isMatch) {
            logger.error('bcrypt error in UserSchema.comparePassword: ' + err.message);
            return cb(new restifyErrors.UnauthorizedError('Invalid login'));
        }
        cb(isMatch);
    });
};

/**
 * Check that the password meets our minimum requirements
 * @param {String} password to check
 * @param {Function} cb callback
 */
UserSchema.statics.validatePassword = function(password, cb) {
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

    const isValid = error === null;
    cb(error, isValid);
};

module.exports = mongoose.model('User', UserSchema);
