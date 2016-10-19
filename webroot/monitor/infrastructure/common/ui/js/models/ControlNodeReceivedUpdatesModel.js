/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var CNReceivedUpdatesModel = function () {
        var statsConfig = {};
        statsConfig["table_name"] = "StatTable.PeerStatsData.rx_update_stats";
        statsConfig["select"] = "T=, Source, SUM(rx_update_stats.reach), SUM(rx_update_stats.unreach)";
        return ContrailListModel(monitorInfraUtils.getStatsModelConfig(statsConfig));
    };
    return CNReceivedUpdatesModel;
    }
);
