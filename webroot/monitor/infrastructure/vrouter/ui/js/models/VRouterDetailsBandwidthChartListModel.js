/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
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
                        parseAndMergeStats (flowRateData,contrailListModel,'MAX(flow_rate.active_flows)');
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
                        parseAndMergeStats (data,contrailListModel,'phy_band_out_bps.__value');
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

        function parseAndMergeStats (response,primaryDS,key) {
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
                if (response[i] != null && response[i][key] != null) {
                    primaryData[i][key] =
                        response[i][key];
                } else if (i > 0){
                    primaryData[i][key] =
                        primaryData[i-1][key];
                }
            }
            primaryDS.updateData(primaryData);
        }

        return ContrailListModel(listModelConfig);
    };
    return VRouterDetailsBandwidthChartListModel;
});
