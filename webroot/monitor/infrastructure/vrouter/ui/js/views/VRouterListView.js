/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
    ['underscore', 'contrail-view', 'monitor-infra-vrouter-model'],
    function(
        _, ContrailView, VRouterListModel) {
        var VRouterListView = ContrailView.extend({
            render: function() {
                var vRouterListModel = new VRouterListModel();
                this.renderView4Config(this.$el,
                    vRouterListModel,
                    getVRouterListViewConfig());
            }
        });

        function getVRouterListViewConfig() {
            return {
                elementId: cowu.formatElementId([
                    ctwl.VROUTER_SUMMARY_LIST_SECTION_ID
                ]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwl.VROUTER_SUMMARY_CHART_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterScatterChartView",
                            viewPathPrefix: "monitor/infrastructure/" +
                                "common/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {
                                widgetConfig: {
                                    elementId: ctwc.VROUTER_SUMMARY_CHART_ID + '-widget',
                                    view: "WidgetView",
                                    viewConfig: {
                                        header: {
                                            title: ctwl.VROUTER_SUMMARY_TITLE,
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
                    }, {
                        columns: [{
                            elementId: ctwl.VROUTER_SUMMARY_CROSSFILTER_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterCrossFiltersView",
                            viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {
                                config:[{
                                    field:'vnCnt',
                                    title:'vRouters over Virtual Networks'
                                },{
                                    field:'instCnt',
                                    title:'vRouters over Instances'
                                },{
                                    field:'intfCnt',
                                    title:'vRouters over Interfaces'
                                }]
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: ctwl.VROUTER_SUMMARY_GRID_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterSummaryGridView",
                            viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {

                            }
                        }]
                    }]
                }
            };
        };
        return VRouterListView;
    });
