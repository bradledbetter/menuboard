const AttributeModel = require('./attribute.model');
const MenuItemModel = require('../menu-item/menu-item.model');
const AttributeController = require('./attribute.controller');
const restifyErrors = require('restify-errors');

describe('AttributeController', () => {
    let controller;
    const attribute = {
        _id: '1',
        name: 'IBU',
        value: '30',
        save: jasmine.createSpy('attribute.save').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        }),
        save: jasmine.createSpy('attribute.delete').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        })
    };

    beforeEach(() => {
        controller = new AttributeController();
    });

    it('should be able to find one or many attributes', () => {
        spyOn(AttributeModel, 'find').and.callThrough();
        spyOn(AttributeModel, 'findOne').and.callThrough();

        let promise = controller.findAttributes('1', ['name']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(AttributeModel.findOne).toHaveBeenCalled();

        promise = controller.findAttributes(null, ['name']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(AttributeModel.find).toHaveBeenCalled();
    });

    describe('createAttribute', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(AttributeModel, 'create').and.callFake((params) => {
                return {
                    exec: () => {
                        return {
                            then: (callback) => {
                                callback(attribute);
                                return {catch: () => {}};
                            }
                        };
                    }
                };
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
        });

        it('should be able to create a new attribute with valid fields', () => {
            controller.createAttribute({name: attribute.name, value: attribute.value});
            expect(AttributeModel.create).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should reject creating a attribute where the name or value is missing', () => {
            controller.createAttribute({value: attribute.value});
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            myReject.calls.reset();

            controller.createAttribute({name: attribute.name});
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
        });
    });

    fdescribe('updateAttribute', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        const newAttribute = {
            name: 'ABV',
            value: '3.0'
        };

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            attribute.save.calls.reset();
            attribute.name = 'IBU';
            attribute.value = '30';
        });

        it('should save an updated attribute with valid fields', () => {
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

            controller.updateAttribute('1', newAttribute);
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            expect(attribute.save).toHaveBeenCalled();
            expect(attribute.name).toEqual(newAttribute.name);
            expect(attribute.value).toEqual(newAttribute.value);
        });

        it('should not save an updated attribute with invalid fields', () => {
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
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            myReject.calls.reset();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(attribute.name).not.toEqual('');
            expect(attribute.value).not.toEqual('');
        });

        it('should not save a attribute that does not exist', () => {
            controller.updateAttribute('', newAttribute);
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(attribute.name).not.toEqual(newAttribute.name);
            expect(attribute.status).not.toEqual(newAttribute.status);
        });
    });

    describe('deleteAttribute', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(MenuItemModel, 'find').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(null);
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

        it('shoudl nto delete an attribute if it is used in a menu-item', () => {
            expect(false).toBe(true);
        });
    });
});
