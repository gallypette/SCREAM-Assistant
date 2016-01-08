'use strict';
angular.module('myApp.viewAttacks', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				when('/viewAttacks', {
					templateUrl: 'viewAttacks/viewAttacks.html',
					controller: 'ViewAttacks5Ctrl',
					resolve: {
						atcks: function ($route, Stc, Atck) {
							return Atck.findAll({}).then(function (atcks) {
								return  atcks;
							});
						}
					}
				});
		}])

	.controller('ViewAttacks5Ctrl', function ($q, $location, $route, $scope, $modal, investigationMenu, Atck, descriptionTypes, Description, Analysis, _) {

		// Load the data into the view
		$scope.atcks = $route.current.locals.atcks;

		$scope.addAtck = function (atck) {
			// Set the date and stcId before injecting
			atck.date = new Date();
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

		$scope.selectAction = function (atck, location) {
			// We set all other Atck.current to false
			var deferred = [];
			_.each($scope.atcks, function (allatck) {
				deferred.push(Atck.update(allatck.id, {current: 'false'}));	
			})

			// We set the attack target as current
			$q.all(deferred).then(function (values) {
				Atck.update(atck.id, {current: 'true'}).then(function (value) {
					$location.path("/" + location + "/" + atck.id);
				});
			});
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

					$scope.registerDescription = function (id, schema) {
						$scope.addDescription(id, schema);
						$modalInstance.close();
					};

					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};

					// Injects a description for an attack into the storage.
					$scope.addDescription = function (id, schema) {
						console.log('Addind description to atck:' + id);
						// Set the date and atckId before injecting
						$scope.model.date = new Date();
						$scope.model.atckId = id;
						$scope.model.type = schema;
						console.log($scope.model);
						// Inject
						return Description.create($scope.model).then(function (desc) {
							console.log(desc.id + ' injected.');
						});
					};
				}
			});
		}

		$scope.secondLine = true;
		$scope.itemsMenu = investigationMenu;
		$scope.isActive = function (url) {
			return url === "#/viewAttacks" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewInvestigation" ? 'active' : 'brand';
		}

	});