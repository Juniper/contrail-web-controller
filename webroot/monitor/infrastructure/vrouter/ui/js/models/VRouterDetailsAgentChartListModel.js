/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var VRouterDetailsAgentChartListModel = function(config) {
        var hostname = config['node'];
        var isTORAgent = config['isTORAgent'];
        var postData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.COMPUTE_NODE,
                                moduleType:"vRouterAgent",
                                node:hostname});
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                    type: 'POST',
                    data: JSON.stringify(postData)
                },
                dataParser : function (response) {
                    if(!isTORAgent) {
                        return monitorInfraUtils.filterTORAgentData(response['data']);
                    } else {
                        return response['data'];
                    }
                }
            },
            cacheConfig : {
//                ucid: ctwc.get(ctwc.UCID_NODE_CPU_MEMORY_LIST, hostname)
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsAgentChartListModel;
});
