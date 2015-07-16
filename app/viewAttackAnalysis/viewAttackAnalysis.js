'use strict';

angular.module('myApp.viewAttackAnalysis', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewAttackAnalysis', {
				templateUrl: 'viewAttackAnalysis/viewAttackAnalysis.html',
				controller: 'ViewAttackAnalysisCtrl'
			});
		}])

	.controller('ViewAttackAnalysisCtrl', function ($scope) {

			$scope.itemsMenu = [
				{url: '#/view1', text: 'view1' },
				{url: '#/view2', text: 'view2' },
				{url: '#/view3', text: 'view3' },
				{url: '#/view4', text: 'view4' },
				{url: '#/view5', text: 'view5' }
			];

		});