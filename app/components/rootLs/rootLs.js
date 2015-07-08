'use strict';
angular.module('myApp.rootLs', [])

	// Repository store handler
	.factory('Root', function (_, localStorageService, $filter) {

		return {
			"getAnalyses": function () {
				var anal = localStorageService.get('repository') || [];
				return anal;
			},
			"getAnalysis": function (name) {
				var anal = localStorageService.get('repository') || [];
				return $filter('filter')(anal, {name: name}, true);
			},
			"addAnalysis": function (newAnalysis) {
				var anal = localStorageService.get('repository') || [];
				anal.push(newAnalysis);
				localStorageService.set('repository', anal);
			},
			"deleteAnalysis": function (delAnalysis) {
				var anal = localStorageService.get('repository') || [];
				anal = _.reject(anal, function (item) {
					return (item.name == delAnalysis.name)
				});
				localStorageService.set('repository', anal);
			}
		}
	})

	// Current analysis store handler
	.factory('Current', function (_, localStorageService, Root) {

		// Private methods
		// Take an analysis and set it as the analysis under scrutiny
		var setCurrent = function (analysis) {
			localStorageService.set('current', analysis);
		}

		// Save the current Analysis into the repository
		var saveCurrent = function () {
			//First we check if the current Ls exists
			var curr = localStorageService.get('current');
			if (curr !== null) {
				Root.addAnalysis(curr)
			}
		}

		return{
			"selectCurrent": function (analysis) {
				// First we save the current analysis in the repository
				saveCurrent();
				// Then we pick the new one and place it in current
				setCurrent(analysis);
				// Eventually, we remove the new current from the repository
				Root.deleteAnalysis(analysis);
			},
			"getCurrent": function () {
				var curr = localStorageService.get('current');
				if (curr == null) {
					return null;
				} else {
					return curr;
				}
			}
		}
	})
	;