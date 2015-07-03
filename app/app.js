'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'd3',
    'schemas',
    'LocalStorageModule',
    'myApp.view1',
    'myApp.view2',
    'myApp.view3',
    'myApp.view4',
    'myApp.emTree',
    'myApp.analysis'
])
        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.otherwise({redirectTo: '/view1'});
            }])

        .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
                localStorageServiceProvider.setPrefix('scream');
            }]);
