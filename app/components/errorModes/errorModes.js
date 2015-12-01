'use strict';
// Holds function related to error modes and emtrees 
angular.module('myApp.errorModes', [])
	.factory('errorModes', ['_', function (_) {
			// Private methods
			var findGA = function (d, scope) {
				// We go through categories 1-3
				var pointer = {};
				for (var i = 1; i < 4; i++) {
					_.each(scope.creamtable.cream.category[i].group, function (value, key, list) {
						// lone elements are not into an array but are an object in CREAM.xml
						if (_.isArray(value.gc)) {
							_.each(value.gc, function (vgc, kgc, lgc) {
								if (vgc.name === d.em) {
									pointer = vgc;
								}
							});
						} else if (_.isObject(value.gc)) {
							if (value.gc.name === d.em) {
								pointer = value.gc;
							}
						}
					});
				}
				return pointer;
			};

			// Builds the path of a node
			var getPath = function (d) {
				var path = [];
				for (var i = d.depth; i != 0; i--) {
					path[d.depth] = {
						"category": d.category,
						"em": d.em
					};
					d = d.parent;
				}
				return path;
			};

			// Recursive tree traversal and update
			var traverseMatch = function (path, d, tree) {
				var trail = "";
				_.each(tree.children, function (value, key, list) {
					if (value.em == path[0].em) {
						trail = "children[" + key + "]";
						if (path.length > 1) {
							trail += '.' + traverseMatch(_.rest(path), d, value);
						}
					}
				});
				return trail;
			};

			// Function tha recursively find the SA nodes with stop rule engaged
			var findSR = function (tounstop, d) {
				if (d.category === 'GA' && isOpened(d)) {
					return _.union(tounstop, d.children.reduce(findSR, tounstop));
				} else if (d.category === 'SA' && d.stop === 'true') {
					return _.union(tounstop, [d]);
				} else {
					return tounstop;
				}
			};

			// Functions that return true if the node is opened
			var isOpened = function (d, scope) {
				return !(d.children === null || _.isUndefined(d.children))
			};

			// Function that returns true if a GA node is constrained by a stop rule
			var isConstrainedGA = function (d, scope) {
				return (d.go === 'true' && !isOpened(d));
			};

			// Function that returns true if the node is GA
			var isGA = function (d, scope) {
				return d.category === 'GA';
			};

			// Function that adds to an array node's children GA that are constrained by a SR
			var getConstrainedGA = function (toexpand, d, scope) {
				if (!_.isUndefined(d.children)) {
					return _.union(toexpand, d.children.filter(isConstrainedGA));
				} else {
					return toexpand;
				}
			};

			// Function that adds to an array node's children GA that are currently opened
			var getOpenedGA = function (toclose, d, scope) {
				if (!_.isUndefined(d.children)) {
					return _.union(toclose, d.children.filter(isOpened));
				} else {
					return toclose;
				}
			};

			// Public methods
			var obj = {};


			// Functions that find the antecedents for the next depth
			obj.digAntecedent = function (d, scope) {
				console.log(d);
				var pointer = {};
				// We investigate the root by parsing category0
				if (d.depth == 0) {
					_.each(scope.creamtable.cream.category[0].group.gc, function (value, key, list) {
						_.each(value.sc, function (vsc, ksc, lsc) {
							if (vsc.name === d.em) {
								pointer = value;
							}
						});
					});
				} else if (d.category == 'GA') {
					pointer = findGA(d, scope);
				}
				// Once pointer point on the right node in CREAM's tree, we populate the tree
				var children = [];
				// lone elements are not into an array but are an object in CREAM.xml
				if (_.isArray(pointer.sa)) {
					_.each(pointer.sa, function (value, key, list) {
						children.push({
							"category": "SA",
							"em": value.name,
							"go": "false",
							"stop": "false"});
					});
				} else if (_.isObject(pointer.sa) && (pointer.sa.name != 'None defined')) {
					children.push({
						"category": "SA",
						"em": pointer.sa.name,
						"go": "false",
						"stop": "false"});
				}
				if (_.isArray(pointer.ga)) {
					_.each(pointer.ga, function (value, key, list) {
						children.push({
							"category": "GA",
							"em": value.name,
							"go": "false",
							"stop": "false"});
					});
				} else if (_.isObject(pointer.ga) && (pointer.sa.name != 'None defined')) {
					children.push({
						"category": "GA",
						"em": pointer.ga.name,
						"go": "false",
						"stop": "false"});
				}
				return children;
			};

			// Function that check the state of the stop rule on a node's siblings 
			obj.stopStateN = function (d, scope) {
				var stoprule = "false";
				if (d.depth > 0) {
					_.each(d.parent.children, function (value, key, list) {
						if (value.stop == "true" && value.em != d.em) {
							stoprule = "true";
							console.log("One sibling is stopped");
						}
					});
				}
				return stoprule;
			};

			// Function that check the state of the stop rule on a node's siblings 
			obj.stopStateN1 = function (d, scope) {
				var stoprule = "false";
				if (d.depth > 1) {
					_.each(d.parent.parent.children, function (value, key, list) {
						if (value.stop == "true") {
							stoprule = "true";
							console.log("One parent's sibling is stopped");
						}
					});
				}
				return stoprule;
			};

			// Function that updates the RCA state when a stop rule is removed
			obj.removeStopRule = function (d, scope) {
				// We need to find out the closed GA that should now be opened
				var tocheck = d.parent.children.filter(isGA);
				var toexpand = tocheck.reduce(getConstrainedGA, []);
				_.each(toexpand, function (value, key, list) {
					value.children = obj.digAntecedent(value, scope);
				});
				// Eventually set the Stop rule to false.
				d.stop = "false";
			};

			// Function that updates the RCA state when a stop rule is added
			obj.addStopRule = function (d, scope) {
				// We need to check if there was already a stop rule engaged
				// in n+* depth. Then remove it before adding this one.
				var tounstop = d.parent.children.reduce(findSR, []);
				_.each(tounstop, function (value, key, list) {
					obj.removeStopRule(value);
				});
				// We need to check if some GA needs to be closed.
				var tocheck = d.parent.children.filter(isGA);
				var toclose = tocheck.reduce(getOpenedGA, []);
				_.each(toclose, function (value, key, list) {
					// the node is closed, but is still present in the analysis
					value.children = null;
					value._children = null;
					value.go = 'true';
				});
				d.stop = 'true';
			};

			// Function that ensures that d is updated in root
			obj.matchRoot = function (d, scope) {
				// First we do a reverse tree traversal to find where this node is
				var path = getPath(d, scope);
				path = _.rest(path);
				var trail = '';
				// Then a tree traversal to check the value of the node
				if (path.length > 0) {
					trail = traverseMatch(path, d, scope.current.data);
				}
				return new Array(scope.current.data, d, trail);
			};

			// Function that ensures that the analysis reached an end
			obj.analysisCompleted = function (em) {
				return !_.isEmpty(em.data.children.reduce(findSR, []))
			};

			// Function that lists the antecedents selected as possible contributors.
			obj.analysisResults = function (em) {
				// TODO
				return em.data.children.reduce(findSR, []);
			}

			return obj;

		}]);