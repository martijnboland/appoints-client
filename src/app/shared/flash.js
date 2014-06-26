angular.module('appoints.flash', []) 
.factory('flash', function ($rootScope, $timeout) {
  var flashes = [];

  function add (message, level, details) {
    level = level || 'info';

    var flash = {
      message: message,
      level: level,
      details: details
    };
    flashes.push(flash);
    $timeout(function () {
      remove(flash);
    }, 5000);
    $rootScope.$broadcast('event:flash.add', flash);
  }

  function addError (err) {
    if (err.message) {
      add(err.message, 'error', err);
    }
    else {
      add(err, 'error');
    }
  }

  function all () {
    return flashes;
  }

  function remove (flashMessage) {
    var index = flashes.indexOf(flashMessage);
    flashes.splice(index, 1);
    $rootScope.$broadcast('event:flash.remove', flashMessage);
  }

  function clear () {
    $rootScope.$broadcast('event:flash.clear', true);
    flashes = [];
  }

  return {
    add: add,
    addError: addError,
    all: all,
    remove: remove,
    clear: clear
  };
})

.controller('FlashCtrl', function ($scope, flash) {
  $scope.flashMessages = [];

  $scope.getMessageClass = function(level) {
    if (level === 'error') {
      level = 'danger';
    }
    return 'alert alert-' + level;
  };

  $scope.dismiss = function (flashMessage) {
    flash.remove(flashMessage);
  };

  $scope.$on('event:flash.add', function() {
    $scope.flashMessages = flash.all();
    $scope.$apply();
  });

  $scope.$on('event:flash.remove', function() {
    $scope.flashMessages = flash.all();
    $scope.$apply();
  });

  $scope.$on('event:flash.clear', function() {
    $scope.flashMessages = [];
    $scope.$apply();
  });
})

.directive('apHideFlash', function(flash) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(e){
        // Clear flash messages when the user clicks anywhere in the element where this directive is applied to.
        var target = angular.element(e.target);
        if (! target.parents().hasClass('flashcontainer')) {
          flash.clear();
        }
      });
    }
  };
});