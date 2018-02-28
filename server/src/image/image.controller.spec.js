const ImageModel = require('./image.model');
const ImageController = require('./image.controller');
const restifyErrors = require('restify-errors');

describe('ImageController', () => {
    let controller;
    const originalLabel = 'Original label';
    const originalURL = 'https://originalimage.com/image.png';
    const image = {
        _id: '1',
        label: originalLabel,
        url: originalURL,
        save: jasmine.createSpy('image.save').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        }),
        delete: jasmine.createSpy('image.delete').and.returnValue({
            then: (success) => {
                success('bla');
                return {
                    catch: () => {}
                };
            }
        })
    };

    beforeEach(() => {
        controller = new ImageController();
    });

    it('should be able to find one or many images', () => {
        spyOn(ImageModel, 'find').and.callThrough();
        spyOn(ImageModel, 'findOne').and.callThrough();

        let promise = controller.findImages('1', ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(ImageModel.findOne).toHaveBeenCalled();

        promise = controller.findImages(null, ['label']);
        expect(promise).toEqual(jasmine.any(Promise));
        expect(ImageModel.find).toHaveBeenCalled();
    });

    describe('createImage', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });

            spyOn(ImageModel, 'create').and.callFake((params) => {
                return {
                    exec: () => {
                        return {
                            then: (callback) => {
                                callback(image);
                                return {catch: () => {}};
                            }
                        };
                    }
                };
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
        });

        it('should be able to create a new image with valid fields', () => {
            controller.createImage(image);
            expect(ImageModel.create).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
        });

        // NOTE: image relies on mongo for model validation, so testing the controller doesn't make sense
    });

    describe('updateImage', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        const newImage = {
            label: 'New iamge label',
            url: 'http://newimage.com/newimage.jpg'
        };

        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            image.save.calls.reset();
            image.label = originalLabel;
            image.url = originalURL;
        });

        it('should save an updated image with valid fields', () => {
            spyOn(ImageModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(image);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.updateImage('1', newImage);
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            expect(image.save).toHaveBeenCalled();
            expect(image.label).toEqual(newImage.label);
            expect(image.url).toEqual(newImage.url);
        });

        it('should not override an image when invalid data is PUT', () => {
            spyOn(ImageModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(image);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.updateImage('1', {label: '', url: ''});
            expect(myResolve).toHaveBeenCalled();
            expect(myReject).not.toHaveBeenCalled();
            myReject.calls.reset();
            expect(image.save).toHaveBeenCalled();
            expect(image.label).not.toEqual('');
            expect(image.url).not.toEqual('');
        });

        it('should not save an image that does not exist', () => {
            controller.updateImage('', newImage);
            expect(myResolve).not.toHaveBeenCalled();
            expect(myReject).toHaveBeenCalled();
            expect(image.save).not.toHaveBeenCalled();
            expect(image.label).not.toEqual(newImage.label);
        });
    });

    describe('deleteImage', () => {
        const myResolve = jasmine.createSpy('myResolve');
        const myReject = jasmine.createSpy('myReject');
        beforeEach(() => {
            spyOn(global, 'Promise').and.callFake((callback) => {
                callback(myResolve, myReject);
            });
        });

        afterEach(() => {
            myResolve.calls.reset();
            myReject.calls.reset();
            image.delete.calls.reset();
            images = [];
        });

        it('should delete image', () => {
            spyOn(ImageModel, 'findOne').and.returnValue({
                exec: () => {
                    return {
                        then: (callback) => {
                            callback(image);
                            return {
                                catch: () => {}
                            };
                        }
                    };
                }
            });

            controller.deleteImage(image._id);
            expect(ImageModel.findOne).toHaveBeenCalled();
            expect(image.delete).toHaveBeenCalled();
            expect(myResolve).toHaveBeenCalledWith('Success');
            expect(myReject).not.toHaveBeenCalled();
        });

        it('should not delete an image if no id provided', () => {
            spyOn(ImageModel, 'findOne');
            controller.deleteImage();
            expect(ImageModel.findOne).not.toHaveBeenCalled();
            expect(image.delete).not.toHaveBeenCalled();
            expect(myResolve).not.toHaveBeenCalledWith();
            expect(myReject).toHaveBeenCalledWith(jasmine.any(restifyErrors.ForbiddenError));
        });
    });
});
