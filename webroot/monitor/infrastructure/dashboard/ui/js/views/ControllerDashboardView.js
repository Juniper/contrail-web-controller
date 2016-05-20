/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    // 'confignode-scatterchart-view',
    'controller-basedir/monitor/infrastructure/common/ui/js/views/ConfigNodeChartsView',
    // 'controlnode-scatterchart-view',
    'controller-basedir/monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
    // 'dbnode-scatterchart-view',
    'controller-basedir/monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
    // 'analyticsnode-scatterchart-view',
    'controller-basedir/monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
    'mon-infra-dashboard-view',
    'vrouter-dashboard-view',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-confignode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model'
], function(_,Backbone,ConfigNodeScatterChartView,
        ControlNodeScatterChartView,DatabaseNodeScatterChartView,
        AnalyticsNodeScatterChartView,MonitorInfraDashboardView,VRouterDashboardView,
        AnalyticsNodeListModel,DatabaseNodeListModel,ConfigNodeListModel,
        ControlNodeListModel,VRouterListModel) {

    var ControllerDashboardView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            //No need to instantiate as it's a singleton class
            var monitorInfraDashboardView = MonitorInfraDashboardView;
            monitorInfraDashboardView.addInfoboxes(getInfoboxesConfig());
        }
    });

    function getInfoboxesConfig() {
        var vRouterListModel = new VRouterListModel();
        var analyticsNodeListModel = new AnalyticsNodeListModel();
        var controlNodeListModel = new ControlNodeListModel();
        var databaseNodeListModel = new DatabaseNodeListModel();
        var configNodeListModel = new ConfigNodeListModel();

        return [{
            title: 'Virtual Routers',
            view: VRouterDashboardView,
            model: vRouterListModel,
            downCntFn: dashboardUtils.getDownNodeCnt
        }, {
            title: 'Control Nodes',
            view: ControlNodeScatterChartView,
            model: controlNodeListModel,
            downCntFn: dashboardUtils.getDownNodeCnt
        },{
            title: 'Analytics Nodes',
            view: AnalyticsNodeScatterChartView,
            model: analyticsNodeListModel,
            downCntFn: dashboardUtils.getDownNodeCnt
        },{
            title: 'Config Nodes',
            view: ConfigNodeScatterChartView,
            model: configNodeListModel,
            downCntFn: dashboardUtils.getDownNodeCnt
        },{
            title: 'Database Nodes',
            view: DatabaseNodeScatterChartView,
            model: databaseNodeListModel,
            downCntFn: dashboardUtils.getDownNodeCnt
        }];
    };

    return ControllerDashboardView;
});
