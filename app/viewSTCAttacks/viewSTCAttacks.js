'use strict';
angular.module('myApp.viewSTCAttacks', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the stc by the use of the button
				when('/viewSTCAttacks/:id', {
					templateUrl: 'viewSTCAttacks/viewSTCAttacks.html',
					controller: 'ViewSTCAttacksCtrl',
					resolve: {
						stc: function ($route, Stc, Atck) {
							return Stc.find($route.current.params.id).then(function (stc) {
								return Stc.loadRelations(stc.id, []);
							});
						}
					}
				}).
				// .when we land on the view5's root, we need to get the current stc
				when('/viewSTCAttacks', {
					templateUrl: 'viewSTCAttacks/viewSTCAttacks.html',
					controller: 'ViewSTCAttacksCtrl',
					resolve: {
						stc: function ($route, Stc, Atck) {
							return Stc.findAll({current: 'true'}).then(function (stc) {
								return Stc.loadRelations(stc[0].id, []);
							});
						}
					}
				});
		}])

	.controller('ViewSTCAttacksCtrl', function ($route, $scope, $modal, stcMenu, Atck, descriptionTypes, Description, Analysis, _) {

		// Load the data into the view
		$scope.stc = $route.current.locals.stc;
		// Point current to the current one
		$scope.current = _.where($route.current.locals.stc.atcks, {current: 'true'})[0];
		console.log($scope.current);

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
		$scope.itemsMenu = stcMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSTCAttacks" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}

	});
