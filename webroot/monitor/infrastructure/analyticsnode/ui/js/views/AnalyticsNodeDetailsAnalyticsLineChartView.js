/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var AnalyticsNodeDetailsAnalyticsLineChartView = ContrailView.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this;

            self.renderView4Config(this.$el, this.model,
                    getAnalyticsNodeDetailLineChartViewConfig(viewConfig));
        }
    });

    var getAnalyticsNodeDetailLineChartViewConfig = function (viewConfig, endTime) {

//        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.ANALYTICSNODE_DETAILS_COLLECTOR_CHART_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ANALYTICSNODE_DETAILS_COLLECTOR_LINE_CHART_ID,
                                view: "LineBarWithFocusChartView",
                                viewConfig: {
//                                    modelConfig: getNodeCPUMemModelConfig(hostname, endTime),
                                    parseFn: function (response) {
                                        var dimensions = ['cpu_info.cpu_share',
                                                          'cpu_info.mem_res'];
                                        var axisLabels = [ctwl.TITLE_CPU,ctwl.TITLE_MEMORY];
                                        var options = {dimensions:dimensions,axisLabels:axisLabels};
                                        return ctwp.
                                            parseLineChartDataForNodeDetails(
                                                        response,options);
                                    },
                                    chartOptions: {
                                        y1AxisLabel:ctwl.TITLE_CPU,
                                        y2AxisLabel:ctwl.TITLE_MEMORY,
                                        forceY1: [0, 1]
                                    },
                                    widgetConfig: {
                                        elementId: ctwl.ANALYTICS_DETAILS_ANALYTICS_CHART_WIDGET,
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.TITLE_ANALYTICS_ANALYTICS_CPU_MEM_UTILIZATION,
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
                            }
                        ]
                    }
                ]
            }
        }
    };

    return AnalyticsNodeDetailsAnalyticsLineChartView;
});