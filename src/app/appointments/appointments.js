angular.module('appoints.appointments', [
  'ngRoute',
  'appoints.api'
])

.config(function config($routeProvider) {
  $routeProvider
    .when('/appointments', {
      templateUrl: 'appointments/appointments.html',
      controller: 'AppointmentsCtrl',
      title: 'Appointments'
    });
})

.controller('AppointmentsCtrl', function AppointmentsController($scope, appointsapi, flash) {
  appointsapi.apiRoot.then(function (rootResource) {
    rootResource.$get('appointments').then(function (appointments) { 
      $scope.appointments = appointments;
    }, function (err) {
      flash.addError(err);
    });
  });
});