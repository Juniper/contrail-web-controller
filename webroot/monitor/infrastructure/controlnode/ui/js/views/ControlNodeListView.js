/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getControlNodeListViewConfig());
                }
            });
            function getControlNodeListViewConfig() {
                var viewConfig = {
                    rows : [
                        {
                            columns : [{
                                elementId: 'control-node-carousel-view',
                                view: "CarouselView",
                                viewConfig: {
                                pages : [
                                         {
                                             page: {
                                                 elementId : 'control-node-grid-stackview-0',
                                                 view : "GridStackView",
                                                 viewConfig: {
                                                     elementId : 'control-node-grid-stackview-0',
                                                     gridAttr : {
                                                         widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         heightMultiplier : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'controlnode-sent-updates'},
                                                         {id:'controlnode-received-updates'},
                                                         {id:'controlnode-control'},
                                                         {id:'controlnode-memory'},
                                                         {id:'controlnode-grid-view'}
                                                     ]
                                                  }
                                               }
                                         },{
                                             page: {
                                                 elementId : 'control-node-grid-stackview-1',
                                                 view : "GridStackView",
                                                 viewConfig: {
                                                     elementId : 'control-node-grid-stackview-1',
                                                     gridAttr : {
                                                         widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         heightMultiplier : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'controlnode-dns'},
                                                         {id:'controlnode-named'},
                                                         {id:'controlnode-system-cpu-share'},
                                                         {id:'controlnode-system-memory-usage'},
                                                         {id:'controlnode-grid-view'}
                                                     ]
                                                }
                                             },
                                         },{
                                             page: {
                                             elementId : 'control-node-grid-stackview-2',
                                             view : "GridStackView",
                                             viewConfig: {
                                                 elementId : 'control-node-grid-stackview-2',
                                                 gridAttr : {
                                                     widthMultiplier : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                     heightMultiplier : 8
                                                 },
                                                 widgetCfgList: [
                                                     {id:'controlnode-disk-usage-info'},
                                                     {id:'controlnode-grid-view'}
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
                          ctwl.CONTROLNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ControlNodeListView;
        });
