/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','node-color-mapping','controlnode-viewconfig'],
        function(
                _, ContrailView,NodeColorMapping,ControlNodeViewConfig) {
            var controlNodeViewConfig = new ControlNodeViewConfig();
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
                    rows : [{
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
                                                     gridAttr : {
                                                         defaultWidth : 6,
                                                         defaultHeight : 8
                                                     },
                                                     widgetCfgList: [
                                                        controlNodeViewConfig.getViewConfig('controlnode-sent-updates')(),
                                                        controlNodeViewConfig.getViewConfig('controlnode-received-updates')(),
                                                        controlNodeViewConfig.getViewConfig('controlnode-cpu-share')(),
                                                        controlNodeViewConfig.getViewConfig('controlnode-memory')(),
                                                        controlNodeViewConfig.getViewConfig('controlnode-grid-view')()
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
                    viewConfig :viewConfig
                };
            }
        return ControlNodeListView;
    });
