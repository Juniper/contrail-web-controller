/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DatabaseNodeCPUMemChartsModel = function () {
        var statsConfig = {};
        statsConfig["table_name"] = "StatTable.CassandraStatusData.cassandra_compaction_task";
        statsConfig["select"] = "T=, name, MAX(cassandra_compaction_task.pending_compaction_tasks)";
        return ContrailListModel(monitorInfraUtils.getStatsModelConfig(statsConfig));
    };
    return DatabaseNodeCPUMemChartsModel;
    }
);
