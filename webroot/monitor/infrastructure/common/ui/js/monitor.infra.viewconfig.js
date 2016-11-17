/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'node-color-mapping'],
        function(_, ContrailView, NodeColorMapping){
    var MonitorInfraViewConfig = function () {
        var nodeColorMapping = new NodeColorMapping(),
        colorFn = nodeColorMapping.getNodeColorMap;
        var self = this;
        self.viewConfig = {
                'system-cpu-share': function () {
                    return {
                        modelCfg: {
                            source: 'STATTABLE',
                            config: {
                                "table_name": "StatTable.NodeStatus.system_mem_cpu_usage",
                                "select": "Source, T=, MAX(system_mem_cpu_usage.cpu_share)"
                            }
                        },
                        viewCfg:{
                            elementId : monitorInfraConstants.SYSTEM_CPU_SHARE_LINE_CHART_ID,
                            view:'LineWithFocusChartView',
                            viewConfig: {
                                chartOptions: {
                                    yFormatter: d3.format('.2f'),
                                    subTitle:"System CPU Utilization (in 3 mins)",
                                    yAxisLabel: 'System CPU Share (%)',
                                    groupBy: 'Source',
                                    colors: colorFn,
                                    yField: 'MAX(system_mem_cpu_usage.cpu_share)',
                                    title: "System",
                                }
                            }
                        },itemAttr: {
                            title: ctwl.SYSTEM_CPU_SHARE
                        }
                    };
                },
                'system-memory-usage': function () {
                    return {
                        modelCfg: {
                            source: 'STATTABLE',
                            config: {
                                "table_name": "StatTable.NodeStatus.system_mem_usage",
                                "select": "Source,T=,MAX(system_mem_usage.used)"
                            }
                        },
                        viewCfg: {
                            elementId : monitorInfraConstants.SYSTEM_MEMORY_USAGE_LINE_CHART_ID,
                            view:'LineWithFocusChartView',
                            viewConfig: {
                                chartOptions: {
                                    //yFormatter: d3.format('.2f'),
                                    subTitle:"Memory usage per system (3 mins)",
                                    yAxisLabel: ctwl.SYSTEM_MEMORY_USED,
                                    groupBy: 'Source',
                                    colors: colorFn,
                                    yField: 'MAX(system_mem_usage.used)',
                                    title: "System",
                                    yFormatter : function(d){
                                        return formatBytes(d, true);
                                   }
                                }
                            }
                        },itemAttr: {
                            title: ctwl.SYSTEM_MEMORY_USED
                        }
                    };
                },
                'disk-usage-info': function (){
                    return {
                        modelCfg: {
                            source: 'STATTABLE',
                            config: {
                                "table_name": "StatTable.NodeStatus.disk_usage_info",
                                "select": "T=, Source, MAX(disk_usage_info.partition_space_used_1k)",
                                "parser": function(response){
                                    var stats = response;
                                    $.each(stats, function(idx, obj) {
                                        obj['MAX(disk_usage_info.partition_space_used_1k)'] =
                                            ifNull(obj['MAX(disk_usage_info.partition_space_used_1k)'],0) * 1024; //Converting KB to Bytes
                                    });
                                    return stats;
                                }
                            }
                        },
                        viewCfg: {
                            elementId : "databsenode_dbusage_chart",
                            view:'LineWithFocusChartView',
                            viewConfig: {
                                chartOptions: {
                                    title: ctwl.DISK_USAGE,
                                    subTitle:"Disk utilization (in 3 mins)",
                                    xAxisLabel: '',
                                    yAxisLabel: ctwl.DISK_USAGE,
                                    groupBy: 'Source',
                                    colors: colorFn,
                                    yField: 'MAX(disk_usage_info.partition_space_used_1k)',
                                    yFormatter : function(d){
                                        return formatBytes(d, true);
                                   },margin: {
                                       left: 62
                                   }
                                }
                            }
                        },
                        itemAttr: {
                            title: ctwl.DISK_USAGE
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
