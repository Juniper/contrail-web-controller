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
        'searchflow-model':
            'monitor/infrastructure/underlay/ui/js/models/' +
            'SearchFlowFormModel',
        'traceflow-model':
            'monitor/infrastructure/underlay/ui/js/models/' +
            'TraceFlowTabModel',
        'underlay-graph-model' :
            'monitor/infrastructure/underlay/ui/js/models/'+
            'UnderlayGraphModel',
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
        'monitor-infra-vrouter-model' :
            'monitor/infrastructure/common/ui/js/models/' +
            'VRouterListModel',
        'monitor-infra-utils' :
            'monitor/infrastructure/common/ui/js/utils/' +
            'monitor.infra.utils',
        'confignode-scatterchart-view':
            'monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView',
        'controlnode-scatterchart-view':
            'monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
        'dbnode-scatterchart-view':
            'monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
        'analyticsnode-scatterchart-view':
            'monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
        'vrouter-dashboard-view':
            'monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView',
        'dashboard-alert-list-model':
            'monitor/infrastructure/common/ui/js/models/AlertListModel',
        'dashboard-log-list-model':
            'monitor/infrastructure/common/ui/js/models/LogListModel',
        'dashboard-node-list-model':
            'monitor/infrastructure/common/ui/js/models/NodeListModel',
        'dashboard-alert-list-view':
            'monitor/infrastructure/dashboard/ui/js/views/AlertListView',
        'dashboard-log-list-view':
            'monitor/infrastructure/dashboard/ui/js/views/LogListView',
        'dashboard-sysinfo-view':
            'monitor/infrastructure/dashboard/ui/js/views/SystemInfoView',
        'alert-grid-view':
            'monitor/infrastructure/dashboard/ui/js/views/AlertGridView',
        'monitor-infra-parsers':
            'monitor/infrastructure/common/ui/js/utils/monitor.infra.parsers',
        'monitor-infra-utils':
            'monitor/infrastructure/common/ui/js/utils/monitor.infra.utils',
        'monitor-infra-constants':
            'monitor/infrastructure/common/ui/js/utils/monitor.infra.constants'
    },
    waitSeconds: 0
});

require(['controller-init'], function () {});

