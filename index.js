var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var http = require('http');
var iconv = require('iconv-lite');

var app = express();
var parseUrlEncoded = bodyParser.urlencoded({extended:false});
var parseJSON = bodyParser.json();
iconv.extendNodeEncodings();

process.env.PORT = process.env.PORT || 7070;

var corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Location'],
  exposedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Location'],
  credentials: true
};

var app = express();
app.use('/franz', require('./check-franz'));
app.use(express.static('./public'));
app.use('/modules', express.static('./node_modules'));

var server = http.createServer(app);
server.listen(process.env.PORT, function() {
  console.log('Node app is running at localhost:' + process.env.PORT);
});
server.on('clientError',function (exception, socket) {
  console.log('>> Client error', exception, socket);
});
