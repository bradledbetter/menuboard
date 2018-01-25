const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const pkg = require('../../package.json');
const moment = require('moment');

/**
 * Controller for the info route
 */
class InfoController {
    /**
     * constructor - Sets internal info from environment.
     */
    constructor() {
        this.info = {
            code: pkg.name,
            name: 'MenuBoard Server',
            description: pkg.description,
            version: pkg.version,
            appDateUTC: '',
            statusCode: 1,
            statusMessage: 'healthy',
            url: `${environment.server.proto}://${environment.server.host}:${environment.server.port}`,
            info: '',
            serverTimestampUTC: moment().utc().toISOString()
        };
    }

    /**
     * getInfo - just return the info
     * @param {object} res - response object
     * @param {function} next - callback
     * @return {*} output from next callback
     */
    getInfo(res, next) {
        res.send(200, this.info);
        return next();
    }
}

module.exports = InfoController;
