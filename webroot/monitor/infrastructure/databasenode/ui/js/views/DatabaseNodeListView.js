/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'node-color-mapping'],
        function(
                _, ContrailView, NodeColorMapping) {
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
                                                         {id:'databsenode-percentile-bar-view'},
                                                         {id:'databasenode-cpu-share'},
                                                         {id:'databasenode-memory'},
                                                         {id:'databasenode-disk-space-usage'},
                                                         {id:'databasenode-pending-compactions'},
                                                         {id:'database-grid-view'}
                                                     ]
                                                }
                                             }
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
