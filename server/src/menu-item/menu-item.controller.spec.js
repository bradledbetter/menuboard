const MenuItemModel = require('./menu-item.model');
const MenuItemController = require('./menu-item.controller');
const restifyErrors = require('restify-errors');

describe('MenuItemController', () => {
    let controller;
    const originalLabel = 'Original label';
    const originalDescription = 'Original description';
    const originalPrices = [{
        label: 'Original price',
        price: 1.0
    }];
    const originalAttributes = [{
        name: 'Original attribute',
        value: 'Original attribute value'
    }];
    const menuItem = {
        _id: '1',
        label: originalLabel,
        description: originalDescription,
        prices: originalPrices,
        attributes: originalAttributes,
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
                                callback(menuItem);
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
            controller.createMenuItem(menuItem);
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
            label: 'New item label',
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
            menuItem.save.calls.reset();
            menuItem.label = originalLabel;
            menuItem.description = originalDescription;
            menuItem.prices = originalPrices;
            menuItem.attributes = originalAttributes;
            menuItem.isActive = true;
        });

        it('should save an updated menu item with valid fields', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(menuItem);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.updateMenuItem('1', newMenuItem);
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            expect(menuItem.save).toHaveBeenCalled();
            expect(menuItem.label).toEqual(newMenuItem.label);
            expect(menuItem.description).toEqual(newMenuItem.description);
            expect(menuItem.prices).toEqual(newMenuItem.prices);
            expect(menuItem.attributes).toEqual(newMenuItem.attributes);
            expect(menuItem.isActive).toEqual(newMenuItem.isActive);
        });

        it('should not override a menu item when invalid data is PUT', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(menuItem);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.updateMenuItem('1', Object.assign({}, newMenuItem, {label: '', description: ''}));
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            myReject.calls.reset();
            expect(menuItem.save).toHaveBeenCalled();
            expect(menuItem.label).not.toEqual('');
            expect(menuItem.description).toEqual('');
            expect(menuItem.prices).toEqual(newMenuItem.prices);
            expect(menuItem.attributes).toEqual(newMenuItem.attributes);
            expect(menuItem.isActive).toEqual(newMenuItem.isActive);
        });

        it('should not save a menu item that does not exist', () => {
            controller.updateMenuItem('', newMenuItem);
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(menuItem.save).not.toHaveBeenCalled();
            expect(menuItem.label).not.toEqual(newMenuItem.label);
        });
    });

    describe('deleteMenuItem', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            menuItem.delete.calls.reset();
            menuItems = [];
        });

        it('should delete menu item ', () => {
            spyOn(MenuItemModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(menuItem);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.deleteMenuItem(menuItem._id);
            expect(MenuItemModel.findOne).toHaveBeenCalled();
            expect(menuItem.delete).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalledWith('Success');
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should not delete a menu item if no id provided', () => {
            spyOn(MenuItemModel, 'findOne');
            controller.deleteMenuItem();
            expect(MenuItemModel.findOne).not.toHaveBeenCalled();
            expect(menuItem.delete).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });
    });
});
