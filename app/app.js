'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
	'js-data',
	'ngRoute',
	'd3',
	'underscore',
	'schemas',
	'ngReally',
	'LocalStorageModule',
	'xsltProcessor',
	'myApp.navBar',
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

	.constant('analysisMenu', [
		{url: '#/view1', text: 'Manage ST Capabilities'},
		{url: '#/view5', text: 'Manage Attacks'},
		{url: '#/view3', text: 'SCREAM Analysis'},
		{url: '#/view4', text: 'Analysis Summary'},
		{url: '#/view2', text: 'STC Summary'}
	])

	.constant('TMMenu', [
		{url: '#/TMview1', text: 'TMview1'},
		{url: '#/TMview2', text: 'TMview2'}
	])

	.run(function (DS) {
		var adapter = new DSLocalStorageAdapter();
		var store = new JSData.DS();
		store.registerAdapter('localstorage', adapter, {default: true});

		// We define our model here
		// A Socio-Technical Capability has many Attack Modes
		var Stc = store.defineResource({
			name: 'stc',
			relations: {
				hasMany: {
					am: [
						{
							localField: 'ams',
							foreignKey: 'stcId'
						}
					]
				}
			}
		});

		// An Attack Mode has one Analysis
		var Am = store.defineResource({
			name: 'am',
			relations: {
				hasOne: {
					analysis: [
						{
							localField: 'analysis',
							foreignKey: 'amId'
						}
					]
				},
				belongsTo: {
					stc: {
						localField: 'stc',
						localKey: 'stcId'
					}
				}
			}
		});

		// An Analysis
		var Analysis = store.defineResource({
			name: 'analysis',
			relations: {
				belongsTo: {
					stc: {
						localField: 'am',
						localKey: 'amId'
					}
				}
			}
		});
	})