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
});