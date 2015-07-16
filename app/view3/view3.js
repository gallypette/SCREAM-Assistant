'use strict';

angular.module('myApp.view3', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view3', {
				templateUrl: 'view3/view3.html',
				controller: 'View3Ctrl'
			});
		}])

	.controller('View3Ctrl', function ($scope, analysisMenu) {

			$scope.itemsMenu = analysisMenu;
		
			//Here we input the data we want to see in the tree
			$scope.data = [
				{
					"name": "Wrong object",
					"parent": "null",
					"children": [
						{
							"name": "Level 2: A",
							"parent": "Top Level",
							"children": [
								{
									"name": "Son of A",
									"parent": "Level 2: A"
								},
								{
									"name": "Daughter of A",
									"parent": "Level 2: A"
								}
							]
						},
						{
							"name": "Level 2: B",
							"parent": "Top Level"
						}
					]
				}
			];
		});
