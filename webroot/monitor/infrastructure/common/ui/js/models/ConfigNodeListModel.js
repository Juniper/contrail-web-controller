/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var ConfigNodeListModel = function () {

        var vlRemoteList = [
            {
                getAjaxConfig: function() {
                    return monitorInfraUtils
                       .getGeneratorsAjaxConfigForInfraNodes('configNodeDS');
                },
                successCallback: function(response,contrailListModel) {
                    monitorInfraUtils
                       .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                       response,contrailListModel);
                }
            },
            {
                getAjaxConfig: function(responseJSON) {
                    return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                            monitorInfraConstants.CONFIG_NODE,responseJSON,'summary');
                },
                successCallback: function(response, contrailListModel) {
                    monitorInfraUtils.parseAndMergeCpuStatsWithPrimaryDataForInfraNodes(
                    response, contrailListModel);
                }
            }
        ];
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.CONFIGNODE_SUMMARY_URL
                    },
                    dataParser : monitorInfraParsers.parseConfigNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteList
                },
                cacheConfig : {
                    ucid: ctwl.CACHE_CONFIGNODE
                }
            };

        return ContrailListModel(listModelConfig);
    };
    return ConfigNodeListModel;
    }
);
