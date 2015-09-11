define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'knockback'
], function (_, ContrailView, ContrailListModel, Knockback) {

    var TrafficStatisticsView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            if(viewConfig != null && viewConfig.linkAttributes != null) {
                var linkAttributes = viewConfig.linkAttributes;
                var trafficStatsConfig = monitorInfraUtils.
                    getTrafficStatisticsTabViewConfig(linkAttributes);
                var trafficStatsViewConfig = trafficStatsConfig.viewConfig;
                if(trafficStatsViewConfig.modelConfig != null) {
                    var contrailListModel = new ContrailListModel(
                            trafficStatsConfig.viewConfig.modelConfig);
                        contrailListModel.onAllRequestsComplete.subscribe(
                        function() {
                            if(trafficStatsViewConfig.link == ctwc.PROUTER) {
                                // Prouter prouter link
                                var rawTrafficStats = contrailListModel.getItems();
                                var trafficStats = monitorInfraUtils.
                                    parsePRouterLinkStats(rawTrafficStats);
                                for (var i = 0; i < trafficStats.length; i++) {
                                    var pRouterIntfStatsObj = trafficStats[i];
                                    var divId = 'timeseries-chart-'+i;
                                    self.$el.append($('<div/>',{
                                        id: divId
                                    }));
                                    trafficStatsViewConfig.elementId = divId;
                                    trafficStatsViewConfig.viewConfig = {};
                                    var pRouterStatsModel = 
                                        new ContrailListModel({
                                            data: pRouterIntfStatsObj.chartData
                                            });
                                    self.renderView4Config($("#"+divId),
                                        pRouterStatsModel, trafficStatsViewConfig,
                                        null, null);
                                }
                                    
                            } else if (trafficStatsConfig.viewConfig.link ==
                                ctwc.VROUTER) {
                                // Prouter vrouter link
                                self.renderView4Config(self.$el,
                                    contrailListModel, trafficStatsConfig,
                                    null, null);
                            }
                    });
                } else {
                    // vrouter and vm link
                    self.renderView4Config(self.$el, null, trafficStatsConfig,
                         null, null, trafficStatsConfig.modelMap);
                }
            }
        }
    });
    return TrafficStatisticsView;
});