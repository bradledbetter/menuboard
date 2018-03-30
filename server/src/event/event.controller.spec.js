// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./event.controller', {'../services/logger.service': mockLogger});

const EventModel = require('./event.model');
const controller = require('./event.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('EventController', () => {
    const originalTitle = 'Original label';
    const originalDescription = 'Original description';
    const originalEventItems = [{
        label: 'event',
        description: 'event description',
        prices: [],
        attributes: [],
        isActive: true
    }];
    const event = {
        _id: '1',
        title: originalTitle,
        description: originalDescription,
        prices: originalEventItems,
        eventItems: originalEventItems,
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

        controller.findEvents('1', ['label']);
        expect(EventModel.findOne).toHaveBeenCalled();

        controller.findEvents(null, ['label']);
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

        it('should not be able to create a event without a label', (done) => {
            controller.createEvent({})
                .catch((error) => {
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
            eventItems: [{}],
            isActive: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            event.save.calls.reset();
            event.title = originalTitle;
            event.description = originalDescription;
            event.eventItems = originalEventItems;
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
                    expect(event.eventItems).toEqual(newEvent.eventItems);
                    expect(event.isActive).toEqual(newEvent.isActive);
                    done();
                });
        });

        it('should not override a event when invalid data is PUT', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(event));

            controller.updateEvent('1', Object.assign({}, newEvent, {label: '', description: ''}))
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(event.save).toHaveBeenCalled();
                    expect(event.title).not.toEqual('');
                    expect(event.description).toEqual('');
                    expect(event.eventItems).toEqual(newEvent.eventItems);
                    expect(event.isActive).toEqual(newEvent.isActive);
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

            controller.deleteEvent(event._id)
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
