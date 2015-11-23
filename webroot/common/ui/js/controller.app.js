/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc;

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

        //TODO: Only commons controller level definations should be created in this file.
        'searchflow-model': 'monitor/infrastructure/underlay/ui/js/models/' + 'SearchFlowFormModel',
        'traceflow-model': 'monitor/infrastructure/underlay/ui/js/models/' + 'TraceFlowTabModel',
        'underlay-graph-model' : 'monitor/infrastructure/underlay/ui/js/models/'+ 'UnderlayGraphModel',
        'monitor-infra-confignode-model' : 'monitor/infrastructure/common/ui/js/models/'+ 'ConfigNodeListModel',
        'monitor-infra-analyticsnode-model' : 'monitor/infrastructure/common/ui/js/models/' + 'AnalyticsNodeListModel',
        'monitor-infra-databasenode-model' : 'monitor/infrastructure/common/ui/js/models/' + 'DatabaseNodeListModel',
        'monitor-infra-controlnode-model' : 'monitor/infrastructure/common/ui/js/models/' + 'ControlNodeListModel',
        'monitor-infra-vrouter-model' : 'monitor/infrastructure/common/ui/js/models/' + 'VRouterListModel',
        'monitor-infra-utils' : 'monitor/infrastructure/common/ui/js/utils/' + 'monitor.infra.utils',
        'confignode-scatterchart-view': 'monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView',
        'controlnode-scatterchart-view': 'monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
        'dbnode-scatterchart-view': 'monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
        'analyticsnode-scatterchart-view': 'monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
        'vrouter-dashboard-view': 'monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView',
        'monitor-infra-parsers': 'monitor/infrastructure/common/ui/js/utils/monitor.infra.parsers',
        'monitor-infra-utils': 'monitor/infrastructure/common/ui/js/utils/monitor.infra.utils',
        'monitor-infra-constants': 'monitor/infrastructure/common/ui/js/utils/monitor.infra.constants',
        'mon-infra-controller-dashboard': 'monitor/infrastructure/dashboard/ui/js/views/ControllerDashboardView'
    },
    waitSeconds: 0
});

require(['controller-init'], function () {});

