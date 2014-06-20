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

.run(function ($window, $rootScope, $location, config, usersession) {
  $window.addEventListener('message', function (event) {
    if (event.origin !== config.defaultApiEndpoint) {
      return;
    }
    usersession.login(event.data)
      .then(function () {
        if ($rootScope.loginPopup) {
          $rootScope.loginPopup.close();
          delete $rootScope.loginPopup;
        }
        $location.url('/');
      });
  }, false);
})

.controller('LoginCtrl', function LoginController($scope, $rootScope, $window, config) {

  $scope.loginFacebook = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/facebook');
  };

  $scope.loginGoogle = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/google');
  };

  function authWindow(authUrl) {
    $rootScope.loginPopup = $window.open(authUrl, 'authenticate', 'width=600,height=450');
    return false;
  }

});