define([
    'underscore',
    'backbone',
    'js/views/InfoboxesView',
    'monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView',
    'monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
    'monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
    'monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
    'monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-confignode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model'
], function(_,Backbone,InfoboxesView,ConfigNodeScatterChartView,
        ControlNodeScatterChartView,DatabaseNodeScatterChartView,
        AnalyticsNodeScatterChartView,VRouterDashboardView,
        AnalyticsNodeListModel,DatabaseNodeListModel,ConfigNodeListModel,
        ControlNodeListModel,VRouterListModel) {

    //Ensure MonInfraDashboardView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var MonInfraDashboardView = Backbone.View.extend({
        el: $(contentContainer),
        render: function () {
            this.infoBoxView = new InfoboxesView({el:$(contentContainer)});
            var infoBoxList = getInfoboxesConfig();
            for(var i=0;i<infoBoxList.length;i++) {
                this.infoBoxView.add(infoBoxList[i]);
            }
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
