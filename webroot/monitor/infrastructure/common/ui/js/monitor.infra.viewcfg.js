/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'node-color-mapping', 'core-utils'],
        function(_, ContrailView, NodeColorMapping, cowu) {
    var MonitorInfraViewConfig = function () {
        var self = this;
        self.viewConfig = {
                'SYSTEM_CPU_PERCENTILES_VIEW': {
                    view:"LineWithFocusChartView",
                    elementId : 'system-cpu-chart',
                    viewConfig: {
                        parseFn : cowu.parsePercentilesData,
                        chartOptions: {
                            title: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                            subTitle:ctwl.VROUTER_MIN_MAX_CPU_UTILIZATION,
                            colors: cowc.THREE_NODE_COLOR,
                            xAxisLabel: '',
                            //yField: 'percentileValue',
                            yAxisLabel: ctwl.VROUTER_SYSTEM_CPU_PERCENTILES,
                            yFormatter: d3.format('.2f'),
                            //groupBy:'Source',
                            yFields: monitorInfraUtils.getYFieldsForPercentile('system_cpu_usage.cpu_share')
                        }
                    }
                },
                'SYSTEM_CPU_SHARE_VIEW': {
                    elementId : monitorInfraConstants.SYSTEM_CPU_SHARE_LINE_CHART_ID,
                    view:'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            yFormatter: d3.format('.2f'),
                            subTitle:"System CPU Utilization (in 3 mins)",
                            yAxisLabel: 'System CPU Share (%)',
                            groupBy: 'Source',
                            yField: 'MAX(system_cpu_usage.cpu_share)',
                            title: "System",
                        }
                    }
                },
                'SYSTEM_MEMORY_USAGE_VIEW': {
                    elementId : monitorInfraConstants.SYSTEM_MEMORY_USAGE_LINE_CHART_ID,
                    view:'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            //yFormatter: d3.format('.2f'),
                            subTitle:"Memory usage per system (3 mins)",
                            yAxisLabel: ctwl.SYSTEM_MEMORY_USED,
                            groupBy: 'Source',
                            yField: 'MAX(system_mem_usage.used)',
                            title: "System",
                            yFormatter : function(d){
                                return formatBytes(d * 1024, true);
                            }
                        }
                    }
                },
                'SYSTEM_DISK_USAGE_VIEW': {
                    elementId : "databsenode_dbusage_chart",
                    view:'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            title: 'DB Usage',
                            subTitle:"Disk Utilization (in 3 mins)",
                            yAxisLabel: ctwl.DISK_USAGE,
                            groupBy: 'Source',
                            overViewText: false,
                            overviewTextOptions: {
                                label: 'Peak Usage',
                                value: '20 GB',
                                operator: 'max'
                            },
                            yField: 'MAX(disk_usage_info.partition_space_used_1k)',
                            yFormatter : function(d){
                                return formatBytes(d * 1024, true);
                            },margin: {
                                left: 30
                            }
                        }
                    }
                },
                'NODE_PROCESS_CPU_VIEW': {
                elementId : 'process_cpu_chart_id',
                    view:'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                            yFormatter: d3.format('.2f'),
                            groupBy: 'name',
                            yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                            //yTickFormat: cpuChartYTickFormat,
                        }
                    } 
                },
                'NODE_PROCESS_MEMORY_VIEW': {
                elementId : 'process_memory_chart_id',
                     view:'LineWithFocusChartView',
                     viewConfig: {
                         chartOptions: {
                             subTitle: 'Memory usage (in 3 mins)',
                             groupBy: 'name',
                             yField: 'MAX(process_mem_cpu_usage.mem_res)',
                             yFormatter : function(d){
                                 return formatBytes(d * 1024, true);
                             },
                             //xFormatter: xCPUChartFormatter,
                      }
                     } 
                }
        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };

};
 return (new MonitorInfraViewConfig()).viewConfig;

});
