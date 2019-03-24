// const AWS = require('aws-sdk');
const { TableName, dynamoParams } = require('./config.js');
const serverlessDynamo = require('serverless-dynamodb-client');

let _client = null;

function factory() {
  if (_client) {
    return _client;
  }

  // const dynamodb = new AWS.DynamoDB(dynamoParams);
  const dynamodb = serverlessDynamo.raw;

  // DocumentClient translates between JavaScript types and DynamoDB attribute structures
  // _client = new AWS.DynamoDB.DocumentClient({
  //   params: {
  //     TableName,
  //     ReturnConsumedCapacity: 'TOTAL'
  //   },
  //   service: dynamodb
  // });
  _client = serverlessDynamo.doc;

  // can access dynamodb on _client.service
  _client.createTable = function(options) {
    // return this.service.createTable(options).promise();
    return dynamodb.createTable(options).promise();
  }.bind(_client);

  _client.deleteTable = function(options) {
    // return this.service.deleteTable(options).promise();
    return dynamodb.deleteTable(options).promise();
  }.bind(_client);

  return _client;
}

module.exports = {
  client: factory()
};
