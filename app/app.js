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

	.factory('Stc', function ($q, store, Atck) {
		return store.defineResource({
			name: 'stc',
			relations: {
				hasMany: {
					atck:
						{
							localField: 'atcks',
							foreignKey: 'stcId'
						}
				}
			},
			beforeDestroy: function (resource, data, cb, DSUtils) {
				console.log('Slaying Stc' + data.id + ' and relatives.');
				return resource.loadRelations(data.id, ['atcks']).
					then(function () {
						if (_.isUndefined(data.atcks)) {
							return true;
						} else {
							// The following code should work, but no luck :'(
//							Atck.destroyAll({
//								stcId: data.id
//							});

							// Instead this ugly piece of code does:
							var defer = $q.defer();
							angular.forEach(data.atcks, function (item) {
								defer.resolve(Atck.destroy(item.id));
							});
							return defer.promise;
						}
					}).
					then(function () {
						return cb(null, data);
					});
			}
		});
	})

	.factory('Atck', function (store, _, Description, Analysis) {
		return store.defineResource({
			name: 'atck',
			relations: {
				hasOne: {
					analysis: {
						localField: 'analysis',
						foreignKey: 'atckId'
					},
					description: {
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
			},
			// Before destroying the attack , we take care of cleaning up children
			beforeDestroy: function (resource, data, cb) {
				console.log('Slaying Atck ' + data.id + ' and relatives.');
				return resource.loadRelations(data.id, ['description', 'analysis']).
					then(function () {
						if (_.isUndefined(data.description)) {
							return true;
						} else {
							console.log('Deletion of description: ' + data.description.id);
							return Description.destroy(data.description.id);
						}
					}).
					then(function () {

						if (_.isUndefined(data.analysis)) {
							return true;
						} else {
							console.log('Deletion of analysis: ' + data.analysis.id);
							return Analysis.destroy(data.analysis.id);
						}
					}).
					then(function () {
						return cb(null, data);
					});
			}
		});
	})

	.factory('Analysis', function (store, ErrorMode) {
		return store.defineResource({
			name: 'analysis',
			relations: {
				hasMany: {
					em:
						{
							localField: 'ems',
							foreignKey: 'analysisId'
						}
				},
				belongsTo: {
					atck: {
						localField: 'atck',
						localKey: 'atckId'
					}
				}
			},
			// Before destroying the analysis , we take care of destroying the children
			beforeDestroy: function (resource, data, cb) {
				console.log('Slaying Analysis' + data.id + ' and relatives.');
				return resource.loadRelations(data.id, ['em']).
					then(function () {
						if (_.isUndefined(data.ems)) {
							return true;
						} else {
							var defer = $q.defer();
							angular.forEach(data.ems, function (item) {
								defer.resolve(ErrorMode.destroy(item.id));
							});
							return defer.promise;
						}
					}).
					then(function () {
						return cb(null, data);
					});
			}
		});
	})

	.factory('ErrorMode', function (store) {
		return store.defineResource({
			name: 'em',
			relations: {
				belongsTo: {
					analysis: {
						localField: 'analysis',
						localKey: 'analysisId'
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