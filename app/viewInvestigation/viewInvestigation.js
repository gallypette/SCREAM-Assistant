'use strict';

angular.module('myApp.viewInvestigation', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewInvestigation', {
				templateUrl: 'viewInvestigation/viewInvestigation.html',
				controller: 'viewInvestigationCtrl'
			});
		}])

	.controller('viewInvestigationCtrl', function ($scope,investigationMenu) {

		$scope.secondLine = true;
		$scope.itemsMenu = investigationMenu;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewInvestigation" ? 'active' : 'brand';
		}

	});