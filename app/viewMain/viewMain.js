'use strict';

angular.module('myApp.viewMain', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewMain', {
				templateUrl: 'viewMain/viewMain.html',
				controller: 'ViewMainCtrl'
			});
		}])

	.controller('ViewMainCtrl', function ($scope, mainMenu) {

			$scope.itemsMenu = mainMenu;

		});