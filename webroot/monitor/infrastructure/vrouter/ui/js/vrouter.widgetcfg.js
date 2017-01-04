/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view'],
        function(_, ContrailView){
    var VRouterViewConfig = function () {
        var self = this;
        self.viewConfig = {
             "vrouter-flow-rate-area-chart": {
                baseModel: 'VROUTER_FLOW_RATE_MODEL',
                modelCfg: {
                    
                },
                viewCfg: {
                     elementId: 'flow_rate_area_chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         chartOptions: {
                             title: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                             subTitle: "Sampled Active Flows across vRouters",
                             colors: cowc.FIVE_NODE_COLOR,
                             xAxisLabel: '',
                             forceY: [0, 5],
                             yFormatter: function(y) {
                                 return _.isNaN(y)? y : parseInt(y);
                             },
                             groupBy: null,
                             yAxisLabel: ctwl.VROUTER_ACTIVE_FLOWS_DROPS_LABEL,
                             yField: 'MAX(flow_rate.active_flows)'
                         }
                     }
                },
                itemAttr: {
                    title: ctwl.VROUTER_ACTIVE_FLOWS_DROP_STATS,
                    height: 1,
                    width: 2/3
                }
             },
             "vrouter-cpu-mem-scatter-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                     elementId: 'vrouter-cpu-mem-chart',
                     view: "ZoomScatterChartView",
                     viewConfig: {
                         chartOptions: {
                             xLabel: 'Agent CPU Share (%)',
                             yLabel: 'Agent Memory (MB)',
                             xFormatter: function(x) {
                                 return cowu.numberFormatter(x,0);
                             },
                             bubbleCfg: {
                                 defaultMaxValue: monitorInfraConstants.VROUTER_DEFAULT_MAX_THROUGHPUT
                             },
                             showColorFilter: false,
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             clickCB: monitorInfraUtils.onvRouterDrillDown,
                             tooltipConfigCB: monitorInfraUtils.vRouterTooltipFn
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_CPU_MEM_UTILIZATION,
                     height: 1,
                     width: 1/3
                 }
             },
             "vrouter-drop-packets-chart": {                 
                 baseModel: 'VROUTER_DROP_PACKET_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                      elementId: 'drop_packets_chart',
                      view: 'LineWithFocusChartView',
                      viewConfig: {
                          chartOptions: {
                              title: ctwl.VROUTER_DROP_PACKETS,
                              subTitle: " Packet Drops across vRouters",
                              colors: monitorInfraConstants.VROUTER_DROP_PACKETS_COLORS,
                              staticColor: true,
                              xAxisLabel: '',
                              forceY: [0, 5],
                              yFormatter: function(y) {
                                  return _.isNaN(y)? y : parseInt(y);
                              },
                              groupBy: null,
                              yField: 'SUM(drop_stats.ds_drop_pkts)',
                              yAxisLabel: ctwl.VROUTER_DROP_PACKETS
                          }
                      }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_DROP_PACKETS,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-bandwidth-percentile-chart": function() {
                 return {
                     modelCfg: {
                        source: "STATTABLE",
                        type: 'vRouter',
                        config: [
                            {
                                table_name: 'StatTable.VrouterStatsAgent.phy_band_in_bps',
                                select: 'T=, PERCENTILES(phy_band_in_bps.__value)'
                            },
                            {
                                table_name: 'StatTable.VrouterStatsAgent.phy_band_out_bps',
                                select: 'T=, PERCENTILES(phy_band_out_bps.__value)',
                                mergeFn: cowu.parseAndMergeStats
                            }
                        ]
                    },
                    viewCfg: {
                      elementId: 'band-in-out-chart',
                      view: "LineWithFocusChartView",
                      viewConfig: {
                          parseFn: cowu.parsePercentilesData,
                          chartOptions: {
                              colors: cowc.FIVE_NODE_COLOR,
                              title: 'Bandwidth Utilization',
                              subTitle: 'vRouter Bandwidth in/out (95th Percentile)',
                              xAxisLabel: '',
                              yAxisLabel: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                              yLabels: ['Bandwidth In', 'Bandwidth Out'],
                              yFormatter: function(y) {
                                  return formatBytes(y, null, null, null, null, true);
                              },
                              yFields: ['PERCENTILES(phy_band_in_bps.__value);95','PERCENTILES(phy_band_out_bps.__value);95']
                          }
                      }
                    },
                    itemAttr: {
                      title: ctwl.VROUTER_BANDWIDTH_PERCENTILE,
                      height: 0.7,
                      width: 1/3
                    }
                 }
             },
             "vrouter-system-cpu-percentiles-chart": {
                     baseModel: 'SYSTEM_CPU_PERCENTILES_MODEL',
                     modelCfg: {
                        type: 'vRouter',
                        modelId: 'VROUTER_SYSTEM_CPU_PERCENTILES_MODEL',
                        config: {
                            where: 'node-type = vrouter'
                        }
                     },
                     viewCfg: {
                         view: "LineWithFocusChartView",
                         elementId: 'system-cpu-chart',
                         viewConfig: {
                             parseFn: cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                             chartOptions: {
                                 title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                                 subTitle: ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                                 colors: cowc.THREE_NODE_COLOR,
                                 xAxisLabel: '',
//                                 yField: 'percentileValue',
                                 yAxisLabel: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
//                                 groupBy:'Source',
                                 yFields: monitorInfraUtils.getYFieldsForPercentile('system_cpu_usage.cpu_share')
                             }
                         }
                     },
                     itemAttr: {
                         title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                         height: 0.7,
                         width: 1/3
                     }
             },
             "vrouter-system-memory-percentiles-chart": {
                baseModel: 'SYSTEM_MEMORY_PERCENTILES_MODEL',
                modelCfg: {
                    type: 'vRouter',
                    modelId: 'VROUTER_SYSTEM_MEMORY_PERCENTILE_MODEL',
                    config: {
                        where: 'node-type = vrouter'
                    }
                },
                viewCfg: {
                    view: "LineWithFocusChartView",
                    elementId: 'system-memory-chart',
                    viewConfig: {
                        parseFn: cowu.parsePercentilesData,
//                             parseFn : function(data, chartOptions) {
//                                 var data = cowu.parsePercentilesDataForStack(data,chartOptions);
//                                 return cowu.chartDataFormatter(data, chartOptions);
//                             },
                        chartOptions: {
                            title: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                            xAxisLabel: '',
                            colors: cowc.THREE_NODE_COLOR,
                            yAxisLabel: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                            subTitle: "Max Avg Min Memory Utilization",
//                                 groupBy:'Source',
//                                 yField: 'percentileValue',
                            yFields: monitorInfraUtils.getYFieldsForPercentile('system_mem_usage.used'),
                            yFormatter: function(y) {
                                return formatBytes(y * 1024, true, null, null,
                                        null);
                            }
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.VROUTER_SYSTEM_MEMORY_PERCENTILES,
                    height: 0.7,
                    width: 1/3
                }
             },
             "vrouter-summary-grid": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 baseView: 'VROUTER_GRID_VIEW',
                 viewCfg: {
                     class: "y-overflow-scroll",
                     title: ctwl.VROUTER_SUMMARY_TITLE,
                     viewConfig: {
                         colorFn: {},
                         cssClass: "y-overflow-scroll"
                     }
                 },
                 itemAttr: {
                    height: 10
                 }                 
             },
             "vrouter-system-cpu-mem-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {
                     
                 },
                 viewCfg: {
                     elementId: 'vrouter-system-cpu-mem-chart',
                     view: 'ZoomScatterChartView',
                     viewConfig: {
                         chartOptions: {
                             xField: 'NodeStatus;system_cpu_usage;cpu_share',
                             xFormatter: function(x) {return $.isNumeric(x) ? x : NaN;},
                             xLabelFormat: function(x) {return $.isNumeric(x) ? x : NaN;},
                             yField: 'NodeStatus;system_mem_usage;used',
                             yFormatter: function(y) {
                                             return $.isNumeric(y) ? parseFloat(
                                             parseFloat(y / 1024).toFixed(2)) : NaN;
                                         },
                             yLabelFormat: function(y) {
                                 return $.isNumeric(y) ? parseFloat(
                                 parseFloat(y / 1024/ 1024).toFixed(2)) : NaN;
                             },
                             xLabel: 'System CPU Share (%)',
                             yLabel: 'System Memory (GB)',
                             sizeField: 'size',
                             showColorFilter: false,
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             tooltipConfigCB: function(currObj,format) {
                                 var options = {};
                                 options['tooltipContents'] = [
                                       {label: 'Host Name', value: currObj['name']},
                                       {label: 'Version', value: currObj['version']},
                                       {label: 'System CPU Share (%)', value: getValueByJsonPath(currObj,'NodeStatus;system_cpu_usage;cpu_share','-')},
                                       {label: 'System Memory (GB)', value: function(){
                                               var mem = getValueByJsonPath(currObj,'NodeStatus;system_mem_usage;used','-');
                                               mem = $.isNumeric(mem) ? parseFloat(
                                                       parseFloat(mem / 1024).toFixed(2)) : NaN;
                                               return formatBytes(mem * 1024 * 1024);
                                           }()
                                       },
                                       {label: 'Virtual Networks', value: currObj['vnCnt']},
                                       {label: 'Instances', value: currObj['instCnt']},
                                       {label: 'Interfaces', value: currObj['intfCnt']}
                                   ];
                                 return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                             },
                             clickCB: monitorInfraUtils.onvRouterDrillDown
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_SYSTEM_CPU_MEMORY,
                     height: 1,
                     width: 0.5
                 }
             },
             "vrouter-vn-int-inst-chart": {
                 baseModel: 'VROUTER_LIST_MODEL',
                 modelCfg: {

                 },
                 viewCfg: {
                     elementId: 'vrouter-vn-int-chart',
                     view: 'ZoomScatterChartView',
                     viewConfig: {
                         chartOptions: {
                             xField: 'vnCnt',
                             yField: 'instCnt',
                             xLabel: 'Virtual Networks',
                             yLabel: 'Instances',
                             sizeField: 'intfCnt',
                             showColorFilter: false,
                             xFormatter: function(x) {
                                 return cowu.numberFormatter(x,0);
                             },
                             bucketTooltipFn: monitorInfraUtils.vRouterBucketTooltipFn,
                             tooltipConfigCB: function(currObj,format) {
                                 var options = {};
                                 options['tooltipContents'] = [
                                       {label: 'Host Name', value: currObj['name']},
                                       {label: 'Version', value: currObj['version']},
                                       {label: 'Virtual Networks', value: currObj['vnCnt']},
                                       {label: 'Instances', value: currObj['instCnt']},
                                       {label: 'Interfaces', value: currObj['intfCnt']}
                                   ];
                                 return monitorInfraUtils.getVRouterScatterChartTooltipFn(currObj,format,options);
                             },
                             clickCB: monitorInfraUtils.onvRouterDrillDown
                         },
                         cfDataSource: self.cfDataSource
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_VN_INTF_INST,
                     height: 1,
                     width: 0.5
                 }
             },
             "vrouter-agent-cpu-percentiles-chart": {
                 baseModel: 'VROUTER_AGENT_CPU_PERCENTILES_MODEL',
                 modelCfg: {
                 },
                 viewCfg: {
                     elementId: 'agent-cpu-share-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                             subTitle: ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                             yFields: monitorInfraUtils.getYFieldsForPercentile('process_mem_cpu_usage.cpu_share'),
                             yFormatter: function(y) {
                                 return y;
                             }
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_AGENT_CPU_PERCENTILES,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-agent-mem-usage-percentiles-chart": {
                 baseModel: 'VROUTER_AGENT_MEMORY_PERCENTILES_MODEL',
                 modelCfg: {
                    
                 },
                 viewCfg: {
                     elementId: 'agent-memory-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                             subTitle: "Max Avg Min Memory Utilization",
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                             yFields: monitorInfraUtils.getYFieldsForPercentile('process_mem_cpu_usage.mem_res'),
                             yFormatter: function(y) {
                                 return formatBytes(y * 1024, true, null, null,
                                         null);
                             }
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_AGENT_MEMORY_PERCENTILES,
                     height: 0.7,
                     width: 1/3
                 }
             },
             "vrouter-active-flows-percentiles-chart": {
                 baseModel: 'VROUTER_ACTIVE_FLOWS_PERCENTILE_MODEL',
                 modelCfg: {
                    
                 },
                 viewCfg: {
                     elementId: 'active-flows-chart',
                     view: 'LineWithFocusChartView',
                     viewConfig: {
                         parseFn: cowu.parsePercentilesData,
                         chartOptions: {
                             title: 'Active Flows Percentiles',
                             subTitle: "Max Avg Min Flow Count",
                             colors: cowc.THREE_NODE_COLOR,
                             xAxisLabel: '',
                             yAxisLabel: 'Active Flows Percentiles',
                             yFields: monitorInfraUtils.getYFieldsForPercentile('flow_rate.active_flows')
                         }
                     }
                 },
                 itemAttr: {
                     title: ctwl.VROUTER_ACTIVE_FLOWS_PERCENTILES,
                     height: 0.7,
                     width: 1/3
                 }
             }
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id]();
        };
    }
    return (new VRouterViewConfig()).viewConfig;
});
