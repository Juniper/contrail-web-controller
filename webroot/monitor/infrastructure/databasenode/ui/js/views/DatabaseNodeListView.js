/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view', 'monitor-infra-databasenode-model'],
        function(
                _, ContrailView, DatabaseNodeListModel) {
            var DatabaseNodeListView = ContrailView.extend({
                render : function() {
                    var databaseNodeListModel = new DatabaseNodeListModel();
                    this.renderView4Config(this.$el, databaseNodeListModel,
                            getDatabaseNodeListViewConfig());
                }
            });

            function getDatabaseNodeListViewConfig() {
                var viewConfig = {
                    rows : [
                        {
                            columns : [{
                                elementId :
                                    ctwl.DATABASENODE_SUMMARY_CHART_ID,
                                title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                view : "DatabaseNodeScatterChartView",
                                viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: ctwc.DATABASENODE_SUMMARY_CHART_ID + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.DATABASENODE_SUMMARY_TITLE,
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
                        },
                        {
                            columns : [{
                                elementId :
                                    ctwl.DATABASENODE_SUMMARY_GRID_ID,
                                title : ctwl.DATABASENODE_SUMMARY_TITLE,
                                view : "DatabaseNodeSummaryGridView",
                                viewPathPrefix:
                                    ctwl.DATABASENODE_VIEWPATH_PREFIX,
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {

                                }
                            }]
                        } ]
                };
                return {
                    elementId : cowu.formatElementId([
                        ctwl.DATABASENODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            };
            return DatabaseNodeListView;
        });
