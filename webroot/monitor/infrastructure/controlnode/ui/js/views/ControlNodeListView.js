/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-controlnode-model', 'node-color-mapping'],
        function(
                _, ContrailView, ControlNodeListModel, NodeColorMapping) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    var controlNodeListModel = new ControlNodeListModel(),
                        nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;
                    this.renderView4Config(this.$el, controlNodeListModel,
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
                                             elementId :ctwl.CONTROLNODE_SUMMARY_CHART_ID,
                                             title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                                             view : "ControlNodeSummaryChartsView",
                                             viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
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
                         ctwl.CONTROLNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig :viewConfig
                };
            };
        return ControlNodeListView;
    });
