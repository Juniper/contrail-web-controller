define(['lodash', 'contrail-view','monitor-infra-databasenode-model'],
        function(_, ContrailView, databaseNodeListModelCfg){
    var DatabaseNodeModelConfig = function () {
        var self = this;
        self.modelCfg = {
            'DATABASENODE_PERCENTILE_MODEL' : {
                source:'STATTABLE',
                type: "databaseNode",
                config: {
                    "table_name": "StatTable.VncApiStatsLog.api_stats",
                    "select": "PERCENTILES(api_stats.response_time_in_usec), PERCENTILES(api_stats.response_size)",
                    "parser": monitorInfraParsers.percentileConfigNodeSummaryChart
                }
            },
            'DATABASENODE_CASSANDRA_PENDING_COMPACTIONS_MODEL': {
                source:'STATTABLE',
                type: "databaseNode",
                config: {
                    table_name: 'StatTable.CassandraStatusData.cassandra_compaction_task',
                    select: 'T=, name, MAX(cassandra_compaction_task.pending_compaction_tasks)'
                }
            },
            'DATABASENODE_LIST_MODEL': {
                type: "databaseNode",
                config: databaseNodeListModelCfg
            }
        }
    }

    return (new DatabaseNodeModelConfig()).modelCfg;


})
