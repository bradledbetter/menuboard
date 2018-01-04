const passport = require('passport');
const Strategy = require('passport-Strategy').Strategy;
const util = require('util');
const bcrypt = require('bcryptjs');
const restifyErrors = require('restify-errors');
/**
 * A strategy for authenticating a user against JSON params supplied in the post
 * @param {object} options (optional) supply options to the strategy
 *  {
 *      usernameField: string? - (optoinal) a username field name other than 'username'
 *      passwordField: string? - (optional) a password field name other than 'password'
 *      server: object - restify server
 *      passReqToCallback: boolean? - (optional) if true, the request object will be passed to the verify function
 *  }
 * @param {function} verify called to verify the user credentials
 */
function PassportLocalJSONStrategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }

    if (!verify) {
        throw new TypeError('LocalStrategy requires a verify callback');
    }

    if (!options) {
        this._server = options.server;
    }
    this._usernameField = options.usernameField || 'username';
    this._passwordField = options.passwordField || 'password';

    passport.Strategy.call(this);
    this.name = 'localJSON';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}
util.inherits(PassportLocalJSONStrategy, Strategy);


/**
 * Authenticate request based on the contents of a form submission.
 * @param {object} req request object
 * @param {object} options
 * @return {*}
 * @api protected
 */
PassportLocalJSONStrategy.prototype.authenticate = function(req, options) {
    options = options || {};
    // TODO: parse the body as JSON, or is it already?
    let username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    let password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);

    if (!username || !password) {
        return this.fail({message: options.badRequestMessage || 'Missing credentials'}, 400);
    }

    let self = this;

    /**
     *
     * @param {object} err
     * @param {object} user
     * @param {object} info
     * @return {*}
     */
    function verified(err, user, info) {
        if (err) {
            return self.error(err);
        }

        if (!user) {
            return self.fail(info);
        }

        self.success(user, info);
    }

    try {
        if (self._passReqToCallback) {
            this._verify(req, username, password, verified);
        } else {
            this._verify(username, password, verified);
        }
    } catch (ex) {
        return self.error(ex);
    }
};
