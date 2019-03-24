const lambdas = require('./handler.js');
const docClient = require('./database.js').client;
const { TableName } = require('./config.js');

const seeker = {
  dataType: 'beer',
  name: 'Seeker',
  abv: 0.05, // 5%
  ibu: 35,
  description: 'Light fruity bitter ale',
  category: 'Hop Forward',
  onTap: 0
};

function callback(err, result, next) {
  console.log(`Callback result: `, err || result);
  next();
}

const tests = [
  // create beer
  next => {
    lambdas.createBeer({ body: JSON.stringify(seeker) }, {}, (err, result) => {
      callback(err, result, next);
    });
  },

  // get beer
  next => {
    lambdas.getBeer({ pathParameters: { name: seeker.name } }, {}, (err, result) => {
      callback(err, result, next);
    });
  },

  // update beer
  next => {
    lambdas.updateBeer(
      {
        pathParameters: {
          name: seeker.name
        },
        body: JSON.stringify(Object.assign({}, seeker, { onTap: 1, category: 'Bitter, hoppy, light' }))
      },
      {},
      (err, result) => {
        callback(err, result, next);
      }
    );
  },

  // list beers
  next => {
    lambdas.listBeers({}, {}, (err, result) => {
      callback(err, result, next);
    });
  },

  // list on tap
  next => {
    lambdas.listOnTap({}, {}, (err, result) => {
      callback(err, result, next);
    });
  },

  // delete beer
  next => {
    lambdas.deleteBeer({ pathParameters: { name: seeker.name } }, {}, (err, result) => {
      callback(err, result, next);
    });
  }
];

// create table
docClient
  .createTable({
    TableName,
    KeySchema: [{ AttributeName: 'dataType', KeyType: 'HASH' }, { AttributeName: 'name', KeyType: 'Range' }],
    AttributeDefinitions: [
      { AttributeName: 'dataType', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' },
      { AttributeName: 'onTap', AttributeType: 'N' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'beerOnTap',
        KeySchema: [{ AttributeName: 'dataType', KeyType: 'HASH' }, { AttributeName: 'onTap', KeyType: 'Range' }],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 3
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 3
    }
  })
  .then(() => {
    return new Promise(resolve => {
      // run tests
      let idx = 0;
      function runTest() {
        if (idx >= tests.length) {
          console.log('Tests complete')
          return resolve(true);
        }
        console.log(`${idx + 1} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
        tests[idx](() => {
          idx++;
          runTest();
        });
      }
      runTest();
    });
  })
  .catch((err) => {
    console.error(`\nThere was an error: `, err, `\n`);
    return Promise.resolve('');
  })
  .finally(() => {
    // delete table
    docClient
      .deleteTable({ TableName })
      .then(() => console.log(`Done.`))
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
