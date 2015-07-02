'use strict';
angular.module('myApp.em', ['d3'])
        .directive('errorMode', ['$window', 'd3Service', function ($window, d3Service) {
                return {
                    restrict: 'A',
                    scope: {
                        data: '=',
                        label: '@',
                        onClick: '&'
                    },
                    link: function (scope, element, attrs) {
                        d3Service.d3().then(function (d3) {
//                            var svg = d3.select(element[0])
//                                    .append('svg')
//                                    .style('width', '100%');

                            var margin = {top: 20, right: 120, bottom: 20, left: 120},
                            width = 960 - margin.right - margin.left,
                                    height = 500 - margin.top - margin.bottom;

                            var svg = d3.select(element[0]).append("svg")
                                    .attr("width", width + margin.right + margin.left)
                                    .attr("height", height + margin.top + margin.bottom)
                                    .append("g")
                                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                            // Browser onresize event
                            window.onresize = function () {
                                scope.$apply();
                            };
                            // Watch for resize event
                            scope.$watch(function () {
                                return angular.element($window)[0].innerWidth;
                            }, function () {
//                                scope.render(scope.data);
                            });
                            // Watch for change in the data
//                            scope.$watch('data', function (newData) {
//                                scope.render(newData);
//                            }, true);

                            // Our d3 code
//                            scope.render = function (data, svg) {

                            // Remove all previous items before rendering 
//                                svg.selectAll('*').remove();

                            // If we don't pass any data, return out of the element
//                                if (!data)
//                                    return;

                            var i = 0;

                            var tree = d3.layout.tree()
                                    .size([height, width]);

                            var diagonal = d3.svg.diagonal()
                                    .projection(function (d) {
                                        return [d.y, d.x];
                                    });

                            var root = scope.data[0];

                            update(root);

                            function update(source) {

                                // Compute the new tree layout.
                                var nodes = tree.nodes(root).reverse(),
                                        links = tree.links(nodes);

                                // Normalize for fixed-depth.
                                nodes.forEach(function (d) {
                                    d.y = d.depth * 180;
                                });

                                // Declare the nodes…
                                var node = svg.selectAll("g.node")
                                        .data(nodes, function (d) {
                                            return d.id || (d.id = ++i);
                                        });

                                // Enter the nodes.
                                var nodeEnter = node.enter().append("g")
                                        .attr("class", "node")
                                        .attr("transform", function (d) {
                                            return "translate(" + d.y + "," + d.x + ")";
                                        });

                                nodeEnter.append("circle")
                                        .attr("r", 10)
                                        .style("fill", "#fff");

                                nodeEnter.append("text")
                                        .attr("x", function (d) {
                                            return d.children || d._children ? -13 : 13;
                                        })
                                        .attr("dy", ".35em")
                                        .attr("text-anchor", function (d) {
                                            return d.children || d._children ? "end" : "start";
                                        })
                                        .text(function (d) {
                                            return d.name;
                                        })
                                        .style("fill-opacity", 1);

                                // Declare the links…
                                var link = svg.selectAll("path.link")
                                        .data(links, function (d) {
                                            return d.target.id;
                                        });

                                // Enter the links.
                                link.enter().insert("path", "g")
                                        .attr("class", "link")
                                        .attr("d", diagonal);

                            }

                        });
                    }};
            }]);