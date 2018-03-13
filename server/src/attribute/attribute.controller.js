const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const AttributeModel = require('./attribute.model');
const MenuItemModel = require('../menu-item/menu-item.model');

/**
 * Controller for attributes
 * @class AttributeController
 */
class AttributeController {
    /**
     * Get an attribute or all active attributes. For use with the GET /attribute route
     * @param {string?} id (optional) attribute id
     * @param {string?} fields (optional) fields to select on the attributes
     * @return {Promise} resolved with the data, rejected on error
     */
    findAttributes(id, fields) {
        let query;
        if (id && typeof id === 'string' && id !== '') {
            query = AttributeModel.findOne({_id: id});
        } else {
            query = AttributeModel.find();
        }

        if (typeof fields === 'string' && fields !== '') {
            query.select(fields);
        }

        return query.exec();
    }

    /**
     * Create a new attribute.
     * @param {{name: string, value: string}} data attribute data
     * @return {Promise} resolved on success, rejected on errors
     */
    createAttribute(data) {
        return new Promise((resolve, reject) => {
            if (!data.name || !data.value) {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                AttributeModel
                    .create({
                        name: data.name,
                        value: data.value
                    })
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
     * Update an existing attribute.
     * @param {string} attributeId id of the attribute to change
     * @param {{name: string, value: string}} newAttribute attribute data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateAttribute(attributeId, newAttribute) {
        return new Promise((resolve, reject) => {
            // expect a userId
            if (typeof attributeId !== 'string' || attributeId === '') {
                reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
            } else {
                AttributeModel
                    .findOne({_id: attributeId})
                    .then((foundAttribute) => {
                        if (newAttribute.name && newAttribute.name !== '') {
                            foundAttribute.name = newAttribute.name;
                        }

                        if (newAttribute.value && newAttribute.value !== '') {
                            foundAttribute.value = newAttribute.value;
                        }

                        foundAttribute.save()
                            .then(() => {
                                logger.info('Updated attribute with id: ', attributeId);
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
     * Deletes an attribute. Will not allow deleting an attribute that is in use
     * @param {string} attributeId the id of the attribute to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteAttribute(attributeId) {
        return new Promise((resolve, reject) => {
            if (!attributeId || typeof attributeId != 'string' || attributeId === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                // first, find if the attribute exists in a menu-item already
                MenuItemModel
                    .find({'attributes._id': attributeId})
                    .then((foundMenuItems) => {
                        if (!foundMenuItems || !foundMenuItems.length) {
                            // if we didn't find it in use, delete it
                            AttributeModel
                                .findOne({_id: attributeId})
                                .then(
                                    (foundAttribute) => {
                                        foundAttribute.delete()
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
                        } else {
                            // we found it in use, so reject the request
                            reject(new restifyErrors.ForbiddenError('Cannot delete attribute that is in use.'));
                        }
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

module.exports = AttributeController;

