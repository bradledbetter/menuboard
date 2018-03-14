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
    attribute.save = jasmine.createSpy('attribute.save').and.returnValue({
        then: () => {
            return Promise.resolve(attribute);
        }
    });
    attribute.delete = jasmine.createSpy('attribute.delete').and.returnValue({
        then: () => Promise.resolve(attribute)
    });
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
        const myReject = jasmine.createSpy('myReject');

        beforeEach(() => {
            spyOn(Promise, 'reject').and.callFake(myReject);
        });

        afterEach(() => {
            myReject.calls.reset();
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new attribute with valid fields', () => {
            spyOn(AttributeModel, 'create').and.returnValue({then: (callback) => callback(attribute)});
            controller.createAttribute({name: attribute.name, value: attribute.value});
            expect(AttributeModel.create).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalled();
        });

        it('should reject creating a attribute where the name or value is missing', () => {
            controller.createAttribute({value: attribute.value});
            expect(myReject).toHaveBeenCalled();
            myReject.calls.reset();

            retVal = controller.createAttribute({name: attribute.name});
            expect(myReject).toHaveBeenCalled();
        });
    });

    fdescribe('updateAttribute', () => {
        const myReject = jasmine.createSpy('myReject');
        const newAttribute = {
            name: 'ABV',
            value: '3.0'
        };

        beforeEach(() => {
            spyOn(Promise, 'reject').and.callFake(myReject);
        });

        afterEach(() => {
            myReject.calls.reset();
            mockLogger.info.calls.reset();
            attribute.save.calls.reset();
            attribute.name = 'IBU';
            attribute.value = '30';
        });

        fit('should save an updated attribute with valid fields', () => {
            spyOn(AttributeModel, 'findOne').and.returnValue(Promise.resolve(attribute));

            controller.updateAttribute('1', newAttribute);
            expect(myReject).not.toHaveBeenCalled();
            expect(attribute.save).toHaveBeenCalled();
            expect(attribute.name).toEqual(newAttribute.name);
            expect(attribute.value).toEqual(newAttribute.value);
        });

        it('should not override an attribute when invalid data is PUT', () => {
            spyOn(AttributeModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(attribute);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.updateAttribute('1', {name: '', value: ''});
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            myReject.calls.reset();
            expect(attribute.save).toHaveBeenCalled();
            expect(attribute.name).not.toEqual('');
            expect(attribute.value).not.toEqual('');
        });

        it('should not save a attribute that does not exist', () => {
            controller.updateAttribute('', newAttribute);
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(attribute.name).not.toEqual(newAttribute.name);
        });
    });

    describe('deleteAttribute', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        let menuItems = [];
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(MenuItemModel, 'find').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(menuItems);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            attribute.delete.calls.reset();
            MenuItemModel.find.calls.reset();
            menuItems = [];
        });

        it('should delete attribute ', () => {
            spyOn(AttributeModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(attribute);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.deleteAttribute(attribute._id);
            expect(MenuItemModel.find).toHaveBeenCalled();
            expect(AttributeModel.findOne).toHaveBeenCalled();
            expect(attribute.delete).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalledWith('Success');
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should not delete a attribute if no id provided', () => {
            spyOn(AttributeModel, 'findOne');
            controller.deleteAttribute();
            expect(MenuItemModel.find).not.toHaveBeenCalled();
            expect(AttributeModel.findOne).not.toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });

        it('should not delete an attribute if it is used in a menu-item', () => {
            spyOn(AttributeModel, 'findOne');
            menuItems = [{_id: '2'}];
            controller.deleteAttribute();
            expect(AttributeModel.findOne).not.toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });
    });
});
