'use strict';

angular.module('myApp.viewResults', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/viewResults/:id', {
					templateUrl: 'viewResults/viewResults.html',
					controller: 'ViewResultsCtrl',
					resolve: {
						atck: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.find($route.current.params.id).then(function (atck) {
								return Atck.loadRelations(atck.id, ['analysis', 'description']);
							});
						}
					}
				}).
				// .when we land on the view4's root, we need to get the current analysis
				when('/viewResults', {
					templateUrl: 'viewResults/viewResults.html',
					controller: 'ViewResultsCtrl',
					resolve: {
						atck: function ($route, Atck, Analysis, Description, _) {
							return Atck.findAll({current: 'true'}, {cacheResponse: false}).then(function (atck) {
								// There should only be one current atck
								return Atck.loadRelations(atck[0].id, []);
							});
						}
					}
				});
		}])

	.controller('ViewResultsCtrl', function (_, $scope, $route, $q, $modal, investigationMenu, Analysis, Atck, ErrorMode, errorModes) {

		// View var from resolve 
		$scope.atck = $route.current.locals.atck;

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
					if (value.completed) {
						value.antecedents = errorModes.analysisResults(value);
						console.log(value.antecedents);
					}
				});
				return true;
			}
		});

		// Function that get the comment form back
		$scope.registerComments = function (em) {
			// We need to update corresponding errorMode in the localstorage.
			ErrorMode.update(em.id, {data: em.data}).then()
			{
				// Display a modal for the user' feedback
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'loadingStateModal',
					size: 'sg',
					controller: function ($scope, $modalInstance) {
						// Dimiss the modal when OK is clicked.
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					}
				});
			}
			;
		}
		
		// Menu vars from app constant
		$scope.secondLine = true;
		$scope.itemsMenu = investigationMenu;
		$scope.isActive = function (url) {
			return url === "#/viewResults" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewInvestigation" ? 'active' : 'brand';
		}
	});
