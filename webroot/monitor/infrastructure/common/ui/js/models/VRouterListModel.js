/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var VRouterListModel = function() {
        var vlRemoteConfig = {
                vlRemoteList: [
                {
                    getAjaxConfig: function(responseJSON) {
                        return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                                monitorInfraConstants.COMPUTE_NODE,responseJSON,'summary');
                    },
                    successCallback: function(response, contrailListModel) {
                        monitorInfraUtils.parseAndMergeCpuStatsWithPrimaryDataForInfraNodes(
                        response, contrailListModel);
                    }
                }
                ]
            };
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : monitorInfraConstants.monitorInfraUrls.VROUTER_CACHED_SUMMARY
                },
                onAllRequestsCompleteCB: function(contrailListModel) {
                    var fetchContrailListModel = new ContrailListModel({
                        remote : {
                            ajaxConfig : {
                                url : monitorInfraConstants.monitorInfraUrls.VROUTER_CACHED_SUMMARY + '?forceRefresh',
                                timeout : 300000 // 5 mins as this may take more time with more nodes
                            },
                            onAllRequestsCompleteCB: function(fetchedContrailListModel) {
                                var data = fetchedContrailListModel.getItems();
                                if(!fetchedContrailListModel.error) {
                                    contrailListModel.setData(data);
                                }
                                if (contrailListModel.ucid != null) {
                                    cowch.setData2Cache(contrailListModel.ucid, {
                                        listModel: fetchedContrailListModel
                                    });
                                }
                            },
                            dataParser : monitorInfraParsers.parsevRoutersDashboardData,
                        },
                        vlRemoteConfig: vlRemoteConfig
                    });
                },
                dataParser : monitorInfraParsers.parsevRoutersDashboardData,
            },
            vlRemoteConfig: vlRemoteConfig,
            cacheConfig : {
                ucid : ctwl.CACHE_VROUTER,
                cacheTimeout: getValueByJsonPath(globalObj,
                                'webServerInfo;sessionTimeout', 3600000)
            }
        };
        var uncachedVrouterModelConfig = {
                remote : {
                    ajaxConfig : {
                        url:monitorInfraConstants.monitorInfraUrls.VROUTER_CACHED_SUMMARY + '?forceRefresh',
                        timeout : 300000
                    },
                    dataParser : monitorInfraParsers.parsevRoutersDashboardData,
                },
                vlRemoteConfig: vlRemoteConfig,
                cacheConfig : {}
            };
        //Use the uncachedVrouterModelConfig if the cgcEnabled is true
        if(globalObj.webServerInfo.cgcEnabled === true){
            return ContrailListModel(uncachedVrouterModelConfig);
        }
        else{
            return ContrailListModel(listModelConfig);
        }
    };
    return VRouterListModel;
});
