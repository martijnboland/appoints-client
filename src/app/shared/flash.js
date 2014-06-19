angular.module('appoints.flash', []) 
.factory('flash', function ($rootScope) {
  var flashes = [];

  function add (message, level) {
    level = level || 'info';

    var flash = {
      message: message,
      level: level
    };
    flashes.push(flash);

    $rootScope.$broadcast('event:flash.add', flash);
  }

  function all () {
    return flashes;
  }

  function allClear () {
    var f = angular.copy(flashes);
    clear();
    return f;
  }

  function clear () {
    $rootScope.$broadcast('event:flash.clear', true);
    flashes = [];
  }

  return {
    add: add,
    all: all,
    clear: clear,
    allClear: allClear
  };
});