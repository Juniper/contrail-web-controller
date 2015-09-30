/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var VRouterListModel = function() {
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : ctwl.VROUTER_SUMMARY_URL
                },
                dataParser : monitorInfraParsers.parsevRoutersDashboardData,
            },
            vlRemoteConfig: {
                vlRemoteList: [{
                    getAjaxConfig: function(responseJSON) {
                        return monitorInfraUtils.getGeneratorsAjaxConfigForInfraNodes(
                            'computeNodeDS',responseJSON);
                    },
                    successCallback: function(response, contrailListModel) {
                        monitorInfraUtils.parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                        response, contrailListModel);
                    }
                }
                //Need to add cpu stats
                ]
            },
            cacheConfig : {
                ucid : ctwl.CACHE_VROUTER
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return VRouterListModel;
});
