'use strict';

angular.module('myApp.view5', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view5', {
				templateUrl: 'view5/view5.html',
				controller: 'View5Ctrl'
			});
		}])

	.controller('View5Ctrl', function ($scope, analysisMenu) {

		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view5" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

	});
