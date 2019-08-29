// Common code used by all tests

const config = require(__dirname + '/../etc/config.json')['development'];
const debug = require('debug')('semantic-web:webid:tests:common');
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const mongoose = require('mongoose');
const { Profile } = require('../models');

const referenceProfile = {
  alias: 'unittest',
  agent: 'Person',
  title: 'Dr.',
  firstName: 'Unit',
  lastName: 'Test',
  nickName: 'testy',
  status: 'Available',
  gender: 'Male',
  marital: 'Single',
  myersBriggs: 'ISTJ',
  birth: {
    date: '2/9/88',
    place: {
      name: 'Marion, Georgia',
      geo: { lat: -23.99, lng: 19.52 }
    },
    sign: {
      sun: 'Capricorn',
      moon: 'Libra',
      rising: 'Gemini'
    },
    parent: {
      mother: 'Jane Test',
      father: 'Harry Test'
    }
  },
  languages: [{
    name: 'Javascript',
    proficiency: 'Advanced'
  }],
  image: {
    avatar: 'http://i.pravatar.cc/300?img=23',
    background: 'https://picsum.photos/1920/640/?image=24'
  },
  certificates: [{
    purpose: 'WebID',
    privateKey: 'abcdef0123456789',
    certificate: 'abcdef0123456789',
    modulus: 'A98AC97CBASD987',
    exponent: 65214
  }],
  email: 'unittest@domain.org',
  secondaryEmails: [{
    type: 'Home',
    address: 'home@domain.org'
  },{
    type: 'Work',
    address: 'work@domain.org'
  }],
  phones: [{
    type: 'Home',
    number: '+442092475092348'
  },{
    type: 'Work',
    number: '+242092472459082457'
  }],
  sites: [{
    type: 'Personal',
    name: 'My Awesome Blog',
    description: 'It\'s awesome!',
    url: 'http://blog.domain.org/'
  }],
  address: {
    street: '123 Main St.',
    locality: 'Anytown',
    region: 'New State',
    postalCode: '01923',
    country: 'United States',
    geo: { lat: -29.44, lng: 54.14 }
  },
  bio: 'Needs much expanding!',
  _password: '09287409A*df;lkmj235j[09'
};

const logConfig = {
  transports: [
    new winston.transports.File({ filename: '/dev/null', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true })
  ],
  exitOnError: true
};

if (process.env.DEBUG) {
  logConfig.transports.push(new winston.transports.Console({ json: false, timestamp: true }));
}

const log = new (winston.Logger)(logConfig);

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.set('config', config);
app.set('log', log);
app.use(bodyParser.json());

const connectDatabase = function(mongoUrl, callback) {
  debug('Connecting to MongoDB');
  mongoose.connect(mongoUrl, { useNewUrlParser: true });
  mongoose.connection.on('error', (err) => {
    debug('Connection to MongoDB failed: %s', err);
    callback(err);
  });
  mongoose.connection.once('open', () => {
    debug('Dropping existing databases (if any)');
    mongoose.connection.db.dropDatabase((err) => {
      if (err) { debug(err); }
      callback(err);
    });
  });
};

const createIndexes = function(callback) {
  debug('Creating indexes on Profile collection');
  Profile.createIndexes((err) => {
    if (err) { debug(err); }
    callback(err);
  });
};

const createReferenceProfile = function(callback) {
  debug('Creating reference Profile');
  Profile.create(referenceProfile, (err, profile) => {
    callback(err, profile);
  });
};

const setup = function(mongoUrl, callback) {
  connectDatabase(mongoUrl, (err) => {
    if (err) { debug(err); return callback(err); }
    createIndexes((err) => {
      callback(err);
    });
  });
};

const teardown = function(callback) {
  debug('Dropping database');
  mongoose.connection.db.dropDatabase((err) => {
    if (err) { debug(err); }
    debug('Closing database connection');
    mongoose.connection.close();
    callback(err);
  });
};

module.exports = {
  app,
  config,
  log,
  connectDatabase,
  createIndexes,
  createReferenceProfile,
  setup,
  teardown
};
