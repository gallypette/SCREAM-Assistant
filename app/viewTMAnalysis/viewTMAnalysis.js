'use strict';

angular.module('myApp.viewTMAnalysis', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewTMAnalysis', {
				templateUrl: 'viewTMAnalysis/viewTMAnalysis.html',
				controller: 'ViewTMAnalysisCtrl'
			});
		}])

	.controller('ViewTMAnalysisCtrl', function ($scope,TMMenu) {

		$scope.itemsMenu = TMMenu;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewTMAnalysis" ? 'active' : 'brand';
		}

	});