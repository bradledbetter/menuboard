const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const MenuItemModel = require('./menu-item.model');

/**
 * Controller for menu items
 * @class MenuItemController
 */
class MenuItemController {
    /**
     * Get a menu item or all active menu items. For use with the GET /menu-item route
     * @param {string?} id (optional) menu item id
     * @param {string?} fields (optional) fields to select on the menu items
     * @return {Promise} resolved with the data, rejected on error
     */
    findMenuItems(id, fields) {
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
    createMenuItem(data) {
        return new Promise((resolve, reject) => {
            if (!data.label) {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                MenuItemModel
                    .create({
                        label: data.label,
                        description: data.description || '',
                        prices: data.prices || [],
                        attributes: data.attributes || [],
                        isActive: true
                    })
                    .exec()
                    .then((success) => {
                        resolve('Success');
                    }, (err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Update an existing menu item.
     * @param {string} menuItemId id of the menu item to change
     * @param {MenuItemModel} newMenuItem menu item data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateMenuItem(menuItemId, newMenuItem) {
        return new Promise((resolve, reject) => {
            // expect a userId
            if (typeof menuItemId !== 'string' || menuItemId === '') {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                MenuItemModel
                    .findOne({_id: menuItemId})
                    .exec()
                    .then((foundMenuItem) => {
                        if (newMenuItem.label && newMenuItem.label !== '') {
                            foundMenuItem.label = newMenuItem.label;
                        }

                        if (newMenuItem.desription) {
                            foundMenuItem.desription = newMenuItem.desription;
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

                        foundMenuItem.save()
                            .then(() => {
                                logger.info('Updated menu-item with id: ', menuItemId);
                                resolve('Success');
                            }, (err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            })
                            .catch((err) => {
                                reject(new restifyErrors.InternalServerError(err));
                            });
                    }, (err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }

    /**
     * Deletes a menu item. Will not allow deleting an menu-item that is in use
     * @param {string} menuItemId the id of the menu item to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteMenuItem(menuItemId) {
        return new Promise((resolve, reject) => {
            if (typeof menuItemId !== 'string' || menuItemId === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                MenuItemModel
                    .findOne({_id: menuItemId})
                    .exec()
                    .then(
                        (foundMenuItem) => {
                            foundMenuItem.delete()
                                .then((result) => {
                                    resolve('Success');
                                }, (err) => {
                                    reject(new restifyErrors.ForbiddenError(err));
                                });
                        }, (err) => {
                            reject(new restifyErrors.ForbiddenError(err));
                        })
                    .catch((err) => {
                        reject(new restifyErrors.InternalServerError(err));
                    });
            }
        });
    }
}

module.exports = MenuItemController;
