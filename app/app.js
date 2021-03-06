'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
	'cb.x2js',
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
	'myApp.attackDescription',
	'myApp.attackTextualDescription',
	'myApp.viewMain',
	'myApp.viewSTC',
	'myApp.viewInvestigation',
	'myApp.viewSTTM',
	'myApp.viewAttacks',
	'myApp.viewRCA',
	'myApp.viewResults',
	'myApp.viewSystems',
	'myApp.viewSystemAttacks',
	'myApp.viewSystemResults',
	'myApp.viewSTCs',
	'myApp.viewSTCAMs',
	'myApp.viewSTCAttacks',
	'myApp.emTree',
	'myApp.errorModes',
	'myApp.threatModel',
	'myApp.attackManager'
])
	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.otherwise({redirectTo: '/viewMain'});
		}])

	.constant('investigationMenu', [
		{url: '#/viewAttacks', text: 'Manage Attacks'},
		{url: '#/viewRCA', text: 'Perform the RCA of an attack'},
		{url: '#/viewResults', text: 'View Results'}
	])

	.constant('stcMenu', [
		{url: '#/viewSTCs', text: 'Manage STCs'},
		{url: '#/viewSTCAttacks', text: 'Manage STC\'s attacks'},
		{url: '#/viewSTCAMs', text: 'List of STC\'s Attack Modes'}
	])

	.constant('screamMenu', [
		{url: '#/viewSystems', text: 'Manage Systems'},
		{url: '#/viewSystemAttacks', text: 'Manage System\'s Attacks'},
		{url: '#/viewSystemResults', text: 'View SCREAM Analysis Results'}
	])

	.constant('screamFlavors', [
//		{name: 'Cdcatalog test', file: "cdcatalog.xsl"},
		{name: 'Basic CREAM tables', file: null}
	])

	.config(function (DSProvider, DSHttpAdapterProvider) {
		angular.extend(DSProvider.defaults);
		angular.extend(DSHttpAdapterProvider.defaults);
	})

	.constant('descriptionTypes', [
		{
			name: 'STEAL',
			desc: 'Description in terms of properties shared by the messages flowing between the attacker and the victim.',
			fields: [
				{
					fieldName: 'Effect',
					desc: 'The effect on the system',
					type: 'text',
					pr: 'false'
				},
				{
					fieldName: 'Source',
					desc: 'The principal that the user believes he is interacting with',
					type: 'text',
					pr: 'true'
				},
				{
					fieldName: 'Declared Identity',
					desc: 'Is the attacker stating that he is the source',
					type: 'boolean',
					pr: 'true'
				},
				{
					fieldName: 'Imitated Identity',
					desc: 'Is the attacker using the logo or the visual identity of the source',
					type: 'boolean',
					pr: 'true'
				},
				{
					fieldName: 'Command',
					desc: 'Describe the command that the user is asked to execute',
					type: 'text',
					pr: 'true'
				},
				{
					fieldName: 'Action',
					desc: "Is the action a genuine action spoofed for the attacker's benefit?",
					type: 'boolean',
					pr: 'true'
				},
				{
					fieldName: 'Sequence',
					desc: 'Where is the message located in the sequence of messages',
					type: 'list',
					value: ['initiation', 'continuation', 'reply to user request'],
					pr: 'true'
				},
				{
					fieldName: 'Medium',
					desc: 'On which medium is the message issued',
					type: 'list',
					value: ['web', 'phone', 'smartphone', 'paper', 'os', 'wifi'],
					pr: 'true'
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
				console.log('Breaking links from relatives to ' + data.id + '.');
				return resource.loadRelations(data.id, ['atcks']).
					then(function () {
						if (_.isUndefined(data.atcks)) {
							return true;
						} else if (data.atcks.length == 0) {
							return true;
						} else {
							var defer = $q.defer();
							angular.forEach(data.atcks, function (item) {
								defer.resolve(Atck.update(item.id, {stcId: 'undefined'}));
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

	.factory('Atck', function (store, _, Description, Analysis, screamFlavors) {
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
					},
					sys: {
						localField: 'sys',
						localKey: 'sysId'
					}
				}
			},
			// Once we create an attack, we also create an default analysis linked to it.
			afterCreate: function (resource, data, cb) {
				// We create and link an analysis at the same time
				var analysis = {};
				analysis.date = data.date;
				analysis.flavor = screamFlavors[0];
				analysis.atckId = data.id;
				Analysis.create(analysis).then(function () {
					return cb(null, data);
				});
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

	.factory('Sys', function (store, _, Description, Analysis, screamFlavors) {
		return store.defineResource({
			name: 'sys',
			relations: {
				hasOne: {
					description: {
						localField: 'description',
						foreignKey: 'sysId'
					}
				},
				hasMany: {
					atck:
						{
							localField: 'atcks',
							foreignKey: 'sysId'
						}
				}
			},
			// Before destroying the system , we take care of cleaning up linked description
			beforeDestroy: function (resource, data, cb) {
				console.log('Slaying System ' + data.id + ' and relatives.');
				return resource.loadRelations(data.id, ['description']).
					then(function () {
						if (_.isUndefined(data.description)) {
							return true;
						} else {
							console.log('Deletion of description: ' + data.description.id);
							return Description.destroy(data.description.id);
						}
					}).
					then(function () {
						return cb(null, data);
					});
			}
		});
	})

	.factory('Analysis', function ($q, store, ErrorMode, _) {
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
				console.log('Slaying Analysis ' + data.id + ' and relatives.');
				return resource.loadRelations(data.id, ['em']).
					then(function () {
						if (_.isUndefined(data.ems)) {
							return true;
						} else if (data.ems.length == 0) {
							return true;
						} else {
							var defer = $q.defer();
							angular.forEach(data.ems, function (item) {
								defer.resolve(ErrorMode.destroy(item.id));
							});
							return defer;
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
			},
			// Before creating an Error Mode, we alter the data block
			// to add a data object that is the root element of a tree
			beforeCreate: function (resource, data, cb) {
				data.data = {
					"category": data.category,
					"em": data.em,
					"go": "false",
					"stop": "false",
					"icon": "icons/clanbomber.png",
					"children": []
				};

				return cb(null, data);
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
					},
					sys: {
						localField: 'sys',
						localKey: 'sysId'
					}
				}
			}
		});
	})

	// To make the export blob downloadable
	.config(['$compileProvider',
		function ($compileProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
		}])