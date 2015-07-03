'use strict';

angular.module('myApp.analysis', [])
        .factory('Analysis', function (localStorageService) {
            return {
                "name": "Anonymous",
                "Id": null,
                "getAnalyses": function () {
                    var analysesInStore = localStorageService.get('analyses'); 
                    return analysesInStore || [];
                },
                "setAnalyses": function (newSet) {
                    localStorageService.set('analyses', newSet);
                }
            }
        });