angular.module('appoints', [
  'ngRoute',
  'appoints.home',
  'appoints-client-templates'
])

.controller('AppCtrl', function AppController ($scope) {
  var defaultPageTitle = 'Appoints';

  $scope.pageTitle = defaultPageTitle;

  $scope.$on('$routeChangeSuccess', function(ev, currentRoute) {
    $scope.pageTitle = currentRoute.title || defaultPageTitle;
  });

});