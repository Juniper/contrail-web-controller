/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var VRouterDetailsBandwidthLineChartView = ContrailView.extend({
//        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this;

            self.renderView4Config(this.$el, this.model,
                    getVRouterDetailLineChartViewConfig(viewConfig));
        }
    });

    var getVRouterDetailLineChartViewConfig = function (viewConfig, endTime) {

        return {
            elementId: ctwl.VROUTER_DETAILS_BANDWIDTH_CHART_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_DETAILS_BANDWIDTH_LINE_CHART_ID,
                                view: "LineBarWithFocusChartView",
                                viewConfig: {
                                    parseFn: function (response) {
                                        var dimensions = ['phy_if_band.in_bandwidth_usage',
                                                          'phy_if_band.out_bandwidth_usage'];
                                        var options = {dimensions:dimensions}
                                        return ctwp.parseCPUMemLineChartDataForNodeDetails(response,options);
                                    },
                                    chartOptions: {
                                        y1AxisLabel:'Bandwidth In',
                                        y1Formatter: function (y1Value) {
                                            return formatBytes(y1Value * 1024, true);
                                        },
                                        y2AxisLabel:'Bandwidth Out',
                                        y2Formatter: function (y2Value) {
                                            return formatBytes(y2Value * 1024, true);
                                        },
                                        forceY1: [0, 1]
                                    },
                                    widgetConfig: {
                                        elementId: ctwl.VROUTER_DETAILS_BANDWIDTH_CHART_WIDGET,
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.TITLE_VROUTER_BANDWIDTH_UTILIZATION,
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

    return VRouterDetailsBandwidthLineChartView;
});