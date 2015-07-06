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
                "addAnalysis": function (name, desc) {
                    var tmp = {'name': name,
                        'desc': desc,
                        'date': new Date()
                    };
                    Root.addAnalysis(tmp);
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