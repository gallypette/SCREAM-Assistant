'use strict';

// The emTree directive prints the tree corresponding to an error mode 
angular.module('myApp.emTree', [])
	.directive('errorModeTree', ['$window', 'd3Service', function ($window, d3Service) {
			return {
				restrict: 'A',
				// I share the scope as I don't plan to have several trees on the same page.
				scope: false,
				link: function (scope, element, attrs) {
					d3Service.d3().then(function (d3) {
						
						var margin = {top: 0, right: 120, bottom: 20, left: 120},
						width = 960 - margin.right - margin.left,
							height = 500 - margin.top - margin.bottom;

						var svg = d3.select(element[0]).append("svg")
							.attr("width", width + margin.right + margin.left)
							.attr("height", height + margin.top + margin.bottom)
							.style('width', '100%')
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
						// Browser onresize event
						window.onresize = function () {
							scope.$apply();
						};
						
						// Watch for resize event
//						scope.$watch(function () {
//							return angular.element($window)[0].innerWidth;
//						}, function () {
//							update(scope.current.data);
//						});
						// Watch for change of current Error Mode
						scope.$watch('current.id', function (newData, oldData) {
							console.log(oldData);
							console.log(newData);
							root = scope.current.data;
							update(root);
						}, true);

						var i = 0;

						var tree = d3.layout.tree()
							.size([height, width]);

						var diagonal = d3.svg.diagonal()
							.projection(function (d) {
								return [d.y, d.x];
							});

						var root = scope.current.data;

						update(root);

						function update(source) {
							
							console.log("Updating the tree.");
							
							// Remove all previous items before rendering 
							svg.selectAll('*').remove();

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
									return d.category;
								})
								.style("fill-opacity", 1);
							
							nodeEnter.append("text")
								.attr("x", function (d) {
									return d.children || d._children ? -13 : 13;
								})
								.attr("dy", "1.55em")
								.attr("text-anchor", function (d) {
									return d.children || d._children ? "end" : "start";
								})
								.text(function (d) {
									return d.em;
								})
								.style("fill-opacity", 1);
							
							// Set the onClick
							nodeEnter.on("click", function(d, i){return scope.onClick({item: d});})

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