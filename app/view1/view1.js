'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.rootLs', 'underscore', 'ngReally'])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl: 'view1/view1.html',
				controller: 'View1Ctrl'
			});
		}])

	.controller('View1Ctrl', function ($scope, Root, Current, _) {

		$scope.analyses = Root.getAnalyses();
		$scope.unique = true;

		$scope.$watch('analyses', function (newValue, oldValue) {
			// Add
			if (newValue.length > oldValue.length) {
				(_.isEmpty($scope.analysis)) ? "" : Root.addAnalysis($scope.analysis);
				$scope.analysis = ''
			}
		}, true);

		$scope.addAnalysis = function () {
			if (_.isUndefined(_.find($scope.analyses, function (item) {
				return ($scope.analysis.name == item.name)
			}))) {
				$scope.unique = true;
				$scope.analysis.date = new Date();
				$scope.analyses.push($scope.analysis);
			} else {
				$scope.unique = false;
				console.log($scope.unique);
			}
		}

		$scope.deleteAnalysis = function (analysis) {
//                console.log("deleting "+analysis.name);
			$scope.analyses = _.reject($scope.analyses, function (item) {
				return ((item.name == analysis.name) && (item.desc == analysis.desc))
			});
			Root.deleteAnalysis(analysis);
		}

		$scope.selectAnalysis = function (analysis) {
//                console.log("selecting "+analysis.name);
			Current.selectCurrent(analysis);
		}
	});