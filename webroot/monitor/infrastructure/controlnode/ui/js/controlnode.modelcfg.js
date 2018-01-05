
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash', 'contrail-view', 'monitor-infra-controlnode-model', 'node-color-mapping'],
        function(_, ContrailView,  controlNodeListModelCfg, NodeColorMapping) {
    var ControlNodeModelCfg = function () {
        var self = this;
        self.modelCfg = {
            'CONTROLNODE_SENT_UPDATES_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.PeerStatsData.tx_update_stats',
                    select: 'T=, Source, SUM(tx_update_stats.reach), SUM(tx_update_stats.unreach)'
                }
            },
            'CONTROLNODE_RECEIVED_UPDATES_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.PeerStatsData.rx_update_stats',
                    select: 'T=, Source, SUM(rx_update_stats.reach), SUM(rx_update_stats.unreach)'
                }
            },
            'CONTROLNODE_SYSTEM_CPU_SHARE_MODEL': {
                baseModel: 'SYSTEM_CPU_MODEL',
                baseView: 'SYSTEM_CPU_SHARE_VIEW',
                modelCfg : {
                    config: {
                        where:'node-type = control-node'
                    }
                },
            },
            'CONTROLNODE_SYSTEM_MEMORY_USAGE_MODEL': {
                baseModel: 'SYSTEM_MEMORY_MODEL',
                baseView:'SYSTEM_MEMORY_USAGE_VIEW',
                modelCfg : {
                    config: {
                        where:'node-type = control-node'
                    }
                },
            },
            'CONTROLNODE_DISK_USAGE_INFO_MODEL': {
                baseModel:'SYSTEM_DISK_USAGE_MODEL',
                baseView:'SYSTEM_DISK_USAGE_VIEW',
                modelCfg : {
                    config: {
                        where:'node-type = control-node'
                    }
                },
            },
            'CONTROLNODE_SYSTEM_LOGS_MODEL': {
                type: "controlNode",
                source:'LOG',
                config: {
                    table_name: 'MessageTable',
                    table_type: 'LOG',
                    select: 'Source,ModuleId,MessageTS,Messagetype,Level,Category,Xmlmessage',
                    where:'ModuleId=contrail-control'
                }
            },
            'CONTROLNODE_OBJECTBGPROUTER_LOGS_MODEL': {
                type: "controlNode",
                source:'OBJECT',
                config: {
                    table_name: 'ObjectBgpRouter',
                    table_type: 'OBJECT',
                    select: 'Source,ModuleId,MessageTS,ObjectId,Messagetype,ObjectLog,SystemLog',
                    where:'ModuleId=contrail-control'
                }
            },
            'CONTROLNODE_OBJECTXMPPPEER_LOGS_MODEL': {
                type: "controlNode",
                source:'OBJECT',
                config: {
                    table_name: 'ObjectXmppPeerInfo',
                    table_type: 'OBJECT',
                    select: 'Source,ModuleId,MessageTS,ObjectId,Messagetype,ObjectLog,SystemLog',
                    where:'ModuleId=contrail-control'
                }
            },
            'CONTROLNODE_OBJECTBGPPEER_LOGS_MODEL': {
                type: "controlNode",
                source:'OBJECT',
                config: {
                    table_name: 'ObjectBgpPeer',
                    table_type: 'OBJECT',
                    select: 'Source,ModuleId,MessageTS,ObjectId,Messagetype,ObjectLog,SystemLog',
                    where:'ModuleId=contrail-control'
                }
            },
            'CONTROLNODE_MEMORY_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.mem_res)',
                    where:'process_mem_cpu_usage.__key = contrail-control'
                }
            },
            'CONTROLNODE_CONTROL_CPU_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where:'process_mem_cpu_usage.__key = contrail-control'
                }
            },
            'CONTROLNODE_NODEMGR_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where:'process_mem_cpu_usage.__key = contrail-control-nodemgr'
                }
            },
            'CONTROLNODE_DNS_CPU_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where:'process_mem_cpu_usage.__key = contrail-dns'
                }
            },
            'CONTROLNODE_NAMED_CPU_MODEL': {
                type: "controlNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                    select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                    where:'process_mem_cpu_usage.__key = contrail-named'
                }
            },
            'CONTROLNODE_LIST_MODEL': {
                type: "controlNode",
                config: controlNodeListModelCfg
            }
        };
        self.getModelCfg = function(id) {
            return self.modelCfg[id];
        };
    };
    return (new ControlNodeModelCfg()).modelCfg;
});
