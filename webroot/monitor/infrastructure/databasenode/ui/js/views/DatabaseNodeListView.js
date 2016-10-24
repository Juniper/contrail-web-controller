/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-databasenode-model',
          'node-color-mapping'],
        function(
                _, ContrailView, DatabaseNodeListModel, NodeColorMapping) {
            var DatabaseNodeListView = ContrailView.extend({
                render : function() {
                    var databaseNodeListModel = new DatabaseNodeListModel(),
                        nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, databaseNodeListModel,
                            getDatabaseNodeListViewConfig(colorFn));
                }
            });

            function getDatabaseNodeListViewConfig(colorFn) {
                var viewConfig = {
                    rows : [
                        {
                            columns : [{
                                elementId: 'analytics-node-carousel-view',
                                view: "CarouselView",
                                viewConfig: {
                                pages : [
                                         {
                                             page: {
                                                 elementId : ctwl.DATABASENODE_SUMMARY_CHART_ID,
                                                 title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                                 view : "DatabaseNodeSummaryChartsView",
                                                 viewPathPrefix:  ctwl.MONITOR_INFRA_VIEW_PATH,
                                                 app : cowc.APP_CONTRAIL_CONTROLLER,
                                                 viewConfig: {
                                                     colorFn: colorFn
                                                 }
                                             },
                                         }
                                   ]
                                }
                            }]
                        }]
                };
                return {
                    elementId : cowu.formatElementId([
                        ctwl.DATABASENODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            };
            return DatabaseNodeListView;
        });
