
const InfoController = require('./info.controller');
const endpoints = require('../../config/endpoints');

/**
 * infoRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    server.get(`/${endpoints.INFO}`, (req, res, next) => {
        const controller = new InfoController();
        return controller.getInfo(res, next);
    });
};
