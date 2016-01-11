'use strict';

angular.module('myApp.viewSTTM', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewSTTM', {
				templateUrl: 'viewSTTM/viewSTTM.html',
				controller: 'viewSTTMCtrl'
			});
		}])

	.controller('viewSTTMCtrl', function ($scope,screamMenu) {

		$scope.secondLine = true;
		$scope.itemsMenu = screamMenu;
		$scope.isActive = function (url) {
			return '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTTM" ? 'active' : 'brand';
		}

	});