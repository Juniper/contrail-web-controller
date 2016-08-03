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
                                        var dimensions = ['MAX(flow_rate.active_flows)',
                                                          'phy_band_in_bps.__value',
                                                          'phy_band_out_bps.__value'];
                                        var axisLabels = ['Flow Rate','Bandwidth In','Bandwidth Out'];
                                        var options = {dimensions:dimensions,axisLabels:axisLabels};
                                        return ctwp.parseLineChartDataForVRouterBandwidth(response,options);
                                    },
                                    chartOptions: {
                                        y1AxisLabel:'Flow Rate',
                                        y1Formatter: function (y1Value) {
                                            return (!isNaN(y1Value))? y1Value.toFixed(2): y1Value;
                                        },
                                        y2AxisLabel:'Bandwidth In/Out',
                                        y2Formatter: function (y2Value) {
                                            return formatBytes(y2Value / 8, true, null, null,
                                                    cowc.BYTES_PER_SECOND_PREFIXES);
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
