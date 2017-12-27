const {
    NOT_FOUND,
    NOT_AUTHORIZED,
    NOT_AUTHENTICATED
} = require('../constants/messages');

module.exports = {
    NotFound: {
        description: NOT_FOUND,
    },
    NotAuthorized: {
        description: NOT_AUTHORIZED,
    },
    NotAuthenticated: {
        description: NOT_AUTHENTICATED,
    }
};
