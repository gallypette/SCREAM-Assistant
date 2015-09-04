'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
	'ui.bootstrap',
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

	.constant('descriptionTypes', [
		{
			name: 'STEAL',
			desc: 'Describe the attack in term of message flowing between the attacker and the victim.',
			fields: [
				{
					fieldName: 'Source',
					desc: 'The principal that the user believes he is interacting with',
					type: 'text'
				},
				{
					fieldName: 'Declared Identity',
					desc: 'Is the attacker stating that he is the source',
					type: 'boolean'
				},
				{
					fieldName: 'Imitated Identity',
					desc: 'Is the attacker using the logo or the visual identity of the source',
					type: 'boolean'
				},
				{
					fieldName: 'Command',
					desc: 'Describe the command that the user is asked to execute',
					type: 'text'
				},
				{
					fieldName: 'Action',
					desc: 'Describe the action, if it is a genuine action or if the action is loaded',
					type: 'boolean'
				},
				{
					fieldName: 'Sequence',
					desc: 'Where is the message located in the sequence of messages',
					type: 'list',
					value: ['initiation', 'continuation', 'reply to user request']
				},
				{
					fieldName: 'Medium',
					desc: 'On which medium is the message issued',
					type: 'list',
					value: ['web', 'phone', 'paper']
				},
			]
		},
		{
			name: 'empty',
			desc: 'empty description schema',
			fields: []
		}
	])

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
//					analysis: {
//						localField: 'analysis',
//						foreignKey: 'atckId'
//					},
					description:
						{
							localField: 'description',
							foreignKey: 'atckId'
						}
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
					atck: {
						localField: 'atck',
						localKey: 'atckId'
					}
				}
			}
		});
	})

	.factory('Description', function (store) {
		return store.defineResource({
			name: 'description',
			relations: {
				belongsTo: {
					atck: {
						localField: 'atck',
						localKey: 'atckId'
					}
				}
			}
		});
	})