'use strict';
angular.module('myApp.viewSystemAttacks', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the system by the use of the button
				when('/viewSystemAttacks/:id', {
					templateUrl: 'viewSystemAttacks/viewSystemAttacks.html',
					controller: 'ViewSystemAttacksCtrl',
					resolve: {
						sys: function ($route, Sys, Atck) {
							return Sys.find($route.current.params.id).then(function (sys) {
								return Sys.loadRelations(sys.id, ['Atck']);
							});
						}
					}
				}).
				// .when we land on the system via the navbar
				when('/viewSystemAttacks', {
					templateUrl: 'viewSystemAttacks/viewSystemAttacks.html',
					controller: 'ViewSystemAttacksCtrl',
					resolve: {
						sys: function ($route, $location, Sys, Atck, Analysis, Description, _) {
							return Sys.findAll({current: 'true'}, {cacheResponse: false}).then(function (syss) {
								if (_.isUndefined(syss[0])) {
									$location.path("/viewSystems/");
								} else {
									return Sys.loadRelations(syss[0].id, []);
								}
							})
						}
					}
				});
		}])

	.controller('ViewSystemAttacksCtrl', function ($q, $route, $scope, $modal, screamMenu, Atck, descriptionTypes, Description, Analysis, _, threatModel) {
		// We load data into the view
		$scope.sys = $route.current.locals.sys;

		// Then we check if previously added attacks are still 
		// Compatible with the current system's Threat Model
		threatModel.verifyCompatibility($route.current.locals.sys).then(function (incompatibleAtcks) {
//			console.log('List of incompatible')
//			console.log(incompatibleAtcks);
			if (incompatibleAtcks.length > 0) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'warningModalIncomp',
					size: 'sg',
					controller: function ($scope, $modalInstance) {
						$scope.incompatibleAtcks = incompatibleAtcks;
						// Dimiss the modal when OK is clicked.
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					}
				});
				// Incompatible attacks are now unlinked
				var deferred = [];
				_.each(incompatibleAtcks, function (atck) {
					deferred.push(Atck.update(atck.id, {sysId: "undefined"}), {bypassCache: true});
				});
				$q.all(deferred).then(function (values) {
					$scope.sys.atcks = _.difference($scope.sys.atcks, incompatibleAtcks);
				});
			}
		});

		$scope.secondLine = true;
		$scope.itemsMenu = screamMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSystemAttacks" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTTM" ? 'active' : 'brand';
		}

	});
