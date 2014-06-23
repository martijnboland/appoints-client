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
    roles: []
  };

  function Session() {
    // always start with a default instance.
    return angular.copy(defaultSession, this);
  }

  var currentSession = new Session();

  function current() {
    return currentSession;
  }

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

  return {
    current: current,
    login: login,
    logout: logout
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