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
					current: function ($route, Stc) {
						return Stc.findAll({current: 'true'}, {cacheResponse: false});
					}
				}
			});
		}])

	.controller('ViewSTCsCtrl', function ($route, $scope, _, stcMenu, store, Stc) {

		// We copy the list of stcs into the view
		$scope.stcs = $route.current.locals.stcs;
		$scope.current = $route.current.locals.current[0];
		console.log($scope.stcs.length + ' items were loaded from the store.');

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
			if (!_.isUndefined($scope.current) && $scope.current.id === stc.id)
				$scope.current = '';
			Stc.destroy(stc.id);
		}

		$scope.selectStc = function (stc) {
			// We set all other Stc.current to false
			_.each($scope.stcs, function (stc) {
				Stc.update(stc.id, {current: 'false'});
			})

			// We set the target as current
			Stc.update(stc.id, {current: 'true'});
			// We update the view
			$scope.current = Stc.get(stc.id);
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