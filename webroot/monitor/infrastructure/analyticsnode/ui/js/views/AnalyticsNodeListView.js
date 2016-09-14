/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-analyticsnode-model',
          'node-color-mapping'],
        function(
                _, ContrailView, AnalyticsNodeListModel, NodeColorMapping) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    var analyticsNodeListModel = new AnalyticsNodeListModel();
                    nodeColorMapping = new NodeColorMapping(),
                    colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, analyticsNodeListModel,
                            getAnalyticsNodeListViewConfig(colorFn));
                }
            });

            function getAnalyticsNodeListViewConfig(colorFn) {
                var viewConfig = {
                        rows : [
                            {
                                columns : [{
                                    elementId :
                                        ctwl.ANALYTICSNODE_SUMMARY_CHART_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodesSummaryChartsView",
                                    viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig: {
                                        colorFn: colorFn
                                    }
                                }]
                            },{
                                columns : [{
                                    elementId :
                                        ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodeSummaryGridView",
                                    viewPathPrefix:
                                        ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig : {
                                        colorFn: colorFn
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
