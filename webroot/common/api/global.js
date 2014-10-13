/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var global = {};

global.STR_GET_CONTROL_NODE_CPU_FLOW_SERIES = 'getControlNodeCPULoadFlowSeries'; 
global.STR_GET_VROUTER_NODE_CPU_FLOW_SERIES = 'getvRouterCPULoadFlowSeries';
global.STR_GET_SVC_MON_CPU_FLOW_SERIES = 'getSvcMonCPULoadFlowSeries';
global.STR_GET_API_SERVER_CPU_FLOW_SERIES = 'getAPIServerCPULoadFlowSeries';
global.STR_GET_SCHEMA_FLOW_SERIES = 'getSchemaCPULoadFlowSeries';
global.STR_GET_COLLECTOR_CPU_FLOW_SERIES = 'getCollectorCPULoadFlowSeries';
global.STR_GET_QE_CPU_FLOW_SERIES = 'getQECPULoadFlowSeries';
global.STR_GET_OPS_CPU_FLOW_SERIES = 'getOpServerCPULoadFlowSeries';
global.FlOW_SERIES_STAT_TYPE = 'oracleStats'
global.STR_GET_VN_STATS_PER_VROUTER = 'vnStatsPerVRouter';

global.QUERY_JSON = {
    'StatTable.UFlowData.flow': {"table": 'StatTable.UFlowData.flow', "start_time": "",
        "end_time": "", "select_fields": ["name", "flow.flowtype", "flow.dip",
        "flow.sip", "flow.protocol", "flow.dport", "flow.sport"],
        "sort_fields": []},
    'StatTable.PRouterEntry.ifStats': {"table":"StatTable.PRouterEntry.ifStats",
        "start_time":"","end_time":"","select_fields":["SUM(ifStats.ifInUcastPkts)",
        "SUM(ifStats.ifInMulticastPkts)", "SUM(ifStats.ifInBroadcastPkts)",
        "SUM(ifStats.ifOutUcastPkts)", "SUM(ifStats.ifOutMulticastPkts)",
        "SUM(ifStats.ifOutBroadcastPkts)"],
        "where":[[{"name":"name","value":"","op":1,"value2":null,
            "suffix":{"name":"ifStats.ifIndex","value":"","suffix":null,"op":1,"value2":null}}]]}
}

global.NODE_TYPE_PROUTER = 'physical-router';
global.NODE_TYPE_VROUTER = 'virtual-router';
global.NODE_TYPE_VIRTUAL_MACHINE = 'virtual-machine';
global.NODE_TYPE_NONE = '-';

global.NODE_CHASSIS_TYPE_TOR = 'tor';
global.NODE_CHASSIS_TYPE_SPINE = 'spine';
global.NODE_CHASSIS_TYPE_CORE = 'coreswitch';
global.NODE_CHASSIS_TYPE_NONE = '-';


module.exports = global;

