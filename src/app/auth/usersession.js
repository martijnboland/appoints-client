angular.module('appoints.usersession', [])
.factory('usersession', function ($rootScope, $http, $window, config, flash) {

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
    return $http( { method: 'GET', url: config.defaultApiEndpoint + '/me' } )
      .then(function (userData) {
        currentSession.isAuthenticated = true;
        currentSession.userId = userData.userId;
        currentSession.displayName = userData.displayName;
        currentSession.roles = userData.roles;
      }, function (err) {
        flash.add(err.message, 'error');
      });
  }

  function logout() {
    $window.localStorage.removeItem('access_token');
    currentSession = new Session();
  }

  return {
    current: current,
    login: login,
    logout: logout
  };
});