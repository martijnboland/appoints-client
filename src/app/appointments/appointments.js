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

.controller('AppointmentsCtrl', function AppointmentsController($scope, appointsapi, flash, moment) {

  function load() {
    return appointsapi.apiRoot.then(function (rootResource) {
      return rootResource.$get('appointments').then(function (appointmentsResource) { 
        return appointmentsResource.$get('appointments').then(function(appointments) {
          $scope.appointments = appointments;
        });
      }, function (err) {
        flash.addError(err.data);
      });
    });
  }

  function initAppointment() {
    $scope.newAppointment = {
      title: '',
      dateAndTime: moment().startOf('day').add('days', 1).add('hours', 9).toDate(),
      duration: 30,
      remarks: ''
    };
  }

  $scope.getEndTime = function (appointment) {
    return moment(appointment.dateAndTime).add('minutes', appointment.duration).format('H:mm');
  };

  $scope.createAppointment = function () {
   return appointsapi.apiRoot.then(function (rootResource) {
    // Sync endDateAndTime first
    $scope.newAppointment.endDateAndTime = moment($scope.newAppointment.dateAndTime).add('minutes', $scope.newAppointment.duration);
      return rootResource.$post('appointments', null, $scope.newAppointment).then(function () {
        flash.add('Appointment created successfully', 'info');
        initAppointment();
      }, function (err) {
        flash.addError(err.data);
      });
   }).then(load);
  };

  initAppointment();
  load();
  
});