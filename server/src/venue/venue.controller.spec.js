// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./venue.controller', {'../services/logger.service': mockLogger});

const VenueModel = require('./venue.model');
const EventModel = require('../event/event.model');
const controller = require('./venue.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('VenueController', () => {
    const originalLabel = 'Original label';
    const originalAddress = 'Original address';
    const originalLatitude = 90;
    const originalLongitude = 180;
    const venue = {
        label: originalLabel,
        address: originalAddress,
        latitude: originalLatitude,
        longitude: originalLongitude
    };
    venue.save = jasmine.createSpy('venue.save').and.returnValue(Promise.resolve(venue));
    venue.delete = jasmine.createSpy('venue.delete').and.returnValue(Promise.resolve(venue));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many venues', () => {
        spyOn(VenueModel, 'find').and.returnValue(fakeQuery);
        spyOn(VenueModel, 'findOne').and.returnValue(fakeQuery);

        controller.findVenues('1', ['label']);
        expect(VenueModel.findOne).toHaveBeenCalled();

        controller.findVenues(null);
        expect(VenueModel.find).toHaveBeenCalled();
    });

    describe('createVenue', () => {
        beforeEach(() => {
            spyOn(VenueModel, 'create').and.returnValue(Promise.resolve(venue));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new venue with valid fields', (done) => {
            controller.createVenue(venue)
                .then(() => {
                    expect(VenueModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });
        // NOTE: Venue field validation is all mongo validaiton, so no tests.
    });

    describe('updateVenue', () => {
        const newVenue = {
            label: 'New item label',
            address: 'New address.',
            latitude: 0,
            longitude: 0
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            venue.save.calls.reset();
            venue.label = originalLabel;
            venue.address = originalAddress;
            venue.latitude = originalLatitude;
            venue.longitude = originalLongitude;
        });

        it('should save an updated venue with valid fields', (done) => {
            spyOn(VenueModel, 'findOne').and.returnValue(Promise.resolve(venue));

            controller.updateVenue('1', newVenue)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(venue.save).toHaveBeenCalled();
                    expect(venue.label).toEqual(newVenue.label);
                    expect(venue.address).toEqual(newVenue.address);
                    expect(venue.latitude).toEqual(newVenue.latitude);
                    expect(venue.longitude).toEqual(newVenue.longitude);
                    done();
                });
        });

        it('should not save a venue that does not exist', (done) => {
            controller.updateVenue('', newVenue)
                .catch((error) => {
                    expect(venue.save).not.toHaveBeenCalled();
                    expect(venue.label).not.toEqual(newVenue.label);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        // NOTE: Venue field validation is all mongo validaiton, so no tests.
    });

    describe('deleteVenue', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            venue.delete.calls.reset();
            venues = [];
        });

        it('should delete venue', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(null));
            spyOn(VenueModel, 'findOne').and.returnValue(Promise.resolve(venue));

            controller.deleteVenue('1')
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(VenueModel.findOne).toHaveBeenCalled();
                    expect(venue.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a venue if no id provided', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve(null));
            spyOn(VenueModel, 'findOne');
            controller.deleteVenue()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(VenueModel.findOne).not.toHaveBeenCalled();
                    expect(venue.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not delete a venue if it is in use on an event', (done) => {
            spyOn(EventModel, 'findOne').and.returnValue(Promise.resolve({_id: '66'}));
            spyOn(VenueModel, 'findOne');
            controller.deleteVenue()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(VenueModel.findOne).not.toHaveBeenCalled();
                    expect(venue.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
