define(['lodash', 'contrail-view','monitor-infra-vrouter-model'],
        function(_, ContrailView, vRouterListModel){
    var VRouterModelConfig = function () {
        var self = this;
        self.modelCfg = {
            'VROUTER_FLOW_RATE_MODEL' : {
                source:"STATTABLE",
                type: 'vRouter',
                config: {
                    table_name: 'StatTable.VrouterStatsAgent.flow_rate',
                    select: 'T=, Source, MAX(flow_rate.active_flows)',
                    parser: parseDataForFlowsDrops
                }    
            },
            'VROUTER_DROP_PACKET_MODEL': {
                source:"STATTABLE",
                type: 'vRouter',
                config: {
                     table_name: 'StatTable.VrouterStatsAgent.drop_stats',
                     select: 'T=, SUM(drop_stats.ds_drop_pkts)'
                }
            },
            'VROUTER_AGENT_CPU_PERCENTILES_MODEL': {
                 source:"STATTABLE",
                 type: 'vRouter',
                 config:{
                     table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                     select: 'T=, PERCENTILES(process_mem_cpu_usage.cpu_share)',
                     where: 'process_mem_cpu_usage.__key = contrail-vrouter-agent'
                 }
            },
            'VROUTER_AGENT_MEMORY_PERCENTILES_MODEL': {
                 source:"STATTABLE",
                 type: 'vRouter',
                 config:{
                     table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                     select: 'T=, PERCENTILES(process_mem_cpu_usage.mem_res)',
                     where: 'process_mem_cpu_usage.__key = contrail-vrouter-agent'
                 }
            },
            'VROUTER_ACTIVE_FLOWS_PERCENTILE_MODEL': {
                source:"STATTABLE",
                type: 'vRouter',
                 config:{
                     table_name: 'StatTable.VrouterStatsAgent.flow_rate',
                     select: 'T=, PERCENTILES(flow_rate.active_flows)'
                 }
             },
            'VROUTER_LIST_MODEL': {
                type: 'vRouter',
                config: vRouterListModel
            }
        }

        function parseDataForFlowsDrops (response) {
            var ret = [];
            var data = getValueByJsonPath(response,'data',[]);
            var groupedByTime = _.groupBy(data,'T=');
            var field = 'MAX(flow_rate.active_flows)';
            for(var key in groupedByTime) {
                var tmp = {"T=":_.isNaN(key)? key: parseInt(key)};
                var arr = groupedByTime[key];
                var sum = _.reduce(arr,function(memo,num){return memo + num[field]},0);
                tmp[field] = sum;
                ret.push(tmp);
            }
            return ret;
        }
    }

    return (new VRouterModelConfig()).modelCfg;


})
