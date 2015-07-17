'use strict';

// The emTree directive prints the tree corresponding to an error mode 
angular.module('myApp.navBar', [])
	.directive('topBar', function () {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'components/navBar/topBar.html'
		};
	});

