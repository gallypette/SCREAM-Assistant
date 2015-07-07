'use strict';

angular.module('myApp.rootLs', [])

        // Repository store handler
        .factory('Root', function (_, localStorageService, $filter) {

            return {
                "getAnalyses": function () {
                    var anal = localStorageService.get('repository') || [];
                    return anal;
                },
                "getAnalysis": function (match) {
                    var anal = localStorageService.get('repository') || [];
                    return anal = $filter('filter')({name: match}, true);
                },
                "addAnalysis": function (newAnalysis) {
                    var anal = localStorageService.get('repository') || [];
                    anal.push(newAnalysis);
                    console.log(anal);
                    localStorageService.set('repository', anal);
                },
                "deleteAnalysis": function (delAnalysis) {
                    var anal = localStorageService.get('repository') || [];
                    anal = _.reject(anal, function (item) {
                        return ((item.name == delAnalysis.name) && (item.desc == delAnalysis.desc))
                    });
                    localStorageService.set('repository', anal);
                }
            }
        })

        // Current analysis store handler
        .factory('Curr', function (_, localStorageService, $filter) {


        })
;