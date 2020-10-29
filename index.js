// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// http server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(`Server listening on port ${config.httpPort}`);
});

// https server
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
  console.log(`Server listening on port ${config.httpsPort}`);
});

const unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  
  const queryStringObject = parsedUrl.query;
  const method = req.method;
  const headers = req.headers;
  
  // Get payload if any
  const decoder = new StringDecoder('utf-8');
  let buffer = ''
  req.on('data', data => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler for this request
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? 
      router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    }

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Returning this response: ${statusCode} - ${payloadString}`);
    });
  });
}

// Defining handlers
let handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
}

// Not Found handler
handlers.notFound = function(data, callback) {
  callback(404);
}

// Defining a request router
const router = {
  'ping': handlers.ping
}