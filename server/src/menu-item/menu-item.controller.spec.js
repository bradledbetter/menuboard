// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./menu-item.controller', {'../services/logger.service': mockLogger});

const MenuItemModel = require('./menu-item.model');
const controller = require('./menu-item.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('MenuItemController', () => {
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
        isActive: true
    };
    menuItem.save = jasmine.createSpy('menuItem.save').and.returnValue(Promise.resolve(menuItem));
    menuItem.delete = jasmine.createSpy('menuItem.delete').and.returnValue(Promise.resolve(menuItem));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many menu items', () => {
        spyOn(MenuItemModel, 'find').and.returnValue(fakeQuery);
        spyOn(MenuItemModel, 'findOne').and.returnValue(fakeQuery);

        controller.findMenuItems('1', ['label']);
        expect(MenuItemModel.findOne).toHaveBeenCalled();

        controller.findMenuItems(null, ['label']);
        expect(MenuItemModel.find).toHaveBeenCalled();
    });

    describe('createMenuItem', () => {
        beforeEach(() => {
            spyOn(MenuItemModel, 'create').and.returnValue(Promise.resolve(menuItem));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new menu item with valid fields', (done) => {
            controller.createMenuItem(menuItem)
                .then(() => {
                    expect(MenuItemModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not be able to create a menu item without a label', (done) => {
            controller.createMenuItem({})
                .catch((error) => {
                    expect(MenuItemModel.create).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateMenuItem', () => {
        const newMenuItem = {
            label: 'New item label',
            description: 'New description.',
            prices: [{}],
            attributes: [{}],
            isActive: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            menuItem.save.calls.reset();
            menuItem.label = originalLabel;
            menuItem.description = originalDescription;
            menuItem.prices = originalPrices;
            menuItem.attributes = originalAttributes;
            menuItem.isActive = true;
        });

        it('should save an updated menu item with valid fields', (done) => {
            spyOn(MenuItemModel, 'findOne').and.returnValue(Promise.resolve(menuItem));

            controller.updateMenuItem('1', newMenuItem)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(menuItem.save).toHaveBeenCalled();
                    expect(menuItem.label).toEqual(newMenuItem.label);
                    expect(menuItem.description).toEqual(newMenuItem.description);
                    expect(menuItem.prices).toEqual(newMenuItem.prices);
                    expect(menuItem.attributes).toEqual(newMenuItem.attributes);
                    expect(menuItem.isActive).toEqual(newMenuItem.isActive);
                    done();
                });
        });

        it('should not override a menu item when invalid data is PUT', (done) => {
            spyOn(MenuItemModel, 'findOne').and.returnValue(Promise.resolve(menuItem));

            controller.updateMenuItem('1', Object.assign({}, newMenuItem, {label: '', description: ''}))
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(menuItem.save).toHaveBeenCalled();
                    expect(menuItem.label).not.toEqual('');
                    expect(menuItem.description).toEqual('');
                    expect(menuItem.prices).toEqual(newMenuItem.prices);
                    expect(menuItem.attributes).toEqual(newMenuItem.attributes);
                    expect(menuItem.isActive).toEqual(newMenuItem.isActive);
                    done();
                });
        });

        it('should not save a menu item that does not exist', (done) => {
            controller.updateMenuItem('', newMenuItem)
                .catch((error) => {
                    expect(menuItem.save).not.toHaveBeenCalled();
                    expect(menuItem.label).not.toEqual(newMenuItem.label);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteMenuItem', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            menuItem.delete.calls.reset();
            menuItems = [];
        });

        it('should delete menu item ', (done) => {
            spyOn(MenuItemModel, 'findOne').and.returnValue(Promise.resolve(menuItem));

            controller.deleteMenuItem(menuItem._id)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(MenuItemModel.findOne).toHaveBeenCalled();
                    expect(menuItem.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a menu item if no id provided', (done) => {
            spyOn(MenuItemModel, 'findOne');
            controller.deleteMenuItem()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(MenuItemModel.findOne).not.toHaveBeenCalled();
                    expect(menuItem.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
