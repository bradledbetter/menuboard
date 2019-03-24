const dotenv = require('dotenv');
if (dotenv) {
  dotenv.config();
}
const db = require('./beer-db.js');
const statusCodes = require('./constants.js').statusCodes;
const sanitizer = require('./sanitizer.js');

// common headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*' // todo: change to menuviz.net, I think
};

/**
 * Common params // todo is there a way to define this and include below?
 * @param {object} event the incoming triggering event. Contains query params and such.
 * @param {object} context execution context, I guess
 * @param {function} callback call to return error or success response
 */

/**
 * Define type beer
 * @typedef {Object} Beer
 * @property {string} dataType - partition key for dynamo. Should equal 'beer'.
 * @property {string} name - primary key sort key
 * @property {number?} abv
 * @property {number?} ibu
 * @property {string?} description
 * @property {string?} category - style (Juicy IPA), or descriptor (Hop Forward)
 * @property {number} onTap - GSI sort key. 0..n where n is max tap number. 0 == not on tap
 */

/**
 * Method: POST
 * Path: /beers-on-tap/
 * Payload: {beer}
 */
function createBeer(event, context, callback) {
  console.log(`${process.env.serviceName}: createBeer called`);
  let beer = JSON.parse(event.body);
  try {
    beer = sanitizer.sanitizeModel(beer);
  } catch (error) {
    console.error('createBeer threw an error sanitizing payload: ', error);
    callback({
      statusCode: statusCodes.BAD_REQUEST,
      headers,
      body: JSON.stringify({ msg: 'Model failed sanitization.', extended: error.message })
    });
  }

  db.createBeer(beer)
    .then((newBeer) => {
      console.log(`Beer created `, newBeer);
      callback(null, {
        statusCode: statusCodes.OK,
        headers,
        body: JSON.stringify(newBeer)
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to create beer.', extended: error })
      });
    });
}

/**
 * Method: GET
 * Path: /beers-on-tap/all
 */
function listBeers(event, context, callback) {
  console.log(`${process.env.serviceName}: listBeers called`);

  db.getAllBeers()
    .then(beers => {
      console.log(`All beers `, beers);
      callback(null, {
        statusCode: statusCodes.OK,
        headers,
        body: JSON.stringify(beers)
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to list all beers.', extended: error })
      });
    });
}

/**
 * Method: GET
 * Path: /beers-on-tap/tapped
 */
function listOnTap(event, context, callback) {
  console.log(`${process.env.serviceName}: listOnTap called`);

  db.getAllOnTap()
    .then(beers => {
      console.log(`Beers on tap `, beers);
      callback(null, {
        statusCode: statusCodes.OK,
        headers,
        body: JSON.stringify(beers)
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to list all on tap.', extended: error })
      });
    });
}

/**
 * Method: GET
 * Path: /beers-on-tap/:name
 */
function getBeer(event, context, callback) {
  console.log(`${process.env.serviceName}: getBeer called`);

  db.getBeer(event.pathParameters.name)
    .then(beer => {
      console.log('Found beer', beer);
      callback(null, {
        statusCode: statusCodes.OK,
        headers,
        body: JSON.stringify(beer)
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to get beer.', extended: error })
      });
    });
}

/**
 * Method: PUT
 * Path: /beers-on-tap/:name
 * Payload: {beer}
 */
function updateBeer(event, context, callback) {
  console.log(`${process.env.serviceName}: updateBeer called`);
  let beer;
  try {
    beer = sanitizer.sanitizeModel(JSON.parse(event.body));
  } catch (error) {
    console.error('updateBeer threw an error sanitizing payload: ', error);
    callback({
      statusCode: statusCodes.BAD_REQUEST,
      headers,
      body: JSON.stringify({ msg: 'Model failed sanitization.', extended: error.message })
    });
  }

  db.updateBeer(event.pathParameters.name, beer)
    .then(beer => {
      console.log(`${event.pathParameters.name} updated`, beer);
      callback(null, {
        statusCode: statusCodes.OK,
        headers,
        body: JSON.stringify(beer)
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to update beer.', extended: error })
      });
    });
}

/**
 * Method: DELETE
 * Path: /beers-on-tap/:name
 */
function deleteBeer(event, context, callback) {
  console.log(`${process.env.serviceName}: deleteBeer called`);

  db.deleteBeer(event.pathParameters.name)
    .then(() => {
      console.log(`deleted ${event.pathParameters.name}`);
      callback(null, {
        statusCode: statusCodes.OK,
        headers
      });
    })
    .catch(error => {
      console.error(error);
      callback({
        statusCode: statusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ msg: 'Failed to delete beer.', extended: error })
      });
    });
}

module.exports = {
  createBeer,
  getBeer,
  listBeers,
  listOnTap,
  updateBeer,
  deleteBeer
};
