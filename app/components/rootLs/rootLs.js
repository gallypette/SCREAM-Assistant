'use strict';

angular.module('myApp.rootLs', [])

        // Root store
        .factory('Root', function (localStorageService) {
            return {
                "getRoot": function () {
                    var root = localStorageService.get('root'); 
                    return root;
                },
                "setRoot": function (root) {
                    localStorageService.set('root', root);
                }
            }
        })
        
        // Analyses stores a set of analysis
        .factory('Analyses', function (Root) {
            return {
                "getAnalyses": function () {
                    var r = Root.getRoot(); 
                    return r || [];
                },
                "setAnalyses": function (newSet) {
                    Root.setRoot(newSet);
                }
            }
        })
        
        // Analysis stores the analysis details
        .factory('Analysis', function (Analyses) {
            return {
                "getAnalysis": function (id) {

                },
                "setAnalysis": function (newAnalysis) {

                }
            }
        });