'use strict';

// Factory that loads schemas from json
angular.module('schemas', [])
  .factory('schemasFactory', function ($q, $http) {
    return {
      getFile: function (scheme) {
        var deferred = $q.defer(),
          httpPromise = $http.get('schemas/'+scheme);

        httpPromise.then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          console.error(error);
        });
 
        return deferred.promise;
      }
    };
  });