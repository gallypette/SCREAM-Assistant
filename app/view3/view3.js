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
						creamtable: function (screamFlavors, xsltTransform) {
							// We resolve Basic CREAM by default
							return xsltTransform.importFlavor(screamFlavors[0]);
						}
					}
				});
		}])

	.controller('View3Ctrl', function ($sce, $scope, $route, $modal, $q, analysisMenu, Analysis, Atck, Description, screamFlavors, xsltTransform) {

		console.log($route.current.locals.atck);
		console.log($route.current.locals.atck.description);
		console.log($route.current.locals.atck.analysis);

		$scope.itemsMenu = analysisMenu;
		$scope.atck = $route.current.locals.atck;
		$scope.flavors = screamFlavors;

		$scope.creamtable = $route.current.locals.creamtable;

		$scope.model = {};

		$scope.getFlavor = function (flavor) {
			console.log("importing " + flavor.name);
			$q.resolve(xsltTransform.importFlavor(flavor)).then(function (result) {
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
						console.log('Addind Error Modes to analysis:' + $scope.atck.analysis.id);
						console.log($scope.model);
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
