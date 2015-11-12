/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {

    function NMUtilsMockData() {
        var mockData = {
            "getUUIDByName" : {
                "input" : {
                    "test1" : "default-domain:admin"
                },
                "output" : {
                    "test1" : "ca9d3c75-bf30-4bb7-8ebb-e3001ea3524b"
                }
            },
            "getMNConfigGraphConfig" : {
                "input": {
                    "test1" : {
                        "url" : "/api/tenant/monitoring/project-config-graph?fqName=default-domain:admin",
                        "elementNameObject": {
                            "fqName": "default-domain:admin"
                        },
                        "keySuffix": ":config",
                        "type": "project"
                    }
                },
                "output": {
                    "test1": {
                        "remote": {
                            "ajaxConfig": {
                                "url": "/api/tenant/monitoring/project-config-graph?fqName=default-domain:admin",
                                "type": "GET"
                            }
                        },
                        "cacheConfig": {
                            "ucid": "monitor-networking:graphs:default-domain:admin:config"
                        },
                        "focusedElement": {
                            "type": "project",
                            "name": {
                                "fqName": "default-domain:admin"
                            }
                        }
                    }
                }
            }
        };

        this.getInput = function(obj) {
            if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['input'][obj['type']] != null)
                return mockData[obj['fnName']]['input'][obj['type']];
            else
                return null;
        };

        this.getOutput = function(obj) {
            if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['output'][obj['type']] != null)
                return mockData[obj['fnName']]['output'][obj['type']];
            else
                return null;
        }

    }
    return new NMUtilsMockData();
});


