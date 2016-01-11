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
								console.log(stc);
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
						stc: function ($route, $location, Stc, Atck, Analysis, Description, _) {
							return Stc.findAll({current: 'true'}, {cacheResponse: false}).then(function (stcs) {
								if (_.isUndefined(stcs[0])) {
									$location.path("/viewSTCs/");	
								} else {
									return Stc.loadRelations(stcs[0].id, []);
								}
							})
						}
					}
				});
		}])

	.controller('ViewSTCAttacksCtrl', function ($route, $scope, $modal, stcMenu, Atck, descriptionTypes, Description, Analysis, _) {

		// Load the data into the view
		$scope.stc = $route.current.locals.stc;

		$scope.secondLine = true;
		$scope.itemsMenu = stcMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSTCAttacks" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTC" ? 'active' : 'brand';
		}

	});
