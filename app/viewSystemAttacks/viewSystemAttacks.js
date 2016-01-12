'use strict';
angular.module('myApp.viewSystemAttacks', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
				// when we land directly on the system by the use of the button
				when('/viewSystemAttacks/:id', {
					templateUrl: 'viewSystemAttacks/viewSystemAttacks.html',
					controller: 'ViewSystemAttacksCtrl',
					resolve: {
						sys: function ($route, Sys, Atck) {
							return Sys.find($route.current.params.id).then(function (sys) {
								return Sys.loadRelations(sys.id, ['Atck']);
							});
						}
					}
				}).
				// .when we land on the system via the navbar
				when('/viewSystemAttacks', {
					templateUrl: 'viewSystemAttacks/viewSystemAttacks.html',
					controller: 'ViewSystemAttacksCtrl',
					resolve: {
						sys: function ($route, $location, Sys, Atck, Analysis, Description, _) {
							return Sys.findAll({current: 'true'}, {cacheResponse: false}).then(function (syss) {
								if (_.isUndefined(syss[0])) {
									$location.path("/viewSystems/");	
								} else {
									return Sys.loadRelations(syss[0].id, []);
								}
							})
						}
					}
				});
		}])

	.controller('ViewSystemAttacksCtrl', function ($route, $scope, $modal, screamMenu, Atck, descriptionTypes, Description, Analysis, _) {

		
		
		// First we check if previously added attacks are still 
		// Compatible with the current system's Threat Model
		
		
		//use compare TM on	$route.current.locals.sys
		$scope.sys = $route.current.locals.sys;
		// Load the data into the view
//		$scope.sys = resultAtcks;

		$scope.secondLine = true;
		$scope.itemsMenu = screamMenu;
		$scope.isActive = function (url) {
			return url === "#/viewSystemAttacks" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewSTTM" ? 'active' : 'brand';
		}

	});
