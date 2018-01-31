/**
 * Mock UserController
 * @class UserControllerMock
 */
class UserControllerMock {
    /**
     * constructor
     */
    constructor() {
        /**
         * fake create user
         */
        this.createUser = jasmine.createSpy('UserController.createUser')
            .and.callFake((username) => {
                return {
                    then: (success, failure) => {
                        if (username === 'success') {
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
    }
}

module.exports = UserControllerMock;
