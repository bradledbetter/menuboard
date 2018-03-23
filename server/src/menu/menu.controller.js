const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const MenuModel = require('./menu.model');
const MenuItemModel = require('../menu-item/menu-item.model');
const Promise = require('bluebird');

// controller for menus
module.exports = {
    /**
     * Get an menu or all active menus. For use with the GET /menu route
     * @param {string?} id (optional) menu id
     * @param {string?} fields (optional) fields to select on the menus
     * @return {Promise} resolved with the data, rejected on error
     */
    findMenus: (id, fields) => {
        let query;
        if (id && typeof id === 'string' && id !== '') {
            query = MenuModel.findOne({_id: id});
        } else {
            query = MenuModel.find();
        }

        if (typeof fields === 'string' && fields !== '') {
            query.select(fields);
        }

        return query.exec();
    },

    /**
     * Create a new menu.
     * @param {{name: string, value: string}} data menu data
     * @return {Promise} resolved on success, rejected on errors
     */
    createMenu: (data) => {
        if (!data.title) {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
        }

        if (data.isActive == undefined) {
            data.isActive = true;
        }

        return MenuModel
            .create({
                title: data.title,
                description: data.valu
            })
            .then((newMenu) => {
                logger.info(`Created new menu with id: ${newMenu._id}`);
                return 'Success';
            });
    },

    /**
     * Update an existing menu.
     * @param {string} menuId id of the menu to change
     * @param {{name: string, value: string}} newMenu menu data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateMenu: (menuId, newMenu) => {
        // expect a userId
        if (typeof menuId !== 'string' || menuId === '') {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
        }

        return MenuModel
            .findOne({_id: menuId})
            .then((foundMenu) => {
                if (newMenu.name && newMenu.name !== '') {
                    foundMenu.name = newMenu.name;
                }

                if (newMenu.value && newMenu.value !== '') {
                    foundMenu.value = newMenu.value;
                }

                return foundMenu.save();
            })
            .then(() => {
                logger.info(`Updated menu with id: ${menuId}`);
                return 'Success';
            });
    },

    /**
     * Deletes an menu. Will not allow deleting an menu that is in use
     * @param {string} menuId the id of the menu to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteMenu: (menuId) => {
        if (!menuId || typeof menuId != 'string' || menuId === '') {
            return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
        }

        // first, find if the menu exists in a menu-item already
        return MenuItemModel
            .find({'menus._id': menuId})
            .then((foundMenuItems) => {
                if (!foundMenuItems || !foundMenuItems.length) {
                    // if we didn't find it in use, delete it
                    return MenuModel.findOne({_id: menuId});
                } else {
                    // we found it in use, so reject the request
                    throw new Error('Cannot delete menu that is in use.');
                }
            })
            .then((foundMenu) => {
                return foundMenu.delete();
            })
            .then(() => {
                logger.info('Deleted menu with id: ', menuId);
                return 'Succcess';
            });
    }
};
