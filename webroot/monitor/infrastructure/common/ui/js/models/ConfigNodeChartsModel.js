/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var ConfigNodeChartsModel = function () {
        var queryPostData = {
            "autoSort": true,
            "async": false,
            "formModelAttrs": {
              "table_name": "StatTable.VncApiStatsLog.api_stats",
              "table_type": "STAT",
              "query_prefix": "stat",
              "time_range": "3600",
              "from_time": Date.now() - (2 * 60 * 60 * 1000),
              "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
              "to_time": Date.now(),
              "to_time_utc": Date.now(),
              "select": "Source, T, UUID, api_stats.operation_type," +
                  " api_stats.user, api_stats.useragent, api_stats.remote_ip," +
                  " api_stats.domain_name, api_stats.project_name, api_stats.object_type," +
                  " api_stats.response_time_in_usec, api_stats.response_size," +
                  " api_stats.resp_code, name",
              "time_granularity_unit": "secs",
              "where": "",
              "where_json": null,
              "filter_json": null,
              "direction": "1",
              "filters": "",
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
                ucid: ctwl.CACHE_CONFIGNODE_CHARTS
            }
        };

        return ContrailListModel(listModelConfig);
    };
    return ConfigNodeChartsModel;
    }
);
