'use strict';
angular.module('myApp.viewSystems', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				when('/viewSystems', {
					templateUrl: 'viewSystems/viewSystems.html',
					controller: 'ViewSystemsCtrl',
					resolve: {
						syss: function ($route, Stc, Sys) {
							return Sys.findAll({}).then(function (syss) {
								return  syss;
							});
						},
						current: function ($route, Sys, _) {
							return Sys.findAll({current: 'true'}, {cacheResponse: false}).then(function (syss) {
								return _.isUndefined(syss[0]) ? "undefined" : syss[0];
							});
						}
					}
				});
		}])

	.controller('ViewSystemsCtrl', function ($q, $location, $route, $scope, $modal, screamMenu, Sys, descriptionTypes, Description, _) {

		// Load the data into the view
		$scope.syss = $route.current.locals.syss;
		$scope.current = $route.current.locals.current;
		console.log($scope.syss)

		$scope.addSys = function (sys) {
			sys.date = new Date();
			// Inject and clear the view
			return Sys.create(sys).then(function () {
				sys.name = '';
				sys.desc = '';
				sys.id = null;
			});
		}
		
		// Delete an System and its description.
		$scope.deleteSys = function (sys) {
			if (!_.isUndefined($scope.current) && $scope.current.id === sys.id) {
				if (!_.isUndefined($scope.syss[1])) {
					if ($scope.current.id == $scope.syss[0].id) {
						console.log("destroying current number 0")
						$scope.current = $scope.syss[1];
						Sys.update($scope.current.id, {current: 'true'}).then(function (value) {
							Sys.destroy(sys.id);
						});
					} else {
						console.log("destroying current number -- not 0")
						$scope.current = $scope.syss[0];
						Sys.update($scope.current.id, {current: 'true'}).then(function (value) {
							Sys.destroy(sys.id);
						});
					}
				} else {
					$scope.current = 'undefined';
				}
			} else {
				console.log("destroying non current");
				Sys.destroy(sys.id);
			}
		}

		$scope.selectAction = function (sys, location) {
			// We set all other Sys.current to false
			var deferred = [];
			_.each($scope.syss, function (allsys) {
				deferred.push(Sys.update(allsys.id, {current: 'false'}));
			})

			// We set the attack target as current
			$q.all(deferred).then(function (values) {
				Sys.update(sys.id, {current: 'true'}).then(function (value) {
					$location.path("/" + location + "/" + sys.id);
				});
			});
		}

		// Opens a modal to describe the attack
		$scope.describeSys = function (sys) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'myDescriptionModal',
				size: 'lg',
				resolve: {
					// We will need to fetch the existing description and feed it into the view
					sysDesc: function (Sys) {
						return Sys.loadRelations(sys.id, ['description']);
					}

				},
				controller: function ($scope, $modalInstance, Description, sysDesc, _) {

					// The model that will get the description back
					console.log(sysDesc.description);
					console.log(sysDesc);

					// The model where we store the values linked in the view (form)
					_.isUndefined(sysDesc.description) ? $scope.model = {} : $scope.model = sysDesc.description;

					$scope.sysMod = sysDesc;
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
						console.log('Addind description to sys:' + id);
						// Set the date and sysId before injecting
						$scope.model.date = new Date();
						$scope.model.sysId = id;
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
		
		Sys.bindAll({}, $scope, 'syss');

		$scope.secondLine = true;
		$scope.itemsMenu = screamMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSystems" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTTM" ? 'active' : 'brand';
		}

	});
