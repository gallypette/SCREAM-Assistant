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
			} else if (d.category == 'GA') {
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
			return children;
		};

		// Function that check the state of the stop rule on a node's siblings 
		var stopStateN = function (d) {
			var stoprule = "false";
			if (d.depth > 0) {
				_.each(d.parent.children, function (value, key, list) {
					if (value.stop == "true" && value.em != d.em) {
						stoprule = "true";
						console.log("One sibling is stopped");
					}
				});
			}
			return stoprule;
		};

		// Function that check the state of the stop rule on a node's siblings 
		var stopStateN1 = function (d) {
			var stoprule = "false";
			if (d.depth > 1) {
				_.each(d.parent.parent.children, function (value, key, list) {
					if (value.stop == "true") {
						stoprule = "true";
						console.log("One parent's sibling is stopped");
					}
				});
			}
			return stoprule;
		};

		// Function that returns true if a GA node is constrained by a stop rule
		var getConstrainedGA = function (toexpand, d) {
			if (!_.isUndefined(d.children)) {
				return _.union(toexpand, d.children.filter(isConstrainedGA));
			} else {
				return toexpand;
			}
		}


		// Function that returns true if a GA node is constrained by a stop rule
		var isConstrainedGA = function (d) {
			return (d.go === 'true' && (d.children === null || _.isUndefined(d.children)));
		}

		// Function that returns true if the node is GA
		var isGA = function (d) {
			return d.category === 'GA';
		}

		// Function that updates the RCA state when a stop rule is removed
		var removeStopRule = function (d) {
			// We need to find out the closed GA that should now be opened
			var tocheck = d.parent.children.filter(isGA);
			var toexpand = tocheck.reduce(getConstrainedGA, []);
			_.each(toexpand, function (value, key, list) {
				value.children = digAntecedent(value)
			});
			// Eventually set the Stop rule to false.
			d.stop = "false";
		}

		// Function that updates the RCA state when a stop rule is added
		var addStopRule = function () {
			// We need to check if there was already a stop rule engaged
			// in n+* depth. Then remove it before adding this one.
			// We need to check if some GA needs to be closed.

		}

		// Builds the path of a node
		var getPath = function (d) {
			var path = [];
			for (var i = d.depth; i != 0; i--) {
				path[d.depth] = {
					"category": d.category,
					"em": d.em
				};
				d = d.parent;
			}
			return path;
		}

		// Recursive tree traversal and update
		var traverseMatch = function (path, d, tree) {
			var trail = "";
			_.each(tree.children, function (value, key, list) {
				if (value.em == path[0].em) {
					trail = "children[" + key + "]";
					if (path.length > 1) {
						trail += '.' + traverseMatch(_.rest(path), d, value);
					}
				}
			});
			return trail;
		}

		var setToValue = function (obj, value, path) {
			console.log(path);
			// I to tell i start to get pissed...
			eval("$scope.current.data." + path + "= value");
			// There must be a way to avoid the dynamic interpretation evil:
//			function resolve(root, link) {
//				return (new Function('root', 'return root.' + link + ';'))(root);
//			}
//			var value = resolve(tree, path.to.link);
			// To be tested

		}

		// Function that ensures that d is updated in root
		var matchRoot = function (d) {
			// First we do a reverse tree traversal to find where this node is
			var path = getPath(d);
			path = _.rest(path);
			var trail = '';
			// Then a tree traversal to check the value of the node
			if (path.length > 0) {
				trail = traverseMatch(path, d, $scope.current.data);
			}
			setToValue($scope.current.data, d, trail);
		}

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
				if (stopStateN(d) == "false" && stopStateN1(d) == "false") { // OFF
					if (d.category == "SA") { // Toggling SA 
						if (d.go == "true") {
							d.go = "false";
							removeStopRule(d);
						} else {
							d.go = "true";
							d.stop = "true";
						}
					} else { // Opening closed GA
						d.go = "true";
						console.log("Opening Closed GA");
						d.children = digAntecedent(d);
						d._children = null;
					}
				} else if (stopStateN(d) == "false" && stopStateN1(d) == "true") { // ON at N-1
					if (d.go == "true") { // Was ON
						d.go = "false"; // Becomes OFF
						d.stop = "false"; // Already stopped
					} else { // Was OFF
						d.go = "true"; // Becomes ON
						d.stop = "false"; // Already stopped
					}
					if (d.category == "GA") {
						d.go = "true"; // Becomes ON
						console.log("Opening of GA prevented by the stop rule");
						d.children = null;
						d._children = null;
					}
				} else if (stopStateN(d) == "true" && stopStateN1(d) == "false") { // ON at N
					if (d.go == "true") { // Was ON
						d.go = "false"; // Becomes OFF
						d.stop = "false"; // Already stopped
					} else { // Was OFF
						d.go = "true"; // Becomes ON
						d.stop = "false"; // Already stopped
					}
					if (d.category == "GA") { // One sibling is stopped, we can open the GA
						d.go = "true"; // Becomes ON
						console.log("Last depth of GA opening.");
						d.children = digAntecedent(d);
						d._children = null;
					}
				}
			}
			updateEMDb();
			// Before returning d for the display, we ensure that root is updated accordingly
			if (d.depth > 0) {
				matchRoot(d);
			}
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
