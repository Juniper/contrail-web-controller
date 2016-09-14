/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DatabaseUsageModel = function () {
        var queryPostData = {
            "autoSort": true,
            "async": false,
            "formModelAttrs": {
              "table_name": "StatTable.DatabaseUsageInfo.database_usage",
              "table_type": "STAT",
              "query_prefix": "stat",
              "from_time": Date.now() - (2 * 60 * 60 * 1000),
              "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
              "to_time": Date.now(),
              "to_time_utc": Date.now(),
              "select": "Source, T=, MAX(database_usage.analytics_db_size_1k), MAX(database_usage.disk_space_used_1k)",
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
                    data: JSON.stringify(queryPostData),
                    timeout : 120000 //2 mins
                },
                dataParser : function (response) {
                    var stats = getValueByJsonPath(response, 'data', []);
                    $.each(stats, function(idx, obj) {
                        obj['MAX(database_usage.analytics_db_size_1k)'] =
                            ifNull(obj['MAX(database_usage.analytics_db_size_1k)'],0) * 1024; //Converting KB to Bytes
                        obj['MAX(database_usage.disk_space_used_1k)'] =
                            ifNull(obj['MAX(database_usage.disk_space_used_1k)'],0) * 1024;
                    });
                    listModel.queryJSON = response['queryJSON'];
                    return stats;
                }
            },
            cacheConfig : {
            }
        };
        var listModel = new ContrailListModel(listModelConfig)
        return listModel;
    };
    return DatabaseUsageModel;
    }
);
