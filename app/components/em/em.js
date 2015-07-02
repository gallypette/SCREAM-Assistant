'use strict';

angular.module('myApp.em', ['d3'])
        .controller('emController', ['$scope', function ($scope) {
                $scope.data = [
                    {
                        "name": "Top Level",
                        "parent": "null",
                        "children": [
                            {
                                "name": "Level 2: A",
                                "parent": "Top Level",
                                "children": [
                                    {
                                        "name": "Son of A",
                                        "parent": "Level 2: A"
                                    },
                                    {
                                        "name": "Daughter of A",
                                        "parent": "Level 2: A"
                                    }
                                ]
                            },
                            {
                                "name": "Level 2: B",
                                "parent": "Top Level"
                            }
                        ]
                    }
                ];
            }])
        .directive('errorMode', ['$window', 'd3Service', function ($window, d3Service) {
                return {
                    // We use link because of the way we inject the d3 dependency
                    link: function (scope, element, attrs) {
                        d3Service.d3().then(function (d3) {
                            // d3 is the raw d3 object
                            var svg = d3.select(element[0])
                                    .append("svg")
                                    .style('width', '100%');

                        });
                    }}
            }]);