define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'knockback',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function (_, ContrailView, ContrailListModel, Knockback, underlayUtils) {
    var TrafficStatisticsView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            if(viewConfig != null && viewConfig.linkAttributes != null) {
                var linkAttributes = viewConfig.linkAttributes;
                var trafficStatsConfig = underlayUtils.
                    getTrafficStatisticsTabViewConfig(linkAttributes);
                var trafficStatsViewConfig = trafficStatsConfig.viewConfig;
                $("#"+ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID).append($('<div/>',{
                    id: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID+'-tempdiv',
                }));
                var tempViewConfig = {
                    view: 'WidgetView',
                    elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID+'-wdiget',
                    viewConfig: {
                        header: {
                            title: 'Traffic Statistics',
                            iconClass: 'fa fa-spinner fa-spin'
                        },
                        controls: {
                            top: {
                                default: {
                                    collapseable: true
                                }
                            }
                        }
                    }
                };
                if(trafficStatsViewConfig.modelConfig != null) {
                    // Displaying widget with loading icon till the ajax call for
                    // stats finish.
                    self.renderView4Config($("#"+ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID+'-tempdiv'),
                        null, tempViewConfig, null, null);
                    var contrailListModel = new ContrailListModel(
                            trafficStatsConfig.viewConfig.modelConfig);
                        contrailListModel.onAllRequestsComplete.subscribe(
                        function() {
                            //Removing the widget which was added before.
                            self.$el.html('');
                            if(trafficStatsViewConfig.link == ctwc.PROUTER) {
                                // Prouter prouter link
                                var rawTrafficStats = contrailListModel.getItems();
                                var trafficStats = underlayUtils.
                                    parsePRouterLinkStats(rawTrafficStats);
                                for (var i = 0; i < ifNull(trafficStats, []).length; i++) {
                                    var pRouterIntfStatsObj = trafficStats[i];
                                    var divId = 'timeseries-chart-'+i;
                                    self.$el.append($('<div/>',{
                                        id: divId
                                    }));
                                    trafficStatsViewConfig.elementId = divId;
                                    trafficStatsViewConfig.viewConfig = {
                                        widgetConfig: {
                                            elementId: divId + '-widget',
                                            view: "WidgetView",
                                            viewConfig: {
                                                header: {
                                                    title: pRouterIntfStatsObj[
                                                                'chartTitle']
                                                },
                                                controls: {
                                                    top: {
                                                        default: {
                                                            collapseable: true
                                                        }
                                                    }
                                                }
                                            }
                                        },chartOptions:
                                            pRouterIntfStatsObj['options']
                                    };
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
                    self.$el.html('');
                    // vrouter and vm link
                    self.renderView4Config(self.$el, null, trafficStatsConfig,
                         null, null, trafficStatsConfig.modelMap);
                }
            }
        }
    });
    return TrafficStatisticsView;
});