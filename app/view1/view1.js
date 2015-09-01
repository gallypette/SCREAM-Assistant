'use strict';
angular.module('myApp.view1', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl: 'view1/view1.html',
				controller: 'View1Ctrl',
				resolve: {
					stcs: function ($route, Stc) {
						return Stc.findAll();
					}
				}
			});
		}])

	.controller('View1Ctrl', function ($route, $scope, Root, Current, _, analysisMenu, store, Stc) {

		// We copy the list of stcs into the view
		$scope.stcs = $route.current.locals.stcs;
		console.log($scope.stcs.length + ' items were loaded from the store.');

		// Setting the menu
		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view1" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}
		$scope.unique = true;
		$scope.currentIsSet = false;
		var refresh = function () {
			$scope.current = Current.getCurrent();
			if (($scope.current == '') || ($scope.current == null)) {
				$scope.currentIsSet = false;
			} else {
				$scope.currentIsSet = true;
			}
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
			Stc.destroy(stc.id);
		}

		$scope.selectAnalysis = function (analysis) {
			Current.selectCurrent(analysis);
			refresh();
		}

		$scope.storeCurrent = function (analysis) {
			Current.storeCurrent(analysis);
			refresh();
		}

		Stc.bindAll({}, $scope, 'stcs');
	});