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

						// Define the zoom function for the zoomable tree
						function zoom() {
							svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						}

						// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
						var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

						var margin = {top: 0, right: 120, bottom: 20, left: 120},
						width = 960 - margin.right - margin.left,
							height = 1000 - margin.top - margin.bottom;

						var duration = 750;

						var svg = d3.select(element[0]).append("svg")
							.attr("width", width + margin.right + margin.left)
							.attr("height", height + margin.top + margin.bottom)
							.style('width', '100%')
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
							.call(zoomListener);

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
							if (oldData != newData)
							{
								update(scope.current.data);
							}
						}, true);

						var i = 0;

						var tree = d3.layout.tree()
							.size([height, width]);

						var diagonal = d3.svg.diagonal()
							.projection(function (d) {
								return [d.y, d.x];
							});

						// Append a group which holds all nodesd and which the zoom listener can act upon
						var svgGroup = svg.append("g");

						update(scope.current.data);

						function update(source) {

							console.log("Updating the tree.");
//							console.log(source);
//							console.log(root);

							// Compute the new tree layout.
							var nodes = tree.nodes(scope.current.data),
								links = tree.links(nodes);
							// Normalize for fixed-depth.
							// Décalage horizontal
							nodes.forEach(function (d) {
								d.y = d.depth * 180;
							});

							// Declare the nodes…
							var node = svgGroup.selectAll("g.node")
								.data(nodes, function (d) {
									return d.id || (d.id = ++i);
								});

							// Enter the nodes.
							var nodeEnter = node.enter().append("g")
								.attr("class", "node")
								.attr("transform", function (d) {
									return "translate(" + source.y0 + "," + source.x0 + ")";
								})
								.on("click", click);

							nodeEnter.append("circle")
								.attr("r", 10)
								.style("fill", function (d) {
									return (d.go == "true") ? "green" : "red";
								});

							nodeEnter.append("image")
								.attr("xlink:href", function (d) {
									return d.stop == "true" ? "icons/stop-sign.png" : "icons/Mail.png";
								})
								.attr("x", "12px")
								.attr("y", "-8px")
								.attr("width", "16px")
								.attr("height", "16px");

							nodeEnter.append("text")
								.attr("x", function (d) {
									return d.children || d._children ? -13 : 36;
								})
								.attr("dy", "0em")
								.attr("text-anchor", function (d) {
									return d.children || d._children ? "end" : "start";
								})
								.text(function (d) {
									return d.category;
								})
								.style("fill-opacity", 1);

							nodeEnter.append("text")
								.attr("x", function (d) {
									return d.children || d._children ? -13 : 36;
								})
								.attr("dy", "1.25em")
								.attr("text-anchor", function (d) {
									return d.children || d._children ? "end" : "start";
								})
								.text(function (d) {
									return d.em;
								})
								.style("fill-opacity", 1);

							// Transition nodes to their new position.
							var nodeUpdate = node.transition()
								.duration(duration)
								.attr("transform", function (d) {
									return "translate(" + d.y + "," + d.x + ")";
								});
							nodeUpdate.select("circle")
								.attr("r", 10)
								.style("fill", function (d) {
									return (d.go == "true") ? "green" : "red";
								});
							nodeUpdate.select("image")
								.attr("xlink:href", function (d) {
									return d.stop == "true" ? "icons/stop-sign.png" : "icons/Mail.png";
								});
							nodeUpdate.select("text")
								.style("fill-opacity", 1);

							// Transition exiting nodes to the parent's new position.
							var nodeExit = node.exit().transition()
								.duration(duration)
								.attr("transform", function (d) {
									return "translate(" + source.y + "," + source.x + ")";
								})
								.remove();
							nodeExit.select("circle")
								.attr("r", 1e-6);
							nodeExit.select("text")
								.style("fill-opacity", 1e-6);
							// Update the links…
							var link = svgGroup.selectAll("path.link")
								.data(links, function (d) {
									return d.target.id;
								});

							// Enter any new links at the parent's previous position.
							link.enter().insert("path", "g")
								.attr("class", "link")
								.attr("d", function (d) {
									var o = {x: source.x0, y: source.y0};
									return diagonal({source: o, target: o});
								});

							// Transition links to their new position.
							link.transition()
								.duration(duration)
								.attr("d", diagonal);

							// Transition exiting nodes to the parent's new position.
							link.exit().transition()
								.duration(duration)
								.attr("d", function (d) {
									var o = {x: source.x, y: source.y};
									return diagonal({source: o, target: o});
								})
								.remove();

							// Stash the old positions for transition.
							nodes.forEach(function (d) {
								d.x0 = d.x;
								d.y0 = d.y;
							});
						}

						// Toggle children on click.
						function click(d) {
							// Run the SCREAM engine
							d = scope.toggleAntecedent(d);
							console.log(d);
							// Update the tree
							update(d);
							return true;
						}
					});
				}};
		}]);