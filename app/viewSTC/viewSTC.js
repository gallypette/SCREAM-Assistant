'use strict';

angular.module('myApp.viewSTC', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewSTC', {
				templateUrl: 'viewSTC/viewSTC.html',
				controller: 'viewSTCCtrl'
			});
		}])

	.controller('viewSTCCtrl', function ($scope) {

		$scope.secondLine = false;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}

	});