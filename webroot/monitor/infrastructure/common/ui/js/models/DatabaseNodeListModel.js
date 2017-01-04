/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model',
], function (ContrailListModel) {
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
        return listModelConfig;
    }
);
