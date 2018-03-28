// const os = require('os');
const restifyErrors = require('restify-errors');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const aws = require('aws-sdk');
const Promise = require('bluebird');

/**
 * Return an upload URL and AWS S3 fields for the client to upload direct to S3
 * @param {string} filename name of the
 * @return {Promise} resolved with credentials object or rejected with an error
 * @throws restify error if the file extension isn't one that's allowed
 */
function s3Credentials(filename) {
    // file extension check
    if (environment.aws.s3.allowedExtensions) {
        const ext = filename.substr(filename.lastIndexOf('.') + 1);
        if (!environment.aws.s3.allowedExtensions.has(ext)) {
            return Promise.reject(new restifyErrors.NotAcceptableError());
        }
    }

    const s3 = new aws.S3({
        signatureVersion: environment.aws.s3.signatureVersion,
        region: environment.aws.region,
        accessKeyId: environment.aws.credentials.accessKeyId,
        secretAccessKey: environment.aws.credentials.secretAccessKey
    });

    const params = {
        Bucket: environment.aws.s3.bucket,
        Fields: {
            key: filename,
        },
        Expires: environment.aws.s3.signatureExpiration,
        Conditions: [
            ['content-length-range', 0, environment.aws.s3.maxFileSizeBytes],
            {acl: 'public-read'},
            {success_action_status: '201'},
        ],
    };

    const s3CreatePresignedPost = Promise.promisify(s3.createPresignedPost, {context: s3});
    return s3CreatePresignedPost(params)
        .then((data) => {
            const transformedData = Object.assign({}, data);
            transformedData.fields.acl = 'public-read';
            transformedData.fields.success_action_status = '201';
            return transformedData;
        });
}

module.exports = {
    s3Credentials
};
