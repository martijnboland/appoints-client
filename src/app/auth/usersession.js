/* global _ */
angular.module('appoints.usersession', [
  'appoints.api',
  'appoints.flash',
  'appoints.config'
])

.factory('usersession', function ($rootScope, $window, config, flash, appointsapi) {

  var defaultSession = {
    userId: '',
    displayName: '',
    isAuthenticated: false,
    roles: [],
    isInRole: function(roleName) {
      return this.isAuthenticated && _(this.roles).contains(roleName);
    },
    isAdmin: function() { 
      return this.isInRole('admin');
    },
    isCustomer: function() {
      return this.isInRole('customer');
    }
  };

  function Session() {
    // always start with a default instance.
    return angular.copy(defaultSession, this);
  }

  var currentSession = new Session();

  function login(token) {
    // Authenticate the user from the given authorization token
    $window.localStorage.setItem('access_token', token);
    return appointsapi.apiRoot.then(function (rootResource) {
      rootResource.$get('me').then(function (userResource) {
        currentSession.isAuthenticated = true;
        currentSession.userId = userResource.userId;
        currentSession.displayName = userResource.displayName;
        currentSession.roles = userResource.roles;
        $rootScope.$broadcast('event:loggedin', currentSession);
      }, function (err) {
        flash.add(err.message, 'error');
      });
    });
  }

  function logout() {
    $window.localStorage.removeItem('access_token');
    currentSession = new Session();
    $rootScope.$broadcast('event:loggedout', currentSession);
  }

  var returnTo = '';

  return {
    current: currentSession,
    login: login,
    logout: logout,
    returnTo: returnTo
  };
})

.run(function ($window, $rootScope, $log, appointsapi, usersession) {
  // Automatically try to login the user when starting up this module
  if ($window.localStorage.getItem('access_token') !== null) {
    appointsapi.apiRoot.then(function (rootResource) {
      rootResource.$get('me').then(function (userResource) {
        usersession.current.isAuthenticated = true;
        usersession.current.userId = userResource.userId;
        usersession.current.displayName = userResource.displayName;
        usersession.current.roles = userResource.roles;
        $rootScope.$broadcast('event:loggedin', usersession.current);
      }, function (err) {
        $log.info('Unable to login automatically: ' + err.message);
      });    
    });
  }
});