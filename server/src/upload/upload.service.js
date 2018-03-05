// const os = require('os');
// const bodyParser = require('restify').plugins.bodyParser;

/**
 * A class that will house various methods useful in handling file uploads
 */
class UploadService {
    /**
     * Get a public URL that a client can use to put object (files) into an s3 bucket that can later be used to serve files from.
     * @param {string} filename the name of the file that will be uploaded to s3
     * @return {Promise} resolved with the s3 upload URL, or rejected on error (e.g. S3 is unreachable)
     */
    static getS3UploadUrl(filename) {
        return new Promise((resolve, reject) => {
            resolve('');
        });
    }

    // static restifyMultipartFileHandler(){}
    // static cleanTmpDir(){}
}

module.exports = UploadService;

// TODO: upload a file and create an image record
// server.post('/image/upload', (req, res, next) => {
//     // NOTE: as I thought, this doesn't work
//     return bodyParser({
//         // mapParams: false,
//         // mapFiles: false,
//         multipartHandler: function(part) {// overrides mapParams
//             part.on('data', function(data) {
//                 // do something with the multipart data
//                 console.log('multipartHandler data: ', data.toString('utf8'));
//             });
//         },
//         multipartFileHandler: function(part) {
//             // console.log('multipartFileHandler arguments[1]: ', arguments[1]);
//             part.on('data', function(data) {
//                 // stream data to S3
//                 // console.log('multipartFileHandler data');
//             });
//             part.on('error', function() {
//                 console.log('multipart file error');
//             });
//             part.on('end', function() {
//                 // add something to params or something so we can get URL?
//                 console.log('multipart file end. no args');
//                 res.send(200, 'OK');
//                 next();
//             });
//         },
//         // keepExtensions: false,// overridden by multipartFileHandler
//         uploadDir: os.tmpdir(),
//         multiples: true,
//         hash: 'sha1',
//         rejectUnknown: true,
//         requestBodyOnGet: false
//     });
// });

