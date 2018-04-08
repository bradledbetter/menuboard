// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./slideshow.controller', {'../services/logger.service': mockLogger});

const SlideshowModel = require('./slideshow.model');
const controller = require('./slideshow.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('SlideshowController', () => {
    const originalDescription = 'Original label';
    const slide = {
        _id: '2',
        title: 'slide',
        data: null,
        templateUrl: 'http://google.com',
        slideType: 'menu',
        isActive: true
    };
    const slideshow = {
        _id: '1',
        description: originalDescription,
        slides: [slide],
        isActive: true,
        isPrimary: true
    };
    slideshow.save = jasmine.createSpy('slideshow.save').and.returnValue(Promise.resolve(slideshow));
    slideshow.delete = jasmine.createSpy('slideshow.delete').and.returnValue(Promise.resolve(slideshow));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many slideshows', () => {
        spyOn(SlideshowModel, 'find').and.returnValue(fakeQuery);
        spyOn(SlideshowModel, 'findOne').and.returnValue(fakeQuery);

        controller.findSlideshows('1', ['label']);
        expect(SlideshowModel.findOne).toHaveBeenCalled();

        controller.findSlideshows(null, ['label']);
        expect(SlideshowModel.find).toHaveBeenCalled();
    });

    describe('createSlideshow', () => {
        beforeEach(() => {
            spyOn(SlideshowModel, 'create').and.returnValue(Promise.resolve(slideshow));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new slideshow with valid fields', (done) => {
            controller.createSlideshow(slideshow)
                .then(() => {
                    expect(SlideshowModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not be able to create a slideshow without a label', (done) => {
            controller.createSlideshow({})
                .catch((error) => {
                    expect(SlideshowModel.create).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateSlideshow', () => {
        const newSlideshow = {
            description: 'New item label',
            slides: [],
            isActive: false,
            isPrimary: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            slideshow.save.calls.reset();
            slideshow.description = originalDescription;
            slideshow.slides = [slide];
            slideshow.isActive = true;
            slideshow.isPrimary = true;
        });

        it('should save an updated slideshow with valid fields', (done) => {
            spyOn(SlideshowModel, 'findOne').and.returnValue(Promise.resolve(slideshow));

            controller.updateSlideshow('1', newSlideshow)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(slideshow.save).toHaveBeenCalled();
                    expect(slideshow.description).toEqual(newSlideshow.description);
                    expect(slideshow.isActive).toEqual(newSlideshow.isActive);
                    expect(slideshow.isPrimary).toEqual(newSlideshow.isPrimary);
                    done();
                });
        });

        it('should not save a slideshow that does not exist', (done) => {
            controller.updateSlideshow('', newSlideshow)
                .catch((error) => {
                    expect(slideshow.save).not.toHaveBeenCalled();
                    expect(slideshow.description).not.toEqual(newSlideshow.description);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not override a slideshow with an empty description', (done) => {
            spyOn(SlideshowModel, 'findOne').and.returnValue(Promise.resolve(slideshow));

            controller.updateSlideshow('1', Object.assign({}, newSlideshow, {description: ''}))
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(slideshow.save).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteSlideshow', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            slideshow.delete.calls.reset();
            slideshows = [];
        });

        it('should delete slideshow', (done) => {
            spyOn(SlideshowModel, 'findOne').and.returnValue(Promise.resolve(slideshow));

            controller.deleteSlideshow(slideshow._id)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(SlideshowModel.findOne).toHaveBeenCalled();
                    expect(slideshow.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a slideshow if no id provided', (done) => {
            spyOn(SlideshowModel, 'findOne');
            controller.deleteSlideshow()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(SlideshowModel.findOne).not.toHaveBeenCalled();
                    expect(slideshow.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
