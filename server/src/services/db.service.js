const environment = require('../../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const restifyErrors = require('restify-errors');
const mongoose = require('mongoose');
const logger = require('./logger.service').getLogger();

// connect to database
mongoose.connect(`${environment.mongoose.host}${environment.mongoose.dbName}`);

const db = mongoose.conection;
db.on('error', (err) => {
    console.error('Could not connect to DB: ', err);
    logger.error('Could not connect to DB', err);
    throw new restifyErrors.InternalServerError(err);
});

db.once('open', () => {
    console.log('Successfully connected to Mongo');
    logger.info('Successfully connected to Mongo');
});

module.exports = db;
