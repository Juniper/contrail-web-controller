/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var AnalyticsNodeDatabaseWriteReadModel = function () {
        var queryPostData = {
            "autoSort": true,
            "async": false,
            "formModelAttrs": {
              "table_name": "StatTable.CollectorDbStats.table_info",
              "table_type": "STAT",
              "query_prefix": "stat",
              "time_range": "3600",
              "from_time": Date.now() - (2 * 60 * 60 * 1000),
              "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
              "to_time": Date.now(),
              "to_time_utc": Date.now(),
              "select": "Source,table_info.reads, table_info.writes, table_info.read_fails, table_info.write_fails,T",
              "time_granularity_unit": "secs",
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
            cacheConfig : {
              ucid: ctwl.CACHE_ANALYTICS_DATABASE_READ_WRITE_CHARTS
            }
        };

        return ContrailListModel(listModelConfig);
    };
    return AnalyticsNodeDatabaseWriteReadModel;
    }
);
