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
//							Am.create({stcId: stc.id});
								return Stc.loadRelations(stc.id, ['atck']);
							});
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
						}
					}
				});
		}])

	.controller('View5Ctrl', function ($route, $scope, analysisMenu, Atck) {

		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view5" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}


		// Load the data into the view

		$scope.stc = $route.current.locals.stc;
		console.log($scope.stc);
		console.log($scope.stc.atcks);

		$scope.addAtck = function (atck) {
			// Set the date and stcId before injecting
			atck.date = new Date();
			atck.stcId = $scope.stc.id;
			// Inject and clear the view
			return Atck.create(atck).then(function () {
				atck.name = '';
				atck.desc = '';
				atck.id = null;
				console.log(atck.name + ' injected.');
			});
		}

		$scope.deleteAtck = function (atck) {
			Atck.destroy(atck.id);
		}

	});
