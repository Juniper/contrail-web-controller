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
                    rows : [monitorInfraUtils.getToolbarViewConfig(),
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
                                                     elementId : 'database-node-grid-stackview-0',
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'databsenode-percentile-bar-view'},
                                                         {id:'databasenode-pending-compactions'},
                                                         {id:'databasenode-cpu-share'},
                                                         {id:'databasenode-memory'},
                                                         {id:'disk-usage-info'},
                                                         {id:'database-grid-view'}
                                                     ]
                                                  }
                                               }
                                         },{
                                             page: {
                                                 elementId : 'database-node-grid-stackview-1',
                                                 view : "GridStackView",
                                                 viewConfig: {
                                                     elementId : 'database-node-grid-stackview-1',
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'databasenode-zookeeper'},
                                                         {id:'databasenode-kafka'},
                                                         {id:'system-cpu-share'},
                                                         {id:'system-memory-usage'},
                                                        // {id:'disk-usage-info'},
                                                         {id:'database-grid-view'}
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
