'use strict';

angular.module('myApp.viewTMAnalysis', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewTMAnalysis', {
				templateUrl: 'viewTMAnalysis/viewTMAnalysis.html',
				controller: 'ViewTMAnalysisCtrl'
			});
		}])

	.controller('ViewTMAnalysisCtrl', function ($scope) {

			$scope.itemsMenu = [
				{url: '#/TMview1', text: 'TMview1'},
				{url: '#/TMview2', text: 'TMview2'}
			];

		});