'use strict';

angular.module('myApp.navBar', [])
	.directive('topBar', function () {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'components/navBar/topBar.html'
		};
	});

