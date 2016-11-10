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
                                                         defaultWidth : 6,
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
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                         {id:'controlnode-dns'},
                                                         {id:'controlnode-named'},
                                                         {id:'system-cpu-share'},
                                                         {id:'system-memory-usage'},
                                                        // {id:'disk-usage-info'},
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
                                                     defaultWidth : 6,
                                                     defaultHeight : 8
                                                 },
                                                 widgetCfgList: [
                                                     {id:'disk-usage-info'},
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
