/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'backbone',
    'monitor/infrastructure/common/ui/js/views/NodeDetailsInfoboxesView',
    'monitor/infrastructure/vrouter/ui/js/views/VRouterDetailsAgentLineChartView',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterDetailsAgentChartListModel',
    'monitor/infrastructure/vrouter/ui/js/views/VRouterDetailsSystemLineChartView',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterDetailsSystemChartListModel',
    'monitor/infrastructure/vrouter/ui/js/views/VRouterDetailsBandwidthLineChartView',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterDetailsBandwidthChartListModel'
], function(_,ContrailView,Backbone,NodeDetailsInfoboxesView,
        VRouterDetailsAgentLineChartView,VRouterDetailsAgentChartListModel,
        VRouterDetailsSystemLineChartView,VRouterDetailsSystemChartListModel,
        VRouterDetailsBandwidthLineChartView,VRouterDetailsBandwidthChartListModel) {

    //Ensure VRouterDetailsChartsView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var VRouterDetailsChartsView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var hostname = viewConfig['hostname'];
            var isTORAgent = viewConfig['vRouterType'] == 'tor-agent'? true:false;
            var detailsChartsTmpl = contrail.getTemplate4Id(cowc.NODE_DETAILS_CHARTS);
            self.$el.append(detailsChartsTmpl);
            this.infoBoxView = new NodeDetailsInfoboxesView({el:$(contentContainer).
                find('#infoboxes-container'), widgetTitle:'Resource Utilization'});
            var infoBoxList = getInfoboxesConfig({node:hostname,isTORAgent:isTORAgent});
            for(var i=0;i<infoBoxList.length;i++) {
                this.infoBoxView.add(infoBoxList[i]);
            }
        }
    });

    function getInfoboxesConfig(config) {
        var vRouterDetailsAgentChartListModel = new VRouterDetailsAgentChartListModel(config);
        var vRouterDetailsSystemChartListModel = new VRouterDetailsSystemChartListModel(config);
        var vRouterDetailsBandwidthChartListModel = new VRouterDetailsBandwidthChartListModel(config);
        return [
        {
            title: 'Virtual Router Agent',
            prefix:'vrouterAgent',
            sparklineTitle1: ctwl.TITLE_CPU,
            sparklineTitle2:'Memory',
            sparkline1Dimension:'process_mem_cpu_usage.cpu_share',
            sparkline2Dimension:'process_mem_cpu_usage.mem_res',
            view: VRouterDetailsAgentLineChartView,
            model: vRouterDetailsAgentChartListModel
        },
        {
            title: 'System',
            prefix:'vrouterSystem',
            sparklineTitle1:ctwl.TITLE_CPU_LOAD,
            sparklineTitle2:'Memory',
            sparkline1Dimension: 'MAX(system_cpu_usage.one_min_avg)',
            sparkline2Dimension:'MAX(system_mem_usage.used)',
            view: VRouterDetailsSystemLineChartView,
            model: vRouterDetailsSystemChartListModel
        },
        {
            title: 'Physical Bandwidth',
            prefix:'vrouterBandwidth',
            sparklineTitle1:'Flow Rate',
            sparklineTitle2:'Bandwidth In',
            sparkline1Dimension: 'MAX(flow_rate.active_flows)',
            sparkline2Dimension:'phy_band_in_bps.__value',
            view: VRouterDetailsBandwidthLineChartView,
            model: vRouterDetailsBandwidthChartListModel
        }];
    };

    return VRouterDetailsChartsView;
});
