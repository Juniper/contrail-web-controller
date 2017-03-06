/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'node-color-mapping'],
        function(
                _, ContrailView, NodeColorMapping) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    var nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, null,
                            getControlNodeListViewConfig(colorFn));
                }
            });
            function getControlNodeListViewConfig(colorFn) {
                var viewConfig = {
                    rows : [
                        monitorInfraUtils.getToolbarViewConfig(),
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
                                                         defaultWidth : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         defaultHeight : 8
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
                                                         defaultWidth : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'controlnode-dns'},
                                                         {id:'controlnode-named'},
                                                         {id:'controlnode-system-cpu-share',
                                                             itemAttr:{
                                                                 config:{
                                                                     nodeType:'control-node'
                                                                 }
                                                             }
                                                         },
                                                         {id:'controlnode-system-memory-usage',
                                                             itemAttr:{
                                                                 config:{
                                                                     nodeType:'control-node'
                                                                 }
                                                             }
                                                         },
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
                                                     defaultWidth : cowc.GRID_STACK_DEFAULT_WIDTH,
                                                     defaultHeight : 8
                                                 },
                                                 widgetCfgList: [
                                                     {id:'controlnode-disk-usage-info',
                                                         itemAttr:{
                                                             config:{
                                                                 nodeType:'control-node'
                                                             }
                                                         }
                                                     },
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
