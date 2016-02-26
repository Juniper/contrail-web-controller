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
            sparkline1Dimension:'cpu_info.cpu_share',
            sparkline2Dimension:'cpu_info.mem_res',
            view: VRouterDetailsAgentLineChartView,
            model: vRouterDetailsAgentChartListModel
        },
        {
            title: 'System',
            prefix:'vrouterSystem',
            sparklineTitle1:'CPU Share (%)',
            sparklineTitle2:'Memory',
            sparkline1Dimension: 'cpu_info.one_min_cpuload',
            sparkline2Dimension:'cpu_info.used_sys_mem',
            view: VRouterDetailsSystemLineChartView,
            model: vRouterDetailsSystemChartListModel
        },
        {
            title: 'Physical Bandwidth',
            prefix:'vrouterBandwidth',
            sparklineTitle1:'Flow Rate',
            sparklineTitle2:'Bandwidth In',
            sparkline1Dimension: 'MAX(flow_rate.active_flows)',
            sparkline2Dimension:'phy_if_band.out_bandwidth_usage',
            view: VRouterDetailsBandwidthLineChartView,
            model: vRouterDetailsBandwidthChartListModel
        }];
    };

    return VRouterDetailsChartsView;
});
