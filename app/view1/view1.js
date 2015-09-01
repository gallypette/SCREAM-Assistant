'use strict';
angular.module('myApp.view1', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl: 'view1/view1.html',
				controller: 'View1Ctrl',
				resolve: {
					stcs: function ($route, Stc) {
						return Stc.findAll();
					},
					current: function ($route, Stc) {
						return Stc.findAll({current: 'true'});
					}
				}
			});
		}])

	.controller('View1Ctrl', function ($route, $scope, Root, Current, _, analysisMenu, store, Stc) {

		// We copy the list of stcs into the view
		$scope.stcs = $route.current.locals.stcs;
		$scope.current = $route.current.locals.current[0];
		console.log($scope.stcs.length + ' items were loaded from the store.');

		// Setting the menu
		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view1" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

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
			if($scope.current.id === stc.id) $scope.current = '';
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

		$scope.storeCurrent = function (analysis) {
			Current.storeCurrent(analysis);
			refresh();
		}

		Stc.bindAll({}, $scope, 'stcs');
	});