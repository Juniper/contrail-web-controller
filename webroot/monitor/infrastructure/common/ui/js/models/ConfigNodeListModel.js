/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {

        var vlRemoteList = [
            {
                getAjaxConfig: function(responseJSON) {
                    return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                            monitorInfraConstants.CONFIG_NODE,responseJSON,'summary');
                },
                successCallback: function(response, contrailListModel) {
                    monitorInfraUtils.parseAndMergeCpuStatsWithPrimaryDataForInfraNodes(
                    response, contrailListModel);
                }
            },{
                getAjaxConfig : function() {
                    var queryPostData = {
                            "autoSort": true,
                            "async": false,
                            "formModelAttrs": {
                             "table_name": "StatTable.VncApiStatsLog.api_stats",
                              "table_type": "STAT",
                              "query_prefix": "stat",
                              "from_time": Date.now() - (2 * 60 * 60 * 1000),
                              "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
                              "to_time": Date.now(),
                              "to_time_utc": Date.now(),
                              "select": "Source,PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
                              "time_granularity": 30,
                              "time_granularity_unit": "mins",
                              "limit": "150000"
                            },
                        };
                    return {
                        url : "/api/qe/query",
                        type: 'POST',
                        data: JSON.stringify(queryPostData)
                    };
                },
                successCallback : function(response, contrailListModel) {
                        monitorInfraUtils.parseAndMergepercentileConfigNodeSummaryChart(
                                response['data'], contrailListModel);

                }
            }
        ];
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.CONFIGNODE_SUMMARY_URL
                    },
                    dataParser : monitorInfraParsers.parseConfigNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteList
                },
                cacheConfig : {
                    ucid: ctwl.CACHE_CONFIGNODE
                }
            };

    return listModelConfig;
    }
);
