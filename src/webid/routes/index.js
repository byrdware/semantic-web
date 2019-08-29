/////////////////////////////////////////////////////////////////////////////// 
// Main Express routes
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

const debug = require('debug')('semantic-web:webid:routes:index');
const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const { Profile } = require('../models');

/* GET user profile. */
router.get('/:alias/profile', (req, res, next) => {
//  debug(req.headers);
//  debug(req.params);
  Profile.findByAlias(req.params.alias, (err, profile) => {
    if (err) {
      res.render('error', err);
    } else if (!profile) {
      next(createError(404));
    } else {
      delete profile._password;
      profile.url = `https://${req.headers.host}/${profile.alias}/profile`;
      const data = {
        req: req,
        profile: profile,
        moment: moment
      };
      debug(`Accept: ${req.headers.accept}`);
      res.format({
        'text/html': () => {
          debug(`Accepts HTML; sending html+rdfa profile for ${profile.alias}`);
          res.render('profile', data);
        },
        'application/rdf+xml': () => {
          debug(`Accepts RDF; sending foaf profile for ${profile.alias}`);
          res.render('rdf', data);
        },
        'text/turtle': () => {
          debug(`Accepts Turtle; sending foaf profile for ${profile.alias}`);
          res.render('turtle', data);
        },
        'text/ld+json': () => {
          debug(`Accepts JSON-LD; sending json-ld profile for ${profile.alias}`);
          res.render('json-ld', data);
        },
        default: () => {
          debug(`Accepts nothing familiar (${req.headers.accept}); sending 406 error for ${profile.alias}`);
          res.status(406).send('Not Acceptable');
        }
      });
    }
  });
});

/*
This is a private, protected container that houses User preferences and settings (such as preferred language, date format and time zone, etc), the content Type Registry, and app preferences and configs. Default ACL: private (owner only). Note that individual resources within the Settings container may be public (that is, override the default ACL).

Discoverable from profile via pim : space#preferencesFile property.

<#me>
    <http://www.w3.org/ns/pim/space#preferencesFile> <../settings/preferences.ttl> ;
*/
router.get('/:alias/settings', (req,res,next) => {
  next(createError(501));
});

/*
A container to serve as a default primary channel for notifications.

Default ACL: append-only by public, read by owner.

Discoverable from profile using the ldp:inbox property as specified in W3C Linked Data Notifications.

<#me>
    <http://www.w3.org/ns/ldp#inbox> <../inbox/> ;
*/
router.get('/:alias/inbox', (req,res,next) => {
  next(createError(501));
});

/*
The root/default container for the account. Default ACL: private (owner only). Discoverable from profile via pim : space#storage property. Discoverable via:

<#me>
    <http://www.w3.org/ns/pim/space#storage> <../> ;
*/
router.get('/:alias/storage', (req,res,next) => {
  next(createError(501));
});

///////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////

module.exports = router;

///////////////////////////////////////////////////////////////////////////////
// End of File
///////////////////////////////////////////////////////////////////////////////
