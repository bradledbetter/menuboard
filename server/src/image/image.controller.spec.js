// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');
const mockLogger = require('../services/logger.stub');
proxyquire('./image.controller', {'../services/logger.service': mockLogger});

const ImageModel = require('./image.model');
const ImageController = require('./image.controller');
const restifyErrors = require('restify-errors');
const Promise = require('bluebird');

describe('ImageController', () => {
    let controller;
    const originalLabel = 'Original label';
    const originalURL = 'https://originalimage.com/image.png';
    const image = {
        _id: '1',
        label: originalLabel,
        url: originalURL
    };
    image.save = jasmine.createSpy('image.save').and.returnValue(Promise.resolve('bla'));
    image.delete = jasmine.createSpy('image.delete').and.returnValue(Promise.resolve('bla'));

    const fakeQuery = {
        select: () => {},
        exec: () => {
            return Promise.resolve({});
        }
    };

    beforeEach(() => {
        controller = new ImageController();
    });

    it('should be able to find one or many images', () => {
        spyOn(ImageModel, 'find').and.returnValue(fakeQuery);
        spyOn(ImageModel, 'findOne').and.returnValue(fakeQuery);

        let promise = controller.findImages('1', ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(ImageModel.findOne).toHaveBeenCalled();

        promise = controller.findImages(null, ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(ImageModel.find).toHaveBeenCalled();
    });

    describe('createImage', () => {
        beforeEach(() => {
            spyOn(ImageModel, 'create').and.returnValue(Promise.resolve(image));
        });

        it('should be able to create a new image with valid fields', (done) => {
            controller.createImage(image)
                .then(() => {
                    expect(ImageModel.create).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        // NOTE: image relies on mongo for model validation, so testing the controller doesn't make sense
    });

    describe('updateImage', () => {
        const newImage = {
            label: 'New iamge label',
            url: 'http://newimage.com/newimage.jpg'
        };

        afterEach(() => {
            image.save.calls.reset();
            image.label = originalLabel;
            image.url = originalURL;
            mockLogger.info.calls.reset();
        });

        it('should save an updated image with valid fields', (done) => {
            spyOn(ImageModel, 'findOne').and.returnValue(Promise.resolve(image));

            controller.updateImage('1', newImage)
                .then(() => {
                    expect(mockLogger.info).toHaveBeenCalled();
                    expect(image.save).toHaveBeenCalled();
                    expect(image.label).toEqual(newImage.label);
                    expect(image.url).toEqual(newImage.url);
                    done();
                });
        });

        it('should not override an image when invalid data is PUT', (done) => {
            spyOn(ImageModel, 'findOne').and.returnValue(Promise.resolve(image));

            controller.updateImage('1', {label: '', url: ''})
                .then(() => {
                    expect(image.save).toHaveBeenCalled();
                    expect(image.label).not.toEqual('');
                    expect(image.url).not.toEqual('');
                    done();
                });
        });

        it('should not save an image that does not exist', (done) => {
            controller.updateImage('', newImage)
                .catch((error) => {
                    expect(image.save).not.toHaveBeenCalled();
                    expect(image.label).not.toEqual(newImage.label);
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });

    describe('deleteImage', () => {
        afterEach(() => {
            image.delete.calls.reset();
            images = [];
            mockLogger.info.calls.reset();
        });

        it('should delete image', (done) => {
            spyOn(ImageModel, 'findOne').and.returnValue(Promise.resolve(image));

            controller.deleteImage(image._id)
                .then(() => {
                    expect(ImageModel.findOne).toHaveBeenCalled();
                    expect(image.delete).toHaveBeenCalled();
                    expect(mockLogger.info).toHaveBeenCalled();
                    done();
                });
        });

        it('should not delete an image if no id provided', (done) => {
            spyOn(ImageModel, 'findOne');
            controller.deleteImage()
                .catch((error) => {
                    expect(ImageModel.findOne).not.toHaveBeenCalled();
                    expect(image.delete).not.toHaveBeenCalled();
                    expect(error).toEqual(jasmine.any(restifyErrors.ForbiddenError));
                    done();
                });
        });
    });
});
