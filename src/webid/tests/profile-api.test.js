/* eslint-env mocha */
/* jshint expr: true */
/* globals describe, before, after, it */

const debug = require('debug')('semantic-web:webid:tests:profile-api');
const request = require('supertest');
const expect = require('chai').expect;
const indexRouter = require('../routes/index');
const { app, setup, teardown, createReferenceProfile } = require('./common');

app.use('/', indexRouter);

const URL = 'mongodb://localhost:27017/unittest';

describe('WebID Profile API', () => {

  before(function(done) {
    debug('Starting tests');
    this.timeout(5000);
    setup(URL, function(err) {
      if (err) {debug(err); return done(err);}
      createReferenceProfile((err, profile) => {
        if (err) {debug(err);}
        if (profile) {debug(profile);}
        done(err);
      });
    });
  });

  after((done) => {
    debug('Completed tests');
    teardown(done);
  });

  // --- Profile endpoint  ---------------------------------------------------

  describe('GET /unittest/profile', function() {
    this.timeout(5000);
    it('Retrieves profile as a turtle document', (done) => {
      request(app)
        .get('/unittest/profile')
        .set('Accept', 'text/turtle')
        .expect('Content-Type', /turtle/)
        .expect(200)
        .expect((res) => {
          expect(res.text).to.be.a('string');
          expect(res.text).to.contain('@prefix');
        })
        .end((err,res) => {
          if (err) { debug(err); }
          if (res) { debug(res.header); debug(res.text); }
          done(err);
        });
    });
  });

});
