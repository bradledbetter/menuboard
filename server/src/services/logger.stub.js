// stub logger to use in unit tests
module.exports = {
    info: jasmine.createSpy('logger.info'),
    warn: jasmine.createSpy('logger.warn'),
    error: jasmine.createSpy('logger.error')
};
