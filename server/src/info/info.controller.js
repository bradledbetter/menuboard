const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const pkg = require('../../package.json');
const moment = require('moment');

/**
 * getInfo - just return the info
 * @param {object} res - response object
 * @param {function} next - callback
 * @return {*} output from next callback
 */
function getInfo(res, next) {
    res.send(200, {
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
    });
    return next();
}


module.exports = {
    getInfo
};
