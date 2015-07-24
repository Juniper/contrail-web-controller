/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc, llswgc, llswp;

require.config({
    baseUrl: ctBaseDir,
    paths: {
        'controller-basedir': ctBaseDir,
        'controller-constants': ctBaseDir + '/common/ui/js/controller.constants',
        'controller-grid-config': ctBaseDir + '/common/ui/js/controller.grid.config',
        'controller-graph-config': ctBaseDir + '/common/ui/js/controller.graph.config',
        'controller-labels': ctBaseDir + '/common/ui/js/controller.labels',
        'controller-utils': ctBaseDir + '/common/ui/js/controller.utils',
        'controller-messages': ctBaseDir + '/common/ui/js/controller.messages',
        'controller-parsers': ctBaseDir + '/common/ui/js/controller.parsers',
        'controller-view-config': ctBaseDir + '/common/ui/js/controller.view.config',
        'controller-init': ctBaseDir + '/common/ui/js/controller.init',

        'lls-grid-config': ctBaseDir + '/config/linklocalservices/ui/js/linkLocalServices.grid.config',
        'lls-parsers': ctBaseDir + '/config/linklocalservices/ui/js/linkLocalServices.parsers',
        'monitor-infra-confignode-model' :
            'monitor/infrastructure/common/ui/js/models/'+
            'ConfigNodeListModel',
        'monitor-infra-analyticsnode-model' :
            'monitor/infrastructure/common/ui/js/models/' +
            'AnalyticsNodeListModel',
        'monitor-infra-databasenode-model' :
            'monitor/infrastructure/common/ui/js/models/' +
            'DatabaseNodeListModel',
        'monitor-infra-controlnode-model' :
            'monitor/infrastructure/common/ui/js/models/' +
            'ControlNodeListModel',
        'monitor-infra-utils' :
            'monitor/infrastructure/common/ui/js/utils/' +
            'monitor.infra.utils',
    },
    waitSeconds: 0
});

require(['controller-init'], function () {});

