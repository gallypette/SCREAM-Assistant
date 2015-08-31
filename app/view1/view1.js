'use strict';

angular.module('myApp.view1', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl: 'view1/view1.html',
				controller: 'View1Ctrl'
			});
		}])

	.controller('View1Ctrl', function ($scope, Root, Current, _, analysisMenu, store, Stc) {

		// Setting the menu
		$scope.itemsMenu = analysisMenu;
		$scope.isActive = function (url) {
			return url === "#/view1" ? 'active' : '';
		}
		$scope.isActiveM = function (url) {
			return url === "#/viewAttackAnalysis" ? 'active' : 'brand';
		}
		$scope.unique = true;
		$scope.currentIsSet = false;

		var refresh = function () {
			$scope.analyses = Root.getAnalyses();
			$scope.current = Current.getCurrent();

			if (($scope.current == '') || ($scope.current == null)) {
				$scope.currentIsSet = false;
			} else {
				$scope.currentIsSet = true;
			}
		}


		$scope.addAnalysis = function () {
			if ((_.isUndefined(_.find($scope.analyses, function (item) {
				return ($scope.analysis.name == item.name)
			}))) && (
				$scope.current.name != $scope.analysis.name)
				) {
				$scope.unique = true;
				$scope.analysis.date = new Date();
				(_.isEmpty($scope.analysis)) ? "" : Root.addAnalysis($scope.analysis);
				$scope.analysis = ''
				refresh();
			} else {
				$scope.unique = false;
			}
		}

		$scope.addStc = function () {
			Stc.create({
				id: 1,
				name: $scope.stc.name,
				desc: $scope.stc.desc
//				date: $scope.stc.date,
//				current: false
			});
			console.log('injected');
		}

		$scope.deleteAnalysis = function (analysis) {
			Root.deleteAnalysis(analysis);
			refresh();
		}

		$scope.selectAnalysis = function (analysis) {
			Current.selectCurrent(analysis);
			refresh();
		}

		$scope.storeCurrent = function (analysis) {
			Current.storeCurrent(analysis);
			refresh();
		}

		refresh();
	});