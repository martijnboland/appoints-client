(function (module) {
  try {
    module = angular.module('appoints-client-templates');
  } catch (e) {
    module = angular.module('appoints-client-templates', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('auth/login.html', '<h2>Login</h2><p>Appoints doesn\'t store user credentials such as usernames and passwords. It\'s required to use one of the providers below.</p><p><a href="" ng-click="loginFacebook()">Login with Facebook</a><br><a href="" ng-click="loginGoogle()">Login with Google</a></p>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('appoints-client-templates');
  } catch (e) {
    module = angular.module('appoints-client-templates', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('home/home.html', '<h2>Appointment scheduler app version {{version}}</h2>');
    }
  ]);
}());
angular.module('appoints.usersession', []).factory('usersession', [
  '$rootScope',
  '$http',
  '$window',
  'config',
  'flash',
  function ($rootScope, $http, $window, config, flash) {
    var defaultSession = {
        userId: '',
        displayName: '',
        isAuthenticated: false,
        roles: []
      };
    function Session() {
      // always start with a default instance.
      return angular.copy(defaultSession, this);
    }
    var currentSession = new Session();
    function current() {
      return currentSession;
    }
    function login(token) {
      // Authenticate the user from the given authorization token
      $window.localStorage.setItem('access_token', token);
      return $http({
        method: 'GET',
        url: config.defaultApiEndpoint + '/me'
      }).then(function (userData) {
        currentSession.isAuthenticated = true;
        currentSession.userId = userData.userId;
        currentSession.displayName = userData.displayName;
        currentSession.roles = userData.roles;
      }, function (err) {
        flash.add(err.message, 'error');
      });
    }
    function logout() {
      $window.localStorage.removeItem('access_token');
      currentSession = new Session();
    }
    return {
      current: current,
      login: login,
      logout: logout
    };
  }
]);
angular.module('appoints.config', []).constant('config', {
  'version': '0.1.0',
  'defaultApiEndpoint': 'http://localhost:3000'
});
;
angular.module('appoints.flash', []).factory('flash', [
  '$rootScope',
  function ($rootScope) {
    var flashes = [];
    function add(message, level) {
      level = level || 'info';
      var flash = {
          message: message,
          level: level
        };
      flashes.push(flash);
      $rootScope.$broadcast('event:flash.add', flash);
    }
    function all() {
      return flashes;
    }
    function allClear() {
      var f = angular.copy(flashes);
      clear();
      return f;
    }
    function clear() {
      $rootScope.$broadcast('event:flash.clear', true);
      flashes = [];
    }
    return {
      add: add,
      all: all,
      clear: clear,
      allClear: allClear
    };
  }
]);
angular.module('appoints.login', [
  'appoints.config',
  'appoints.usersession',
  'ngRoute'
]).config([
  '$routeProvider',
  function config($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'auth/login.html',
      controller: 'LoginCtrl',
      title: 'Login'
    });
  }
]).controller('LoginCtrl', [
  '$scope',
  '$window',
  'config',
  'usersession',
  function LoginController($scope, $window, config, usersession) {
    var popup;
    $scope.loginFacebook = function () {
      return authWindow(config.defaultApiEndpoint + '/auth/facebook');
    };
    $scope.loginGoogle = function () {
      return authWindow(config.defaultApiEndpoint + '/auth/google');
    };
    function authWindow(authUrl) {
      popup = $window.open(authUrl, 'authenticate', 'width=600,height=450');
      return false;
    }
    $window.addEventListener('message', function (event) {
      if (event.origin !== config.defaultApiEndpoint) {
        return;
      }
      usersession.login(event.data).then(function () {
        popup.close();
      });
    }, false);
  }
]);
angular.module('appoints.home', [
  'appoints.config',
  'ngRoute'
]).config([
  '$routeProvider',
  function config($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl',
      title: 'Home'
    });
  }
]).controller('HomeCtrl', [
  '$scope',
  'config',
  function HomeController($scope, config) {
    $scope.version = config.version;
  }
]);
angular.module('appoints', [
  'ngRoute',
  'appoints.flash',
  'appoints.usersession',
  'appoints.home',
  'appoints.login',
  'appoints-client-templates'
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]).controller('AppCtrl', [
  '$scope',
  '$location',
  'usersession',
  function AppController($scope, $location, usersession) {
    var defaultPageTitle = 'Appoints';
    $scope.pageTitle = defaultPageTitle;
    $scope.$on('$routeChangeSuccess', function (ev, currentRoute) {
      $scope.pageTitle = currentRoute.title || defaultPageTitle;
    });
    $scope.user = usersession.current();
    $scope.routeIs = function (routeName) {
      return $location.path() === routeName;
    };
    $scope.logout = function () {
      usersession.logout(function () {
        $location.url('/');
      });
    };
    $scope.$on('event:currentSessionChanged', function (ev, currentSession) {
      $scope.user = currentSession;
    });
  }
]);