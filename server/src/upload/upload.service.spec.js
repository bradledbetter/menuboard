// NOTE: make sure to proxyquire before requiring the files that require the proxied things
const proxyquire = require('proxyquire');

const mockAws = {
    S3: function() {
        this.createPresignedPost = function(options, callback) {
            callback(null, {fields: {}, url: ''});
        };
        return this;
    }
};

const mockEnv = {
    aws: {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'fake',
            secretAccessKey: 'superfake'
        },
        s3: {
            bucket: 'bucket',
            maxFileSizeBytes: 1000,
            allowedExtensions: new Set(['jpg']),
            signatureVersion: 'v4',
            signatureExpiration: 10
        }
    }
};

const uploadService = proxyquire('./upload.service', {
    'aws-sdk': mockAws,
    '../../config/environment/environment.development.js': mockEnv
});

const restifyErrors = require('restify-errors');

describe('UploadService', () => {
    describe('s3Credentials', () => {
        it('should reject an upload that has an unacceptable extension', (done) => {
            uploadService.s3Credentials('foo.png')
                .catch((err) => {
                    expect(err).toEqual(jasmine.any(restifyErrors.NotAcceptableError));
                    done();
                });
        });

        it('should return credentials fields if everything goes well', (done) => {
            uploadService.s3Credentials('foo.jpg')
                .then((data) => {
                    expect(data.fields.acl).toEqual('public-read');
                    expect(data.fields.success_action_status).toEqual('201');
                    done();
                });
        });
    });
});
