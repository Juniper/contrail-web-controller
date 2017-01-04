/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'node-color-mapping', 'legend-view', 'chart-utils'],
        function(_, ContrailView, NodeColorMapping, LegendView, chUtils){
    var MonitorInfraViewConfig = function () {
        var self = this;
        self.viewConfig = {
                'system-cpu-percentiles': {
                    baseModel:'SYSTEM_CPU_PERCENTILES_MODEL',
                    baseView:'SYSTEM_CPU_PERCENTILES_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                    }
                },
                'interfaces-trend': {
                    baseModel: 'INTERFACES_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                cssClass: 'utilization-chart',
                                groupBy: null,
                                yField: 'SUM(vmi_count.active)',
                                title: "Interfaces",
                                yAxisLabel: 'Interfaces',
                                colors: ['#81D4FA'],
                                staticColor: true,
                                area: true,
                                showTicks: false,
                                forceY: [0, 1],
                                overViewText: false,
                                showXMinMax: false,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-'
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'instances-trend': {
                    baseModel: 'INSTANCES_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                cssClass: 'utilization-chart',
                                groupBy: null,
                                title: "Instances",
                                yAxisLabel: 'Instances',
                                yField: 'SUM(vm_count.active)',
                                area: true,
                                colors: ['#7dc48a'],
                                staticColor: true,
                                forceY: [0, 1],
                                showTicks: false,
                                overViewText: true,
                                showXMinMax: false,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-'
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'service-instances-trend': {
                    baseModel: 'SERVICE_INSTANCES_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                cssClass: 'utilization-chart',
                                groupBy: null,
                                title: "Service Instances",
                                yAxisLabel: "Service Instances",
                                yField: 'SUM(vmi_count.active)',
                                colors: cowc.RESOURCE_UTILIZATION_CHART_COLOR,
                                area: true,
                                showTicks: false,
                                overViewText: true,
                                forceY: [0, 1],
                                showXMinMax: false,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-'
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'fip-trend': {
                    baseModel: 'FLOATING_IPS_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                cssClass: 'utilization-chart',
                                groupBy: null,
                                title: "Floating IPs",
                                yAxisLabel: "Floating IPs",
                                yField: 'SUM(vm_count.active)',

                                colors: ['#c79dcd'],
                                staticColor: true,
                                area: true,
                                showTicks: false,
                                overViewText: true,
                                forceY: [0, 1],
                                showXMinMax: false,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-'
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'vrouter-active-drop-flows-chart':{
                    baseModel: 'VROUTER_ACTIVE_DROP_FLOWS',
                    modelCfg: {
                    },
                    viewCfg: {
                      elementId: 'band-in-out-chart',
                      view: "LineBarWithFocusChartView",
                      viewConfig: {
                          parseFn: cowu.parseLineBarChartWithFocus,
                          chartOptions: {
                                title: 'Active Flows & Packet Drops',
                                cssClass: 'small-bar-line-bar-chart',
                                margin: {top: 20, right: 20, bottom: 20, left: 20},
                                axisLabelDistance: -10,
                                focusEnable: false,
                                showLegend: false,
                                showXMinMax: true,
                                showYMinMax: true,
                                xAxisLabel: '',
                                xAxisMaxMin: false,
                                overViewText: true,
                                overviewTextOptions: {
                                    label: 'Drops in 3hrs',
                                    key: 'SUM(drop_stats.ds_drop_pkts)',
                                    operator: 'sum',
                                    formatter: function (value) {
                                        return cowu.numberFormatter(value, 0);
                                    }
                                },
                                defaultDataStatusMessage: false,
                                insertEmptyBuckets: false,
                                bucketSize: 2.5,
                                legendView: LegendView,
                                y1AxisLabel: 'Active Flows',
                                y1AxisColor: ['#03a9f4'],
                                //Y1 for bar
                                y1Field: 'MAX(flow_rate.active_flows)',
                                y1FieldOperation: 'average',
                                y1Formatter: function (y1Value) {
                                    return cowu.numberFormatter(y1Value, 0);
                                },
                                y2AxisLabel: 'Drop packets',
                                y2AxisWidth: 50,
                                //Y2 for line
                                y2Field: 'SUM(drop_stats.ds_drop_pkts)',
                                staticColor: true,
                                y2AxisColor: monitorInfraConstants.VROUTER_DROP_PACKETS_COLORS,
                                y2FieldOperation: 'average',
                                xFormatter: function (xValue, tickCnt) {
                                    // Same function is called for
                                    // axis ticks and the tool tip
                                    // title
                                    var date = new Date(xValue);
                                    return d3.time.format('%H:%M')(date);
                                },
                                y2Formatter: function (y2Value) {
                                    return cowu.numberFormatter(y2Value, 0);
                                },
                          }
                      }
                    },
                    itemAttr: {
                      title: 'Active Flows & Packet Drops',
                      height: 0.7,
                      width: 1/3
                    }
             },
                'system-overall-cpu-share': {
                    baseModel: 'SYSTEM_OVERALL_CPU_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                cssClass: 'utilization-chart',
                                groupBy: null,
                                title: "CPU",
                                colors: cowc.RESOURCE_UTILIZATION_CHART_COLOR,
                                staticColor: true,
                                area: true,
                                showTicks: false,
                                overViewText: true,
                                showXMinMax: false,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-',
                                    valueFn: function (selector, data, viewConfig) {
                                        valueFn(selector, data, viewConfig);
                                    }
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'system-overall-memory-usage': {
                    baseModel: 'SYSTEM_OVERALL_MEMORY_MODEL',
                    baseView: 'SYSTEM_MEMORY_USAGE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                title: "Memory",
                                cssClass: 'utilization-chart',
                                area: true,
                                colors: cowc.RESOURCE_UTILIZATION_CHART_COLOR,
                                staticColor: true,
                                groupBy: null,
                                showTicks: false,
                                showXMinMax: false,
                                overViewText: true,
                                xAxisLabel: '',
                                overviewTextOptions: {
                                    label: '',
                                    value: '-',
                                    valueFn: function (selector, data, viewConfig) {
                                        valueFn(selector, data, viewConfig);
                                    }
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                },
                            }
                        }
                    }
                },
                'system-overall-disk-usage': {
                    baseModel: 'SYSTEM_OVERALL_DISK_MODEL',
                    baseView: 'SYSTEM_DISK_USAGE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                        viewConfig: {
                            class: 'utilization-chart',
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                title: "Disk",
                                cssClass: 'utilization-chart',
                                colors: cowc.RESOURCE_UTILIZATION_CHART_COLOR,
                                staticColor: true,
                                area: true,
                                groupBy: null,
                                showTicks: false,
                                showXMinMax: false,
                                overViewText: true,
                                overviewTextOptions: {
                                    label: '',
                                    value: '-',
                                    valueFn: function (selector, data, viewConfig) {
                                        valueFn(selector, data, viewConfig);
                                    }
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'system-overall-bandwidth-usage': {
                    baseModel: 'SYSTEM_OVERALL_DISK_MODEL',
                    baseView: 'SYSTEM_DISK_USAGE_VIEW',
                    modelCfg: {
                        source: "STATTABLE",
                        type: 'vRouter',
                        config: [
                            {
                                table_name: 'StatTable.VrouterStatsAgent.phy_band_out_bps',
                                select: 'T=, AVG(phy_band_out_bps.__value)',
                            }
                        ]
                    },
                    viewCfg: {
                        viewConfig: {
                            class: 'utilization-chart',
                            parseFn: cowu.chartDataFormatter,
                            chartOptions: {
                                title: "Bandwidth",
                                cssClass: 'utilization-chart',
                                yAxisLabel: 'Bandwidth Usage',
                                yField: 'AVG(phy_band_out_bps.__value)',
                                colors: cowc.RESOURCE_UTILIZATION_CHART_COLOR,
                                staticColor: true,
                                area: true,
                                groupBy: null,
                                showTicks: false,
                                showXMinMax: false,
                                overViewText: true,
                                yFormatter: function(y) {
                                      return formatBytes(y, 1, null, null, null, true);
                                },
                                overviewTextOptions: {
                                    label: '',
                                    value: '-',
                                    valueFn: function (selector, data, viewConfig) {
                                        valueFn(selector, data, viewConfig);
                                    }
                                },
                                margin: {
                                    left: 5,
                                    top: 5,
                                    right: 10,
                                    bottom: 10
                                }
                            }
                        }
                    }
                },
                'system-cpu-share': {
                    baseModel:'SYSTEM_CPU_MODEL',
                    baseView: 'SYSTEM_CPU_SHARE_VIEW',
                    modelCfg: {
                    },
                    viewCfg:{
                    },
                    itemAttr: {
                        title: ctwl.SYSTEM_CPU_SHARE,
                        width: 1/2
                    }
                },
                'system-memory-usage': {
                    baseModel:'SYSTEM_MEMORY_MODEL',
                    baseView:'SYSTEM_MEMORY_USAGE_VIEW',
                    modelCfg: {
                    },
                    viewCfg: {
                    },itemAttr: {
                        title: ctwl.SYSTEM_MEMORY_USED,
                        width: 1/2
                    }
                },
                'disk-usage-info': function (config){
                    return {
                        baseModel:'SYSTEM_DISK_USAGE_MODEL',
                        baseView:'SYSTEM_DISK_USAGE_VIEW',
                        modelCfg: {
                        },
                        viewCfg: {
                        },
                        itemAttr: {
                            title: ctwl.DISK_USAGE,
                            width: 1/2
                        }
                    }
                },
                'dashboard-virtualization-view':{
                    viewCfg: {
                        elementId: 'dashboard-virtualization-view',
                        view: 'CustomView',
                        viewConfig: {
                            template: 'four-quadrant-template',
                            title: 'Virtualization Overview',
                            childWidgets: [
                                'interfaces-trend',
                                'instances-trend',
                                'service-instances-trend',
                                'fip-trend'
                            ]
                        }
                    },
                    modelCfg: {
                    },
                    itemAttr: {
                        width: 0.9,
                        height: 0.6,
                        title: 'Virtualization Overview',
                    }
                },
                'dashboard-resource-utilization-view':{
                    viewCfg: {
                        elementId: 'dashboard_resource_utilization_view',
                        view: 'CustomView',
                        viewConfig: {
                            template: 'four-quadrant-template',
                            title: 'Resource Utilization',
                            childWidgets: [
                                'system-overall-cpu-share',
                                'system-overall-memory-usage',
                                'system-overall-disk-usage',
                                'system-overall-bandwidth-usage'
                            ]
                        }
                    },
                    modelCfg: {
                    },
                    itemAttr: {
                        width: 0.9,
                        height: 0.6,
                        title: 'Resource Utilization'
                    }
                },
                'monitor-infra-scatterchart-view': {
                    viewCfg: {
                        elementId: 'monitor-infra-scatterchart-view',
                        view: 'MonitorInfraScatterChartView',
                        /*viewPathPrefix: ctwl.DASHBOARD_VIEWPATH_PREFIX,
                        app : cowc.APP_CONTRAIL_CONTROLLER,*/
                        viewConfig: {

                        }
                    },
                    modelCfg: {

                    },
                    itemAttr: {
                        width: 0.9,
                        height: 0.6,
                        title: 'Resource Utilization'
                    }
                },
        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
        function valueFn(selector, data, viewConfig) {
            var yValue = '-', yValueArr = [];
            if (data.length) {
                yValue = chUtils.getLastYValue(data, viewConfig);
                var yFormatter = cowu.getValueByJsonPath(viewConfig, 'chartOptions;overviewTextOptions;formatter',
                                    cowu.getValueByJsonPath(viewConfig, 'chartOptions;yFormatter'));
                var yField = cowu.getValueByJsonPath(viewConfig, 'chartOptions;overviewTextOptions;key',
                                cowu.getValueByJsonPath(viewConfig, 'chartOptions;yField', 'y'));
                if ($.isNumeric(yValue) || yValue == '-') {
                    $(selector).find('.value').text(yValue);
                } else {
                    var valueArr = _.pluck(data, yField);
                    var min = yFormatter(_.min(valueArr)), max = yFormatter(_.max(valueArr)), minArr = [], maxArr = [];
                    minArr = min.match(/([0-9]+)(.*)/), maxArr = max.match(/([0-9]+)(.*)/);
                    yValueArr = yValue.match(/([0-9]+)(.*)/);
                    html = ''+yValueArr[1]+'<span class="unit">'+yValueArr[2]+'</span><img src="img/upArrow.svg"><dl style=""><dt>'+maxArr[1]+' Max</dt><dt>'+minArr[1]+' Min</dt></dl>';
                    $(selector).find('.value').html(html);
                }
            }
        }
};
 return (new MonitorInfraViewConfig()).viewConfig;

});
