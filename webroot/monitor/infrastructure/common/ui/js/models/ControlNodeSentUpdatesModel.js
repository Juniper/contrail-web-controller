/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'contrail-list-model'
], function (ContrailListModel) {
    var CNSentUpdatesModel = function () {
        var statsConfig = {};
        statsConfig["table_name"] = "StatTable.PeerStatsData.tx_update_stats";
        statsConfig["select"] = "T=, Source, SUM(tx_update_stats.reach), SUM(tx_update_stats.unreach)";
        return ContrailListModel(monitorInfraUtils.getStatsModelConfig(statsConfig));
    };
    return CNSentUpdatesModel;
    }
);
