/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/views/InfoboxesView',
    //'confignode-scatterchart-view',
    'monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView',
    //'controlnode-scatterchart-view',
    'monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
    //'dbnode-scatterchart-view',
    'monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
    //'analyticsnode-scatterchart-view',
    'monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
    'vrouter-dashboard-view',
    'dashboard-alert-list-model',
    'dashboard-log-list-model',
    'dashboard-node-list-model',
    'dashboard-alert-list-view',
    'dashboard-log-list-view',
    'dashboard-sysinfo-view',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-confignode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model'
], function(_,Backbone,InfoboxesView,ConfigNodeScatterChartView,
        ControlNodeScatterChartView,DatabaseNodeScatterChartView,
        AnalyticsNodeScatterChartView,VRouterDashboardView,
        AlertListModel,LogListModel,NodeListModel,
        AlertListView,LogListView,SystemInfoView,
        AnalyticsNodeListModel,DatabaseNodeListModel,ConfigNodeListModel,
        ControlNodeListModel,VRouterListModel) {

    //Ensure MonInfraDashboardView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var MonInfraDashboardView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var dashboardTmpl = contrail.getTemplate4Id(cowc.TMPL_INFRA_DASHBOARD);
            self.$el.html(dashboardTmpl);
            this.infoBoxView = new InfoboxesView({
                el: $(contentContainer).
                    find('#dashboard-infoboxes')
            });
            var infoBoxList = getInfoboxesConfig();
            for(var i=0;i<infoBoxList.length;i++) {
                this.infoBoxView.add(infoBoxList[i]);
            }
            var alertListView = new AlertListView({
                el: $(contentContainer).find('#alerts-box'),
                model: new AlertListModel()
            });
            alertListView.render();
            var logListView = new LogListView({
                el: $(contentContainer).find('#logs-box'),
                model: new LogListModel()
            });
            logListView.render();
            var sysInfoView = new SystemInfoView({
                el: $(contentContainer).find('#sysinfo-box'),
                model: new NodeListModel()
            });
            sysInfoView.render();
        }
    });

    function getInfoboxesConfig() {
        var analyticsNodeListModel = new AnalyticsNodeListModel();
        var controlNodeListModel = new ControlNodeListModel();
        var databaseNodeListModel = new DatabaseNodeListModel();
        var configNodeListModel = new ConfigNodeListModel();
        var vRouterListModel = new VRouterListModel();

        return [{
            title: 'vRouters',
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

    return MonInfraDashboardView;
});
