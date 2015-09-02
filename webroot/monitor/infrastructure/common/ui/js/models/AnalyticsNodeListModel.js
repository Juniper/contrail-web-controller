define(['contrail-list-model'], function(ContrailListModel) {
    var AnalyticsNodeListModel = function() {
        if (AnalyticsNodeListModel.prototype.singletonInstance) {
            return AnalyticsNodeListModel.prototype.singletonInstance;
        }
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
                }, {
                    getAjaxConfig : function() {
                        var postData =
                            getPostData("analytics-node", '', '',
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
                }
                //Need to add cpu stats
                ]
            },
            cacheConfig : {
                ucid : ctwc.CACHE_ANALYTICSNODE
            }
        };
        AnalyticsNodeListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return AnalyticsNodeListModel.prototype.singletonInstance;
    };
    return AnalyticsNodeListModel;
});
