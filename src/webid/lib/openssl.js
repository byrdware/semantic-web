/////////////////////////////////////////////////////////////////////////////// 
// OpenSSL CLI wrapper class.
//
// Simplified Web ID Provider Microservice
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

//////////////////////////////////////////////////////////////////////////////// 
// Modules
//////////////////////////////////////////////////////////////////////////////// 

const debug = require('debug')('semantic-web:webid:openssl');
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

//////////////////////////////////////////////////////////////////////////////// 
// Constants
//////////////////////////////////////////////////////////////////////////////// 

const OPENSSL = 'openssl';

//////////////////////////////////////////////////////////////////////////////// 
// OpenSSL Class
//////////////////////////////////////////////////////////////////////////////// 

class OpenSSL {

  constructor(options) {
    debug('OpenSSL.cliDirectory: %s', options['cliDirectory']);
    debug('OpenSSL.libDirectory: %s', options['libDirectory']);
    if (options['cliDirectory']) {
      this.command = path.join(options.cliDirectory, OPENSSL);
    } else {
      this.command = OPENSSL;
    }
    if (options['libDirectory']) {
      this.libDirectory = options.libDirectory;
    } else {
      this.libDirectory = null;
    }
  }

  genSelfSignedCert(options, callback) {
    debug(`OpenSSL.genSelfSignedCert: days ${options['days']}`);
    debug(`OpenSSL.genSelfSignedCert: sslConfigFileName ${options['sslConfigFileName']}`);
    debug(`OpenSSL.genSelfSignedCert: outputKeyFileName ${options['outputKeyFileName']}`);
    debug(`OpenSSL.genSelfSignedCert: outputCertFileName ${options['outputCertFileName']}`);
    assert(options);
    assert(typeof options === 'object');
    assert(callback);
    assert(typeof callback === 'function');
    assert(options['sslConfigFileName']);
    assert(options['outputKeyFileName']);
    assert(options['outputCertFileName']);
    debug('Create a self-signed certificate');
    const self = this;
    self.error = null;
    self.stdout = '';
    self.stderr = '';
    var args = [ 
      'req',
      '-x509',
      '-new',
      '-batch',
      '-days', options['days'] ? options['days'] : 3650,
      '-config', options['sslConfigFileName'],
      '-keyout', options['outputKeyFileName'],
      '-out', options['outputCertFileName']
    ];
    var spawnOpts = {
      env: {
        LD_LIBRARY_PATH: this.libDirectory
      }
    };
    debug('Executing command: %s %s', this.command, args.join(' '));
    const openssl = spawn(this.command, args, spawnOpts);
    openssl.on('error', (err) => {
      self.error = err;
      callback(err);
    });
    openssl.stdout.on('data', (data) => {
      if (data !== undefined) { self.stdout += data; }
    });
    openssl.stderr.on('data', (data) => {
      if (data !== undefined) { self.stderr += data; }
    });
    openssl.on('close', (code) => {
      debug(`OpenSSL completed with exit code ${code}`);
      if (!self.error) {
        callback(null, code, self.stdout, self.stderr);
      }
    });
  }

  getKeyModulus(keyFile, callback) {
    assert(keyFile);
    const self = this;
    self.error = null;
    self.stdout = '';
    self.stderr = '';
    var args = [ 
      'rsa',
      '-in', keyFile,
      '-modulus',
      '-noout'
    ];
    var spawnOpts = {
      env: {
        LD_LIBRARY_PATH: this.libDirectory
      }
    };
    debug('Executing command: %s %s', this.command, args.join(' '));
    const openssl = spawn(this.command, args, spawnOpts);
    openssl.on('error', (err) => {
      self.error = err;
      callback(err);
    });
    openssl.stdout.on('data', (data) => {
      if (data !== undefined) { self.stdout += data; }
    });
    openssl.stderr.on('data', (data) => {
      if (data !== undefined) { self.stderr += data; }
    });
    openssl.on('close', (code) => {
      debug(`OpenSSL completed with exit code ${code}`);
      if (!self.error) {
        const modulus = self.stdout.substring(8); // Strip away 'Modulus='
        debug(`Key modulus: ${modulus}`);
        callback(null, modulus);
      }
    });
  }

  getKeyExponent(keyFile, callback) {
    assert(keyFile);
    const self = this;
    self.error = null;
    self.exponent = null;
    self.stdout = '';
    self.stderr = '';
    var args = [ 
      'rsa',
      '-in', keyFile,
      '-text',
      '-noout'
    ];
    var spawnOpts = {
      env: {
        LD_LIBRARY_PATH: this.libDirectory
      }
    };
    debug('Executing command: %s %s', this.command, args.join(' '));
    const openssl = spawn(this.command, args, spawnOpts);
    openssl.on('error', (err) => {
      self.error = err;
      callback(err);
    });
    openssl.stdout.on('data', (data) => {
      if (data) {
        self.stdout += data;
        const found = self.stdout.match(/\npublicExponent:\s+(\d+)\s+\(0x[0-9a-fA-F]+\)\s*\n/);
        debug(found);
        if (found && found.length > 1) {
          self.exponent = +(found[1]);
          debug(`Key exponent: ${self.exponent}`);
        }
      }
    });
    openssl.stderr.on('data', (data) => {
      if (data) { self.stderr += data; }
    });
    openssl.on('close', (code) => {
      debug(`OpenSSL completed with exit code ${code}`);
      if (!self.error) {
        callback(null, self.exponent);
      }
    });
  }

/*   genWebIdP12Cert(options, callback) {
    debug('WebID Self-signed Certificate Generator');
    const self = this;
    self.stdout = '';
    self.stderr = '';
    tmp.file((err,path,fd,cleanupCallback) => {
      var args = [
        'pkcs12',
        '-clcerts',
        '-name', `WebID for ${options.name}`,
        '-in', 'webid.pem',
        '-inkey', 'webid.pem',
        '-out', 'webid.cert'
      ];
      var spawnOpts = {
        env: {
          LD_LIBRARY_PATH: this.libDirectory
        }
      };
      debug('Executing command: %s %s', this.command, args.join(' '));
      const openssl = spawn(this.command, args, spawnOpts);
      openssl.on('error', (err) => {
        callback(err);
      });
      openssl.stdout.on('data', (data) => {
        if (data !== undefined) { self.stdout += data; }
      });
      openssl.stderr.on('data', (data) => {
        if (data !== undefined) { self.stderr += data; }
      });
      openssl.on('close', (code) => {
        if (self.stdout && self.stdout.length) {
          if (code) {
            debug('Converted MIB to JSON with exit code %d', code);
          }
          callback(null, self.stdout);
        } else if (self.stderr && self.stderr.length) {
          debug('Conversion of MIB to JSON failed with exit code %d: ' + self.stderr, code);
          callback(new Error(self.stderr));
        } else {
          callback(new Error('Failed to convert MIB'));
        }
      });
      cleanupCallback();
    });
  }
 */
}

///////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////

module.exports = OpenSSL;

///////////////////////////////////////////////////////////////////////////////
// End File
///////////////////////////////////////////////////////////////////////////////
