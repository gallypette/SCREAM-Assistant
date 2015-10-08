'use strict';

angular.module('myApp.view3', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the analysis by the use of the main menu's button
				when('/view3/:id', {
					templateUrl: 'view3/view3.html',
					controller: 'View3Ctrl',
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
						},
						creamtable: function ($q, $route, Atck, Analysis, screamFlavors, xsltTransform) {
							// First we need to get the Analysis's CREAM flavor
							return $q.resolve(Atck.find($route.current.params.id)).
								then(function (atck) {
									return Atck.loadRelations(atck.id, ['analysis', 'description']);
								}).
								then(function (atck) {
									return xsltTransform.importFlavor(atck.analysis.flavor);
								});
						}
					}
				}).
				// .when we land on the view3's root, we need to get the current analysis
				when('/view3', {
					templateUrl: 'view3/view3.html',
					controller: 'View3Ctrl',
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

	.controller('View3Ctrl', function ($sce, $scope, $route, $modal, $q, analysisMenu, Analysis, Atck, Description, ErrorMode, screamFlavors, xsltTransform, _) {

		console.log($route.current.locals.atck);
		console.log($route.current.locals.atck.description);
		console.log($route.current.locals.atck.analysis);

		$scope.itemsMenu = analysisMenu;
		$scope.atck = $route.current.locals.atck;
		$scope.current = $route.current.locals.current[0];
		$scope.flavors = screamFlavors;
		// lazy loading of nested realtions does not work with localstorage
		// so we resolve those here
		$q.resolve(Analysis.loadRelations($scope.atck.analysis.id)).then(function () {
			// The model where we store the values linked in the view (form)
			// We need to populated it with the analysis's error modes.
			$scope.model = {};
			if (_.isEmpty($scope.atck.analysis.ems)) {
				return true;
			} else {
				_.each($scope.atck.analysis.ems, function (value, key, list) {
					$scope.model[value.category] = value.em;
				});
				return true;
			}
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

		$scope.isActive = function (url) {
			return url === "#/view3" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

		$scope.onClick = function (element) {
//			console.log(element);
		};

		// Set the DB to the current emTree's state.
		var updateEMDb = function () {
			ErrorMode.update($scope.current.id, {data: $scope.current.data})
		};

		var findGA = function (d) {
			// We go through categories 1-3
			var pointer = {};
			for (var i = 1; i < 4; i++) {
				_.each($scope.creamtable.cream.category[i].group, function (value, key, list) {
					// lone elements are not into an array but are an object in CREAM.xml
					if (_.isArray(value.gc)) {
						_.each(value.gc, function (vgc, kgc, lgc) {
							if (vgc.name === d.em) {
								pointer = vgc;
							}
						});
					} else if (_.isObject(value.gc)) {
						if (value.gc.name === d.em) {
							pointer = value.gc;
						}
					}
				});
			}
			return pointer;
		};

		// Functions that find the antecedents for the next depth
		var digAntecedent = function (d) {
			console.log(d);
			var pointer = {};
			// We investigate the root by parsing category0
			if (d.depth == 0) {
				_.each($scope.creamtable.cream.category[0].group.gc, function (value, key, list) {
					_.each(value.sc, function (vsc, ksc, lsc) {
						if (vsc.name === d.em) {
							pointer = value;
						}
					});
				});
			} else if (d.category == 'SA') { // SA do not have children
				// But we need to set the stoprule for this branch
				d.stop = "true";
				return true;
			} else { // We investigate a GA
				pointer = findGA(d);
			}
			// Once pointer point on the right node in CREAM's tree, we populate the tree
			var children = [];
			// lone elements are not into an array but are an object in CREAM.xml
			if (_.isArray(pointer.sa)) {
				_.each(pointer.sa, function (value, key, list) {
					children.push({
						"category": "SA",
						"em": value.name,
						"go": "false",
						"stop": "false"});
				});
			} else if (_.isObject(pointer.sa) && (pointer.sa.name != 'None defined')) {
				children.push({
					"category": "SA",
					"em": pointer.sa.name,
					"go": "false",
					"stop": "false"});
			}
			if (_.isArray(pointer.ga)) {
				_.each(pointer.ga, function (value, key, list) {
					children.push({
						"category": "GA",
						"em": value.name,
						"go": "false",
						"stop": "false"});
				});
			} else if (_.isObject(pointer.ga) && (pointer.sa.name != 'None defined')) {
				children.push({
					"category": "GA",
					"em": pointer.ga.name,
					"go": "false",
					"stop": "false"});
			}
			console.log(pointer);
			console.log(children);
			return children;
		};
		
		// Function that check the state of the stop rule for a node
		var stopState = function (d){
			// The stop rule is ON for a node if:
			// One sibling node is SR ON
			// One sibling of the parent is SR ON


			return "false";
		};

		// Function that implements the stop rule
		$scope.toggleAntecedent = function (d) {
			if (d.children) { // Opened
				d.go = "false";
				// I don't keep track of previous computations
				// because ids get messed up when manipulating the data
				d._children = null;
				d.children = null;
			} else { // Closed or SA								
				// First we check the state of the stop rule
				if (stopState(d) == "false") {
					d.go = "true";
					d.children = digAntecedent(d);
					d._children = null;
				} else { 
				

				}
			}
			updateEMDb();
			return d;
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
							ErrorMode.findAll({where: {category: {'==': key}}}, {cacheResponse: false}).then(function (em) {
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
	});
