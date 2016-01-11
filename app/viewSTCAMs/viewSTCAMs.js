'use strict';

// I put this here as a scaffold but the real view needs to bring almost all the app's data model.

angular.module('myApp.viewSTCAMs', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/viewSTCAMs/:id', {
					templateUrl: 'viewSTCAMs/viewSTCAMs.html',
					controller: 'ViewSTCAMsCtrl',
					resolve: {
						stc: function ($route, Stc, Atck, Analysis, Description, _) {
							return Stc.find($route.current.params.id).then(function (stc) {
								return Stc.loadRelations(stc.id, []);
								// I can't go further down the nest because of js-data limitations.
							})
						}
					}
				}).
				// .when we land on the view4's root, we need to get the current analysis
				when('/viewSTCAMs', {
					templateUrl: 'viewSTCAMs/viewSTCAMs.html',
					controller: 'ViewSTCAMsCtrl',
					resolve: {
						stc: function ($route, Stc, Atck, Analysis, Description, _) {
							return Stc.findAll({current: 'true'}, {cacheResponse: false}).then(function (stc) {
								return Stc.loadRelations(stc[0].id, []);
							})
						}
					}
				});
		}])

	.controller('ViewSTCAMsCtrl', function ($scope, $route, $q, stcMenu, Analysis, Atck, ErrorMode, errorModes) {

		$scope.areCompleted = function () {
			_.each($scope.atck.analysis.ems, function (value, key, list) {
				// For each ErrorMode, we check that it reached an end state
				value.completed = errorModes.analysisCompleted(value);
			});
		}

		// View var from resolve 
		$scope.stc = $route.current.locals.stc;

		// lazy loading of nested relations does not work with localstorage
		// so we resolve those here
		var defer = $q.defer();
		var promises = [];
		$scope.antecedents = [];
		// Crunching everything into one big arry
		_.each($scope.stc.atcks, function (element, index, list) {
			promises.push(Atck.loadRelations(element.id).then(function () {
				return Analysis.loadRelations($scope.stc.atcks[index].analysis.id).then(function () {
					if (_.isEmpty($scope.stc.atcks[index].analysis.ems)) {
						console.log('No error modes');
						return true;
					} else {
						_.each($scope.stc.atcks[index].analysis.ems, function (value, key, list) {
							// For each ErrorMode, we check that it reached an end state
							value.completed = errorModes.analysisCompleted(value);
							// For each ErrorMode, we compile the list of antecedents
							if (value.completed) {
								$scope.antecedents.push({ant: errorModes.analysisResults(value), em: value, description: $scope.stc.atcks[index].description});
							}
						});
					}
					return true;
				})
			}));
		});
		$q.all(promises).then(function () {
			$scope.display = errorModes.analysisResultsSTC($scope.antecedents);
			console.log($scope.display);
		});

		$scope.secondLine = true;
		$scope.itemsMenu = stcMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSTCAMs" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}
	});