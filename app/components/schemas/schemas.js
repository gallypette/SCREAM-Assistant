'use strict';

// Factory that loads scheams from json
angular.module('schemas', [])
  .factory('schemasFactory', function ($q, $http) {
    return {
      getCream: function () {
        var deferred = $q.defer(),
          httpPromise = $http.get('schemas/creamTables.json');

        httpPromise.then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          console.error(error);
        });
 
        return deferred.promise;
      }
    };
  });