/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view','node-color-mapping'],
        function(_, ContrailView, NodeColorMapping){
    var DatabseNodeViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'databsenode-percentile-bar-view': {
                baseModel: 'DATABASENODE_LIST_MODEL', 
                modelCfg:{
                },
                viewCfg: {
                    elementId :ctwl.DATABASENODE_PERCENTILE_BAR_VIEW,
                    title : '',
                    view : "PercentileBarView",
                    viewPathPrefix:
                        ctwl.DATABASENODE_VIEWPATH_PREFIX,
                    app : cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig : {
                    }
                },
                itemAttr: {
                    height: 0.3,
                    width: 1/2
                }
            },
            'databasenode-cpu-share': {
                baseModel: 'NODE_PROCESS_CPU_MODEL',
                baseView: 'NODE_PROCESS_CPU_VIEW',
                modelCfg: {
                    type: 'databaseNode',
                    modelId: 'DATABASENODE_CASSANDRA_CPU_MODEL',
                    config: {
                        where: 'process_mem_cpu_usage.__key = cassandra'
                    }
                },
                viewCfg: {
                    elementId : ctwl.DATABASENODE_CPU_SHARE_LINE_CHART_ID,
                    viewConfig: {
                        chartOptions: {
                            yAxisLabel: ctwl.DATABSE_NODE_CPU_SHARE,
                            title: ctwl.DATABASENODE_SUMMARY_TITLE,
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.DATABSE_NODE_CPU_SHARE,
                    width: 1/2,
                    height: 0.9
                }
            },
            'databasenode-memory': {
                baseModel: 'NODE_PROCESS_MEMORY_MODEL',
                baseView: 'NODE_PROCESS_MEMORY_VIEW',
                modelCfg: {
                    type: 'databaseNode',
                   modelId: 'DATABASENODE_CASSANDRA_MEMORY_MODEL',
                    config: {
                        where: 'process_mem_cpu_usage.__key = cassandra'
                    }
                },
                viewCfg: {
                    elementId : ctwl.DATABASENODE_MEM_SHARE_LINE_CHART_ID,
                    viewConfig: {
                        chartOptions: {
                            yAxisLabel: 'Cassandra Memory Usage',
                            title: ctwl.DATABASENODE_SUMMARY_TITLE,
                        }
                     }
                 },
                 itemAttr: {
                     title: ctwl.DATABSE_NODE_MEMORY,
                     width: 1/2
                }
            },
            'databasenode-system-cpu-share': {
                baseModel:'SYSTEM_CPU_MODEL',
                baseView:'SYSTEM_CPU_SHARE_VIEW',
                modelCfg : {
                    type: 'databaseNode',
                    modelId: 'DATABASENODE_SYSTEM_CPU_MODEL',
                    config: {
                        where:'node-type = database-node'
                    }
                },
                itemAttr: {
                     width: 1/2
                }
            },
            'databasenode-system-memory-usage': {
                baseModel: 'SYSTEM_MEMORY_MODEL',
                baseView:'SYSTEM_MEMORY_USAGE_VIEW',
                modelCfg : {
                    type: 'databaseNode',
                    modelId: 'DATABASENODE_SYSTEM_MEMORY_MODEL',
                    config: {
                        where:'node-type = database-node'
                    }
                },
                itemAttr: {
                     title: ctwl.DATABSE_NODE_MEMORY,
                     width: 1/2
                }
            },
            'databasenode-disk-usage-info': {
                baseModel:'SYSTEM_DISK_USAGE_MODEL',
                baseView:'SYSTEM_DISK_USAGE_VIEW',
                modelCfg : {
                    type: 'databaseNode',
                    modelId: 'DATABASENODE_DISK_USAGE_MODEL',
                    config: {
                        where:'node-type = database-node'
                    }
                },
                itemAttr: {
                     title: ctwl.DATABSE_NODE_MEMORY,
                     width: 1/2
                }
            },
            'databasenode-pending-compactions': {
                baseModel: 'DATABASENODE_CASSANDRA_PENDING_COMPACTIONS_MODEL',
                modelCfg: {
                    
                },
                viewCfg: {
                        elementId : ctwl.DATABASENODE_COMPACTIONS_CHART_ID,
                        view:'StackedAreaChartView',
                        viewConfig: {
                        chartOptions: {
                            title: ctwl.DATABASENODE_SUMMARY_TITLE,
                            subTitle:"Pending compactions per DB (in 3 mins)",
                            yAxisLabel: ctwl.DATABSE_NODE_PENDING_COMPACTIONS,
                            xAxisLabel: '',
                            groupBy: 'name',
                            bar: true,
                            yField: 'MAX(cassandra_compaction_task.pending_compaction_tasks)',
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.DATABSE_NODE_PENDING_COMPACTIONS,
                    height: 1.2,
                    width: 1/2
                }
            },
            'databasenode-zookeeper': {
                baseModel: 'NODE_PROCESS_CPU_MODEL',
                baseView: 'NODE_PROCESS_CPU_VIEW',
                modelCfg:{
                    modelId: 'DATABASENODE_ZOO_KEEPER_CPU_MODEL',
                    type: 'databaseNode',
                    config: {
                        where: 'process_mem_cpu_usage.__key = zookeeper'
                    }
                },
                viewCfg:{
                    elementId : 'database_node_zookeeper',
                    viewConfig: {
                        chartOptions: {
                            yAxisLabel: ctwl.DATABASE_NODE_ZOOKEEPER_CPU_SHARE,
                            title: ctwl.DATABASENODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.DATABASE_NODE_ZOOKEEPER_CPU_SHARE,
                    width: 1/2
                }
            },
            'databasenode-kafka': {
                baseModel: 'NODE_PROCESS_CPU_MODEL',
                baseView: 'NODE_PROCESS_CPU_VIEW',
                modelCfg: {
                    type: 'databaseNode',
                    modelId: 'DATABASENODE_KAFKA_CPU_MODEL',
                    config: {
                        where: 'process_mem_cpu_usage.__key = kafka'
                    }
                },
                viewCfg:{
                    elementId : 'database_node_kafka',
                    viewConfig: {
                        chartOptions: {
                            yAxisLabel: ctwl.DATABASE_NODE_KAFKA_CPU_SHARE,
                            title: ctwl.DATABASENODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.DATABASE_NODE_KAFKA_CPU_SHARE,
                    width: 1/2
                }
            },
            'database-grid-view': {
                baseModel: 'DATABASENODE_LIST_MODEL',
                baseView: 'DATABASENODE_GRID_VIEW',
                modelCfg: {
                },
                itemAttr: {
                    height: 2,
                }
            }
        };
    };
    return (new DatabseNodeViewConfig()).viewConfig;
});
