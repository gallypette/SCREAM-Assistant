'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
	'ngRoute',
	'd3',
	'underscore',
	'schemas',
	'ngReally',
	'LocalStorageModule',
	'xsltProcessor',
	'myApp.viewAttackAnalysis',
	'myApp.viewMain',
	'myApp.viewTMAnalysis',
	'myApp.view1',
	'myApp.view2',
	'myApp.view3',
	'myApp.view4',
	'myApp.view5',
	'myApp.emTree',
	'myApp.rootLs'
])
	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.otherwise({redirectTo: '/viewMain'});
		}])

	.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
			localStorageServiceProvider.setPrefix('scream');
		}])

	.constant('mainMenu', [
		{url: '#/view1', text: 'view1'},
		{url: '#/view2', text: 'view2'}
	])

	.constant('analysisMenu', [
		{url: '#/view1', text: 'view1'},
		{url: '#/view2', text: 'view2'},
		{url: '#/view3', text: 'view3'},
		{url: '#/view4', text: 'view4'},
		{url: '#/view5', text: 'view5'}
	])

	.constant('TMMenu', [
		{url: '#/TMview1', text: 'TMview1'},
		{url: '#/TMview2', text: 'TMview2'}
	])
