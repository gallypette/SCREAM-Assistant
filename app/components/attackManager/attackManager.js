'use strict';

angular.module('myApp.attackManager', [])
	.directive('attackManager', function (_, Stc, Atck, $q, $location) {
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
					Stc.find(scope.displayed.id).then(function (stc) {
						return Stc.loadRelations(stc.id, [], {cacheResponse: false}).then(function (stc) {
							return Atck.findAll().then(function (atcks) {
								scope.repository = _.difference(atcks, stc.atcks);
							});
						});
					});
				}

				scope.addAttack = function (atck) {
					if (scope.type == 'Stc') {
						return Atck.update(atck.id, {stcId: scope.displayed.id}).then(function () {
							// Update the view from the storage
							updateRepository();
						});
					} else if (scope.type === 'System') {

					}
				};

				scope.removeAttack = function (atck) {
					if (scope.type == 'Stc') {
						return Atck.update(atck.id, {stcId: "undefined"}).then(function () {
							updateRepository();
						});
					} else if (scope.type === 'System') {

					}
				};

				scope.compileAM = function () {
					if (scope.type == 'Stc') {
						$location.path("/viewSTCAMs/" + scope.displayed.id);
					} else if (scope.type === 'System') {

					}
				};

				if (scope.type == 'Stc') {
					updateRepository();
				} else if (scope.type === 'System') {

				}
			}
		};
	});

