/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-analyticsnode-model' ],
        function(
                _, ContrailView, AnalyticsNodeListModel) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    var analyticsNodeListModel = new AnalyticsNodeListModel();
                    this.renderView4Config(this.$el, analyticsNodeListModel,
                            getAnalyticsNodeListViewConfig());
                }
            });

            function getAnalyticsNodeListViewConfig() {
                var viewConfig = {
                        rows : [
                            {
                                columns : [{
                                    elementId :
                                        ctwl.ANALYTICSNODE_SUMMARY_CHART_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodeScatterChartView",
                                    viewPathPrefix: "monitor/infrastructure/" +
                                        "common/ui/js/views/",
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                }]
                            },{
                                columns : [{
                                    elementId :
                                        ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodeGridView",
                                    viewPathPrefix: "monitor/infrastructure/" +
                                        "analyticsnode/ui/js/views/",
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig : {

                                    }
                                }]
                            }
                            ]
                        };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return AnalyticsNodeListView;
        });