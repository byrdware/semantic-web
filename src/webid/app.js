/////////////////////////////////////////////////////////////////////////////// 
// Simplified Web ID Provider Microservice
// app.js - Main Application File
//
// Copyright (c) 2018 Ted Byrd
// All Rights Reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//
/////////////////////////////////////////////////////////////////////////////// 

'use strict';

/////////////////////////////////////////////////////////////////////////////// 
// Bootstrap the runtime environment & configuration
/////////////////////////////////////////////////////////////////////////////// 

const ENV = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/etc/config.json')[ENV];

if (config.service && config.service.debug) {
  process.env.DEBUG = 'semantic-web:webid:*';
}

//////////////////////////////////////////////////////////////////////////////// 
// Modules
//////////////////////////////////////////////////////////////////////////////// 

const debug = require('debug')('semantic-web:webid:app');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
const winston = require('winston');
const path = require('path');
const pkg = require(path.join(__dirname, 'package.json'));
const { Profile } = require(path.join(__dirname,'models'));

const indexRouter = require('./routes/index');

/////////////////////////////////////////////////////////////////////////////// 
// Create the Express app
///////////////////////////////////////////////////////////////////////////////

const app = express();

/////////////////////////////////////////////////////////////////////////////// 
// PM2 Integration
/////////////////////////////////////////////////////////////////////////////// 

const pmx = require('pmx').init({
  http          : true, // (default: true) HTTP routes logging
  custom_probes : true, // (default: true) Auto expose JS Loop Latency and HTTP req/s as custom metrics
  network       : true, // (default: false) Network monitoring at the application level
  ports         : true, // (default: false) Shows which ports your app is listening on

  // Transaction Tracing system configuration
  transactions  : true, // (default: false) Enable transaction tracing
  ignoreFilter: {
    'url': [],
    'method': ['OPTIONS']
  },

  // can be 'express', 'hapi', 'http', 'restify'
  excludedHooks: []
});

//////////////////////////////////////////////////////////////////////////////// 
// Application Logger
//////////////////////////////////////////////////////////////////////////////// 

const log = new winston.Logger({
  transports: [
    new winston.transports.Console({ json: false, timestamp: true }),
    new winston.transports.File({ filename: path.join(__dirname, 'webid.log'), json: false })
  ],
  exceptionHandlers: [
    new winston.transports.Console({ json: false, timestamp: true }),
    new winston.transports.File({ filename: path.join(__dirname, 'webid.crash.reports.json'), json: true })
  ],
  exitOnError: true
});

/////////////////////////////////////////////////////////////////////////////// 
// MongoDB Connection
/////////////////////////////////////////////////////////////////////////////// 

const connectToMongoDB = function() {
  app.set('mongo.connection', null);
  mongoose.connect(config.mongodb.url, { useNewUrlParser: true });
  mongoose.connection.on('error', (err) => {
    if (err) {
      log.error('%s - MongoDB is offline or inaccessible', err.message);
      debug(err);
    }
    app.set('mongo.connect-interval', setInterval(connectToMongoDB, 15000));
  });
  mongoose.connection.once('open', () => {
    clearInterval(app.get('mongo.connect-interval'));
    app.set('mongo.connect-interval', undefined);
    Profile.createIndexes((err) => {
      if (err) { log.error('Creating indexes on Profile collection failed: %s', err); }
      else { debug('Indexes created on Profile collection'); }
      log.info('Connected to MongoDB: %s', config.mongodb.url);
      app.set('mongo.connection', mongoose.connection);
    });
  });
};

connectToMongoDB();

/////////////////////////////////////////////////////////////////////////////// 
// Application configuration
/////////////////////////////////////////////////////////////////////////////// 

app.set('json spaces', ENV === 'development' ? 2 : 0);
app.set('env', ENV);
app.set('config', config);
app.set('log', log);
app.set('pmx', pmx);

/////////////////////////////////////////////////////////////////////////////// 
// View engine setup
/////////////////////////////////////////////////////////////////////////////// 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/////////////////////////////////////////////////////////////////////////////// 
// Express middleware
/////////////////////////////////////////////////////////////////////////////// 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

/////////////////////////////////////////////////////////////////////////////// 
// Add standard response headers
/////////////////////////////////////////////////////////////////////////////// 

app.use((req, res, next) => {
  res.set('X-Powered-By', pkg.name);
  next();
});

/////////////////////////////////////////////////////////////////////////////// 
// Reject downstream routes until the database is online
/////////////////////////////////////////////////////////////////////////////// 

app.use((req, res, next) => {
  if (!req.app.get('mongo.connection')) {
    const log = req.app.get('log');
    log.warn('Database not connected, request rejected');
    next(createError(503)); // Service unavailable
  } else {
    next();
  }    
});

/////////////////////////////////////////////////////////////////////////////// 
// Main routes
/////////////////////////////////////////////////////////////////////////////// 

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

/////////////////////////////////////////////////////////////////////////////// 
// Catch 404 and forward to error handler
/////////////////////////////////////////////////////////////////////////////// 

app.use(function(req, res, next) {
  next(createError(404));
});

/////////////////////////////////////////////////////////////////////////////// 
// Send an appropriate error response
/////////////////////////////////////////////////////////////////////////////// 

app.use(function(err, req, res, next) {
  debug(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { meta: { company: { name: 'W&sup3;ID.net' } } });
});

/////////////////////////////////////////////////////////////////////////////// 
// Module Exports
/////////////////////////////////////////////////////////////////////////////// 

module.exports = app;

/////////////////////////////////////////////////////////////////////////////// 
// End of File
/////////////////////////////////////////////////////////////////////////////// 
