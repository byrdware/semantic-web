/* eslint-env mocha */
/* jshint expr: true */
/* globals describe, before, after, it */

const debug = require('debug')('semantic-web:webid:tests:webid');
const fs = require('fs');
const { expect } = require('chai');
const { setup, teardown } = require('./common');
const WebID = require('../lib/webid');

const URL = 'mongodb://localhost:27017/unittest';
const KEYFILENAME = './tests/key.pem';
const CERTFILENAME = './tests/cert.pem';

describe('WebID Class', () => {

  before((done) => {
    debug('Starting tests');
    //setup(URL, done);
    done();
  });

  after((done) => {
    debug('Completed tests');
    //teardown(done);
    done();
  });

  describe('Helper Functions', () => {
    it('Should create an OpenSSL configuration file', (done) => {
      const webId = new WebID({
        name: 'Ted Byrd',
        id: 'https://w3id.net/tbyrd/profile#me'
      });
      webId.createOpenSslConfigFile((err, path, cleanup) => {
        expect(err).to.be.null;
        expect(path).to.be.a('string');
        expect(cleanup).to.be.a('function');
        fs.exists(path, (exists) => {
          expect(exists).to.be.true;
          cleanup();
          fs.exists(path, (exists) => {
            expect(exists).to.be.false;
            done();
          });
        });
      });
    });
    it('Should generate a key & certificate files', function(done) {
      this.timeout(5000);
      const webId = new WebID({
        name: 'Ted Byrd',
        id: 'https://w3id.net/tbyrd/profile#me'
      });
      const certOpts = {
        userKeyFileName: KEYFILENAME,
        userCertFileName: CERTFILENAME,
        openssl: {
          cliDirectory: null,
          libDirectory: null,
          days: 3652 // 2 or 3 leap years in 10 year span
        }
      };
      webId.genCertificate(certOpts, (err) => {
        expect(err).to.be.null;
        fs.exists(KEYFILENAME, (keyExists) => {
          expect(keyExists).to.be.true;
          fs.unlinkSync(KEYFILENAME);
          fs.exists(CERTFILENAME, (certExists) => {
            expect(certExists).to.be.true;
            fs.unlinkSync(CERTFILENAME);
            done();
          });
        });
      });
    });
  });

});
