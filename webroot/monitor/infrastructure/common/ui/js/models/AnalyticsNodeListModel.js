define(['contrail-list-model'], function(ContrailListModel) {
    var AnalyticsNodeListModel = function() {
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : ctwl.ANALYTICSNODE_SUMMARY_URL
                },
                dataParser : monitorInfraParsers.parseAnalyticsNodesDashboardData
            },
            vlRemoteConfig : {
                vlRemoteList : [{
                    getAjaxConfig : function() {
                        return monitorInfraUtils
                            .getGeneratorsAjaxConfigForInfraNodes(
                                'analyticsNodeDS');
                    },
                    successCallback : function(response, contrailListModel) {
                        monitorInfraUtils
                            .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                                response, contrailListModel);
                    }
                },
                {
                    getAjaxConfig : function() {
                        var postData =
                            monitorInfraUtils.getPostData("analytics-node", '', '',
                                'CollectorState:generator_infos', '');
                        return {
                            url : TENANT_API_URL,
                            type : 'POST',
                            data : JSON.stringify(postData)
                        };
                    },
                    sucessCallback : function(response, contrailListModel) {
                        if (result != null && result[0] != null) {
                            monitorInfraUtils
                                .mergeCollectorDataAndPrimaryData(result[0],
                                        contrailListModel);
                        }
                    }
                },
                {
                    getAjaxConfig: function(responseJSON) {
                        return monitorInfraUtils.getAjaxConfigForInfraNodesCpuStats(
                                monitorInfraConstants.ANALYTICS_NODE,responseJSON,'summary');
                    },
                    successCallback: function(response, contrailListModel) {
                        monitorInfraUtils.parseAndMergeCpuStatsWithPrimaryDataForInfraNodes(
                        response, contrailListModel);
                    }
                }
                ]
            },
            cacheConfig : {
                ucid : ctwl.CACHE_ANALYTICSNODE
            }
        };
        return ContrailListModel(listModelConfig);
    };
    return AnalyticsNodeListModel;
});
