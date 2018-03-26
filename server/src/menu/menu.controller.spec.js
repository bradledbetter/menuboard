// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./menu.controller', {'../services/logger.service': mockLogger});

const MenuModel = require('./menu.model');
const controller = require('./menu.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('MenuController', () => {
    const originalTitle = 'Original label';
    const originalDescription = 'Original description';
    const originalMenuItems = [{
        label: 'menu',
        description: 'menu description',
        prices: [],
        attributes: [],
        isActive: true
    }];
    const menu = {
        _id: '1',
        title: originalTitle,
        description: originalDescription,
        prices: originalMenuItems,
        menuItems: originalMenuItems,
        isActive: true
    };
    menu.save = jasmine.createSpy('menu.save').and.returnValue(Promise.resolve(menu));
    menu.delete = jasmine.createSpy('menu.delete').and.returnValue(Promise.resolve(menu));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many menus', () => {
        spyOn(MenuModel, 'find').and.returnValue(fakeQuery);
        spyOn(MenuModel, 'findOne').and.returnValue(fakeQuery);

        controller.findMenus('1', ['label']);
        expect(MenuModel.findOne).toHaveBeenCalled();

        controller.findMenus(null, ['label']);
        expect(MenuModel.find).toHaveBeenCalled();
    });

    describe('createMenu', () => {
        beforeEach(() => {
            spyOn(MenuModel, 'create').and.returnValue(Promise.resolve(menu));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new menu with valid fields', (done) => {
            controller.createMenu(menu)
                .then(() => {
                    expect(MenuModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not be able to create a menu without a label', (done) => {
            controller.createMenu({})
                .catch((error) => {
                    expect(MenuModel.create).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateMenu', () => {
        const newMenu = {
            title: 'New item label',
            description: 'New description.',
            menuItems: [{}],
            isActive: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            menu.save.calls.reset();
            menu.title = originalTitle;
            menu.description = originalDescription;
            menu.menuItems = originalMenuItems;
            menu.isActive = true;
        });

        it('should save an updated menu with valid fields', (done) => {
            spyOn(MenuModel, 'findOne').and.returnValue(Promise.resolve(menu));

            controller.updateMenu('1', newMenu)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(menu.save).toHaveBeenCalled();
                    expect(menu.title).toEqual(newMenu.title);
                    expect(menu.description).toEqual(newMenu.description);
                    expect(menu.menuItems).toEqual(newMenu.menuItems);
                    expect(menu.isActive).toEqual(newMenu.isActive);
                    done();
                });
        });

        it('should not override a menu when invalid data is PUT', (done) => {
            spyOn(MenuModel, 'findOne').and.returnValue(Promise.resolve(menu));

            controller.updateMenu('1', Object.assign({}, newMenu, {label: '', description: ''}))
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(menu.save).toHaveBeenCalled();
                    expect(menu.title).not.toEqual('');
                    expect(menu.description).toEqual('');
                    expect(menu.menuItems).toEqual(newMenu.menuItems);
                    expect(menu.isActive).toEqual(newMenu.isActive);
                    done();
                });
        });

        it('should not save a menu that does not exist', (done) => {
            controller.updateMenu('', newMenu)
                .catch((error) => {
                    expect(menu.save).not.toHaveBeenCalled();
                    expect(menu.title).not.toEqual(newMenu.title);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteMenu', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            menu.delete.calls.reset();
            menus = [];
        });

        it('should delete menu', (done) => {
            spyOn(MenuModel, 'findOne').and.returnValue(Promise.resolve(menu));

            controller.deleteMenu(menu._id)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(MenuModel.findOne).toHaveBeenCalled();
                    expect(menu.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a menu if no id provided', (done) => {
            spyOn(MenuModel, 'findOne');
            controller.deleteMenu()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(MenuModel.findOne).not.toHaveBeenCalled();
                    expect(menu.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
