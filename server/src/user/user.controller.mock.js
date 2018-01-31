const restifyErrors = require('restify-errors');
/**
 * Mock UserController
 * @class UserControllerMock
 */
class UserControllerMock {
    /**
     * Creates an instance of UserControllerMock.
     * @memberof UserControllerMock
     */
    constructor() {
        this.findUsers = jasmine.createSpy('UserController.findUsers')
            .and.callFake((id) => {
                return {
                    then: (success, failure) => {
                        if (id === 'success') {
                            success('success');
                        } else {
                            failure('failure');
                        }
                        return {
                            catch: () => {}
                        };
                    }
                };
            });

        this.createUser = jasmine.createSpy('UserController.createUser')
            .and.callFake((username) => {
                return {
                    then: (success, failure) => {
                        if (username === 'success') {
                            success('success');
                        } else {
                            failure(new restifyErrors.InternalServerError('failure'));
                        }
                        return {
                            catch: () => {}
                        };
                    }
                };
            });

        this.updateUser = jasmine.createSpy('UserController.updateUser')
            .and.callFake((userId) => {
                return {
                    then: (success, failure) => {
                        if (userId === '1') {
                            success('success');
                        } else {
                            failure(new restifyErrors.InternalServerError('failure'));
                        }
                        return {
                            catch: () => {}
                        };
                    }
                };
            });

        this.verifyUser = jasmine.createSpy('UserController.verifyUser')
            .and.callFake((code) => {
                return {
                    then: (success, failure) => {
                        if (code === '1') {
                            success('success');
                        } else {
                            failure(new restifyErrors.InternalServerError('failure'));
                        }
                        return {
                            catch: () => {}
                        };
                    }
                };
            });

        this.deleteUser = jasmine.createSpy('UserController.deleteUser')
            .and.callFake((userId) => {
                return {
                    then: (success, failure) => {
                        if (userId === '1') {
                            success('success');
                        } else {
                            failure(new restifyErrors.InternalServerError('failure'));
                        }
                        return {
                            catch: () => {}
                        };
                    }
                };
            });
    }
}

module.exports = UserControllerMock;
