/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-controlnode-model'],
        function(
                _, ContrailView, ControlNodeListModel) {
            var ControlNodeListView = ContrailView.extend({
                render : function() {
                    var controlNodeListModel = new ControlNodeListModel();
                    this.renderView4Config(this.$el, controlNodeListModel,
                            getControlNodeListViewConfig());
                }
            });

            function getControlNodeListViewConfig() {
                var viewConfig = {
                    rows : [{
                        columns : [{
                            elementId :
                                ctwl.CONTROLNODE_SUMMARY_CHART_ID,
                            title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                            view : "ControlNodeScatterChartView",
                            viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                            app : cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {
                                widgetConfig: {
                                    elementId: ctwc.CONTROLNODE_SUMMARY_CHART_ID + '-widget',
                                    view: "WidgetView",
                                    viewConfig: {
                                        header: {
                                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                            // iconClass: "icon-search"
                                        },
                                        controls: {
                                            top: {
                                                default: {
                                                    collapseable: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }]
                    },{
                        columns : [{
                            elementId :
                                ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                            title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                            view : "ControlNodeSummaryGridView",
                            viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
                            app : cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig : {
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
