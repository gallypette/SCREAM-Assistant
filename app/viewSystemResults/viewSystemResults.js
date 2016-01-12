'use strict';

// I put this here as a scaffold but the real view needs to bring almost all the app's data model.

angular.module('myApp.viewSystemResults', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/viewSystemResults/:id', {
					templateUrl: 'viewSystemResults/viewSystemResults.html',
					controller: 'ViewSystemResultsCtrl',
					resolve: {
						sys: function ($route, Sys, Atck, Analysis, Description, _) {
							return Sys.find($route.current.params.id).then(function (sys) {
								return Sys.loadRelations(sys.id, []);
								// I can't go further down the nest because of js-data limitations.
							})
						}
					}
				}).
				// .when we land on the view4's root, we need to get the current analysis
				when('/viewSystemResults', {
					templateUrl: 'viewSystemResults/viewSystemResults.html',
					controller: 'ViewSystemResultsCtrl',
					resolve: {
						sys: function ($route, $location, Sys, Atck, Analysis, Description, _) {
							return Sys.findAll({current: 'true'}, {cacheResponse: false}).then(function (syss) {
								if (_.isUndefined(syss[0])) {
									$location.path("/viewSystems/");
								} else {
									return Sys.loadRelations(syss[0].id, []);
								}
							})
						}
					}
				});
		}])

	.controller('ViewSystemResultsCtrl', function ($scope, $route, $q, screamMenu, Analysis, Atck, ErrorMode, Stc, errorModes, threatModel) {

		$scope.areCompleted = function () {
			_.each($scope.atck.analysis.ems, function (value, key, list) {
				// For each ErrorMode, we check that it reached an end state
				value.completed = errorModes.analysisCompleted(value);
			});
		}

		$scope.isOpenA = function (antecedent) {
			return (!_.isUndefined(antecedent.comment) && (antecedent.comment.length) > 0) ? true : false;
		}

		// View var from resolve 
		$scope.sys = $route.current.locals.sys;

		// Analizing the attacks linked to this system
		var promises = [];
		$scope.antecedents = [];
		_.each($scope.sys.atcks, function (element, index, list) {
			promises.push(Atck.loadRelations(element.id).then(function () {
				return Analysis.loadRelations($scope.sys.atcks[index].analysis.id).then(function () {
					if (_.isEmpty($scope.sys.atcks[index].analysis.ems)) {
						console.log('No error modes');
						return true;
					} else {
						_.each($scope.sys.atcks[index].analysis.ems, function (value, key, list) {
							// For each ErrorMode, we check that it reached an end state
							value.completed = errorModes.analysisCompleted(value);
							// For each ErrorMode, we compile the list of antecedents
							if (value.completed) {
								$scope.sys.atcks[index].analysis.ems[key].antecedents = [];
								$scope.sys.atcks[index].analysis.ems[key].antecedents = (errorModes.analysisResults(value));
							}
						});
					}
					return true;
				})
			}));
		});
		$q.all(promises).then(function (values) {
			console.log('Linked Attacks analyzed');
		});

		// Compiling the STCs corresponding to this system
		var promisesStc = [];
		// Get compatible-linked to a STC-atcks
		threatModel.speStc($scope.sys).then(function (atcksCompatibles) {
			// get the corresponding STC, analyses, ems, and antecedents.
			var deferred = [];
			_.each(atcksCompatibles, function (atck) {
				deferred.push(Atck.loadRelations(atck.id, ['stc']));
			});
			var stcs = [];
			$q.all(deferred).then(function (values) {
				// We build the stcs array
				_.each(values, function (element) {
					stcs.push(element.stc);
				});
				stcs = _.uniq(stcs);
				return stcs;
			}).then(function (stcs) {
				var deferred = [];
				_.each(stcs, function (element) {
					// We load the relations of the Stc 
					deferred.push(Stc.loadRelations(element.id, ['atck']));
				});
				$q.all(deferred).then(function (values) {
					// Now that the stc are populated by the attacks, we push
					// only the compatible into the scope
					_.each(values, function (element, index, list) {
						stcs[index].atcks = _.intersection(element.atcks, atcksCompatibles);
					});
					return stcs;
					// The list of Stc is now ready
				}).then(function (stcs) {
					$scope.stcs = stcs;
					var promises = [];
					_.each($scope.stcs, function (elementStc, indexStc, listStc) {
						elementStc.antecedents = [];
						_.each(elementStc.atcks, function (elementAtck, indexAtck, listAtck) {
							promises.push(Atck.loadRelations(elementAtck.id, ['description', 'analysis']).then(function () {
								return Analysis.loadRelations(elementAtck.analysis.id).then(function () {
									if (_.isEmpty(elementAtck.analysis.ems)) {
										console.log('No error modes');
										return true;
									} else {
										_.each(elementAtck.analysis.ems, function (value, key, list) {
											// For each ErrorMode, we check that it reached an end state
											value.completed = errorModes.analysisCompleted(value);
											// For each ErrorMode, we compile the list of antecedents
											if (value.completed) {
												$scope.stcs[indexStc].antecedents.push({ant: errorModes.analysisResults(value), em: value, description: stcs[indexStc].atcks[indexAtck].description});
											}
										});
									}
									return true;
								})
							}));
						});
						$q.all(promises).then(function () {
							$scope.stcs[indexStc].antecedents = errorModes.analysisResultsSTC($scope.stcs[indexStc].antecedents);
						});
					});
				});
			});
		});

		$scope.secondLine = true;
		$scope.itemsMenu = screamMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSystemResults" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTTM" ? 'active' : 'brand';
		}
	}
	);
