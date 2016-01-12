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
                    url : ctwl.VROUTER_SUMMARY_URL 
                },
                onAllRequestsCompleteCB: function(contrailListModel) {
                    var fetchContrailListModel = new ContrailListModel({
                        remote : {
                            ajaxConfig : {
                                url : ctwl.VROUTER_SUMMARY_URL + '?forceRefresh'
                            },
                            onAllRequestsCompleteCB: function(fetchContrailListModel) {
                                var data = fetchContrailListModel.getItems();
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
                ucid : ctwl.CACHE_VROUTER
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return VRouterListModel;
});
