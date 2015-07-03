'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.analysis'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view1', {
                    templateUrl: 'view1/view1.html',
                    controller: 'View1Ctrl'
                });
            }])

        .controller('View1Ctrl', function ($scope, Analysis) {
            $scope.analyses = Analysis.getAnalyses();
            $scope.addAnalysis = function () {
                Analysis.addAnalysis($scope.analysis);
                // Clears the input text field
                $scope.analysis = '';
            }           
        });