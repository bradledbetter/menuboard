
module.exports = {
  TableName: process.env.beersTableName,
  dynamoParams: {
    region: 'us-east-1',
    endpoint: process.env.dynamoEndpoint || 'http://localhost:8000',
    apiVersion: '2012-08-10',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
}
