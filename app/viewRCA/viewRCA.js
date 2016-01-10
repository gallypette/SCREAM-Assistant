'use strict';

angular.module('myApp.viewRCA', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/viewRCA/:id', {
					templateUrl: 'viewRCA/viewRCA.html',
					controller: 'ViewRCACtrl',
					resolve: {
						atck: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.find($route.current.params.id).then(function (atck) {
								return Atck.loadRelations(atck.id, []);
							});
						}, // nested load relations does not work on localStorage - that's the why of this ugly bit
						current: function ($route, Stc, Atck, Analysis, Description, ErrorMode) {
							return Atck.find($route.current.params.id).then(function (atck) {
								return Atck.loadRelations(atck.id, ['analysis']).then(function (atck) {
									return ErrorMode.findAll({current: 'true', analysisId: atck.analysis.id}, {cacheResponse: false});
								});
							});
						},
						creamtable: function ($q, $route, Atck, Analysis, screamFlavors, xsltTransform) {
							// First we need to get the Analysis's CREAM flavor
							return $q.resolve(Atck.find($route.current.params.id)).
								then(function (atck) {
									return Atck.loadRelations(atck.id, ['analysis', 'descriptions']);
								}).
								then(function (atck) {
									return xsltTransform.importFlavor(atck.analysis.flavor);
								});
						}
					}
				}).
				// .when we land on the viewRCA's root, we need to get the current analysis
				when('/viewRCA', {
					templateUrl: 'viewRCA/viewRCA.html',
					controller: 'ViewRCACtrl',
					resolve: {
						atck: function ($route, Atck, Analysis, Description, _) {
							return Atck.findAll({current: 'true'}, {cacheResponse: false}).then(function (atck) {
								// There should only be one current atck
								console.log(atck);
								return Atck.loadRelations(atck[0].id, []);
							});
						},
						// Without the id, we just return all current Error Modes
						current: function ($route, ErrorMode) {
							return ErrorMode.findAll({current: 'true'}, {cacheResponse: false});
						},
						creamtable: function ($q, Atck, Analysis, screamFlavors, xsltTransform) {
							// First we need to get the Analysis's CREAM flavor
							return $q.resolve(Atck.findAll({current: 'true'})).
								then(function (atcks) {
									return Atck.loadRelations(atcks[0].id, ['analysis', 'description']);
								}).
								then(function (atck) {
									return xsltTransform.importFlavor(atck.analysis.flavor);
								});
						}
					}
				});
		}])

	.controller('ViewRCACtrl', function ($sce, $scope, $route, $modal, $q, investigationMenu, Analysis, Atck, Description, ErrorMode, errorModes, screamFlavors, xsltTransform, _) {

		$scope.atck = $route.current.locals.atck;
		// Current EM being analyzed
		$scope.current = _.where($route.current.locals.current, {analysisId: $scope.atck.analysis.id})[0];
		$scope.flavors = screamFlavors;

		$scope.areCompleted = function () {
			_.each($scope.atck.analysis.ems, function (value, key, list) {
				// For each ErrorMode, we check that it reached an end state
				value.completed = errorModes.analysisCompleted(value);
			});
		}

		// lazy loading of nested realtions does not work with localstorage
		// so we resolve those here
		$q.resolve(Analysis.loadRelations($scope.atck.analysis.id)).then(function () {
			// The model where we store the values linked in the view (form)
			// We need to populated it with the analysis's error modes.
			$scope.model = {};
			if (_.isEmpty($scope.atck.analysis.ems)) {
				console.log('No error modes associated.');
				return true;
			} else {
				_.each($scope.atck.analysis.ems, function (value, key, list) {
					$scope.model[value.category] = value.em;
				});
				// Update of the state of the errorModes
				$scope.areCompleted();
				return true;
			}
			console.log($scope.atck.analysis.ems);
		});

		$scope.creamtable = $route.current.locals.creamtable;

		$scope.analyzeEM = function (em) {
			var promises = [];
			// We set this EM as current
			_.each($scope.atck.analysis.ems, function (em) {
				promises.push(ErrorMode.update(em.id, {current: 'false'}));
			})

			$q.all(promises).then(function () {
				// We set the error mode as current
				ErrorMode.update(em.id, {current: 'true'}).
					then(function () {
						// We update the view
						ErrorMode.find(em.id).
							then(function (current) {
//								console.log(current)
								$scope.current = current;
//							console.log($scope.current);
								// Now we try to update the TreeView
								return true;
							});
					})
			});

		}

		$scope.getFlavor = function (flavor) {
			console.log("importing " + flavor.name);
			// First we Update the Flavor for the analysis
			return Analysis.update($scope.atck.analysis.id, {flavor: flavor}).
				then(function (success) {
					console.log(success.id + ' updated with flavor' + flavor.name);
					return xsltTransform.importFlavor(flavor);
				}).then(function (result) {// Now we import the flavor in the app
				$scope.creamtable = result;
			});
		}

		$scope.onClick = function (element) {
//			console.log(element);
		};

		// This evil hack must stay here because of the eval of 'this' $scope
		var setToValue = function (toSet) {
			console.log(toSet[2]);
			eval("$scope.current.data." + toSet[2] + "= toSet[1]");
			// There must be a way to avoid the dynamic interpretation evil
		};

		// Function that implements the stop rule
		// Return a promise
		$scope.toggleAntecedent = function (d) {
			var defer = $q.defer();

			if (d.children || (d.children == null && d.category == "GA" && d.go == "true")) {
				console.log("[+] Removing antecedent.");
				d.go = "false";
				// I don't keep track of previous computations
				d._children = null;
				d.children = null;
			} else { // Closed GA or SA								
				// First we check the state of the stop rule
				if (errorModes.stopStateN(d, $scope) == "false" && errorModes.stopStateN1(d, $scope) == "false") { // OFF
					if (d.category == "SA") { // Toggling SA 
						if (d.go == "true") {
							d.go = "false";
							errorModes.removeStopRule(d, $scope);
						} else {
							d.go = "true";
							errorModes.addStopRule(d, $scope);
						}
					} else { // Opening closed GA
						d.go = "true";
						console.log("Opening Closed GA");
						d.children = errorModes.digAntecedent(d, $scope);
						d._children = null;
					}
				} else if (errorModes.stopStateN(d, $scope) == "false" && errorModes.stopStateN1(d, $scope) == "true") { // ON at N-1
					if (d.category === 'SA') {
						if (d.go == "true") { // Was ON
							d.go = "false"; // Becomes OFF
							errorModes.removeStopRule(d, $scope);
						} else { // Was OFF
							d.go = "true"; // Becomes ON
							errorModes.removeStopRule(d, $scope);
						}
					} else if (d.category == "GA") { // The GA can be closed because of SR ON
						if (d.go === 'false') {
							d.go = "true"; // Becomes ON
							console.log("Opening of GA prevented by the stop rule");
							d.children = null;
							d._children = null;
						} else {
							console.log("Removing  a closed GA from the selection");
							d.go = "false"; // Becomes OFF
						}
					}
				} else if (errorModes.stopStateN(d, $scope) == "true" && errorModes.stopStateN1(d, $scope) == "false") { // ON at N
					if (d.category === 'SA') {
						if (d.go == "true") { // Was ON
							d.go = "false"; // Becomes OFF
							errorModes.removeStopRule(d, $scope);
						} else { // Was OFF
							d.go = "true"; // Becomes ON
							errorModes.removeStopRule(d, $scope);
						}
					} else if (d.category == "GA") { // One sibling is stopped, we can open the GA
						d.go = "true"; // Becomes ON
						console.log("Last depth of GA opening.");
						d.children = errorModes.digAntecedent(d, $scope);
						d._children = null;
					}
				}
			}

			// Before saving to the storage and displaying, we update the node value in the tree
//			if (d.depth > 0) {
//				var toSet = errorModes.matchRoot(d, $scope);
//				setToValue(toSet);
//			}

			ErrorMode.update($scope.current.id, {data: $scope.current.data}).then(function (errorMode) {
				console.log('localstorage updated!');
				// Now that all is done, we can resolve the promise with d, allowing the display of the tree.
				defer.resolve(d);
			})

			return defer.promise;
		}

		// Opens a modal to select an Error Mode to create
		$scope.addEM = function () {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'myEmSelectionModal',
				size: 'lg',
				scope: $scope,
				resolve: {
				},
				controller: function ($scope, $modalInstance) {

					$scope.registerEM = function (id) {
						$scope.addEMtoAnalysis(id);
						$modalInstance.close();
					};

					// Injects the Error Mode into the analysis linked to the attack
					$scope.addEMtoAnalysis = function () {
						console.log('Addind Selected Error Modes to Analysis:' + $scope.atck.analysis.id);
						console.log($scope.model);
						// We add each Error Mode to the Analysis
						_.each($scope.model, function (value, key, list) {
							// We update the categories that are updated and we create the missing ones.
							ErrorMode.findAll({where: {analysisId: {'===': $scope.atck.analysis.id}, category: {'==': key}}}, {cacheResponse: false}).then(function (em) {
								console.log(em);
								if (_.isEmpty(em)) {
									ErrorMode.create({category: key, em: value, analysisId: $scope.atck.analysis.id}).
										then(function (success) {
											console.log('ErrorMode ' + success.id + ' injected.');
										});
								} else {
									if (value == null) {
										ErrorMode.destroy(em[0].id).
											then(function (success) {
												console.log('ErrorMode Destroyed.');
											});
									} else {
										ErrorMode.update(em[0].id, {em: value}).
											then(function (success) {
												console.log('ErrorMode ' + success.id + ' Updated.');
											});
									}
								}
							})

						});
					};

					$scope.clear = function (catName) {
						$scope.model[catName] = null;
					}

					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}
			});
		}

		// Menu vars from app constant
		$scope.secondLine = true;
		$scope.itemsMenu = investigationMenu;
		$scope.isActive = function (url) {
			return url === "#/viewRCA" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewInvestigation" ? 'active' : 'brand';
		}
	});
