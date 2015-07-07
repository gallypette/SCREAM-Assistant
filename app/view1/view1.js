'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.rootLs', 'underscore', 'ngReally'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/view1', {
                    templateUrl: 'view1/view1.html',
                    controller: 'View1Ctrl'
                });
            }])

        .controller('View1Ctrl', function ($scope, Root, _) {

            $scope.analyses = Root.getAnalyses();

            $scope.$watch('analyses', function (newValue, oldValue) {
                // Add
                if (newValue.length > oldValue.length) {
                    (_.isEmpty($scope.analysis)) ? "" : Root.addAnalysis($scope.analysis);
                    $scope.analysis = ''
                }
            }, true);

            $scope.addAnalysis = function () {
                $scope.analysis.date = new Date();
                $scope.analyses.push($scope.analysis);
            }

            $scope.deleteAnalysis = function (analysis) {
//                console.log("deleting "+analysis.name);
                $scope.analyses = _.reject($scope.analyses, function (item) {
                    return ((item.name == analysis.name) && (item.desc == analysis.desc))
                });
                Root.deleteAnalysis(analysis);
            }
        });