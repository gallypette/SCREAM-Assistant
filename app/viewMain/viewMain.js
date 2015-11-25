'use strict';

angular.module('myApp.viewMain', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewMain', {
				templateUrl: 'viewMain/viewMain.html',
				controller: 'ViewMainCtrl'
			});
		}])

	.controller('ViewMainCtrl', function ($scope) {
		// Export localStorage through a blob
		var content = JSON.stringify(localStorage);
		var blob = new Blob([content], {type: 'text/plain'});
		$scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
	});