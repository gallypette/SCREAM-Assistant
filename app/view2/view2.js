'use strict';

angular.module('myApp.view2', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view2', {
				templateUrl: 'view2/view2.html',
				controller: 'View2Ctrl'
			});
		}])

	.controller('View2Ctrl', function ($sce, $scope, $q, schemasFactory, xsltTransform) {

		var getScheme = function (scheme) {
		}

		var transform = function (xml, xsl) {

			var xmlFile = schemasFactory.getFile(xml)
				.then(function (response) {
					return response;
				}, function (error) {
					console.error(error);
					return(error);
				});

			var xslFile = schemasFactory.getFile(xsl)
				.then(function (response) {
					return response;
				}, function (error) {
					console.error(error);
					return(error);
				});

			$q.all([xmlFile, xslFile]).then(function wrapUp(files) {
				var transformResult = xsltTransform.transformXml(files[0].data, files[1].data);
				console.log(transformResult);
				$scope.result = $sce.trustAsHtml( transformResult );
				return true;
			});
		}

		transform('cdcatalog.xml', 'cdcatalog.xsl');
	});