/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView,NodeColorMapping) {
            var DashboardListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getDashboardListViewConfig());
                }
            });
            function getDashboardListViewConfig() {
                var viewConfig = {
                    rows: [{
                        columns: [{
                            elementId: 'dashboard-carousel-view',
                            view: "CarouselView",
                            viewConfig: {
                                pages: [{
                                    page: {
                                        elementId: 'dashboard-grid-stackview-1',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'dashboard-grid-stackview-1',
                                            gridAttr: {
                                                defaultWidth: 3.5,
                                                defaultHeight: 7
                                            },
                                            widgetCfgList: [{
                                                id: 'system-cpu-percentiles'
                                            }, {
                                                id: 'system-memory-percentiles'
                                            }, {
                                                id: 'disk-usage-percentiles'
                                            }, {
                                                id: 'vrouter-bandwidth-percentile-chart'
                                            }, {
                                               id: 'vrouter-active-flows-percentiles-chart' 
                                            }, {
                                                id: 'analyticsnode-sandesh-message-info'
                                            }, {
                                                id: 'confignode-requests-served'
                                            }, {
                                                id: 'confignode-response-time-size'
                                            }, {
                                                id: 'controlnode-sent-updates'
                                            }, {
                                                id: 'controlnode-received-updates'
                                            }]
                                        }
                                    }
                                }, {
                                    page: {
                                        elementId: 'dashboard-grid-stackview-0',
                                        view: 'MonitorInfraDashboardView',
                                        //viewPathPrefix: ctwl.DASHBOARD_VIEWPATH_PREFIX,
                                        viewConfig: {
                                            
                                        }
                                    }
                                }]
                            }
                        }]
                    }]
                };
                return {
                    elementId : cowu.formatElementId([ctwl.CONFIGNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return DashboardListView;
        });
