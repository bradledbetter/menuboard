const restifyErrors = require('restify-errors');
const logger = require('../services/logger.service');
const AttributeModel = require('./attribute.model');
const MenuItemModel = require('../menu-item/menu-item.model');
const Promise = require('bluebird');

/**
 * Get an attribute or all active attributes. For use with the GET /attribute route
 * @param {string?} id (optional) attribute id
 * @param {string?} fields (optional) fields to select on the attributes
 * @return {Promise} resolved with the data, rejected on error
 */
function findAttributes(id, fields) {
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
 * @param {Attribute} data attribute data
 * @return {Promise} resolved on success, rejected on errors
 */
function createAttribute(data) {
    if (!data.name || !data.value) {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return AttributeModel
        .create({
            name: data.name,
            value: data.value
        })
        .then((newAttribute) => {
            logger.info(`Created new attribute with id: ${newAttribute._id}`);
            return 'Success';
        });
}

/**
 * Update an existing attribute.
 * @param {string} attributeId id of the attribute to change
 * @param {Attribute} newAttribute attribute data
 * @return {Promise} resolved on success, rejected on errors
 */
function updateAttribute(attributeId, newAttribute) {
    // expect a userId
    if (typeof attributeId !== 'string' || attributeId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter(s).'));
    }

    return AttributeModel
        .findOne({_id: attributeId})
        .then((foundAttribute) => {
            if (newAttribute.name && newAttribute.name !== '') {
                foundAttribute.name = newAttribute.name;
            }

            if (newAttribute.value && newAttribute.value !== '') {
                foundAttribute.value = newAttribute.value;
            }

            return foundAttribute.save();
        })
        .then(() => {
            logger.info(`Updated attribute with id: ${attributeId}`);
            return 'Success';
        });
}

/**
 * Deletes an attribute. Will not allow deleting an attribute that is in use
 * @param {string} attributeId the id of the attribute to delete
 * @return {Promise} resolved with a message on success, or rejected with an error
 */
function deleteAttribute(attributeId) {
    if (!attributeId || typeof attributeId != 'string' || attributeId === '') {
        return Promise.reject(new restifyErrors.ForbiddenError('Missing parameter.'));
    }

    // first, find if the attribute exists in a menu-item already
    return MenuItemModel
        .find({'attributes._id': attributeId})
        .then((foundMenuItems) => {
            if (!foundMenuItems || !foundMenuItems.length) {
                // if we didn't find it in use, delete it
                return AttributeModel.findOne({_id: attributeId});
            } else {
                // we found it in use, so reject the request
                throw new Error('Cannot delete attribute that is in use.');
            }
        })
        .then((foundAttribute) => {
            return foundAttribute.delete();
        })
        .then(() => {
            logger.info('Deleted attribute with id: ', attributeId);
            return 'Succcess';
        });
}

module.exports = {
    findAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute
};

