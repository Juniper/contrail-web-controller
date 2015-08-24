/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var TMessages = function() {
        this.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE = 'Neworks List view - Common Tests';
        this.NETWORKS_GRID_MODULE = 'Networks Grid -  NM Tests';
        this.NETWORK_LIST_VIEW_CUSTOM_TEST = 'Networks List view - Custom Tests';
        this.NETWORKS_GRID_COLUMN_VALUE_CHECK = "Network grid check for a particular column value equality";

        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };
    };
    return new TMessages();
});