'use strict';

angular.module('myApp.rootLs', [])

        // Root store handler
        .factory('Root', function (_, localStorageService, $filter) {

            return {
                "getAnalysesList": function () {
                    var anal = localStorageService.get('anal') || [];
                    return anal;
                },
                "getAnalysis": function (match) {
                    var anal = localStorageService.get('anal') || [];
                    return anal = $filter('filter')({name: match}, true);
                },
                "addAnalysis": function (newAnalysis) {
                    var anal = localStorageService.get('anal') || [];
                    anal.push(newAnalysis);
                    console.log(anal);
                    localStorageService.set('anal', anal);
                },
                "deleteAnalysis": function (delAnalysis) {
                    var anal = localStorageService.get('anal') || [];
                    anal = _.reject(anal, function(item){ return ((item.name == delAnalysis.name) && (item.desc == delAnalysis.desc)) });
                    localStorageService.set('anal', anal);
                }
            }
        })

        // Analyses stores a set of analysis
        .factory('Analyses', function (Root) {
            return {
                "getAnalyses": function () {
                    var r = Root.getAnalysesList();
                    return r;
                },
                "addAnalysis": function (newAnalysis) {
                    var tmp = {'name': newAnalysis.name,
                        'desc': newAnalysis.desc,
                        'date': newAnalysis.date
                    };
                    Root.addAnalysis(tmp);
                },
                "deleteAnalysis": function (delAnalysis) {
                    Root.deleteAnalysis(delAnalysis);
                }
            }
        })

        // Analysis stores one analysis's details
        .factory('Analysis', function (Analyses) {
            return {
                "getAnalysis": function (id) {

                },
                "setAnalysis": function (newAnalysis) {

                }
            }
        });