const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const bunyan = require('bunyan');

/**
 * A central point to configure and create the bunyan logger so different files can use it.
 * @class MBLogger
 */
class MBLogger {
    /**
     * Creates an instance of MBLogger.
     * @memberof MBLogger
     */
    constructor() {
        this.logger = bunyan.createLogger(environment.logger);
    }

    /**
     * Return the configured logger
     * @return {Bunyan} bunyan logger
     * @memberof MBLogger
     */
    getLogger() {
        return this.logger;
    }
}

module.exports = (new MBLogger());
