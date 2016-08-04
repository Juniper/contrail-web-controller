/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var DatabaseNodeDetailsCollectorLineChartView = ContrailView.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this;

            self.renderView4Config(this.$el, this.model,
                    getDatabaseNodeDetailLineChartViewConfig(viewConfig));
        }
    });

    var getDatabaseNodeDetailLineChartViewConfig = function (viewConfig, endTime) {

        return {
            elementId: ctwl.DATABASENODE_DETAILS_CHART_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.DATABASENODE_DETAILS_LINE_CHART_ID,
                                view: "LineBarWithFocusChartView",
                                viewConfig: {
                                    parseFn: function (response) {
                                        var dimensions = ['database_usage.disk_space_used_1k',
                                                          'database_usage.analytics_db_size_1k'];
                                        var axisLabels = ['Used Space', 'Analytics DB Size']
                                        var options = {dimensions:dimensions,axisLabels:axisLabels};
                                        return ctwp.parseLineChartDataForNodeDetails(response,options);
                                    },
                                    chartOptions: {
                                        y1AxisLabel:'Used Space',
                                        y1Formatter: function (y1Value) {
                                            return formatBytes(y1Value * 1024, true);
                                        },
                                        y2AxisLabel:'Analytics DB Size',
                                        y2Formatter: function (y2Value) {
                                            return formatBytes(y2Value * 1024, true);
                                        },
                                        forceY1: [0, 1]
                                    },
                                    widgetConfig: {
                                        elementId: ctwl.DATABASENODE_DETAILS_CHART_WIDGET,
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: ctwl.TITLE_DATABASENODE_DISK_USAGE,
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

    return DatabaseNodeDetailsCollectorLineChartView;
});