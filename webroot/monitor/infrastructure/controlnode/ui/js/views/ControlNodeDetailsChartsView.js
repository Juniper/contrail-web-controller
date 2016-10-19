/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'backbone',
    'monitor/infrastructure/common/ui/js/views/NodeDetailsInfoboxesView',
    'monitor/infrastructure/controlnode/ui/js/views/ControlNodeDetailsLineChartView',
    'monitor/infrastructure/controlnode/ui/js/models/ControlNodeDetailsChartListModel'
], function(_,ContrailView,Backbone,NodeDetailsInfoboxesView,ControlNodeDetailsLineChartView,
        ControlNodeDetailsChartListModel) {

    //Ensure ControlNodeDetailsChartsView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var ControlNodeDetailsChartsView = ContrailView.extend({
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
        var controlNodeDetailsChartListModel = new ControlNodeDetailsChartListModel(config);

        return [{
            title: 'Control Node',
            prefix:'controlnode',
            sparklineTitle1: ctwl.TITLE_CPU,
            sparklineTitle2:'Memory',
            sparkline1Dimension:'process_mem_cpu_usage.cpu_share',
            sparkline2Dimension:'process_mem_cpu_usage.mem_res',
            view: ControlNodeDetailsLineChartView,
            model: controlNodeDetailsChartListModel
        }];
    };

    return ControlNodeDetailsChartsView;
});
