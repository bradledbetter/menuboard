
const InfoController = require('./info.controller');
const endpoints = require('../../config/endpoints');

/**
 * infoRouter - bind controller functions to routes
 * @param {*} server - the restify server
 */
module.exports = (server) => {
    const controller = new InfoController();

    server.get(`/${endpoints.INFO}`, (req, res, next) => {
        return controller.getInfo(res, next);
    });
};
