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
						current: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.findAll({current: 'true'}, {cacheResponse: false});
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
						current: function ($route, Stc, Atck, Analysis, Description) {
							return Atck.findAll({current: 'true'}, {cacheResponse: false});
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
							ErrorMode.findAll({where: { category: {'==': key}}}, {cacheResponse: false}).then(function (em) {
								console.log(em);
								if (_.isEmpty(em)) {
									ErrorMode.create({category: key, em: value, analysisId: $scope.atck.analysis.id}).
										then(function (success) {
											console.log('ErrorMode ' + success.id + ' injected.');
										});
								} else {
									ErrorMode.update(em[0].id, {em: value}).
										then(function (success) {
											console.log('ErrorMode ' + success.id + ' Updated.');
										});
								}
							})

						});
						// Set the date and atckId before injecting
//						$scope.model.date = new Date();
//						$scope.model.atckId = id;
						// Inject
//						return Description.create($scope.model).then(function (desc) {
//							console.log(desc.id + ' injected.');
//						});
					};

					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}
			});
		}

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
