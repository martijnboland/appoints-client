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

.controller('AppointmentsCtrl', function AppointmentsController($scope, $window, _, appointsapi, flash, moment) {

  function load() {
    return appointsapi.apiRoot.then(function (rootResource) {
      return rootResource.$get('appointments').then(function (appointmentsResource) { 
        return appointmentsResource.$get('appointment').then(function(appointments) { // get embedded appointments
          $scope.upcomingAppointments = _.filter(appointments, function (appointment){
            return moment(appointment.dateAndTime) > moment();
          });
          $scope.pastAppointments = _.filter(appointments, function (appointment){
            return moment(appointment.dateAndTime) <= moment();
          });
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
    $scope.editAppointment = null;
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
    })
    .then(load);
  };

  $scope.removeAppointment = function (appointmentResource) {
    if ($window.confirm('Are you sure?')) {
      return appointmentResource.$del('self').then(function (result) {
        flash.add(result.message);
      }, function (err) {
        flash.addError(err.data);
      }).then(load);
    }
  };

  $scope.setAppointmentForEdit = function (appointment) {
    $scope.editAppointment = angular.copy(appointment);
  };

  $scope.reschedule = function (newDateTime) {
    if ($scope.editAppointment) {
      $scope.editAppointment.dateAndTime = newDateTime;
      $scope.editAppointment.endDateAndTime = moment($scope.editAppointment.dateAndTime).add('minutes', $scope.editAppointment.duration).toDate();
      var appointmentResource = _($scope.upcomingAppointments).find({ id: $scope.editAppointment.id });
      return appointmentResource.$patch('self', null, { dateAndTime: $scope.editAppointment.dateAndTime, endDateAndTime: $scope.editAppointment.endDateAndTime }).then(function () {
        flash.add('Appointment is rescheduled');
      }, function (err) {
        flash.addError(err.data);
      }).then(load);
    }
  };

  initAppointment();
  load();
  
});