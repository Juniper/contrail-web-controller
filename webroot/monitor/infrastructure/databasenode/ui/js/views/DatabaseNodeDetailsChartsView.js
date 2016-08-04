/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'backbone',
    'monitor/infrastructure/common/ui/js/views/NodeDetailsInfoboxesView',
    'monitor/infrastructure/databasenode/ui/js/views/DatabaseNodeDetailsLineChartView',
    'monitor/infrastructure/databasenode/ui/js/models/DatabaseNodeDetailsChartListModel'
], function(_,ContrailView,Backbone,NodeDetailsInfoboxesView,
        DatabaseNodeDetailsLineChartView,
        DatabaseNodeDetailsChartListModel) {

    //Ensure DatabaseNodeDetailsChartsView is instantiated only once and re-used always
    //Such that tabs can be added dynamically like from other feature packages
    var DatabaseNodeDetailsChartsView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var hostname = viewConfig['hostname'];
            var detailsChartsTmpl = contrail.getTemplate4Id(cowc.NODE_DETAILS_CHARTS);
            self.$el.append(detailsChartsTmpl);
            this.infoBoxView = new NodeDetailsInfoboxesView({el:$(contentContainer).
                find('#infoboxes-container'), widgetTitle:'Resource Utilization'});
            var infoBoxList = getInfoboxesConfig({node:hostname});
            for(var i=0;i<infoBoxList.length;i++) {
                this.infoBoxView.add(infoBoxList[i]);
            }
        }
    });

    function getInfoboxesConfig(config) {
        var databaseNodeDetailsChartListModel = new DatabaseNodeDetailsChartListModel(config);
        return [{
            title: 'Disk Usage',
            prefix:'databaseCollector',
            sparklineTitle1:'Used Space',
            sparklineTitle2:'Analytics DB Size',
            sparkline1Dimension:'database_usage.disk_space_used_1k',
            sparkline2Dimension:'database_usage.analytics_db_size_1k',
            view: DatabaseNodeDetailsLineChartView,
            model: databaseNodeDetailsChartListModel
        }];
    };

    return DatabaseNodeDetailsChartsView;
});
