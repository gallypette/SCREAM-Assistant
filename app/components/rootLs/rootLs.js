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
			var curr = localStorageService.get('current') || [];
			// First, we call Root.getAnalysis to see if we need to update or create
			if (_.isUndefined(Root.getAnalysis(curr.name))) {
				addAnalysis(curr);
			} else {// Update
				console.log('update !');
				Root.deleteAnalysis(curr);
				Root.addAnalysis(curr)
			}
		}

		return{
			"selectCurrent": function (analysis) {
				saveCurrent();
				setCurrent(analysis);
			}
		}
	})
	;