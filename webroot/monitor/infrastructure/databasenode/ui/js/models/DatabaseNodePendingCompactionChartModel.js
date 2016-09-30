/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DatabaseNodeCPUMemChartsModel = function () {
        var queryPostData = {
            "autoSort": true,
            "async": false,
            "formModelAttrs": {
              "table_name": "StatTable.CassandraStatusData.cassandra_compaction_task",
              "table_type": "STAT",
              "query_prefix": "stat",
              "from_time": Date.now() - (2 * 60 * 60 * 1000),
              "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
              "to_time": Date.now(),
              "to_time_utc": Date.now(),
              "select": "T=, name, MAX(cassandra_compaction_task.pending_compaction_tasks)",
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
    return DatabaseNodeCPUMemChartsModel;
    }
);
