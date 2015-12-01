'use strict';

angular.module('myApp.view4', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/view4/:id', {
					templateUrl: 'view4/view4.html',
					controller: 'View4Ctrl',
					resolve: {
						atck: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.find($route.current.params.id).then(function (atck) {
								return Atck.loadRelations(atck.id, ['analysis', 'description']);
							});
						},
						current: function ($route, Stc, Atck, Analysis, Description, ErrorMode) {
							return Atck.find($route.current.params.id).then(function (atck) {
								return Atck.loadRelations(atck.id, ['analysis']).then(function (atck) {
									return ErrorMode.findAll({current: 'true', analysisId: atck.analysis.id}, {cacheResponse: false});
								});
							});
						}
					}
				}).
				// .when we land on the view4's root, we need to get the current analysis
				when('/view4', {
					templateUrl: 'view4/view4.html',
					controller: 'View4Ctrl',
					resolve: {
						atck: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.findAll({current: 'true'}).then(function (atcks) {
								return Atck.loadRelations(atcks[0].id, ['analysis', 'description']);
							});
						},
						current: function ($route, Stc, Atck, Analysis, Description, ErrorMode) {
							return Atck.findAll({current: 'true'}).then(function (atck) {
								return Atck.loadRelations(atck[0].id, ['analysis']).then(function (atck) {
									return ErrorMode.findAll({current: 'true', analysisId: atck.analysis.id}, {cacheResponse: false});
								});
							});
						}
					}
				});
		}])

	.controller('View4Ctrl', function (_, $scope, $route, $q, analysisMenu, Analysis, Atck, ErrorMode, errorModes) {

		// Menu vars from app constant
		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view4" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

		// View var from resolve 
		$scope.atck = $route.current.locals.atck;
		$scope.current = $route.current.locals.current[0];
		
		
		// lazy loading of nested relations does not work with localstorage
		// so we resolve those here
		$q.resolve(Analysis.loadRelations($scope.atck.analysis.id)).then(function () {
			if (_.isEmpty($scope.atck.analysis.ems)) {
				// No ErrorMode for this analysis, we should warn the user 
				// That the analysis of this attack is incomplete.
				return true;
			} else {
				_.each($scope.atck.analysis.ems, function (value, key, list) {
					// For each ErrorMode, we check that it reached an end state
					value.completed = errorModes.analysisCompleted(value);
					// For each ErrorMode, we compile the list of antecedents
					if(value.completed){
						value.antecedents = errorModes.analysisResults(value);
						console.log(value.antecedents);
					}	
				});
				return true;
			}
		});

		
		
		// Function that get the comment form back
		$scope.registerComments = function (em){
			console.log(em);
			// We need to update corresponding errorMode in the localstorage.
			ErrorMode.update(em.id, {data: em.data});
		} 
	
	});
