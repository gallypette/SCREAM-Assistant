'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.rootLs', 'underscore', 'ngReally'])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl: 'view1/view1.html',
				controller: 'View1Ctrl'
			});
		}])

	.controller('View1Ctrl', function ($scope, Root, Current, _) {

		$scope.unique = true;

		var refresh = function () {
			$scope.analyses = Root.getAnalyses();
			$scope.current = Current.getCurrent();
		}

		$scope.addAnalysis = function () {
			if (_.isUndefined(_.find($scope.analyses, function (item) {
				return ($scope.analysis.name == item.name)
			}))) {
				$scope.unique = true;
				$scope.analysis.date = new Date();
				(_.isEmpty($scope.analysis)) ? "" : Root.addAnalysis($scope.analysis);
				$scope.analysis = ''
				refresh();

			} else {
				$scope.unique = false;
			}
		}

		$scope.deleteAnalysis = function (analysis) {
			Root.deleteAnalysis(analysis);
			refresh();
		}

		$scope.selectAnalysis = function (analysis) {
			Current.selectCurrent(analysis);
			refresh();
		}

		refresh();
	});