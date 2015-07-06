'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.rootLs', 'underscore'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view1', {
                    templateUrl: 'view1/view1.html',
                    controller: 'View1Ctrl'
                });
            }])

        .controller('View1Ctrl', function ($scope, Analyses, _) {

            $scope.analyses = Analyses.getAnalyses();

            $scope.$watch('analyses', function (newValue, oldValue) {
                (_.isEmpty($scope.analysis)) ? "" : Analyses.addAnalysis($scope.analysis);
                $scope.analysis = ''
            }, true);

            $scope.addAnalysis = function () {
                $scope.analysis.date = new Date();
                $scope.analyses.push($scope.analysis);
            }

            $scope.deleteAnalysis = function (analysis) {
//                console.log("deleting "+analysis.name);
                Analyses.deleteAnalysis(analysis);
            }
        });