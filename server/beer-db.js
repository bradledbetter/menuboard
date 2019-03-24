const docClient = require('./database.js').client;
const { TableName } = require('./config.js');

function getAllBeers() {
  console.log(`DB client getAllBeers()`);
  return docClient
    .query({
      TableName,
      KeyConditionExpression: '#tName = :tValue',
      ExpressionAttributeValues: {
        ':tValue': 'beer'
      },
      ExpressionAttributeNames: {
        '#tName': 'dataType'
      }
    })
    .promise()
    .then(result => (result.Items ? result.Items : []))
    .catch(err => {
      console.error('error', err);
      return Promise.reject(JSON.stringify(err, null, 2));
    });
}

function getAllOnTap() {
  console.log(`DB client getAllOnTap()`);
  return docClient
    .query({
      IndexName: 'beerOnTap',
      KeyConditionExpression: '#tName = :tValue AND #onTap > :onTapValue',
      ExpressionAttributeValues: {
        ':tValue': 'beer',
        ':onTapValue': 0
      },
      ExpressionAttributeNames: {
        '#tName': 'dataType',
        '#onTap': 'onTap'
      }
    })
    .promise()
    .then(result => (result.Items ? result.Items : []))
    .catch(err => Promise.reject(JSON.stringify(err, null, 2)));
}

function createBeer(beer) {
  // todo limit description to 270 chars
  console.log(`DB client createBeer()`, beer);
  return docClient
    .put({ TableName, Item: beer })
    .promise()
    .then(() => beer)
    .catch(err => Promise.reject(JSON.stringify(err, null, 2)));
}

function getBeer(name) {
  console.log(`DB client getBeer(${name})`);
  return docClient
    .get({
      TableName,
      Key: {
        dataType: 'beer',
        name
      }
    })
    .promise()
    .then(result => (result.Item ? result.Item : {}))
    .catch(err => Promise.reject(JSON.stringify(err, null, 2)));
}

function updateBeer(name, attributes) {
  // todo limit description to 270 chars
  console.log(`DB client updateBeer(${name}, ${require('util').inspect(attributes)})`);
  var params = {
    TableName,
    Key: {
      dataType: 'beer',
      name
    },
    ReturnValues: 'UPDATED_NEW'
  };
  const cantUpdateKeys = ['dataType', 'name']; // note: Can't update the primary key values

  const keys = Object.keys(attributes).filter(key => !cantUpdateKeys.includes(key));
  const updateExpr = keys.map(key => `#${key} = :${key}`);
  const UpdateExpression = `SET ${updateExpr.join(', ')}`;
  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};
  keys.forEach(key => {
    ExpressionAttributeValues[`:${key}`] = attributes[key];
    ExpressionAttributeNames[`#${key}`] = key;
  });

  return docClient
    .update(
      Object.assign({}, params, {
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames
      })
    )
    .promise()
    .then(result => {
      if (result.Attributes) {
        return Object.assign({}, attributes, result.Attributes);
      }
      return attributes;
    })
    .catch(err => Promise.reject(JSON.stringify(err, null, 2)));
}

function deleteBeer(name) {
  console.log(`DB client deleteBeer(${name})`);
  return docClient
    .delete({
      TableName,
      Key: {
        dataType: 'beer',
        name
      }
    })
    .promise()
    .catch(err => Promise.reject(JSON.stringify(err, null, 2)));
}

module.exports = {
  getAllBeers,
  getAllOnTap,
  createBeer,
  getBeer,
  updateBeer,
  deleteBeer
};
