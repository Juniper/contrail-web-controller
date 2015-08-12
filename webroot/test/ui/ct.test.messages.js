/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    this.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE = 'Neworks List view - Common Tests';
    this.NETWORKS_GRID_MODULE = 'Networks Grid -  NM Tests';

    this.get = function () {
        var args = arguments;
        return args[0].replace(/\{(\d+)\}/g, function (m, n) {
            n = parseInt(n) + 1;
            return args[n];
        });
    };
    return {
        NETWORKS_LIST_VIEW_COMMON_TEST_MODULE: NETWORKS_LIST_VIEW_COMMON_TEST_MODULE,
        NETWORKS_GRID_MODULE: NETWORKS_GRID_MODULE,
        get : get
    };
});