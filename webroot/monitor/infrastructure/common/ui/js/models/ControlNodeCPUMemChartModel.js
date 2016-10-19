/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var CNCPUMemChartsModel = function () {
        var statsConfig = {};
        statsConfig["table_name"] = "StatTable.ControlCpuState.cpu_info";
        statsConfig["select"] = "T=, name, MAX(cpu_info.cpu_share), MAX(cpu_info.mem_res)";
        statsConfig["where"] = "cpu_info.module_id = contrail-control";
        return ContrailListModel(monitorInfraUtils.getStatsModelConfig(statsConfig));
    };
    return CNCPUMemChartsModel;
    }
);
