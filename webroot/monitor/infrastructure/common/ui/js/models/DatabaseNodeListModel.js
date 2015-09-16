define([
    'contrail-list-model',
], function (ContrailListModel) {
    var DatabaseNodeListModel = function () {
        // if(DatabaseNodeListModel.prototype.singletonInstance) {
        //     return DatabaseNodeListModel.prototype.singletonInstance;
        // }
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
        DatabaseNodeListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return DatabaseNodeListModel.prototype.singletonInstance;
    };
    return DatabaseNodeListModel;
    }
);
