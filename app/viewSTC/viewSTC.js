'use strict';

angular.module('myApp.viewSTC', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewSTC', {
				templateUrl: 'viewSTC/viewSTC.html',
				controller: 'viewSTCCtrl'
			});
		}])

	.controller('viewSTCCtrl', function ($scope, stcMenu) {

		$scope.secondLine = true;
		$scope.itemsMenu = stcMenu;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}

	});