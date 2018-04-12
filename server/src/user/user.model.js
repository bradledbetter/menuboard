const mongoose = require('mongoose');
const UserPasswordModel = require('./user-password.model');
const bcrypt = require('bcryptjs');
const Promise = require('bluebird');
const htmlSanitizer = require('../mongoose-middleware/html-sanitizer');

const bcryptCompare = Promise.promisify(bcrypt.compare, {context: bcrypt});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
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

UserSchema.plugin(htmlSanitizer, {exclude: ['status', 'verifyCode']});

/**
 * Compare an input password to the password hash
 * @param {String} password to check
 * @return {Promise} resolved on match with true, rejected with error if error or no match
 */
/* istanbul ignore next: No sense testing just calling another function */
UserSchema.methods.comparePassword = function(password) {
    const user = this;
    return UserPasswordModel
        .find({userId: user._id})
        .then((userPassword) => {
            return bcryptCompare(password, this.passwordHash)
                .then(() => {
                    // returning the user through the promise chain because it's often needed in later resolutions
                    return user;
                });
        });
};

module.exports = mongoose.model('User', UserSchema);
