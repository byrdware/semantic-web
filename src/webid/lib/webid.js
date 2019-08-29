/////////////////////////////////////////////////////////////////////////////// 
// WebID class implements the behaviours needed to manage W3C WebID's.
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

const debug = require('debug')('semantic-web:webid:webid');
const assert = require('assert');
const fs = require('fs-extra');
const tmp = require('tmp');
const path = require('path');
const OpenSSL = require(path.join(__dirname,'openssl'));

//////////////////////////////////////////////////////////////////////////////// 
// Internal Formatting Functions
//////////////////////////////////////////////////////////////////////////////// 

function _cfg(name,id) {
  return `[ req ]
default_md = sha1
default_bits = 2048
distinguished_name = req_distinguished_name
encrypt_key = no
string_mask = nombstr
x509_extensions = req_ext
[ req_distinguished_name ]
commonName = The Agent's name
commonName_default = ${name}
UID = The WebID/URI
UID_default="${id}"
[ req_ext ]
subjectKeyIdentifier = hash
subjectAltName = critical,@subject_alt
basicConstraints = CA:false
extendedKeyUsage = clientAuth
nsCertType = client
[ subject_alt ]
URI.1="${id}"
`;
}

//////////////////////////////////////////////////////////////////////////////// 
// WebID Class
//////////////////////////////////////////////////////////////////////////////// 

class WebID {

  constructor(options) {
    debug(`WebID:
      id: ${options['id']}
      name: ${options['name']}
      image: ${options['image']}
      nick: ${options['nick']}`
    );
    this.id = options['id'];
    this.name = options['name'];
    this.image = options['image'];
    this.nick = options['nick'];
  }

  retrieve(options, callback) {
    callback(new Error('Not implemented!'));
  }

  validate(options, callback) {
    callback(new Error('Not implemented!'));
  }
  
  genCertificate(options, callback) {
    assert(options);
    assert(typeof options === 'object');
    assert(callback);
    assert(typeof callback === 'function');
    assert(options['userKeyFileName']);
    assert(options['userCertFileName']);
    assert(options['openssl']);
    assert(options.openssl['cliDirectory'] !== undefined);
    assert(options.openssl['libDirectory'] !== undefined);
    this.createOpenSslConfigFile((err, path, cleanup) => {
      if (err) { debug(err); return callback(err); }
      const sslOpts = {
        sslConfigFileName: path,
        outputKeyFileName: options['userKeyFileName'],
        outputCertFileName: options['userCertFileName']
      };
      const openssl = new OpenSSL(options.openssl);
      openssl.genSelfSignedCert(sslOpts, (err, code, stdout, stderr) => {
        if (err) { debug(err); }
        debug(`OpenSSL results:\nReturn code: ${code}\nstdout: ${stdout}\nstderr: ${stderr}`);
        cleanup();
        callback(err);
      });
    });
  }

  createOpenSslConfigFile(callback) {
    tmp.file({keep: true, prefix: 'openssl.', postfix: '.config'}, (err, path, fd, cleanup) => {
      if (err) { debug(err); return callback(err); }
      fs.write(fd, _cfg(this.name,this.id), (err) => {
        if (err) { debug(err); return callback(err); }
        callback(err, path, cleanup);
      });
    });
  }

}

///////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////

module.exports = WebID;

///////////////////////////////////////////////////////////////////////////////
// End File
///////////////////////////////////////////////////////////////////////////////
