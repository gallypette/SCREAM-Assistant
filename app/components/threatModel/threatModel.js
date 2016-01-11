'use strict';
// Holds function related to error modes and emtrees 
angular.module('myApp.threatModel', [])
	.factory('threatModel', ['_', function (_) {
			// Private methods
			
			// Public methods
			var obj = {};

			// Example function
			obj.compare = function (d1, d2, mode) {
				var result = true;
				console.log(d1);
				console.log(d2);

				return result == true;

			};
			
			return obj;
		}]);