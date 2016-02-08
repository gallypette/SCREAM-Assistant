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
			// Function tha recursively find the contributors
			var findContributors = function (selected, d) {
				// GA is opened, we go deeper
				if (d.category === 'GA' && isOpened(d)) {
					return _.union(selected, d.children.reduce(findContributors, selected));
					// GA closed because of the stop rule, added to the selected list
				} else if (d.category === 'GA' && !isOpened(d) && d.go === 'true') {
					return _.union(selected, [d]);
				} else if (d.category === 'SA' && d.go === 'true') {
					return _.union(selected, [d]);
				} else {
					return selected;
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
			// Function that recursively find the SA nodes with stop rule engaged
			var findSR = function (tounstop, d) {
				if (d.category === 'GA' && isOpened(d)) {
					return _.union(tounstop, d.children.reduce(findSR, tounstop));
				} else if (d.category === 'SA' && d.stop === 'true') {
					return _.union(tounstop, [d]);
				} else {
					return tounstop;
				}
			};
			// Recursive function that looks for a property 
			// in the parent nodes.
			var findUpstairs = function (d, c1, c2, holder) {
				var up = false;
				// We look at our siblings
				if (!_.isUndefined(d.parent)) {
					_.each(d.parent.children, function (value, key, list) {
						if (value[c1] == c2) {
							holder = value;
							up = false;
						} else {
							up = true;
						}
					});
					if (up) {
						holder = findUpstairs(d.parent, c1, c2, holder);
					}
				}
				return holder;
			};
			// Remove a stop rule check further checks,
			// checks where made elsewhere
			var removeStopRuleDirectly = function (d) {
				d.stop = 'false';
			};
			var addStopRuleDirectly = function (d) {
				console.log(d)
				d.stop = 'true';
			};
			
			// Public methods
			var obj = {};
			// Functions that find the antecedents for the next depth
			obj.digAntecedent = function (d, scope) {
//				console.log(d);
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
				if (_.isArray(pointer.sc)) {
					_.each(pointer.sc, function (value, key, list) {
						children.push({
							"category": "SC",
							"em": value.name,
							"go": "false",
							"desc": value.desc.replace(/[\n\r\s+\s]/g, ' ')});
					});
				} else if (_.isObject(pointer.sc) && (pointer.sc.name != 'None defined')) {
					children.push({
						"category": "SC",
						"em": pointer.sc.name,
						"go": "false",
						"desc": pointer.sc.desc.replace(/[\n\r\s+\s]/g, ' ')});
				}if (_.isArray(pointer.ga)) {
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
							console.log("[+] One sibling is stopped");
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
							console.log("[+] One parent's sibling is stopped");
						}
					});
				}
				return stoprule;
			};
			// Function that recursivaly looks downstairs
			// for SA that could carry the stop rule
			var findDownStairSA = function (tocarry, d) {
				if (d.category === 'GA' && isOpened(d)) {
					return _.union(tocarry, d.children.reduce(findDownStairSA, tocarry));
				} else if (d.category === 'SA' && d.go === 'true') {
					return _.union(tocarry, [d]);
				} else {
					return tocarry;
				}
			};
			// Function that updates the RCA state when a stop rule is removed
			obj.removeStopRule = function (d, scope) {
				console.log('Removing stop rule')
				// We need to find out the closed GA that should now be opened
				var tocheck = d.parent.children.filter(isGA);
				var toexpand = tocheck.reduce(getConstrainedGA, []);
				_.each(toexpand, function (value, key, list) {
					value.children = obj.digAntecedent(value, scope);
				});
				var toSet = false;
				// Who should now carry the stop rule ???
				// We check if it should be a sibling 
				_.each(d.parent.children, function (value, key, list) {
					if (value.stop == "false" && value.category === 'SA' && value.go == 'true' && !toSet) {
						toSet = value;
					}
				});
				// Then we check down the line
				if (!toSet) {
					var toSet = d.parent.children.reduce(findDownStairSA, [])[0];
				}
				// Eventually set the Stop rule to false.
				d.stop = "false";
				// Set the carried stop rule on 'the one' 
				if (toSet) {
					addStopRuleDirectly(toSet);
				}
			};
			// Function that updates the RCA state when a stop rule is added
			obj.addStopRule = function (d, scope) {
				console.log('[+] Adding stop rule')
				var prevent = false;
				// We need to check if there is a stop rule engaged in the
				// parents of this node: if so, we don't add the stop rule
				var test = findUpstairs(d.parent, "stop", "true", false);
				if (test != false) {
					console.log('[+] Stop rule prevented - already set upstairs')
					prevent = true;
				}
				;
				// The we check if there was already a stop rule engaged
				// in n+* depth. Then remove it before adding this one.
				var tounstop = d.parent.children.reduce(findSR, []);
				_.each(tounstop, function (value, key, list) {
					removeStopRuleDirectly(value);
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
				if (!prevent) {
					d.stop = 'true';
				}
			};
			// Function that ensures that the analysis reached an end
			obj.analysisCompleted = function (em) {
				if (!_.isEmpty(em.data.children)) {
					return !_.isEmpty(em.data.children.reduce(findSR, []));
				} else {
					return false;
				}
			};
			// Function that lists the antecedents selected as possible contributors.
			obj.analysisResults = function (em) {
				return em.data.children.reduce(findContributors, []);
			}
			// Function that crunches duplicate antecedents together,
			// but still distinguishing the different descriptions (or TM)
			// and associated comments.
			// The end result is an array  of objects where the antecedent are keys
			// to an array of tuples (comment / description) are the values
			obj.analysisResultsSTC = function (table) {
				var init = [];
				var results = [];
				var keys = [];
				// Throws everything in an Array
				_.each(table, function (element, index, list) {
					_.each(element.ant, function (element1, index1, list1) {
						init.push({ant: element1, context: [[element.em, element.description]]});
						keys.push([element1.category, element1.em]);
					});
				});
				// Remove duplicate keys
				keys = _.uniq(keys, function (x) {
					return x[0] + x[1];
				});
				// Build the final object for each key
				_.each(keys, function (element, index, list) {
					// Group same antecedents together
					var tmp = _.filter(init, function (obj) {
						return obj.ant.category === element[0] && obj.ant.em === element[1];
					});
					// Compile the context into the modes array
					var context = []
					_.each(tmp, function (element2, index2, list2) {
						context.push(element2.context[0]);
					});
					// Compile the comments into the comments array
					var comments = []
					_.each(tmp, function (element3, index3, list3) {
						if (!_.isUndefined(element3.ant.comment)) {
							comments.push(element3.ant.comment);
						}
					});
					results.push({ant: element[0] + "-" + element[1], modes: context, comments: comments});
				});
				return results;
			}
			return obj;
		}]);