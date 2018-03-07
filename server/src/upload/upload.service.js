// const os = require('os');
const crypto = require('crypto');
const restifyErrors = require('restify-errors');
const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const moment = require('moment');
const awsDateFormat = 'YYYYMMDDT000000Z';

// Stuff I don't care to expose on exports
/**
 * Returns the parameters that must be passed to the API call
 * @param {Object} config s3 config params
 * @param {*} filename
 * @return {Object}
 */
function s3Params(config, filename) {
    const credential = [config.accessKey, config.dateString.substr(0, 8), config.region, 's3/aws4_request'].join('/');
    const policy = s3UploadPolicy(config, filename, credential);
    const policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64');
    return {
        'key': filename,
        'acl': 'public-read',
        'success_action_status': '201',
        'policy': policyBase64,
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': credential,
        'x-amz-date': config.dateString,
        'x-amz-signature': s3UploadSignature(config, policyBase64, credential)
    };
}

/**
 * Constructs the policy
 * @param {Object} config
 * @param {string} filename
 * @param {Array} credential
 * @return {Object}
 */
function s3UploadPolicy(config, filename, credential) {
    return {
        // 5 minutes into the future
        expiration: moment().add(5, 'minutes').format('YYYY-MM-DDTHH:mm:ss.sssZ'),
        conditions: [
            {bucket: config.bucket},
            {key: filename},
            {acl: 'public-read'},
            {success_action_status: '201'},
            // Optionally control content type and file size
            // {'Content-Type': 'application/pdf'},
            ['content-length-range', 0, environment.aws.s3.maxFileSizeBytes],
            {'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
            {'x-amz-credential': credential},
            {'x-amz-date': config.dateString}
        ],
    };
}

/**
 * Generate a sha256 hmac for a message
 * @param {string} key secret key to seed the hmac
 * @param {string} message data to generate a hmac for
 * @return {string}
 */
function hmac(key, message) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return hmac.read();
}

/**
 * Signs the policy with date, region, service, and a predetermined token
 * @param {Object} config aws config
 * @param {string} policyBase64 base64 encoded policy doc
 * @return {string} signature string
 */
function s3UploadSignature(config, policyBase64) {
    const dateKey = hmac('AWS4' + config.secretKey, config.dateString);
    const dateRegionKey = hmac(dateKey, config.region);
    const dateRegionServiceKey = hmac(dateRegionKey, 's3');
    const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
    return hmac(signingKey, policyBase64).toString('hex');
}

/**
 * A class that will house various methods useful in handling file uploads
 */
class UploadService {
    /**
     * Return an upload URL and AWS S3 params for the client to upload
     * @param {string} filename name of the
     * @return {Object} credentials object
     * @throws restify error if the file extension isn't one that's allowed
     */
    static s3Credentials(filename) {
        // file extension check
        if (environment.aws.s3.allowedExtensions) {
            const ext = filename.substr(filename.lastIndexOf('.'));
            if (!environment.aws.s3.allowedExtensions.has(ext)) {
                throw new restifyErrors.NotAcceptableError();
            }
        }

        const config = {
            bucket: environment.aws.s3.bucket,
            region: environment.aws.region,
            accessKey: environment.aws.credentials.accessKeyId,
            secretKey: environment.aws.credentials.secretAccessKey,
            dateString: moment().format(awsDateFormat)
        };

        return {
            endpoint_url: 'https://' + config.bucket + '.s3.amazonaws.com',
            params: s3Params(config, filename)
        };
    }
}

module.exports = UploadService;
