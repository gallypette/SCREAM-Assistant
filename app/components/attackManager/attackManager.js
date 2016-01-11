'use strict';

angular.module('myApp.attackManager', [])
	.directive('attackManager', function (_, Stc, Sys, Atck, Description, threatModel, $q, $location) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'components/attackManager/attackManager.html',
			scope: {
				displayed: '=managed',
				type: '='
			},
			link: function (scope, element) {

				function updateRepository() {
					if (scope.type == 'Stc') {
						Stc.find(scope.displayed.id).then(function (stc) {
							return Stc.loadRelations(stc.id, [], {bypassCache: true}).then(function (stc) {
								return Atck.findAll({}, {bypassCache: true}).then(function (atcks) {
									scope.repository = _.difference(atcks, stc.atcks);
								});
							});
						});
					} else if (scope.type === 'Sys') {
						Sys.find(scope.displayed.id).then(function (sys) {
							return Sys.loadRelations(sys.id, [], {bypassCache: true}).then(function (sys) {
								return Atck.findAll({}, {bypassCache: true}).then(function (atcks) {
									console.log('Atck findall')
									// Here we filter the attack to get only the one compatible
									// With the system's threatModel
									var deferred = [];
									_.each(atcks, function (atck) {
										deferred.push(Atck.loadRelations(atck.id, ['description'], {bypassCache: true}));
									})
									var compatibleAtcks = [];
									$q.all(deferred).then(function (values) {
										compatibleAtcks = _.chain(values)
											.filter(function (value) {
												if (!_.isUndefined(value.description)) {
													return threatModel.compare(sys.description, value.description);
												}
											});
										compatibleAtcks = _(compatibleAtcks).value();
										scope.repository = _.difference(compatibleAtcks, sys.atcks);
									});
								});
							});
						});
					}
				}

				scope.addAttack = function (atck) {
					if (scope.type == 'Stc') {
						return Atck.update(atck.id, {stcId: scope.displayed.id}).then(function () {
							// Update the view from the storage
							updateRepository();
						});
					} else if (scope.type === 'Sys') {
						return Atck.update(atck.id, {sysId: scope.displayed.id}).then(function (atck) {
							console.log(atck)
							// Update the view from the storage
							updateRepository();
						});
					}
				};

				scope.removeAttack = function (atck) {
					if (scope.type == 'Stc') {
						return Atck.update(atck.id, {stcId: "undefined"}).then(function () {
							updateRepository();
						});
					} else if (scope.type === 'Sys') {
						return Atck.update(atck.id, {sysId: "undefined"}).then(function () {
							updateRepository();
						});
					}
				};

				scope.compileAM = function () {
					if (scope.type == 'Stc') {
						$location.path("/viewSTCAMs/" + scope.displayed.id);
					} else if (scope.type === 'Sys') {
						$location.path("/viewSystemResults/" + scope.displayed.id);
					}
				};

				updateRepository();
			}
		};
	});

