angular.module('appoints', [
  'ngRoute',
  'appoints.flash',
  'appoints.usersession',
  'appoints.authinterceptor',
  'appoints.home',
  'appoints.login',
  'appoints.appointments',
  'appoints-client-templates'
])

// allow DI for use in controllers, unit tests
.constant('_', window._)

.config(function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.controller('AppCtrl', function AppController ($scope, $location, usersession) {
  var defaultPageTitle = 'Appoints';

  $scope.pageTitle = defaultPageTitle;

  $scope.$on('$routeChangeSuccess', function (ev, currentRoute) {
    $scope.pageTitle = currentRoute.title || defaultPageTitle;
  });

  $scope.user = usersession.current;

  $scope.routeIs = function(routeName) {
    return $location.path() === routeName;
  };

  $scope.logout = function () {
    usersession.logout();
    $location.url('/');
  };

  $scope.$on('event:loggedin', function (ev, currentSession) {
    $scope.user = currentSession;
  });

  $scope.$on('event:loggedout', function (ev, currentSession) {
    $scope.user = currentSession;
  });

});