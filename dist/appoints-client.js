(function(module) {
try {
  module = angular.module('appoints-client-templates');
} catch (e) {
  module = angular.module('appoints-client-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('home/home.html',
    '<h2>Appointment scheduler app version {{version}}</h2>');
}]);
})();

(function(module) {
try {
  module = angular.module('appoints-client-templates');
} catch (e) {
  module = angular.module('appoints-client-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('auth/login.html',
    '<h2>Login</h2><p>Appoints doesn\'t store user credentials such as usernames and passwords. It\'s required to use one of the providers below.</p><p><a href="" ng-click="loginFacebook()">Login with Facebook</a><br><a href="" ng-click="loginGoogle()">Login with Google</a></p>');
}]);
})();

angular.module("appoints.config", [])

.constant("config", {
	"version": "0.1.0",
	"defaultApiEndpoint": "http://localhost:3000"
})

;
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
angular.module('appoints.usersession', [
  'appoints.flash',
  'appoints.config'
])

.factory('usersession', function ($rootScope, $http, $window, config, flash) {

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
    return $http( { method: 'GET', url: config.defaultApiEndpoint + '/me' } )
      .then(function (res) {
        currentSession.isAuthenticated = true;
        currentSession.userId = res.data.userId;
        currentSession.displayName = res.data.displayName;
        currentSession.roles = res.data.roles;
        $rootScope.$broadcast('event:loggedin', currentSession);
      }, function (err) {
        flash.add(err.message, 'error');
      });
  }

  function logout() {
    $window.localStorage.removeItem('access_token');
    currentSession = new Session();
    $rootScope.$broadcast('event:loggedout', currentSession);
  }

  return {
    current: current,
    login: login,
    logout: logout
  };
});
angular.module('appoints.home', [
  'appoints.config',
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

.controller('HomeCtrl', function HomeController($scope, config) {
  $scope.version = config.version;
});
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
        $location.path('/login').search('returnTo', $location.path());
      }
      return $q.reject(rejection);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
angular.module('appoints.login', [
  'appoints.config',
  'appoints.usersession',
  'ngRoute'
])

.config(function config($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'auth/login.html',
      controller: 'LoginCtrl',
      title: 'Login'
    });
})

.run(function ($window, $rootScope, $location, config, usersession) {
  $window.addEventListener('message', function (event) {
    if (event.origin !== config.defaultApiEndpoint) {
      return;
    }
    usersession.login(event.data)
      .then(function () {
        if ($rootScope.loginPopup) {
          $rootScope.loginPopup.close();
          delete $rootScope.loginPopup;
        }
        $location.url('/');
      });
  }, false);
})

.controller('LoginCtrl', function LoginController($scope, $rootScope, $window, config) {

  $scope.loginFacebook = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/facebook');
  };

  $scope.loginGoogle = function () {
    return authWindow(config.defaultApiEndpoint + '/auth/google');
  };

  function authWindow(authUrl) {
    $rootScope.loginPopup = $window.open(authUrl, 'authenticate', 'width=600,height=450');
    return false;
  }

});
angular.module('appoints', [
  'ngRoute',
  'appoints.flash',
  'appoints.usersession',
  'appoints.authinterceptor',
  'appoints.home',
  'appoints.login',
  'appoints-client-templates'
])

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

  $scope.user = usersession.current();

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