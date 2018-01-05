/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var DatabaseNodeListView = ContrailView.extend({
                render : function() {
                    
                    this.renderView4Config(this.$el, null,
                            getDatabaseNodeListViewConfig());
                }
            });
            function getDatabaseNodeListViewConfig() {
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
                                                     elementId : 'database-node-grid-stackview-0',
                                                     gridAttr : {
                                                         widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         heightMultiplier : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'databsenode-percentile-bar-view'},
                                                         {id:'databasenode-pending-compactions'},
                                                         {id:'databasenode-cpu-share'},
                                                         {id:'databasenode-memory'},
                                                         {id:'databasenode-disk-usage-info'},
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
                                                         widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         heightMultiplier : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'databasenode-zookeeper'},
                                                         {id:'databasenode-kafka'},
                                                         {id:'databasenode-system-cpu-share'},
                                                         {id:'databasenode-system-memory-usage'},
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
