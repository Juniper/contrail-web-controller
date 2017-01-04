define(['lodash', 'contrail-view', 'legend-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, configNodeListModelCfg, NodeColorMapping){
    var MonitorInfraModelConfig = function () {
        var self = this;
        self.modelCfg = {
            'SYSTEM_CPU_MODEL' : {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    "table_name": "StatTable.NodeStatus.system_cpu_usage",
                    "select": "Source,T=,MAX(system_cpu_usage.cpu_share)",
                }
            },
            'VROUTER_ACTIVE_DROP_FLOWS': {
                source: "STATTABLE",
                type: 'vRouter',
                config: [
                    {
                        table_name: 'StatTable.VrouterStatsAgent.flow_rate',
                        select: 'T=, MAX(flow_rate.active_flows)',
                    },{
                        table_name: 'StatTable.VrouterStatsAgent.drop_stats',
                        select: 'T=, SUM(drop_stats.ds_drop_pkts)',
                        mergeFn: cowu.parseAndMergeStats
                    }
                ]
            },
            'INTERFACES_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.VrouterAgent.vmi_count",
                     "select": "T=, SUM(vmi_count.active)"
                }
            },
            'INSTANCES_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.VrouterAgent.vm_count",
                     "select": "T=, SUM(vm_count.active)"
                }
            },
            'SERVICE_INSTANCES_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.VrouterAgent.vmi_count",
                     "select": "T=, SUM(vmi_count.active)"
                }
            },
            'FLOATING_IPS_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.VrouterAgent.vm_count",
                     "select": "T=, SUM(vm_count.active)"
                }
            },
            'SYSTEM_OVERALL_CPU_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.NodeStatus.system_cpu_usage",
                     "select": "T=, MAX(system_cpu_usage.cpu_share)"
                }
            },
            'SYSTEM_OVERALL_MEMORY_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.NodeStatus.system_mem_usage",
                     "select": "T=, MAX(system_mem_usage.used)"
                }
            },
            'SYSTEM_OVERALL_DISK_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.NodeStatus.disk_usage_info",
                     "select": "T=, MAX(disk_usage_info.partition_space_used_1k)"
                }
            },
            'SYSTEM_OVERALL_BANDWIDTH_MODEL': {
                source: 'STATTABLE',
                config: {
                     "table_name": "StatTable.NodeStatus.disk_usage_info",
                     "select": "T=, MAX(disk_usage_info.partition_space_used_1k)"
                }
            },

            'SYSTEM_CPU_PERCENTILES_MODEL' : {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    table_name: "StatTable.NodeStatus.system_cpu_usage",
                    select: "T=, PERCENTILES(system_cpu_usage.cpu_share)",
                },
            },
            'SYSTEM_MEMORY_PERCENTILES_MODEL' : {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    table_name: "StatTable.NodeStatus.system_cpu_usage",
                    select: "T=, PERCENTILES(system_cpu_usage.cpu_share)",
                },
            },
            'SYSTEM_MEMORY_MODEL' : {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    "table_name": "StatTable.NodeStatus.system_mem_usage",
                    "select": "Source,T=,MAX(system_mem_usage.used)",
                }
            },
            'SYSTEM_DISK_USAGE_MODEL' : {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    "table_name": "StatTable.NodeStatus.disk_usage_info",
                    "select": "T=, Source, MAX(disk_usage_info.partition_space_used_1k)",
                }
            },
            'NODE_PROCESS_CPU_MODEL': {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                }
            },
            'NODE_PROCESS_MEMORY_MODEL': {
                type: 'common',
                source: 'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.mem_res)',
                }
            },
        }
    }
    return (new MonitorInfraModelConfig()).modelCfg;
});
