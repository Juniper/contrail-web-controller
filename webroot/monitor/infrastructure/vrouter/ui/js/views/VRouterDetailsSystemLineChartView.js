/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var VRouterDetailsSystemLineChartView = ContrailView.extend({
//        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this;

            self.renderView4Config(this.$el, this.model,
                    getVRouterDetailLineChartViewConfig(viewConfig));
        }
    });

    var getVRouterDetailLineChartViewConfig = function (viewConfig, endTime) {

        return {
            elementId: ctwl.VROUTER_DETAILS_SYSTEM_CHART_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_DETAILS_SYSTEM_LINE_CHART_ID,
                                view: "LineBarWithFocusChartView",
                                viewConfig: {
                                    parseFn: function (response) {
                                        var dimensions = ['MAX(system_cpu_usage.one_min_avg)',
                                                          'MAX(system_mem_usage.used)'];
                                        var axisLabels = [ctwl.TITLE_CPU_LOAD,ctwl.TITLE_MEMORY];
                                        var options = {dimensions:dimensions,axisLabels:axisLabels};
                                        return ctwp.parseLineChartDataForNodeDetails(response,options);
                                    },
                                    chartOptions: {
                                        y1AxisLabel:ctwl.TITLE_CPU_LOAD,
                                        y2AxisLabel:ctwl.TITLE_MEMORY,
                                        forceY1: [0, 1],
                                        y1Formatter: function (y1Value) {
                                            return (!isNaN(y1Value))? y1Value.toFixed(2): y1Value;
                                        }
                                    },
                                    widgetConfig: {
                                        elementId: ctwl.VROUTER_DETAILS_SYSTEM_CHART_WIDGET,
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.TITLE_VROUTER_SYSTEM_CPU_MEM_UTILIZATION,
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

    return VRouterDetailsSystemLineChartView;
});