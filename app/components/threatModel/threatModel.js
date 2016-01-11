'use strict';
// Holds function related to error modes and emtrees 
angular.module('myApp.threatModel', [])
	.factory('threatModel', ['_', 'descriptionTypes', 'Description', function (_, descriptionTypes, Description) {
			// Private methods
			var prChecked = function (d, field) {
				if(!_.isUndefined(d[field+"-required"])){
					var checked = d[field+"-required"];
				}else{
					var checked = false;	
				}
				return checked;
			};

			// Public methods
			var obj = {};

			// return true if d2 attack fits into d1 threat model
			obj.compare = function (d1, d2, mode) {
				var result = false;
				// First, we check if both descriptions use the 
				// same schema
				if (d1.type == d2.type) {
					console.log(d1)
					console.log(d2)
					// We get the list of fields that can be required
					var schema = _.findWhere(descriptionTypes, {name: d1.type});
					var prFields = _.filter(schema.fields, function (value) {
						return value.pr === 'true';
					});
					_.each(prFields, function (element, index, list) {
						if (prChecked(d1, element.fieldName) && prChecked(d2, element.fieldName)) {
							console.log("d1 d2 checked, investigating "+element.fieldName);
							// We need to check further if d1 == d2
							// First we check if they are defined
							
							// The we check the equality
							switch (element.type) {
								case 'text':
									(d1[element.fieldName] === d2[element.fieldName]) ? result = true : result = false;
									console.log("text equality check "+element.fieldName);
									break;

								case 'boolean':
									(d1[element.fieldName] === d2[element.fieldName]) ? result = true : result = false;
									console.log("boolean equal check "+element.fieldName);
									break;

								case 'list':
									// TODO
									console.log("list todo "+element.fieldName);
									break;
								default:
									result = false;
							}
						} else if (prChecked(d1, element.fieldName) && !prChecked(d2, element.fieldName)) {
							console.log("Attacker can do more than required "+element.fieldName);
							// In this case, the attacker can do more than what
							// is required by d2
							result = true;
						} else if (!prChecked(d1, element.fieldName) && prChecked(d2, element.fieldName)) {
							console.log("Attacker can do less than required "+element.fieldName);
							// In this case, the attacker can do less than what
							// is required by d2
							result = false;
						}
					});
				} else {
					result = false;
				}
				return result;
			};
			return obj;
		}]);