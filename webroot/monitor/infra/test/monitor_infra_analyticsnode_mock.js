/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
function InfraAnalyticsMockData() {
    var mockData = {
		'processGenerators' : {
            input: {
            	'test1' : {
            		
            	}
            },
            output: {
            	'test1':{
            		
            	}
            }
		},
		'parseQEQueries': { 

            		    "input" : {
                "test1" : {
                    "QueryStats" : {
                        "pending_queries" : [],
                        "queries_being_processed" : [ {
                            "enqueue_time" : 1392073431132527,
                            "progress" : 15,
                            "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]', 'enqueue_time': '1392073431132674', 'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                            "query_id" : "9b247a9c-92a7-11e3-a99f-00000a540521"
                        } ]
                    }
                },
                "test2" : {},
                "test3" : {
                    "QueryStats" : {
                        "pending_queries" : [],
                        "queries_being_processed" : [ {
                            "progress" : 15,
                            "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]',  'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                            "query_id" : "9b247a9c-92a7-11e3-a99f-00000a540521"
                        } ]
                    }
                }
            },
            "output" : {
                "test1" : [ {
                    "progress" : "15 %",
                    "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]', 'enqueue_time': '1392073431132674', 'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                    "raw_json" : {
                        "enqueue_time" : 1392073431132527,
                        "progress" : 15,
                        "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]', 'enqueue_time': '1392073431132674', 'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                        "query_id" : "9b247a9c-92a7-11e3-a99f-00000a540521"
                    },
                    "time" : "2/11/14 4:33:51"
                } ],
                "test2" : [],
                "test3" : [ {
                    "progress" : "15 %",
                    "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]',  'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                    "raw_json" : {
                        "progress" : 15,
                        "query" : "{'sort': '2', 'start_time': '1392072855202000', 'sort_fields': '[\"MessageTS\"]',  'filter': '[{\"name\": \"Type\", \"value\": \"1\", \"op\": 1}, {\"name\": \"Level\", \"value\": \"4\", \"op\": 5}]', 'limit': '10', 'end_time': '1392073455203000', 'select_fields': '[\"MessageTS\", \"Type\", \"Source\", \"ModuleId\", \"Messagetype\", \"Xmlmessage\", \"Level\", \"Category\"]', 'table': '\"MessageTable\"'}",
                        "query_id" : "9b247a9c-92a7-11e3-a99f-00000a540521"
                    },
                    "time" : "-"
                } ]
            }
		}
    }
    this.getInput = function(obj) {
        if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['input'][obj['type']] != null)
            return mockData[obj['fnName']]['input'][obj['type']];
         else
             return null;
     },
     this.getOutput = function(obj) {
        if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['output'][obj['type']] != null)
            return mockData[obj['fnName']]['output'][obj['type']];
         else
             return null;
     }
}
var infraAnalyticsMockData = new InfraAnalyticsMockData();