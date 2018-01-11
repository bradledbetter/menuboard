const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const mongoose = require('mongoose');
const logger = require('./logger.service');
mongoose.Promise = Promise; //  override mongoose mpromise with ES6 Promise

console.log('Attempting to connect to DB.');
logger.info(`Attempting to connect to DB host: ${environment.mongoose.host}`);

let myDB;
// connect to database
mongoose.connect(`${environment.mongoose.host}${environment.mongoose.dbName}`, {useMongoClient: true}).then(
    (db) => {
        myDB = db;
        console.log('Successfully connected to DB');
        logger.info('Successfully connected to DB');
    },
    (err) => {
        console.error('Could not connect to DB: ', err);
        logger.error('Could not connect to DB: ', err);
        throw new restifyErrors.InternalServerError(err);
    }
);

module.exports = myDB;
