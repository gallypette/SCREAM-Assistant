'use strict';

angular.module('myApp.view4', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view4', {
				templateUrl: 'view4/view4.html',
				controller: 'View4Ctrl'
			});
		}])

	.controller('View4Ctrl', function ($scope, analysisMenu) {

		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view4" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

	});
