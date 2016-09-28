/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-confignode-model', 'node-color-mapping'],
        function(
                _, ContrailView, ConfigNodeListModel, NodeColorMapping) {
            var ConfigNodeListView = ContrailView.extend({
                render : function() {
                    var configNodeListModel = new ConfigNodeListModel(),
                        nodeColorMapping = new NodeColorMapping(),
                        colorFn = nodeColorMapping.getNodeColorMap;

                    this.renderView4Config(this.$el, configNodeListModel,
                            getConfigNodeListViewConfig(colorFn));
                }
            });


            function getConfigNodeListViewConfig(colorFn) {
                var viewConfig = {
                    rows : [
                         {
                            columns : [ {
                                elementId :
                                    ctwl.CONFIGNODE_SUMMARY_CHART_ID,
                                title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                view : "ConfigNodeChartsView",
                                viewPathPrefix:
                                    ctwl.MONITOR_INFRA_VIEW_PATH,
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    colorFn: colorFn
                                }
                                    } ]
                        },{
                            columns : [ {
                                elementId :
                                    ctwl.CONFIGNODE_SUMMARY_GRID_ID,
                                title : ctwl.CONFIGNODE_SUMMARY_TITLE,
                                view : "ConfigNodeSummaryGridView",
                                viewPathPrefix:
                                    ctwl.CONFIGNODE_VIEWPATH_PREFIX,
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {
                                    colorFn: colorFn
                                }
                            } ]
                        } ]
                };
                return {
                    elementId : cowu.formatElementId(
                        [ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return ConfigNodeListView;
        });
