/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DBNCPUMemChartsModel = function () {
        var queryPostData = {
                "autoSort": true,
                "async": false,
                "formModelAttrs": {
                  "table_name": "StatTable.NodeStatus.process_mem_cpu_usage",
                  "table_type": "STAT",
                  "query_prefix": "stat",
                  "from_time": Date.now() - (2 * 60 * 60 * 1000),
                  "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
                  "to_time": Date.now(),
                  "to_time_utc": Date.now(),
                  "select": "name, T=, "+
                  "MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)",
                  "where": "process_mem_cpu_usage.__key = cassandra",
                  "time_granularity_unit": "secs",
                  "time_granularity": 150,
                  "limit": "150000"
                },
            };
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : "/api/qe/query",
                    type: 'POST',
                    data: JSON.stringify(queryPostData)
                },
                dataParser : function (response) {
                    return response['data'];
                }
            },
            cacheConfig : {}
        };

        return ContrailListModel(listModelConfig);
    };
    return DBNCPUMemChartsModel;
    }
);
