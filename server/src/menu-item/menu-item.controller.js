const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const MenuItemModel = require('./menu-item.model');
const MenuModel = require('../menu/menu.model');
const Promise = require('bluebird');

/**
 * Get a menu item or all active menu items. For use with the GET /menu-item route
 * @param {string?} id (optional) menu item id
 * @param {string?} fields (optional) fields to select on the menu items
 * @return {Promise} resolved with the data, rejected on error
 */
function findMenuItems(id, fields) {
    let query;
    if (id && typeof id === 'string' && id !== '') {
        query = MenuItemModel.findOne({_id: id});
    } else {
        query = MenuItemModel.find();
    }

    if (typeof fields === 'string' && fields !== '') {
        query.select(fields);
    }

    return query.exec();
}

/**
 * Create a new menu item.
 * @param {MenuItemModel} data menu item data
 * @return {Promise} resolved on success, rejected on errors
 */
function createMenuItem(data) {
    if (!data.label) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return MenuItemModel
        .create({
            label: data.label,
            description: data.description || '',
            prices: data.prices || [],
            attributes: data.attributes || [],
            isActive: true
        })
        .then((newMenuItem) => {
            logger.info('Create menu-item with id: ', newMenuItem._id);
            return newMenuItem;
        });
}

/**
 * Update an existing menu item.
 * @param {string} menuItemId id of the menu item to change
 * @param {MenuItemModel} newMenuItem menu item data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateMenuItem(menuItemId, newMenuItem) {
    // expect a userId
    if (typeof menuItemId !== 'string' || menuItemId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return MenuItemModel
        .findOne({_id: menuItemId})
        .then((foundMenuItem) => {
            if (newMenuItem.label && newMenuItem.label !== '') {
                foundMenuItem.label = newMenuItem.label;
            }

            if (typeof newMenuItem.description === 'string') {
                foundMenuItem.description = newMenuItem.description;
            }

            if (newMenuItem.prices) {
                foundMenuItem.prices = newMenuItem.prices;
            }

            if (newMenuItem.attributes) {
                foundMenuItem.attributes = newMenuItem.attributes;
            }

            if (typeof newMenuItem.isActive === 'boolean') {
                foundMenuItem.isActive = newMenuItem.isActive;
            }

            return foundMenuItem.save();
        })
        .then(() => {
            logger.info('Updated menu-item with id: ', menuItemId);
            return 'Success';
        });
}

/**
 * Deletes a menu item. Will not allow deleting an menu-item that is in use in a Menu
 * @param {string} menuItemId the id of the menu item to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteMenuItem(menuItemId) {
    if (typeof menuItemId !== 'string' || menuItemId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    return MenuModel
        .find({'menuItems._id': menuItemId})
        .then((foundMenus) => {
            if (Array.isArray(foundMenus) && foundMenus.length) {
                return Promise.reject(new restifyErrors.ForbiddenError(`Menu item is in use in ${foundMenus.length} menu(s)`));
            }

            return MenuItemModel
                .findOne({_id: menuItemId})
                .then((foundMenuItem) => {
                    return foundMenuItem.delete();
                })
                .then(() => {
                    logger.info('Deleted menu-item with id: ', menuItemId);
                    return 'Success';
                });
        });
}


module.exports = {
    findMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
