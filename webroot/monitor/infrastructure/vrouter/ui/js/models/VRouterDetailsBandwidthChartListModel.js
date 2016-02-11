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
                    return getValueByJsonPath(response,'data',[]);;
                }
            },
            vlRemoteConfig: vlRemoteConfig,
            cacheConfig : {
            }
        };

        function parseAndMergeFlowStats (response,primaryDS) {
            var primaryData = primaryDS.getItems();
            if(primaryData.length == 0) {
                return response;
            }
            if(response.length == 0) {
                return primaryData;
            }
            //If both arrays are not having first element at same time
            //remove one item accordingly
            while (primaryData[0]['T='] != response[0]['T=']) {
                if(primaryData[0]['T='] > response[0]['T=']) {
                    response = response.slice(1,response.length-1);
                } else {
                    primaryData = primaryData.slice(1,primaryData.length-1);
                }
            }
            var cnt = primaryData.length;
            for (var i = 0; i < cnt ; i++) {
                primaryData[i]['T'] = primaryData[i]['T='];
                if (response[i] != null && response[i]['MAX(flow_rate.active_flows)'] != null) {
                    primaryData[i]['MAX(flow_rate.active_flows)'] =
                        response[i]['MAX(flow_rate.active_flows)'];
                } else if (i > 0){
                    primaryData[i]['MAX(flow_rate.active_flows)'] =
                        primaryData[i-1]['MAX(flow_rate.active_flows)'];
                }
            }
            primaryDS.updateData(primaryData);
        }

        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsBandwidthChartListModel;
});
