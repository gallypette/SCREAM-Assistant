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
	'myApp.emTree'
])
	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.otherwise({redirectTo: '/viewMain'});
		}])

	.constant('analysisMenu', [
		{url: '#/view1', text: 'Manage ST Capabilities'},
		{url: '#/view5', text: 'Manage Attacks'},
		{url: '#/view3', text: 'SCREAM Analysis'},
		{url: '#/view4', text: 'Analysis Summary'},
		{url: '#/view2', text: 'STC Attack Modes'}
	])

	.constant('TMMenu', [
		{url: '#/TMview1', text: 'TMview1'},
		{url: '#/TMview2', text: 'TMview2'}
	])

	.config(function (DSProvider, DSHttpAdapterProvider) {
		angular.extend(DSProvider.defaults);
		angular.extend(DSHttpAdapterProvider.defaults);
	})

	.factory('store', function () {
		var store = new JSData.DS();
		store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true});
		return store;
	})

	.factory('Stc', function (store) {
		return store.defineResource({
			name: 'stc', relations: {
				hasMany: {
					atck: [
						{
							localField: 'atcks',
							foreignKey: 'stcId'
						}
					]
				}
			}
		});
	})

	.factory('Atck', function (store) {
		return store.defineResource({
			name: 'atck',
			relations: {
				hasOne: {
					analysis: [
						{
							localField: 'analysis',
							foreignKey: 'atckId'
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
	})

	.factory('Analysis', function (store) {
		return store.defineResource({
			name: 'analysis',
			relations: {
				belongsTo: {
					stc: {
						localField: 'atck',
						localKey: 'atckId'
					}
				}
			}
		});
	})