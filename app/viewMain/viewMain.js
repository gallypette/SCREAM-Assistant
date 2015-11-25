'use strict';

angular.module('myApp.viewMain', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/viewMain', {
				templateUrl: 'viewMain/viewMain.html',
				controller: 'ViewMainCtrl'
			});
		}])

	.controller('ViewMainCtrl', function ($scope, $modal) {
		// Export localStorage through a blob
		var content = JSON.stringify(localStorage);
		var blob = new Blob([content], {type: 'text/plain'});
		$scope.url = (window.URL || window.webkitURL).createObjectURL(blob);

		// Import file into localStorage
		$scope.import = function () {
			var f = document.getElementById('file').files[0],
				r = new FileReader();
			r.onloadend = function (e) {
				console.log("[+] Loading file into localStorage...");
				var data = JSON.parse(e.target.result);
				for (var key in data) {
					localStorage[key] = data[key];
				}
				console.log("[+] File loaded!")
				// Display a modal for the user' feedback
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'loadingStateModal',
					size: 'sg',
					controller: function ($scope, $modalInstance) {
						// Dimiss the modal when OK is clicked.
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					}
				});
			}
			r.readAsBinaryString(f);
		}
	});