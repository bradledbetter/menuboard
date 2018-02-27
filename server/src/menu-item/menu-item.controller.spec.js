const MenuItemModel = require('./menu-item.model');
const MenuItemController = require('./menu-item.controller');
const restifyErrors = require('restify-errors');

describe('MenuItemController', () => {
    let controller;
    const menuItem = {
        _id: '1',
        label: 'Something',
        description: 'Waa!',
        prices: [{
            label: 'Small',
            price: 1.0
        }],
        attributes: [{
            name: 'Color',
            value: 'Red'
        }],
        isActive: true,
        save: jasmine.createSpy('menuItem.save').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        }),
        delete: jasmine.createSpy('menuItem.delete').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        })
    };

    beforeEach(() => {
        controller = new MenuItemController();
    });

    it('should be able to find one or many menu items', () => {
        spyOn(MenuItemModel, 'find').and.callThrough();
        spyOn(MenuItemModel, 'findOne').and.callThrough();

        let promise = controller.findMenuItems('1', ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(MenuItemModel.findOne).toHaveBeenCalled();

        promise = controller.findMenuItems(null, ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(MenuItemModel.find).toHaveBeenCalled();
    });

    describe('createMenuItem', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(MenuItemModel, 'create').and.callFake((params) => {
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

        it('should be able to create a new menu item with valid fields', () => {
            controller.createAttribute({name: attribute.name, value: attribute.value});
            expect(MenuItemModel.create).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
        });

        // NOTE: menu-item relies on mongo for model validation, so testing the controller doesn't make sense
    });

    describe('updateMenuItem', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        const newMenuItem = {
            name: 'New Menu Item',
            description: 'New description.',
            prices: [{}],
            attributes: [{}],
            isActive: false
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

        it('should save an updated menu item with valid fields', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
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

        it('should not override a menu item when invalid data is PUT', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
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

        it('should not save a menu item that does not exist', () => {
            controller.updateAttribute('', newAttribute);
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(attribute.name).not.toEqual(newAttribute.name);
        });
    });

    describe('deleteMenuItem', () => {
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

        it('should delete menu item ', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
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
            expect(MenuItemModel.findOne).toHaveBeenCalled();
            expect(attribute.delete).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalledWith('Success');
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should not delete a menu item if no id provided', () => {
            spyOn(MenuItemModel, 'findOne');
            controller.deleteAttribute();
            expect(MenuItemModel.find).not.toHaveBeenCalled();
            expect(MenuItemModel.findOne).not.toHaveBeenCalled();
            expect(attribute.save).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });
    });
});
