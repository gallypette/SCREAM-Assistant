'use strict';

angular.module('myApp.analysis', [])
        .factory('Analysis', function () {
            var analyses = ['item 1', 'sdfqsdf', 'item3'];
            return {
                "name": "Anonymous",
                "Id": null,
                "getAnalyses": function () {
                    return analyses;
                },
                "addAnalysis": function (newAnalysis) {
                    analyses.push(newAnalysis);
                }
            }
        });