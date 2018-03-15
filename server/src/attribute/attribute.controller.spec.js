// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./attribute.controller', {'../services/logger.service': mockLogger});

const AttributeModel = require('./attribute.model');
const MenuItemModel = require('../menu-item/menu-item.model');
const AttributeController = require('./attribute.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('AttributeController', () => {
    let controller;
    const attribute = {
        _id: '1',
        name: 'IBU',
        value: '30',

    };
    attribute.save = jasmine.createSpy('attribute.save').and.returnValue(Promise.resolve(attribute));
    attribute.delete = jasmine.createSpy('attribute.delete').and.returnValue(Promise.resolve(attribute));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    beforeEach(() => {
        controller = new AttributeController();
    });

    it('should be able to find one or many attributes', () => {
        spyOn(AttributeModel, 'find').and.returnValue(fakeQuery);
        spyOn(AttributeModel, 'findOne').and.returnValue(fakeQuery);

        let promise = controller.findAttributes('1', ['name']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(AttributeModel.findOne).toHaveBeenCalled();

        promise = controller.findAttributes(null, ['name']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(AttributeModel.find).toHaveBeenCalled();
    });

    describe('createAttribute', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new attribute with valid fields', (done) => {
            spyOn(AttributeModel, 'create').and.returnValue(Promise.resolve(attribute));
            controller.createAttribute({name: attribute.name, value: attribute.value})
                .then(() => {
                    expect(AttributeModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should reject creating a attribute where the name is missing', (done) => {
            controller.createAttribute({value: attribute.value})
                .catch((error) => {
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should reject creating a attribute where the value is missing', (done) => {
            controller.createAttribute({name: attribute.name})
                .catch((error) => {
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateAttribute', () => {
        const newAttribute = {
            name: 'ABV',
            value: '3.0'
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            attribute.save.calls.reset();
            attribute.name = 'IBU';
            attribute.value = '30';
        });

        it('should save an updated attribute with valid fields', (done) => {
            spyOn(AttributeModel, 'findOne').and.returnValue(Promise.resolve(attribute));

            controller.updateAttribute('1', newAttribute)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(attribute.save).toHaveBeenCalled();
                    expect(attribute.name).toEqual(newAttribute.name);
                    expect(attribute.value).toEqual(newAttribute.value);
                    done();
                });
        });

        it('should not override an attribute when invalid data is PUT', (done) => {
            spyOn(AttributeModel, 'findOne').and.returnValue(Promise.resolve(attribute));

            controller.updateAttribute('1', {name: '', value: ''})
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(attribute.save).toHaveBeenCalled();
                    expect(attribute.name).not.toEqual('');
                    expect(attribute.value).not.toEqual('');
                    done();
                });
        });

        it('should not save a attribute that does not exist', (done) => {
            controller.updateAttribute('', newAttribute)
                .catch(() => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(attribute.save).not.toHaveBeenCalled();
                    expect(attribute.name).not.toEqual(newAttribute.name);
                    done();
                });
        });
    });

    describe('deleteAttribute', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            attribute.delete.calls.reset();
            menuItems = [];
        });

        it('should delete attribute ', (done) => {
            spyOn(MenuItemModel, 'find').and.returnValue(Promise.resolve([]));
            spyOn(AttributeModel, 'findOne').and.returnValue(Promise.resolve(attribute));

            controller.deleteAttribute(attribute._id)
                .then(() => {
                    expect(MenuItemModel.find).toHaveBeenCalled();
                    expect(AttributeModel.findOne).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(attribute.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a attribute if no id provided', (done) => {
            spyOn(MenuItemModel, 'find').and.returnValue(Promise.resolve([]));
            spyOn(AttributeModel, 'findOne');
            controller.deleteAttribute()
                .catch((error) => {
                    expect(MenuItemModel.find).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(AttributeModel.findOne).not.toHaveBeenCalled();
                    expect(attribute.save).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not delete an attribute if it is used in a menu-item', (done) => {
            spyOn(MenuItemModel, 'find').and.returnValue(Promise.resolve([{_id: '2'}]));
            spyOn(AttributeModel, 'findOne');
            controller.deleteAttribute('1')
                .catch((error) => {
                    expect(AttributeModel.findOne).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(attribute.save).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(Error));
                    done();
                });
        });
    });
});
