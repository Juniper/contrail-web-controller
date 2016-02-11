/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var VRouterDetailsBandwidthChartListModel = function(config) {
        var hostname = config['node'];
        var bandwidthPostData = monitorInfraUtils.
                        getPostDataForCpuMemStatsQuery({
                                nodeType:monitorInfraConstants.COMPUTE_NODE,
                                moduleType:"vRouterBandwidth",
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
                        parseAndMergeFlowStats (flowRateData,contrailListModel);
                    }
                }
            ]
        };
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                    type: 'POST',
                    data: JSON.stringify(bandwidthPostData)
                },
                dataParser : function (response) {
                    return response['data'];
                }
            },
            vlRemoteConfig: vlRemoteConfig,
            cacheConfig : {
            }
        };

        function parseAndMergeFlowStats (response,primaryDS) {
            var primaryData = primaryDS.getItems();
            var cnt = primaryData.length;
            var j=0;
            for (var i = 0; i < cnt ; i++) {
                j = i * 2;
                var flowRate = 0;
                if (response[j] != null && response[j]['MAX(flow_rate.active_flows)'] != null) {
                    if (response[j+1] != null && response[j+1]['MAX(flow_rate.active_flows)'] != null) {
                        if (response[j]['MAX(flow_rate.active_flows)'] > response[j+1]['MAX(flow_rate.active_flows)']){
                            flowRate = response[j]['MAX(flow_rate.active_flows)'];
                        } else {
                            flowRate = response[j+1]['MAX(flow_rate.active_flows)'];
                        }
                    } else {
                        flowRate = response[j]['MAX(flow_rate.active_flows)'];
                    }
                }
                primaryData[i]['MAX(flow_rate.active_flows)'] = flowRate;
            }
            primaryDS.updateData(primaryData);
        }

        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsBandwidthChartListModel;
});
