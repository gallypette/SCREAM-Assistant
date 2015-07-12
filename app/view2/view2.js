'use strict';

angular.module('myApp.view2', [])

	.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view2', {
				templateUrl: 'view2/view2.html',
				controller: 'View2Ctrl'
			});
		}])

	.controller('View2Ctrl', function ($scope, schemasFactory, xsltTransform) {

		var getScheme = function (scheme) {
			schemasFactory.getFile(scheme)
				.then(function (response) {
					return response;
				}, function (error) {
					console.error(error);
					return(error);
				});
		}

		var transform = function (xml, xsl) {
			xml = getScheme('cdcatalog.xml');
			xsl = getScheme('cdcatalog.xsl');
			return xsltTransform.trans(xml, xsl);
		}

		$scope.result = transform('cdcatalog.xml', 'cdcatalog.xsl');

	});