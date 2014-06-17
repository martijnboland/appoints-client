angular.module('appoints.home', [
  'ngRoute'
])

.config(function config($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl',
      title: 'Home'
    });
})

.controller('HomeCtrl', function HomeController($scope) {
  $scope.test = '';
});