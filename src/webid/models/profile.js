/////////////////////////////////////////////////////////////////////////////// 
// Profile schema used by Mongoose to represent a profile document in MongoDB.
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

const debug = require('debug')('semantic-web:webid:models:profile');
const moment = require('moment');
const { Schema } = require('mongoose');

//////////////////////////////////////////////////////////////////////////////// 
// Profile Schema
//////////////////////////////////////////////////////////////////////////////// 

const profile = new Schema({
  alias: { type: String, required: true, unique: true, index: true },
  agent: { type: String, required: true, default: 'Person', enum: [ 'Person', 'Organization', 'Group' ] },
  title: { type: String }, // Mr, Mrs, Ms, Dr, etc.
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nickName: { type: String },
  status: { type: String, enum: ['Available', 'Away', 'Busy', 'Offline', 'Custom' ]},
  customStatus: { type: String },
  gender: { type: String, default: 'Unknown', enum: [ 'Unknown', 'Male', 'Female' ] },
  marital: { type: String, default: 'Unknown', enum: [ 'Unknown', 'Single', 'Married', 'Separated', 'Divorced' ] },
  myersBriggs: { type: String },
  birth: {
    date: { type: Date },       // Date (and time, astrologers) of birth
    place: {
      name: { type: String },   // Place name of birth, arbitrary
      geo: {
        lat: { type: Number },  // Lattitude
        lng: { type: Number }   // Longitude
      }
    },
    parent: {
      mother: { type: String }, // WebID or (more likely?) name
      father: { type: String }  // WebID or (more likely?) name
    }
  },
  death: {
    date: { type: Date },       // Date of death
    cause: { type: String },    // Cause of death
    place: {
      name: { type: String },   // Place name of death, arbitrary
      geo: {
        lat: { type: Number },  // Lattitude
        lng: { type: Number }   // Longitude
      }
    }
  },
  languages: [{                 // Langauges spoken at proficiency
    name: { type: String, required: true },
    proficiency: { type: String, enum: ['Beginner','Intermediate','Advanced','Native'] }
  }],
  image: {
    avatar: { type: String },     // Avatar Image URL
    background: { type: String }  // Background Image URL
  },
  certificates: [{ // Security certificates; zero (0) is always "primary" WebID cert
    purpose: { type: String, required: true },      // Certificate purpose
    certificate: { type: Object, required: true },  // Pathname to certificate
  }],
  openid: { type: String },       // OpenID
  email: { type: String, required: true, unique: true,  index: true }, // Primary email address
  secondaryEmails: [{
    type: { type: String, required: true },
    address: { type: String, required: true, unique: true, index: true }
  }],
  phones: [{ 
    type: { type: String },
    number: { type: String, index: true }
  }],
  messaging: [{ // Messaging and chat accounts
    type: { type: String },
    id: { type: String },
    url: { type: String }
  }],
  wallets: [{
    type: { type: String },
    name: { type: String },
    address: { type: String }
  }],
  accounts: [{ // Online & Offline accounts; facebook to bank accounts
    type: { type: String },
    id: { type: String },
    url: { type: String }
  }],
  sites: [{ // Sites owned, operated, or affiliated with profile owner
    type: { type: String, default: 'Personal', enum: [ 'Personal', 'Business', 'Group', 'Employer', 'Other' ] },
    name: { type: String },
    description: { type: String },
    url: { type: String }
  }], // Web sites owned or affiliated with
  address: {
    street: { type: String},
    locality: { type: String },
    region: { type: String},
    postalCode: { type: String },
    country: { type: String },
    geo: {
      lat: { type: Number },
      lng: { type: Number }
    },
    landlord: {
      name: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    history: [{ // Prior addresses
      street: { type: String, required: true},
      locality: { type: String, required: true },
      region: { type: String, required: true},
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      geo: {
        lat: { type: Number },
        lng: { type: Number }
      },
      landlord: {
        name: { type: String },
        phone: { type: String },
        email: { type: String }
      }
    }]
  },
  bio: { // Biographical write-ups
    summary: { type: String },    // Short bio; one sentence
    sketch: { type: String },     // Long bio; one or more paragraphs
    occupation: { type: String }, // Occupational description (not job title!)
    projects: { type: String },   // Projects involved with
    skills: { type: String },     // Skills accrued
    religion: { type: String },   // Reiligious beliefs
    politics: { type: String },   // Political beliefs
    hobbies: { type: String },    // Hobbies enjoyed
    interests: { type: String },  // Interests and 
    books: { type: String },      // Favorite books
    writers: { type: String },    // Favorite writers
    music: { type: String },      // Favorite music / bands / artists
    tv: { type: String },         // Favorite tv shows
    movies: { type: String },     // Favorite movies
    games: { type: String },      // Favorite games (board, video, role playing, etc.)
  },
  education: {
    school: {
      primaries: [{
        name: { type: String },
        location: { type: String },
        description: { type: String },
        date: { 
          from: { type: Date },
          to: { type: Date }
        }
      }],
      secondaries: [{
        name: { type: String },
        location: { type: String },
        description: { type: String },
        date: {
          from: { type: Date },
          to: { type: Date }
        }
      }],
      trades: [{
        name: { type: String },
        location: { type: String },
        description: { type: String },
        date: {
          from: { type: Date },
          to: { type: Date }
        },
        degree: { type: String }
      }],
      universities: [{
        name: { type: String },
        location: { type: String },
        description: { type: String },
        date: {
          from: { type: Date },
          to: { type: Date }
        },
        degree: { type: String }
      }]
    },
    studies: [{
      subject: { type: String },
      description: { type: String },
      date: {
        from: { type: Date },
        to: { type: Date }
      } 
    }]
  },
  employment: {
    history: [{
      position: { type: String },
      company: { type: String },
      location: { type: String },
      rateOfPay: { type: String },
      date: { 
        from: { type: Date },
        to: { type: Date }
      },
      description: { type: String }
    }]
  },
  accomplishments: [{
    name: { type: String },
    description: { type: String },
    location: { type: String },
    date: {
      from: { type: Date },
      to: { type: Date }
    } 
  }],
  publications: [{
    title: { type: String },
    description: { type: String },
    publishedOn: { type: Date },
    isbn: { type: String }
  }],
  storage: { type: String },          // pim:storage data
  knows: [{ type: String }],          // people known (web id's)
  created: [{ type: String }],        // works of endeavor (web id's)
  groups: [{                          // Groups this profile belongs to
    name: { type: String },           // Group name
    class: { type: String },          // Membership class
    id: { type: String }              // Group ID
  }],
  members: [{ type: String }],        // Followers of this profile
  _settings: {
    permissions: {                    // Permissions settings
      public: {                       // Public permissions:
        profile: Boolean,             // Profile visible to public
        email: Boolean,               // Email address(es) visible to public
        emailHash: Boolean,           // Email addresses only visible as hash
        phone: Boolean,               // Phone number(s) visible to public
        address: Boolean,             // Postal address(es) visible to public
        connectRequest: Boolean,      // Connect requests allowed from anyone
        contact: Boolean              // Contact allowed from anyone
      }
    },
    notifications: {
      playSound: { type: Boolean },   // Play notifications sound
      sendEmail: { type: Boolean },   // Send notifications email
      birthdays: { type: Boolean },   // Show friend's birthday notficiations
      chatSound: { type: Boolean }    // Play sounds when chat message rcv'd
    }
  },
  _bookmarks: [{
    name: { type: String },           // Site / bookmark name
    url: { type: String },            // URL
    createdOn: { type: Date },        // Date bookmark created
    updatedOn: { type: Date },        // Date bookmark updated / validated
    category: { type: String },       // Arbitrary, user-defined category
    tags: [ String ]                  // An array of tags
  }],
  _notifications: [{                  // System notifications
    date: { type: Date },             // Date notification received
    type: { type: String },           // Type of notification (details need worked out)
    description: { type: String }     // Detailed notification information
  }],
  _history: [{                        // Profile revision history (timeline)
    date: { type: Date },             // Date of event
    event: { type: String },          // What happened to profile (e.g. 'profile created', 'article posted', 'friend liked post', etc.)
    detail: { type: String }          // Details about the event (e.g. profile status, article title & url, article url & friend id, etc.)
  }],
  _connectRequests: [{                // Connect requests from other people
    date: { type: Date },             // Date of request
    requestor: { type: String },      // Address or ID of requestor
    note: { type: String }            // Note written by requestor, describing request
  }],
  _password: { type: String, required: true }, // Password, hashed!
  _createdOn: { type: Date, default: Date.now() },
  _updatedOn: { type: Date }
},{ // Options
  autoIndex: false
});

profile.statics.findByAlias = function(alias, callback) {
  debug('Find by alias: %s', alias);
  return this.findOne({alias: alias}, callback);
};

profile.query.byAlias = function(alias) {
  debug('Query by alias: %s', alias);
  return this.findOne({alias: alias});
};

profile.virtual('fullName').
  get(function() {
    return this.firstName + (this.lastName ? ' ' + this.lastName : '');
  });

profile.virtual('age').
  get(function() {
    return this.birth.date ? moment().diff(this.birth.date, 'years') : undefined;
  });

profile.virtual('createdOn').
  get(function() { // read-only access
    return this._createdOn;
  });

profile.virtual('updatedOn').
  get(function() { // read-only access
    return this._updatedOn;
  });

profile.pre('save', function(next) {
  this._updatedOn = Date.now();
  if (!this.nickName) {
    this.nickName = this.firstName;
  }
  debug('Saving profile: %s', JSON.stringify(this));
  next();
});

profile.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret._password;
  }
});

///////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////

module.exports = profile;

///////////////////////////////////////////////////////////////////////////////
// End of File
///////////////////////////////////////////////////////////////////////////////
