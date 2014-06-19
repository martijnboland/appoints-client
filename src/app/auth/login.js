angular.module('appoints.login', [
  'appoints.config',
  'appoints.usersession',
  'ngRoute'
])

.config(function config($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'auth/login.html',
      controller: 'LoginCtrl',
      title: 'Login'
    });
})

.controller('LoginCtrl', function LoginController($scope, $window, config, usersession) {
  var popup;

  $scope.loginFacebook = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/facebook');
  };

  $scope.loginGoogle = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/google');
  };

  function authWindow(authUrl) {
    popup = $window.open(authUrl, 'authenticate', 'width=600,height=450');
    return false;
  }

  $window.addEventListener('message', function (event) {
    if (event.origin !== config.defaultApiEndpoint) {
      return;
    }
    usersession.login(event.data)
      .then(function () {
        popup.close();
      });
  }, false);
});