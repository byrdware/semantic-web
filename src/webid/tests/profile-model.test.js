/* eslint-env mocha */
/* jshint expr: true */
/* globals describe, before, after, it */

const debug = require('debug')('semantic-web:webid:tests:profile-model');
const { expect } = require('chai');
const { Profile } = require('../models');
const { setup, teardown } = require('./common');

const URL = 'mongodb://localhost:27017/unittest';

describe('Profile Model', () => {

  before(function(done) {
    debug('Starting tests');
    this.timeout(5000);
    setup(URL, done);
  });

  after((done) => {
    debug('Completed tests');
    teardown(done);
  });

  describe('Create a Profile', () => {
    it('Should create a minimal profile in the database', (done) => {
      const minimalProfile = {
        firstName: 'Jim',
        lastName: 'Smith',
        alias: 'username123',
        email: 'user@domain.com',
        _password: 'Lkj23409a8.132k'
      };
      Profile.create(minimalProfile, (err, profile) => {
        if (err) { debug(err); return done(err); }
        expect(profile).to.exist;
        expect(profile).to.be.an('object');
        expect(profile.alias).to.equal('username123');
        expect(profile.agent).to.equal('Person');
        expect(profile.firstName).to.equal('Jim');
        expect(profile.lastName).to.equal('Smith');
        expect(profile.nickName).to.equal('Jim');
        expect(profile.fullName).to.equal('Jim Smith');
        expect(profile.email).to.equal('user@domain.com');
        expect(profile.age).to.be.undefined;
        expect(profile.gender).to.equal('Unknown');
        expect(profile.marital).to.equal('Unknown');
        expect(profile._password).to.equal('Lkj23409a8.132k');
        expect(profile._createdOn).to.be.a('date');
        expect(profile._updatedOn).to.be.a('date');
        expect(profile._id).to.be.an('object');
        let json = JSON.stringify(profile);
        expect(json).to.be.a('string');
        done();
      });
    });
    it('Should not allow empty profiles in the database', (done) => {
      Profile.create({}, (err, profile) => {
        expect(err).to.be.an('object');
        expect(profile).to.be.undefined;
        done();
      });
    });
    it('Should prevent duplicate aliases in collection', (done) => {
      const dup = {
        firstName: 'Jane',
        lastName: 'Doe',
        alias: 'username123',
        email: 'jane@domain.com',
        _password: 'kJKj4975kX213Ba98'
      };
      Profile.create(dup, (err, profile) => {
        expect(err).not.to.be.empty;
        expect(profile).to.be.undefined;
        done();
      });
    });
  });

  var profileId = null;

  describe('Retrieve a Profile', () => {
    it('Should find a profile by alias', (done) => {
      Profile.findByAlias('username123', (err, profile) => {
        if (err) { debug(err); return done(err); }
        expect(profile).to.exist;
        expect(profile).to.be.an('object');
        expect(profile.alias).to.equal('username123');
        expect(profile.agent).to.equal('Person');
        expect(profile.firstName).to.equal('Jim');
        expect(profile.lastName).to.equal('Smith');
        expect(profile.nickName).to.equal('Jim');
        expect(profile.fullName).to.equal('Jim Smith');
        expect(profile.email).to.equal('user@domain.com');
        expect(profile.age).to.be.undefined;
        expect(profile.gender).to.equal('Unknown');
        expect(profile.marital).to.equal('Unknown');
        expect(profile._password).to.equal('Lkj23409a8.132k');
        expect(profile._createdOn).to.be.a('date');
        expect(profile._updatedOn).to.be.a('date');
        expect(profile._id).to.be.an('object');
        profileId = profile._id;
        let json = profile.toJSON();
        expect(json).to.be.an('object');
        expect(json._password).to.be.undefined;
        done();
      });
    });
    it('Should query profile collection by alias', (done) => {
      var query = Profile.findOne().byAlias('username123');
      query.select('firstName gender');
      query.exec((err, profile) => {
        if (err) { debug(err); return done(err); }
        expect(profile).to.be.an('object');
        expect(profile.alias).to.be.undefined;
        expect(profile.agent).to.be.undefined;
        expect(profile.firstName).to.equal('Jim');
        expect(profile.lastName).to.be.undefined;
        expect(profile.nickName).to.be.undefined;
        expect(profile.fullName).to.equal('Jim');
        expect(profile.email).to.be.undefined;
        expect(profile.age).to.be.undefined;
        expect(profile.gender).to.equal('Unknown');
        expect(profile.marital).to.be.undefined;
        expect(profile._password).to.be.undefined;
        expect(profile._createdOn).to.be.undefined;
        expect(profile._updatedOn).to.be.undefined;
        expect(profile._id).to.be.an('object');
        done();
      });
    });
    it('Should find a profile by ID', (done) => {
      Profile.findById(profileId, (err, profile) => {
        if (err) { debug(err); return done(err); }
        expect(profile).to.be.an('object');
        expect(profile.alias).to.equal('username123');
        expect(profile.agent).to.equal('Person');
        expect(profile.firstName).to.equal('Jim');
        expect(profile.lastName).to.equal('Smith');
        expect(profile.nickName).to.equal('Jim');
        expect(profile.fullName).to.equal('Jim Smith');
        expect(profile.email).to.equal('user@domain.com');
        expect(profile.age).to.be.undefined;
        expect(profile.gender).to.equal('Unknown');
        expect(profile.marital).to.equal('Unknown');
        expect(profile._password).to.equal('Lkj23409a8.132k');
        expect(profile._createdOn).to.be.a('date');
        expect(profile._updatedOn).to.be.a('date');
        expect(profile._id).to.be.an('object');
        profileId = profile._id;
        let json = profile.toJSON();
        expect(json).to.be.an('object');
        expect(json._password).to.be.undefined;
        done();
      });
    });
  });

  describe('Update a Profile', () => {
    it('Should modify a profile by alias', (done) => {
      Profile.findById(profileId, (err, profile) => {
        if (err) { debug(err); return done(err); }
        expect(profile).to.be.an('object');
        expect(profile.alias).to.equal('username123');
        expect(profile.agent).to.equal('Person');
        expect(profile.firstName).to.equal('Jim');
        expect(profile.lastName).to.equal('Smith');
        expect(profile.nickName).to.equal('Jim');
        expect(profile.fullName).to.equal('Jim Smith');
        expect(profile.email).to.equal('user@domain.com');
        expect(profile.age).to.be.undefined;
        expect(profile.gender).to.equal('Unknown');
        expect(profile.marital).to.equal('Unknown');
        expect(profile._password).to.equal('Lkj23409a8.132k');
        expect(profile._createdOn).to.be.a('date');
        expect(profile._updatedOn).to.be.a('date');
        expect(profile._id).to.be.an('object');
        let json = profile.toJSON();
        expect(json).to.be.an('object');
        expect(json._password).to.be.undefined;
        profile.gender = 'Male';
        profile.save((err,doc) => {
          if (err) { debug(err); return done(err); }
          expect(doc).to.exist;
          expect(doc).to.be.an('object');
          expect(doc.gender).to.equal('Male');
          done();
        });
      });
    });
  });

  describe('Delete a Profile', () => {
    it('Should remove a profile from the database', (done) => {
      Profile.findByIdAndDelete(profileId,(err) => {
        if (err) { debug(err); return done(err); }
        Profile.findById(profileId, (err, p) => {
          expect(err).to.be.null;
          expect(p).to.be.null;
          done(err);
        });
      });
    });
  });

});
