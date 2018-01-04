/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model', 'core-utils'], function(ContrailListModel, CoreUtils) {
    var cowu = new CoreUtils();
    var VRouterDetailsSystemChartListModel = function(config) {
        var hostname = config['node'];
        var isTORAgent = config['isTORAgent'];
        var systemCpuPostData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.COMPUTE_NODE,
                                moduleType:"vRouterSystemCpu",
                                node:hostname});
        var systemMemPostData = monitorInfraUtils.
                                getPostDataForCpuMemStatsQuery({
                                    nodeType:monitorInfraConstants.COMPUTE_NODE,
                                    moduleType:"vRouterSystemMem",
                                    node:hostname});
        var vlRemoteConfig = {
                vlRemoteList: [{
                    getAjaxConfig: function() {
                        return {
                            url:monitorInfraConstants.monitorInfraUrls['QUERY'],
                            type:'POST',
                            data:JSON.stringify(systemMemPostData)
                        }
                    },
                    successCallback: function(response, contrailListModel) {
                        var flowRateData = getValueByJsonPath(response,'data',[]);
                        cowu.parseAndMergeStats (flowRateData,contrailListModel,'MAX(system_mem_usage.used)');
                    }
                }
            ]
        };
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                    type: 'POST',
                    data: JSON.stringify(systemCpuPostData)
                },
                dataParser : function (response) {
                    if(!isTORAgent) {
                        return monitorInfraUtils.filterTORAgentData(response['data']);
                    } else {
                        return response['data'];
                    }
                }
            },
            vlRemoteConfig: vlRemoteConfig,
            cacheConfig : {
//                ucid: ctwc.get(ctwc.UCID_NODE_CPU_MEMORY_LIST, hostname)
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsSystemChartListModel;
});
