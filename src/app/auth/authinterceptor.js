angular.module('appoints.authinterceptor', [
  'appoints.usersession'
])

.factory('authInterceptor', function ($rootScope, $q, $window, $location, $log, $injector) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.getItem('access_token');
      }
      return config;
    },
    response: function (response){
      if (response.status === 401) {
        $log.warn("Response 401");
      }
      return response || $q.when(response);
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        var usersession = $injector.get('usersession'); // usersession via injector because of circular dependencies with $http
        $log.info("Response Error 401", rejection);
        usersession.logout();
        var returnTo = $location.path();
        $location.path('/login').search('returnTo', returnTo);
      }
      return $q.reject(rejection);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});