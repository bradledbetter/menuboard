const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const bunyan = require('bunyan');

module.exports = bunyan.createLogger(environment.logger);
