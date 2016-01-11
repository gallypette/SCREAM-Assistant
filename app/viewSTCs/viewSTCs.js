'use strict';
angular.module('myApp.viewSTCs', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewSTCs', {
				templateUrl: 'viewSTCs/viewSTCs.html',
				controller: 'ViewSTCsCtrl',
				resolve: {
					stcs: function ($route, Stc) {
						return Stc.findAll();
					},
					current: function ($route, Stc, Atck) {
						return Stc.findAll({current: 'true'}, {cacheResponse: false}).then(function (stcs) {
							return Stc.loadRelations(stcs[0].id, []);
						});
					}
				}
			});
		}])

	.controller('ViewSTCsCtrl', function ($q, $location, $route, $scope, _, stcMenu, store, Stc) {

		// We copy the list of stcs into the view
		$scope.stcs = $route.current.locals.stcs;
		$scope.current = $route.current.locals.current;

		$scope.addStc = function (stc) {
			stc.date = new Date();
			return Stc.create(stc).then(function () {
				console.log(stc.name + ' injected.');
				stc.name = '';
				stc.desc = '';
				stc.id = null;
			});
		}

		$scope.deleteStc = function (stc) {
			if (!_.isUndefined($scope.current) && $scope.current.id === stc.id) {
				if (!_.isUndefined($scope.stcs[1])) {
					if ($scope.current.id == $scope.stcs[0].id) {
						console.log("destroying current number 0")
						$scope.current == $scope.stcs[1];
					Stc.update($scope.current.id, {current: 'true'}).then(function (value) {
						Stc.destroy(stc.id);
					});
					} else {
						console.log("destroying current number -- not 0")
						$scope.current == $scope.stcs[0];
					Stc.update($scope.current.id, {current: 'true'}).then(function (value) {
						Stc.destroy(stc.id);
					});
					}
				}else{
					$scope.current = 'undefined';
				}
			} else {
				console.log("destroying non current");
				Stc.destroy(stc.id);
			}
		}

		$scope.selectAction = function (stc, location) {
			// We set all other Stc.current to false
			var deferred = [];
			_.each($scope.stcs, function (allstc) {
				deferred.push(Stc.update(allstc.id, {current: 'false'}));
			})

			// We set the stc target as current
			$q.all(deferred).then(function (values) {
				Stc.update(stc.id, {current: 'true'}).then(function (value) {
					$location.path("/" + location + "/" + stc.id);
				});
			});
		}

		Stc.bindAll({}, $scope, 'stcs');

		$scope.secondLine = true;
		$scope.itemsMenu = stcMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSTCs" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}
	});