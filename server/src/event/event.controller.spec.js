// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./event.controller', {'../services/logger.service': mockLogger});

const EventModel = require('./event.model');
const controller = require('./event.controller');
const restifyErrors = require('restify-errors');
const moment = require('moment');
const Promise = require('bluebird');

describe('EventController', () => {
    const originalTitle = 'Original label';
    const originalDescription = 'Original description';
    const originalUrl = 'http://google.com';
    const originalTimezone = 'America/New_York';
    const originalStart = moment('2018-01-01T16:00:00').utc().toDate();
    const originalEnd = moment('2018-01-01T17:00:00').utc().toDate();
    const originalVenue = '500';// my super fancy fake objectid
    const event = {
        title: originalTitle,
        description: originalDescription,
        url: originalUrl,
        startTime: originalStart,
        endTime: originalEnd,
        timeZone: originalTimezone,
        venue: originalVenue,
        isActive: true
    };
    event.save = jasmine.createSpy('event.save').and.returnValue(Promise.resolve(event));
    event.delete = jasmine.createSpy('event.delete').and.returnValue(Promise.resolve(event));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many events', () => {
        spyOn(EventModel, 'find').and.returnValue(fakeQuery);
        spyOn(EventModel, 'findOne').and.returnValue(fakeQuery);

        controller.findEvents('1', ['title']);
        expect(EventModel.findOne).toHaveBeenCalled();

        controller.findEvents(null, ['title']);
        expect(EventModel.find).toHaveBeenCalled();
    });

    describe('createEvent', () => {
        beforeEach(() => {
            spyOn(EventModel, 'create').and.returnValue(Promise.resolve(event));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new event with valid fields', (done) => {
            controller.createEvent(event)
                .then(() => {
                    expect(EventModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not be able to create a event with an invalid timezone', (done) => {
            event.timeZone = 'Foo/Bar';
            controller.createEvent(event)
                .catch((error) => {
                    event.timeZone = originalTimezone;
                    expect(EventModel.create).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateEvent', () => {
        const newEvent = {
            title: 'New item label',
            description: 'New description.',
            url: '',
            startTime: moment().utc().toDate(),
            endTime: moment().utc().toDate(),
            timeZone: 'America/Denver',
            venue: null,
            isActive: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            event.save.calls.reset();
            event.title = originalTitle;
            event.description = originalDescription;
            event.url = originalUrl;
            event.startTime = originalStart;
            event.endTime = originalEnd;
            event.timeZone = originalTimezone;
            event.venue = originalVenue;
            event.isActive = true;
        });

        it('should save an updated event with valid fields', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(event));

            controller.updateEvent('1', newEvent)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(event.save).toHaveBeenCalled();
                    expect(event.title).toEqual(newEvent.title);
                    expect(event.description).toEqual(newEvent.description);
                    expect(event.timeZone).toEqual(newEvent.timeZone);
                    expect(event.venue).toEqual(newEvent.venue);
                    expect(event.isActive).toEqual(newEvent.isActive);
                    done();
                });
        });

        it('should not update event when invalid data is PUT', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(event));

            controller.updateEvent('1', Object.assign({}, newEvent, {timeZone: 'Foo/Bar'}))
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(event.save).not.toHaveBeenCalled();
                    expect(event.title).not.toEqual(newEvent.title);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not save a event that does not exist', (done) => {
            controller.updateEvent('', newEvent)
                .catch((error) => {
                    expect(event.save).not.toHaveBeenCalled();
                    expect(event.title).not.toEqual(newEvent.title);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteEvent', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            event.delete.calls.reset();
            events = [];
        });

        it('should delete event', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(event));

            controller.deleteEvent('1')
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(EventModel.findOne).toHaveBeenCalled();
                    expect(event.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a event if no id provided', (done) => {
            spyOn(EventModel, 'findOne');
            controller.deleteEvent()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(EventModel.findOne).not.toHaveBeenCalled();
                    expect(event.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
