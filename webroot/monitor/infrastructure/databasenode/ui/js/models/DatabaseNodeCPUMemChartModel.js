/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DBNCPUMemChartsModel = function () {
        var statsConfig = {};
        statsConfig["table_name"] = "StatTable.NodeStatus.process_mem_cpu_usage";
        statsConfig["select"] = "name, T=, MAX(process_mem_cpu_usage.mem_res), MAX(process_mem_cpu_usage.cpu_share)";
        statsConfig["where"] = "process_mem_cpu_usage.__key = cassandra";
        return ContrailListModel(monitorInfraUtils.getStatsModelConfig(statsConfig));
    };
    return DBNCPUMemChartsModel;
    }
);
