/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view','monitor-infra-analyticsnode-model' ],
        function(
                _, ContrailView, AnalyticsNodeListModel) {
            var AnalyticsNodeListView = ContrailView.extend({
                render : function() {
                    var analyticsNodeListModel = new AnalyticsNodeListModel();
                    this.renderView4Config(this.$el, analyticsNodeListModel,
                            getAnalyticsNodeListViewConfig());
                }
            });

            function getAnalyticsNodeListViewConfig() {
                var viewConfig = {
                        rows : [
                            {
                                columns : [{
                                    elementId :
                                        ctwl.ANALYTICSNODE_SUMMARY_CHART_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodeSummaryView",
                                    viewPathPrefix: ctwl.MONITOR_INFRA_VIEW_PATH,
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig: {
                                        widgetConfig: {
                                            elementId: ctwc.ANALYTICSNODE_SUMMARY_CHART_ID + '-widget',
                                            view: "WidgetView",
                                            viewConfig: {
                                                header: {
                                                    title: ctwl.ANALYTICSNODE_SUMMARY_TITLE,
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
                                        ctwl.ANALYTICSNODE_SUMMARY_GRID_ID,
                                    title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
                                    view : "AnalyticsNodeSummaryGridView",
                                    viewPathPrefix:
                                        ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
                                    app : cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig : {

                                    }
                                }]
                            }
                            ]
                        };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return AnalyticsNodeListView;
        });
