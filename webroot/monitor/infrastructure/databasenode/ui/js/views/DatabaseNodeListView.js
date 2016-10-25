/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'node-color-mapping','databasenode-viewconfig'],
        function(
                _, ContrailView, NodeColorMapping, DatabaseNodeViewConfig) {
            var databaseNodeViewConfig = new DatabaseNodeViewConfig();
            var DatabaseNodeListView = ContrailView.extend({
                render : function() {
                    var nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, null,
                            getDatabaseNodeListViewConfig(colorFn));
                }
            });
            function getDatabaseNodeListViewConfig(colorFn) {
                var viewConfig = {
                    rows : [
                        {
                            columns : [{
                                elementId: 'database-node-carousel-view',
                                view: "CarouselView",
                                viewConfig: {
                                pages : [
                                         {
                                             page: {
                                                 elementId : 'database-node-grid-stackview-0',
                                                 view : "GridStackView",
                                                 viewConfig: {
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         databaseNodeViewConfig.getViewConfig('databsenode-percentile-bar-view')(),
                                                         databaseNodeViewConfig.getViewConfig('databasenode-cpu-share')(),
                                                         databaseNodeViewConfig.getViewConfig('databasenode-memory')(),
                                                         databaseNodeViewConfig.getViewConfig('databasenode-disk-space-usage')(),
                                                         databaseNodeViewConfig.getViewConfig('databasenode-pending-compactions')(),
                                                         databaseNodeViewConfig.getViewConfig('database-grid-view')(),
                                                     ]
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
            }
            return DatabaseNodeListView;
        });
