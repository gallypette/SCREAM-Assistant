'use strict';

angular.module('myApp.attackDescription', [])
	.directive('attackDescription', ['descriptionTypes',function (descriptionTypes) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'components/attackDescription/attackDescription.html',
			// We bring atck from the upper scope
			scope: {
				atck: '='
			},
			// link is needed to link injected descriptionTypes into the directive
			link: function(scope) {
				scope.descriptionTypes = descriptionTypes;
			}
		};
	}]);

