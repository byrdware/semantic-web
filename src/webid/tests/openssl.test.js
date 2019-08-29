/* eslint-env mocha */
/* jshint expr: true */
/* globals describe, before, after, it */

const debug = require('debug')('semantic-web:webid:tests:openssl');
const fs = require('fs');
const tmp = require('tmp');
const { expect } = require('chai');
const { setup, teardown } = require('./common');
const OpenSSL = require('../lib/openssl');

const URL = 'mongodb://localhost:27017/unittest';
const MOCK_CONFIG =`[ req ]
default_md = sha1
default_bits = 2048
distinguished_name = req_distinguished_name
encrypt_key = no
string_mask = nombstr
x509_extensions = req_ext
[ req_distinguished_name ]
commonName = Common Name (i.e. your name)
commonName_default = Ted Byrd
UID = A User ID
UID_default="https://w3id.net/tbyrd/profile#me"
[ req_ext ]
subjectKeyIdentifier = hash
subjectAltName = critical,@subject_alt
basicConstraints = CA:false
extendedKeyUsage = clientAuth
nsCertType = client
[ subject_alt ]
URI.1="https://w3id.net/tbyrd/profile#me"
`;

describe('OpenSSL Class', () => {

  before(function(done) {
    debug('Starting tests');
    //this.timeout(5000);
    //setup(URL, done);
    done();
  });

  after((done) => {
    debug('Completed tests');
    //teardown(done);
    done();
  });

  describe('Certificate tests', () => {
    it('Should generate a self-signed certificate and keys', function(done) {
      this.timeout(5000);
      tmp.file({keep: true, prefix: 'unittest.', postfix: '.config'}, (err, path, fd, cleanup) => {
        if (err) { debug(err); }
        expect(err).to.be.null;
        expect(path).be.be.a('string');
        expect(fd).to.be.a('number');
        expect(cleanup).to.be.a('function');
        fs.write(fd, MOCK_CONFIG, (err) => {
          if (err) { debug(err); }
          expect(err).to.be.null;
          const sslOpts = {
            sslConfigFileName: path,
            outputKeyFileName: './key.pem',
            outputCertFileName: './cert.pem'
          };
          const openssl = new OpenSSL({});
          openssl.genSelfSignedCert(sslOpts, (err, code, stdout, stderr) => {
            expect(err).to.be.null;
            expect(code).to.equal(0);
            expect(stdout).to.be.a('string');
            expect(stderr).to.be.a('string');
            cleanup();
            done();
          });
        });
      });
    });
  });

  describe('Key tests', () => {
    it('Should return the key modulus', (done) => {
      const openssl = new OpenSSL({});
      openssl.getKeyModulus('./key.pem', (err, modulus) => {
        expect(err).to.be.null;
        expect(modulus).to.be.a('string');
        done();
      });
    });
    it('Should return the key exponent', (done) => {
      const openssl = new OpenSSL({});
      openssl.getKeyExponent('./key.pem', (err, exponent) => {
        debug(exponent);
        expect(err).to.be.null;
        expect(exponent).to.be.a('number');
        done();
      });
    });
  });

});
