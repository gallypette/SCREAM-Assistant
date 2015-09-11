'use strict';
angular.module('myApp.view5', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the stc by the use of the button
				when('/view5/:id', {
					templateUrl: 'view5/view5.html',
					controller: 'View5Ctrl',
					resolve: {
						stc: function ($route, Stc, Atck) {
							return Stc.find($route.current.params.id).then(function (stc) {
								return Stc.loadRelations(stc.id, ['atck']);
							});
						},
						current: function ($route, Atck) {
							return Atck.findAll({current: 'true'}, {cacheResponse: false});
						}
					}
				}).
				// .when we land on the view5's root, we need to get the current stc
				when('/view5', {
					templateUrl: 'view5/view5.html',
					controller: 'View5Ctrl',
					resolve: {
						stc: function ($route, Stc, Atck) {
							return Stc.findAll({current: 'true'}).then(function (stc) {
								return Stc.loadRelations(stc[0].id, ['atcks']);
							});
						},
						current: function ($route, Atck) {
							console.log("ok");
							return Atck.findAll({where: {
									'current': {
										'===': 'true'
									}
								}}, {cacheResponse: false});
						},
					}
				});
		}])

	.controller('View5Ctrl', function ($route, $scope, $modal, analysisMenu, Atck, descriptionTypes, Description, Analysis, _) {

		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view5" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}

		// Load the data into the view
		$scope.current = $route.current.locals.current[0];
		$scope.stc = $route.current.locals.stc;
//		console.log($scope.stc);
//		console.log($scope.stc.atcks);

		console.log($route.current.locals.current);

		$scope.addAtck = function (atck) {
			// Set the date and stcId before injecting
			atck.date = new Date();
			atck.stcId = $scope.stc.id;
			// Inject and clear the view
			return Atck.create(atck).then(function () {
				atck.name = '';
				atck.desc = '';
				atck.id = null;
			});
		}
		// Delete an Attack and its description.
		$scope.deleteAtck = function (atck) {
			Atck.destroy(atck.id).then(function () {
				// Update the view
				$scope.current = "";
				return true;
			})
		}

		$scope.selectAtck = function (atck) {
			// We set all other Atck.current to false
			_.each($scope.stc.atcks, function (atck) {
				Atck.update(atck.id, {current: 'false'});
			})

			// We set the attack target as current
			Atck.update(atck.id, {current: 'true'});
			// We update the view
			$scope.current = Atck.get(atck.id);
		}

		// Opens a modal to describe the attack
		$scope.describeAtck = function (atck) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'myDescriptionModal',
				size: 'lg',
				resolve: {
					// We will need to fetch the existing description and feed it into the view
					atckDesc: function (Atck) {
						return Atck.loadRelations(atck.id, ['description']);
					}

				},
				controller: function ($scope, $modalInstance, Description, atckDesc, _) {

					// The model that will get the description back
					console.log(atckDesc.description);
					console.log(atckDesc);

					// The model where we store the values linked in the view (form)
					_.isUndefined(atckDesc.description) ? $scope.model = {} : $scope.model = atckDesc.description;

					$scope.atckMod = atckDesc;
					$scope.descriptionTypes = descriptionTypes;

					$scope.registerDescription = function (id) {
						$scope.addDescription(id);
						$modalInstance.close();
					};

					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};

					// Injects a description for an attack into the storage.
					$scope.addDescription = function (id) {
						console.log('Addind description to atck:' + id);
						console.log($scope.model);
						// Set the date and atckId before injecting
						$scope.model.date = new Date();
						$scope.model.atckId = id;
						// Inject
						return Description.create($scope.model).then(function (desc) {
							console.log(desc.id + ' injected.');
						});
					};
				}
			});
		}

	});
