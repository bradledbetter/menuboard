// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./slide.controller', {'../services/logger.service': mockLogger});

const SlideModel = require('./slide.model');
const SlideshowModel = require('../slideshow/slideshow.model');
const controller = require('./slide.controller');
const restifyErrors = require('restify-errors');
const mongoose = require('mongoose');
const Promise = require('bluebird');

describe('SlideController', () => {
    const originalTitle = 'Original label';
    const originalData = new mongoose.Types.ObjectId();
    const originalTemplateUrl = 'http://google.com';
    const originalSlideType = 'event feed';
    const slide = {
        _id: '1',
        title: originalTitle,
        data: originalData,
        templateUrl: originalTemplateUrl,
        slideType: originalSlideType,
        isActive: true
    };
    slide.save = jasmine.createSpy('slide.save').and.returnValue(Promise.resolve(slide));
    slide.delete = jasmine.createSpy('slide.delete').and.returnValue(Promise.resolve(slide));
    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    it('should be able to find one or many slides', () => {
        spyOn(SlideModel, 'find').and.returnValue(fakeQuery);
        spyOn(SlideModel, 'findOne').and.returnValue(fakeQuery);

        controller.findSlides('1', ['label']);
        expect(SlideModel.findOne).toHaveBeenCalled();

        controller.findSlides(null, ['label']);
        expect(SlideModel.find).toHaveBeenCalled();
    });

    describe('createSlide', () => {
        beforeEach(() => {
            spyOn(SlideModel, 'create').and.returnValue(Promise.resolve(slide));
        });

        afterEach(() => {
            mockLogger.info.calls.reset();
        });

        it('should be able to create a new slide with valid fields', (done) => {
            controller.createSlide(slide)
                .then(() => {
                    expect(SlideModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not be able to create a slide without a label', (done) => {
            controller.createSlide({})
                .catch((error) => {
                    expect(SlideModel.create).not.toHaveBeenCalled();
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('updateSlide', () => {
        const newSlide = {
            title: 'New item label',
            data: new mongoose.Types.ObjectId(),
            templateUrl: 'http://yahoo.com',
            slideType: 'event feed',
            isActive: false
        };

        afterEach(() => {
            mockLogger.info.calls.reset();
            slide.save.calls.reset();
            slide.title = originalTitle;
            slide.data = originalData;
            slide.templateUrl = originalTemplateUrl;
            slide.slideType = originalSlideType;
            slide.isActive = true;
        });

        it('should save an updated slide with valid fields', (done) => {
            spyOn(SlideModel, 'findOne').and.returnValue(Promise.resolve(slide));

            controller.updateSlide('1', newSlide)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(slide.save).toHaveBeenCalled();
                    expect(slide.title).toEqual(newSlide.title);
                    expect(slide.templateUrl).toEqual(newSlide.templateUrl);
                    expect(slide.slideType).toEqual(newSlide.slideType);
                    expect(slide.isActive).toEqual(newSlide.isActive);
                    done();
                });
        });

        it('should not save a slide that does not exist', (done) => {
            controller.updateSlide('', newSlide)
                .catch((error) => {
                    expect(slide.save).not.toHaveBeenCalled();
                    expect(slide.title).not.toEqual(newSlide.title);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not override a slide when invalid object ref is PUT', (done) => {
            spyOn(SlideModel, 'findOne').and.returnValue(Promise.resolve(slide));

            controller.updateSlide('1', Object.assign({}, newSlide, {data: 'e'}))
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(slide.save).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteSlide', () => {
        afterEach(() => {
            mockLogger.info.calls.reset();
            slide.delete.calls.reset();
            slides = [];
        });

        it('should delete slide', (done) => {
            spyOn(SlideshowModel, 'find').and.returnValue(Promise.resolve(null));
            spyOn(SlideModel, 'findOne').and.returnValue(Promise.resolve(slide));

            controller.deleteSlide(slide._id)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(SlideModel.findOne).toHaveBeenCalled();
                    expect(slide.delete).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete a slide if no id provided', (done) => {
            spyOn(SlideshowModel, 'find').and.returnValue(Promise.resolve(null));
            spyOn(SlideModel, 'findOne');
            controller.deleteSlide()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(SlideModel.findOne).not.toHaveBeenCalled();
                    expect(slide.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });

        it('should not delete a slide if it is in a slideshow', (done) => {
            spyOn(SlideshowModel, 'find').and.returnValue(Promise.resolve([{_id: '1'}]));
            spyOn(SlideModel, 'findOne');
            controller.deleteSlide()
                .catch((error) => {
                    expect(mockLogger.info).not.toHaveBeenCalled();
                    expect(SlideModel.findOne).not.toHaveBeenCalled();
                    expect(slide.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
