/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
        var vlRemoteConfig = [
          {
              getAjaxConfig: function(responseJSON) {
                  return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                          monitorInfraConstants.CONTROL_NODE,responseJSON,'summary');
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
                        url : ctwl.CONTROLNODE_SUMMARY_URL
                    },
                    dataParser : monitorInfraParsers.parseControlNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteConfig
                },
                cacheConfig : {
                    ucid: ctwc.CACHE_CONTROLNODE
                }
            };
        return listModelConfig;
    }
);
