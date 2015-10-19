/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var MonitorInfraConstants = function () {
        this.infraNodesTree;
        this.noDataStr = '-';
        this.controlNodetabs = ['details', 'peers', 'routes', 'console','servicechaining'];
        this.computeNodeTabs = ['details', 'interfaces', 'networks', 'acl', 'flows','routes', 'console'];
        this.analyticsNodeTabs = ['details', 'generators', 'qequeries', 'console'];
        this.configNodeTabs = ['details', 'console', 'generators', 'qequeries'];
        this.dbNodeTabs = ['details'];

        this.COMPUTE_NODE = 'computeNode';
        this.CONTROL_NODE = 'controlNode';
        this.ANALYTICS_NODE = 'analyticsNode';
        this.CONFIG_NODE = 'configNode';
        this.DATABASE_NODE = 'databaseNode';

        this.excludeProcessList = ['contrail-config-nodemgr','contrail-analytics-nodemgr','contrail-control-nodemgr','contrail-snmp-collector','contrail-topology',
            'contrail-vrouter-nodemgr','openstack-nova-compute','contrail-svc-monitor','contrail-schema','contrail-discovery','contrail-zookeeper','redis-sentinel','contrail-device-manager'];
        this.vRouterDashboardChartInitialized = false;
        this.controlNodesDashboardChartInitialized = false;
        this.analyticsNodesDashboardChartInitialized = false;
        this.configNodesDashboardChartInitialized = false;
        this.computeNodeTabStrip = "compute_tabstrip";
        this.configNodeTabStrip = "config_tabstrip";
        this.aNodeTabStrip = "analytics_tabstrip";
        this.ctrlNodeTabStrip = "control_tabstrip";
        this.dbNodeTabStrip = "db_tabstrip";
        this.infraDetailsPageCPUChartTitle = 'CPU Share (%)';
        this.CONSOLE_LOGS_REFRESH_INTERVAL = 90000;//Auto refresh interval in console tab (ms)

        this.IS_NODE_MANAGER_INSTALLED = true;

        this.monitorInfraUrls = {
                VROUTER_BASE                : '/api/admin/monitor/infrastructure/vrouter/',
                VROUTER_SUMMARY             : '/api/admin/monitor/infrastructure/vrouters/summary',
                VROUTER_CACHED_SUMMARY      : '/api/admin/monitor/infrastructure/vrouters/cached-summary',
                VROUTER_DETAILS             : '/api/admin/monitor/infrastructure/vrouter/details?hostname={0}&basic={1}',
                VROUTER_INTERFACES          : '/api/admin/monitor/infrastructure/vrouter/interface',
                VROUTER_NETWORKS            : '/api/admin/monitor/infrastructure/vrouter/vn',
                VROUTER_ACL                 : '/api/admin/monitor/infrastructure/vrouter/acl',
                VROUTER_FLOWS               : '/api/admin/monitor/infrastructure/vrouter/flows',
                VROUTER_VRF_LIST            : '/api/admin/monitor/infrastructure/vrouter/vrf-list?ip={0}&introspectPort={1}',
                VROUTER_UNICAST_ROUTES      : '/api/admin/monitor/infrastructure/vrouter/ucast-routes',
                VROUTER_MCAST_ROUTES        : '/api/admin/monitor/infrastructure/vrouter/mcast-routes',
                VROUTER_L2_ROUTES           : '/api/admin/monitor/infrastructure/vrouter/l2-routes',
                VROUTER_UCAST6_ROUTES       : '/api/admin/monitor/infrastructure/vrouter/ucast6-routes',

                CONTROLNODE_SUMMARY         : '/api/admin/monitor/infrastructure/controlnodes/summary',
                CONTROLNODE_DETAILS         : '/api/admin/monitor/infrastructure/controlnode/details?hostname={0}',
                CONTROLNODE_PEERS           : '/api/admin/monitor/infrastructure/controlnode/paged-bgppeer?hostname={0}&count={1}',
                CONTROLNODE_ROUTE_INST_LIST : '/api/admin/monitor/infrastructure/controlnode/routes/rout-inst-list?ip={0}',
                CONTROLNODE_PEER_LIST       : '/api/admin/monitor/infrastructure/controlnode/peer-list?hostname={0}',
                CONTROLNODE_ROUTES          : '/api/admin/monitor/infrastructure/controlnode/routes',

                ANALYTICS_SUMMARY           : '/api/admin/monitor/infrastructure/analyticsnodes/summary',
                ANALYTICS_DETAILS           : '/api/admin/monitor/infrastructure/analyticsnode/details?hostname={0}',
                ANALYTICS_GENERATORS        : '/api/admin/monitor/infrastructure/analyticsnode/generators?hostname={0}&count={1}',

                CONFIG_SUMMARY              : '/api/admin/monitor/infrastructure/confignodes/summary',
                CONFIG_DETAILS              : '/api/admin/monitor/infrastructure/confignode/details?hostname={0}',

                DATABASE_SUMMARY            : '/api/admin/monitor/infrastructure/dbnodes/summary',
                DATABASE_DETAILS            : '/api/admin/monitor/infrastructure/dbnode/details?hostname={0}',

                FLOWSERIES_CPU              : '/api/tenant/networking/flow-series/cpu?moduleId={0}&minsSince={1}&sampleCnt={2}&source={3}&endTime={4}',
                QUERY                       : '/api/admin/reports/query',
                MSGTABLE_CATEGORY           : '/api/admin/table/values/MessageTable/Category',
                MSGTABLE_LEVEL              : '/api/admin/table/values/MessageTable/Level'
        }

        this.UVEModuleIds = {
                VROUTER_AGENT       : 'contrail-vrouter-agent',
                CONTROLNODE         : 'contrail-control',
                COLLECTOR           : 'contrail-collector',
                OPSERVER            : 'contrail-analytics-api',
                QUERYENGINE         : 'contrail-query-engine',
                APISERVER           : 'contrail-api',
                DISCOVERY_SERVICE   : 'contrail-discovery',
                SERVICE_MONITOR     : 'contrail-svc-monitor',
                SCHEMA              : 'contrail-schema',
                ANALYTICS_NODEMGR   : 'contrail-analytics-nodemgr',
                CONFIG_NODE         : 'ConfigNode',
                IFMAP               : 'ifmap',
                DATABASE            : 'contrail-database',
                KAFKA               : 'kafka'
        }

        this.controlProcsForLastTimeStamp = [this.UVEModuleIds['CONTROLNODE']];
        this.computeProcsForLastTimeStamp = [this.UVEModuleIds['VROUTER_AGENT']];
        this.analyticsProcsForLastTimeStamp = [this.UVEModuleIds['COLLECTOR'],
                                               this.UVEModuleIds['OPSERVER']];
        this.configProcsForLastTimeStamp = [this.UVEModuleIds['APISERVER'],
                                            this.UVEModuleIds['DISCOVERY_SERVICE'],
                                            this.UVEModuleIds['SERVICE_MONITOR'],
                                            this.UVEModuleIds['SCHEMA']];
        this.defaultIntrospectPort = '8085';

    };

    return MonitorInfraConstants;
});
