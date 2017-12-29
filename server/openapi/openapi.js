const environment = require('../config/environment/environment' + (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '') + '.js');
const paths = require('./routes');
const components = require('./definitions');

const port = process.env.PORT || environment.server.port;

const openapi = {
    openapi: '3.0.0',
    info: {
        title: 'GoMenuBoard',
        version: '0.1.0',
        description: 'A basic menu board intended for small taprooms.<br>' +
            'And an opportunity for me (Brad) to write an HTTP REST API in Go.<br>' +
            'And a client with React/Redux, probably.<br>' +
            'Because I like to experiment.<br>',
        contact: {
            name: 'Brad Ledbetter',
            email: 'brad.ledbetter@gmail.com'
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0'
        }
    },
    servers: [{
        url: 'http://localhost:{port}',
        description: 'Local server for development.',
        variables: {
            port: {
                default: '' + port    // force string, but we want number in the app
            }
        }
    }],
    paths,
    components
};

const fs = require('fs');
fs.writeFileSync('openapi.json', JSON.stringify(openapi), 'utf8', (err) => {
    if (err) {
        throw err;
    }
    console.log('openapi.json written');
    process.exit();
});
