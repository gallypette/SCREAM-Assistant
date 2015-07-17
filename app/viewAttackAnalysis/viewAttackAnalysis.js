'use strict';

angular.module('myApp.viewAttackAnalysis', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewAttackAnalysis', {
				templateUrl: 'viewAttackAnalysis/viewAttackAnalysis.html',
				controller: 'ViewAttackAnalysisCtrl'
			});
		}])

	.controller('ViewAttackAnalysisCtrl', function ($scope, analysisMenu) {

		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

	});