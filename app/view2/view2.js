'use strict';

angular.module('myApp.view2', [])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view2', {
                    templateUrl: 'view2/view2.html',
                    controller: 'View2Ctrl'
                });
            }])

        .controller('View2Ctrl', function ($scope, schemasFactory) {

            $scope.creamtab = {};
            schemasFactory.getCream()
                    .then(function (response) {
                        $scope.creamtab = response;
                    }, function (error) {
                        console.error(error);
                    });

        });