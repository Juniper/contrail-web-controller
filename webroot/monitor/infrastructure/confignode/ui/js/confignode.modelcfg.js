define(['lodash', 'contrail-view', 'legend-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, configNodeListModelCfg, NodeColorMapping){
    var ConfigNodeModelConfig = function () {
        var self = this;
        self.modelCfg = {
            'CONFIGNODE_PERCENTILE_TIMESIZE_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    "table_name": "StatTable.VncApiStatsLog.api_stats",
                    "select": "PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
                    "parser": monitorInfraParsers.percentileConfigNodeSummaryChart
                }
            }, 
            'CONFIGNODE_APIREQUESTS_MODEL' : {
                type: "configNode",
                source: 'STATTABLE',
                config: {
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "Source, T, api_stats.operation_type," +
                        " api_stats.response_time_in_usec, api_stats.response_size," +
                        " api_stats.resp_code, name"
                }
            },
            'CONFIGNODE_USERAGENT_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.useragent, COUNT(api_stats)"
                }
            },
            'CONFIGNODE_OBJECTTYPE_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.object_type, COUNT(api_stats)"
                }
            },
            'CONFIGNODE_REMOTEIP_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.remote_ip, COUNT(api_stats)"
                }
            },
            'CONFIGNODE_PROJECTS_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.VncApiStatsLog.api_stats',
                    select: "T=, api_stats.project_name, COUNT(api_stats)"
                }
            },
            'CONFIGNODE_SCHEMA_CPU_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = contrail-schema'
                }
            },
            'CONFIGNODE_DISCOVERY_CPU_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = contrail-discovery:0'
                }
            },
            'CONFIGNODE_API_CPU_MODEL': {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = contrail-api:0'
                }
            },
            'CONFIGNODE_SERVICE_MONITOR_CPU_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = contrail-svc-monitor'
                }
            },
            'CONFIGNODE_DEVICE_MANAGER_CPU_MODEL' : {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = contrail-device-manager'
                }
            },
            'CONFIGNODE_IFMAP_CPU_MODEL': {
                type: "configNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where: 'process_mem_cpu_usage.__key = ifmap'
                }
            }
        }
    }

    return (new ConfigNodeModelConfig()).modelCfg;
})
