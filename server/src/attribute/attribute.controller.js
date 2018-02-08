// const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
// const logger = require('../services/logger.service');
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
    findUsers(id, fields) {
        let query;
        if (id && typeof id === 'string' && id !== '') {
            query = AttributeModel.findOne({_id: id});
        } else {
            query = AttributeModel.find({status: 'active'});
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
            reject(new restifyErrors.InternalServerError('not done yet'));
        });
    }

    /**
     * Update an existing attribute.
     * @param {string} attributeId id of the attribute to change
     * @param {{name: string, value: string}} data attribute data
     * @return {Promise} resolved on success, rejected on errors
     */
    updateAttribute(attributeId, data) {
        return new Promise((resolve, reject) => {
            reject(new restifyErrors.InternalServerError('not done yet'));
        });
    }

    /**
     * Deletes an attribute. Will not allow deleting an attribute that is in use
     * @param {string} attributeId the id of the attribute to delete
     * @return {Promise} resolved with a message on success, or rejected with an error
     */
    deleteUser(attributeId) {
        return new Promise((resolve, reject) => {
            if (!attributeId || typeof attributeId != 'string' || attributeId === '') {
                return reject(new restifyErrors.ForbiddenError('Missing parameter.'));
            } else {
                // first, find if the attribute exists in a menu-item already
                MenuItemModel.find({'attributes._id': attributeId}).then(
                    (foundMenuItems) => {
                        if (!foundMenuItems || !foundMenuItems.length) {

                        } else {
                            reject(new restifyErrors.)
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

