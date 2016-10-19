/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'backbone',
    'monitor/infrastructure/common/ui/js/views/NodeDetailsInfoboxesView',
    'monitor/infrastructure/analyticsnode/ui/js/views/AnalyticsNodeDetailsCollectorLineChartView',
    'monitor/infrastructure/analyticsnode/ui/js/models/AnalyticsNodeDetailsCollectorChartListModel',
    'monitor/infrastructure/analyticsnode/ui/js/views/AnalyticsNodeDetailsQELineChartView',
    'monitor/infrastructure/analyticsnode/ui/js/models/AnalyticsNodeDetailsQEChartListModel',
    'monitor/infrastructure/analyticsnode/ui/js/views/AnalyticsNodeDetailsAnalyticsLineChartView',
    'monitor/infrastructure/analyticsnode/ui/js/models/AnalyticsNodeDetailsAnalyticsChartListModel'
], function(_,ContrailView,Backbone,NodeDetailsInfoboxesView,
        AnalyticsNodeDetailsCollectorLineChartView,AnalyticsNodeDetailsCollectorChartListModel,
        AnalyticsNodeDetailsQELineChartView,AnalyticsNodeDetailsQEChartListModel,
        AnalyticsNodeDetailsAnalyticsLineChartView,AnalyticsNodeDetailsAnalyticsChartListModel) {

    //Ensure AnalyticsNodeDetailsChartsView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var AnalyticsNodeDetailsChartsView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var hostname = viewConfig['hostname'];
            var detailsChartsTmpl = contrail.getTemplate4Id(cowc.NODE_DETAILS_CHARTS);
            self.$el.append(detailsChartsTmpl);
            this.infoBoxView = new NodeDetailsInfoboxesView({el:$(contentContainer).
                find('#infoboxes-container'), widgetTitle:'CPU and Memory Utilization'});
            var infoBoxList = getInfoboxesConfig({node:hostname});
            for(var i=0;i<infoBoxList.length;i++) {
                this.infoBoxView.add(infoBoxList[i]);
            }
        }
    });

    function getInfoboxesConfig(config) {
        var analyticsNodeDetailsCollectorChartListModel =
            new AnalyticsNodeDetailsCollectorChartListModel(config);
        var analyticsNodeDetailsQEChartListModel =
            new AnalyticsNodeDetailsQEChartListModel(config);
        var analyticsNodeDetailsAnalyticsChartListModel =
            new AnalyticsNodeDetailsAnalyticsChartListModel(config);
        return [{
            title: 'Collector',
            prefix:'analyticsCollector',
            sparklineTitle1: ctwl.TITLE_CPU,
            sparklineTitle2:'Memory',
            sparkline1Dimension:'process_mem_cpu_usage.cpu_share',
            sparkline2Dimension:'process_mem_cpu_usage.mem_res',
            view: AnalyticsNodeDetailsCollectorLineChartView,
            model: analyticsNodeDetailsCollectorChartListModel
        },
        {
            title: 'Query Engine',
            prefix:'analyticsQE',
            sparklineTitle1: ctwl.TITLE_CPU,
            sparklineTitle2:'Memory',
            sparkline1Dimension:'process_mem_cpu_usage.cpu_share',
            sparkline2Dimension:'process_mem_cpu_usage.mem_res',
            view: AnalyticsNodeDetailsQELineChartView,
            model: analyticsNodeDetailsQEChartListModel
        },
        {
            title: 'OpServer',
            prefix:'analyticsAPI',
            sparklineTitle1: ctwl.TITLE_CPU,
            sparklineTitle2:'Memory',
            sparkline1Dimension:'process_mem_cpu_usage.cpu_share',
            sparkline2Dimension:'process_mem_cpu_usage.mem_res',
            view: AnalyticsNodeDetailsAnalyticsLineChartView,
            model: analyticsNodeDetailsAnalyticsChartListModel
        }];
    };

    return AnalyticsNodeDetailsChartsView;
});
