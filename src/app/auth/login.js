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
        if (usersession.returnTo) {
          $location.url(usersession.returnTo);
        }
        else {
          $location.url('/');
        }
      });
  }, false);
})

.controller('LoginCtrl', function LoginController($scope, $rootScope, $window, $location, config, usersession) {

  usersession.returnTo = $location.search().returnTo;

  $scope.loginFacebook = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/facebook');
  };

  $scope.loginGoogle = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/google');
  };

  function authWindow(authUrl) {
    $rootScope.loginPopup = popupCenterWindow(authUrl, 'authenticate', 640, 500);
    return false;
  }

  function popupCenterWindow(url, title, w, h) {
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    return $window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  } 

});