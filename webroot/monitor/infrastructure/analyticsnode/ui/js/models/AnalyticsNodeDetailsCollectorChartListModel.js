/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var AnalyticsNodeDetailsCollectorChartListModel = function(config) {
        var hostname = config['node'];
        var postData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.ANALYTICS_NODE,
                                moduleType:"analyticsCollector",
                                node:hostname});
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                    type: 'POST',
                    data: JSON.stringify(postData)
                },
                dataParser : function (response) {
                    return response['data']
                }
            },
            cacheConfig : {
//                ucid: ctwc.get(ctwc.UCID_NODE_CPU_MEMORY_LIST, hostname)
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return AnalyticsNodeDetailsCollectorChartListModel;
});
