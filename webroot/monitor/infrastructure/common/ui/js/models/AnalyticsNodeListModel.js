/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : ctwl.ANALYTICSNODE_SUMMARY_URL
                },
                dataParser : monitorInfraParsers.parseAnalyticsNodesDashboardData
            },
            vlRemoteConfig : {
                vlRemoteList : [
                {
                    getAjaxConfig : function() {
                        var postData =
                            monitorInfraUtils.getPostData("analytics-node", '', '',
                                'CollectorState:generator_infos', '');
                        return {
                            url : TENANT_API_URL,
                            type : 'POST',
                            data : JSON.stringify(postData)
                        };
                    },
                    successCallback : function(response, contrailListModel) {
                        if (response != null && response[0] != null) {
                            monitorInfraUtils
                                .mergeCollectorDataAndPrimaryData(response[0],
                                        contrailListModel);
                        }
                    }
                },
                {
                    getAjaxConfig: function(responseJSON) {
                        return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                                monitorInfraConstants.ANALYTICS_NODE,responseJSON,'summary');
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
                                 "table_name": "StatTable.SandeshMessageStat.msg_info",
                                  "table_type": "STAT",
                                  "query_prefix": "stat",
                                  "from_time": Date.now() - (2 * 60 * 60 * 1000),
                                  "from_time_utc": Date.now() - (2 * 60 * 60 * 1000),
                                  "to_time": Date.now(),
                                  "to_time_utc": Date.now(),
                                  "select": "Source,PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
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
                            monitorInfraUtils.parseAndMergePercentileAnalyticsNodeSummaryChart(
                                    response['data'], contrailListModel);
                    }
                }
                ]
            },
            cacheConfig : {
                ucid : ctwl.CACHE_ANALYTICSNODE
            }
        };
    return listModelConfig;
});
