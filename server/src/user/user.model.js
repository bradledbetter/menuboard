const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
        lowercase: true,
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
        if (err) {
            return cb(new restifyError.InternalServerError(err));
        }
        cb(isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
