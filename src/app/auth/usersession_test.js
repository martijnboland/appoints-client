/*jshint expr: true*/
/*global describe, it, beforeEach, afterEach, module, inject, expect*/
describe('usersession tests', function () {
  var usersession, config, httpBackend, flash;
  
  beforeEach(function () {
    
    // Load the module.
    module('appoints.usersession');

    // Provide constants that would be provided via app.js, but are not available because 
    // we're only loading the module in isolation.
    module(function ($provide) {
      $provide.constant('_', window._);
    });
    
    inject(function($httpBackend, _usersession_, _config_, _flash_) {
      httpBackend = $httpBackend;
      usersession = _usersession_;
      config = _config_;
      flash = _flash_;
    });

    httpBackend.when('GET', config.defaultApiEndpoint).respond({
      "message":"Appoints service API",
      "_links":{
        "self":{
          "href":"/"
        },
        "me":{
          "href":"/me"
        },
        "appointments":{
          "href":"/appointments"
        }
      }
    });
  });
     
  it('has a currentSession property', function () { 
    expect(usersession).to.have.ownProperty('current');
  });

  it('has a default current property when not logged in', function () {
    expect(usersession.current.userId).to.be.empty;
    expect(usersession.current.displayName).to.be.empty;
    expect(usersession.current.isAuthenticated).to.be.false;
    expect(usersession.current.roles).to.have.length(0);
  }); 
  
  it('sets the current property after authenticating with a token', function (done) {
    httpBackend.when('GET', config.defaultApiEndpoint + '/me').respond({
      "_links":{
        "self":{"href":"/users/53b156ad76c3c30000a15eb4"}
      },
      "userId":"1234567890",
      "provider":"test",
      "email":"tinus@test.com",
      "displayName":"Tinus Test",
      "roles":["customer"]
    });

    var promise = usersession.login('dummy token');
    promise.then(function () {
      expect(usersession.current.userId).to.equal('1234567890');
      expect(usersession.current.displayName).to.equal('Tinus Test');
      expect(usersession.current.isAuthenticated).to.be.true;
      expect(usersession.current).to.have.property('roles').that.has.length(1);
      done();
    });
    httpBackend.flush();
  });

  it('still has the default current property after a failed authentication attempt and a message in flash', function (done) {
    httpBackend.when('GET', config.defaultApiEndpoint + '/me').respond(401, { 
      "message":"Access to /me is not allowed.",
      "details":"No Authorization header was found. Format is Authorization: Bearer [token]",
      "_links":{
        "auth_facebook":{
          "href":"/auth/facebook"
        },
        "auth_google":{
          "href":"/auth/google"
        }
      }
    });
    var promise = usersession.login('dummy token');
    promise.then(function () {
      expect(usersession.current.userId).to.equal('');
      expect(usersession.current.displayName).to.equal('');
      expect(usersession.current.isAuthenticated).to.be.false;
      expect(usersession.current).to.have.property('roles').that.has.length(0);
      var flashes = flash.all();
      expect(flashes).to.have.length(1);
      expect(flashes[0]).to.have.ownProperty('message');
      done();
    });
    httpBackend.flush();
  });

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    //httpBackend.verifyNoOutstandingRequest();
  });
});