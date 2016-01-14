'use strict';

angular.module('myApp.attackTextualDescription', [])
	.directive('attackTextualdescription', ['Atck',function (Atck) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'components/attackTextualDescription/attackTextualDescription.html',
			// We bring atck from the upper scope
			scope: {
				atck: '='
			}
		};
	}]);

