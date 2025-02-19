const awsServerlessExpress = require('aws-serverless-express');
const app = require('./server'); // Importamos nuestro servidor Express
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};
