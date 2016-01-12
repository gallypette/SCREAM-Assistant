'use strict';
// Holds function related to error modes and emtrees 
angular.module('myApp.threatModel', [])
	.factory('threatModel', ['_', 'descriptionTypes', 'Atck', 'Description', 'Sys', '$q', function (_, descriptionTypes, Atck, Description, Sys, $q) {
			// Private methods
			var prChecked = function (d, field) {
				if (!_.isUndefined(d[field + "-required"])) {
					var checked = d[field + "-required"];
				} else {
					var checked = false;
				}
				return checked;
			};

			// return true if d2 attack fits into d1 threat model
			var compareDesc = function (d1, d2) {
				var result = true;
				// First, we check if both descriptions use the 
				// same schema
//				console.log(d2);
				if (d1.type == d2.type) {
//					console.log(d1)
//					console.log(d2)
					// We get the list of fields that can be required
					var schema = _.findWhere(descriptionTypes, {name: d1.type});
					var prFields = _.filter(schema.fields, function (value) {
						return value.pr === 'true';
					});
					var test = [];
					_.each(prFields, function (element, index, list) {
						if (prChecked(d1, element.fieldName) && prChecked(d2, element.fieldName)) {
//							console.log("d1 d2 checked, investigating " + element.fieldName);
							// We need to check further if d1 == d2
							// First we check if d2 is defined
							if (_.isUndefined(d2[element.fieldName]) || (d2[element.fieldName] === false)) {
								test[index] = true;
							} else {
								// We check depending on the type
								switch (element.type) {
									case 'text':
										test[index] = true;
										break;

									case 'boolean':
										test[index] = true;
										break;

									case 'list':
										// If the value of d2 is contained in the list of d1
										// or, if d1 is 'undef' (any in the UI)
										if (_.contains(d1[element.fieldName], 'undef') || _.isUndefined(d1[element.fieldName])) {
//											console.log('undef')
											test[index] = true;
										} else if (_.contains(d1[element.fieldName], d2[element.fieldName])) {
											test[index] = true;
										} else {
											test[index] = false;
										}
										break;
									default:
										test[index] = false;
								}
							}
						} else if (prChecked(d1, element.fieldName) && !prChecked(d2, element.fieldName)) {
//							console.log("Attacker can do more than required " + element.fieldName);
							// In this case, the attacker can do more than what
							// is required by d2
							test[index] = true;
						} else if (!prChecked(d1, element.fieldName) && prChecked(d2, element.fieldName)) {
//							console.log("Attacker can do less than required " + element.fieldName);
							// In this case, the attacker can do less than what
							// is required by d2
							test[index] = false;
						} else if (!prChecked(d1, element.fieldName) && !prChecked(d2, element.fieldName)) {
//							console.log("Both unchecked " + element.fieldName);
							// In this case, the attacker can do less than what
							// is required by d2
							test[index] = true;
						}
//						console.log(test);
					});
				} else {
					result = false;
				}
				return result && !_.contains(test, false);
			};

			// Public methods
			var obj = {};

			// Function that creates a list of compatible Attack
			// for a given system
			obj.buildCompatibles = function (sys, filter) {
				if (_.isUndefined(filter)) {
					var filter = {};
				}
				return $q(function (resolve, reject) {
					Atck.findAll(filter, {bypassCache: true}).then(function (atcks) {
						// Here we filter the attack to get only the one compatible
						// With the system's threatModel
						var deferred = [];
						_.each(atcks, function (atck) {
							deferred.push(Atck.loadRelations(atck.id, ['description'], {bypassCache: true}));
						});
						var compatibleAtcks = [];
						$q.all(deferred).then(function (values) {
							compatibleAtcks = _.chain(values)
								.filter(function (value) {
									if (!_.isUndefined(value.description)) {
										return compareDesc(sys.description, value.description);
									}
								});
							compatibleAtcks = _(compatibleAtcks).value();
							resolve(_.difference(compatibleAtcks, sys.atcks));
						});
					});
				});
			};

			// Function that verifies that the Attack linked to 
			// a system are still compatible
			// return an array of incompatible attacks
			// that should be removed
			obj.verifyCompatibility = function (sys) {
				return $q(function (resolve, reject) {
					var incompatibleAtcks = [];
					Sys.loadRelations(sys.id, ['description', 'atck'], {bypassCache: true}).then(function (sys) {
						// Then we load the description of each linked atck
						var deferred = [];
						_.each(sys.atcks, function (atck) {
							deferred.push(Atck.loadRelations(atck.id, ['description'], {bypassCache: true}));
						});
						// We compute the list of compatible attacks
						// linked with the system
						var compatibleAtcks = [];
						$q.all(deferred).then(function (values) {
							compatibleAtcks = _.chain(values)
								.filter(function (value) {
									if (!_.isUndefined(value.description)) {
										return compareDesc(sys.description, value.description);
									}
								});
							compatibleAtcks = _(compatibleAtcks).value();
							// We return the list of incompatible linked attacks
							resolve(_.difference(sys.atcks, compatibleAtcks));
						});
					});
				});
			};

			// Function that compiles all the STC that
			// are compatible with the system's Threat Model
			// So it lists all the compatible attacks that are linked 
			// to an STC and then return the 
			// STC / atck.analysis.ems.antecedent couples
			obj.speStc = function (sys) {
				var filter = {
					where: {
						stcId: {
							'!=': "undefined"
						}
					}
				};
				return this.buildCompatibles(sys, filter);
			};
			return obj;
		}]);