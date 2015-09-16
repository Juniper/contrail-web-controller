/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
    ['underscore', 'contrail-view', 'monitor-infra-vrouter-model'],
    function(
        _, ContrailView, VRouterListModel) {
        var VRouterDashobardView = ContrailView.extend({
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
                    ctwl.VROUTER_DASHBOARD_SECTION_ID
                ]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwl.VROUTER_DASHBOARD_SPARKLINE_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "BarChartInfoView",
                            viewConfig: {
                                // class:'span3',
                                width: '135px',
                                config:[{
                                    field:'instCnt',
                                    title:'Instances'
                                },{
                                    field:'intfCnt',
                                    title:'Interfaces'
                                },{
                                    field:'vnCnt',
                                    title:'Networks'
                                }]
                            }
                        },{
                            elementId: ctwl.VROUTER_DASHBOARD_CHART_ID,
                            title: ctwl.VROUTER_SUMMARY_TITLE,
                            view: "VRouterScatterChartView",
                            viewConfig : {
                                // class: 'span9'
                                'margin-left': '160px'
                            },
                            viewPathPrefix: "monitor/infrastructure/" +
                                "common/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                        }]
                    }]
                }
            };
        };
        return VRouterDashobardView;
    });
