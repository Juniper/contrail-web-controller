/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var VRouterListModel = function() {
        var vlRemoteConfig = {
                vlRemoteList: [{
                    getAjaxConfig: function(responseJSON) {
                        return monitorInfraUtils.getGeneratorsAjaxConfigForInfraNodes(
                            'computeNodeDS',responseJSON);
                    },
                    successCallback: function(response, contrailListModel) {
                        monitorInfraUtils.parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                        response, contrailListModel);
                    }
                },
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
                                url : monitorInfraConstants.monitorInfraUrls.VROUTER_CACHED_SUMMARY + '?forceRefresh'
                            },
                            onAllRequestsCompleteCB: function(fetchedContrailListModel) {
                                var data = fetchedContrailListModel.getItems();
                                contrailListModel.setData(data);
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
                cacheTimeout:0
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return VRouterListModel;
});
