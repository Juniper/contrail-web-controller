/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model', 'core-utils'], function(ContrailListModel, CoreUtils) {
    var cowu = new CoreUtils();
    var VRouterDetailsBandwidthChartListModel = function(config) {
        var hostname = config['node'];
        var isTORAgent = config['isTORAgent'];
        var bandwidthInPostData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.COMPUTE_NODE,
                                moduleType:"vRouterBandwidthIn",
                                node:hostname});
        var bandwidthOutPostData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.COMPUTE_NODE,
                                moduleType:"vRouterBandwidthOut",
                                node:hostname});
        var flowRatePostData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                            nodeType:monitorInfraConstants.COMPUTE_NODE,
                            moduleType:"vRouterFlowRate",
                            node:hostname});
        var vlRemoteConfig = {
                vlRemoteList: [{
                    getAjaxConfig: function() {
                        return {
                            url:monitorInfraConstants.monitorInfraUrls['QUERY'],
                            type:'POST',
                            data:JSON.stringify(flowRatePostData)
                        }
                    },
                    successCallback: function(response, contrailListModel) {
                        var flowRateData = getValueByJsonPath(response,'data',[]);
                        cowu.parseAndMergeStats (flowRateData,contrailListModel);
                    }
                },
                {
                    getAjaxConfig: function() {
                        return {
                            url:monitorInfraConstants.monitorInfraUrls['QUERY'],
                            type:'POST',
                            data:JSON.stringify(bandwidthOutPostData)
                        }
                    },
                    successCallback: function(response, contrailListModel) {
                        var data;
                        if(!isTORAgent) {
                            data = monitorInfraUtils.filterTORAgentData(response['data']);
                        } else {
                            data = getValueByJsonPath(response,'data',[]);
                        }
                        cowu.parseAndMergeStats (data,contrailListModel);
                    }
                }
            ]
        };
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                    type: 'POST',
                    data: JSON.stringify(bandwidthInPostData)
                },
                dataParser : function (response) {
                    if(!isTORAgent) {
                        return monitorInfraUtils.filterTORAgentData(response['data']);
                    } else {
                        return getValueByJsonPath(response,'data',[]);
                    }
                }
            },
            vlRemoteConfig: vlRemoteConfig,
            cacheConfig : {
            }
        };

        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsBandwidthChartListModel;
});
