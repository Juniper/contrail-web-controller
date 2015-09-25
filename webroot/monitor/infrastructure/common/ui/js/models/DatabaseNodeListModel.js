define([
    'contrail-list-model',
], function (ContrailListModel) {
    var DatabaseNodeListModel = function () {
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.DATABASENODE_SUMMARY_URL
                    },
                    dataParser : monitorInfraParsers.parseDatabaseNodesDashboardData
                },
                cacheConfig : {
                    ucid: ctwl.CACHE_DATABASENODE
                }
            };
        return ContrailListModel(listModelConfig);
    };
    return DatabaseNodeListModel;
    }
);
