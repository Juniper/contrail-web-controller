/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'legend-view',
    'core-utils',
    "core-constants",
], function (_, LegendView, CoreUtils, cowc) {
    cowu = new CoreUtils();
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
        this.DNS_SERVER = 'dns-server:';

        //Default introspect ports
        this.ApiServerIntrospectPort = '8084';
        this.ControlNodeIntrospectPort = '8083';
        this.VRouterIntrospectPort = '8085';
        this.OpServerIntrospectPort = '8089';

        //Default feature ports
        this.ApiServerPort = '8082';
        this.OpServerPort = '8081';

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
        this.infraDetailsPageCPUChartTitle = ctwl.TITLE_CPU;
        this.CONSOLE_LOGS_REFRESH_INTERVAL = 90000;//Auto refresh interval in console tab (ms)

        this.IS_NODE_MANAGER_INSTALLED = true;

        this.HOST_DPDK = 'HOST_DPDK';

        this.STATS_BUCKET_DURATION = 2.5; //Minutes

        //Config Summary page Constants
        this.CONFIGNODE_FAILEDREQUESTS_TITLE = 'Failed Requests';
        this.CONFIGNODE_FAILEDREQUESTS_COLOR = '#d95436';
        this.CONFIGNODE_RESPONSESIZE_COLOR = '#7f9d92';

        this.CONFIGNODE_CPU_SHARE_NODE_MNGR_LINE_CHART_ID = 'confignode-cpu-share-node-mgnr-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_SCHEMA_LINE_CHART_ID = 'confignode-cpu-share-schema-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_DISCOVERY_LINE_CHART_ID = 'confignode-cpu-share-discovery-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_API_LINE_CHART_ID = 'confignode-cpu-share-api-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_SERVICE_MONITOR_LINE_CHART_ID = 'confignode-cpu-share-service-monitor-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_DEVICE_MANAGER_LINE_CHART_ID = 'confignode-cpu-share-device-manager-line-chart-id';
        this.CONFIGNODE_CPU_SHARE_IFMAP_LINE_CHART_ID = 'confignode-cpu-share-ifmap-line-chart-id';
        this.SYSTEM_CPU_SHARE_LINE_CHART_ID = 'system-cpu-share-line-chart-id';
        this.SYSTEM_MEMORY_USAGE_LINE_CHART_ID = 'system-memory-usage-line-chart-id';

        this.monitorInfraUrls = {
                TENANT_API_URL              : "/api/tenant/get-data",

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
                VROUTER_INSTANCES_IN_CHUNKS : '/api/tenant/networking/vrouter-virtual-machines/details?vRouter={0}&count={1}&startAt={2}',
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
                QUERY                       : '/api/qe/query',
                ANALYTICS_QUERY             : '/api/analytics/query',
                MSGTABLE_CATEGORY           : '/api/qe/table/values/MessageTable/Category',
                MSGTABLE_LEVEL              : '/api/qe/table/values/MessageTable/Level'
        }

        this.controlProcsForLastTimeStamp = [cowc.UVEModuleIds['CONTROLNODE']];
        this.computeProcsForLastTimeStamp = [cowc.UVEModuleIds['VROUTER_AGENT']];
        this.analyticsProcsForLastTimeStamp = [cowc.UVEModuleIds['COLLECTOR'],
                                               cowc.UVEModuleIds['OPSERVER']];
        this.configProcsForLastTimeStamp = [cowc.UVEModuleIds['APISERVER'],
                                            cowc.UVEModuleIds['DISCOVERY_SERVICE'],
                                            cowc.UVEModuleIds['SERVICE_MONITOR'],
                                            cowc.UVEModuleIds['SCHEMA']];
        this.defaultIntrospectPort = '8085';
        this.controlRouteAddressFamily = [{ id:"enet", text:"enet" },
                                          { id:"ermvpn", text:"ermvpn" },
                                          { id:"evpn", text:"evpn" },
                                          { id:"inet", text:"inet" },
                                          { id:"inetvpn", text:"inetvpn" },
                                          { id:"inet6", text:"inet6" },
                                          { id:"l3vpn", text:"l3vpn" },
                                          { id:"rtarget", text:"rtarget" }];
        this.controlRouteProtocol = [{ id:"XMPP", text:"XMPP" },
                                     { id:"BGP", text:"BGP" },
                                     { id:"ServiceChain", text:"ServiceChain" },
                                     { id:"Static", text:"Static" },
                                     { id:"Local", text:"Local" }];

        this.VROUTER_DEFAULT_MAX_THROUGHPUT = 10737418240; // 10 GB

        this.VROUTER_FLOWS_CHART_COLORS = ['#6f97ae','#d95436'];
        this.VROUTER_DROP_PACKETS_COLORS = ['#d95436'];
        this.GLOBAL_CONTROLLER_CHART_COLOR = ['#72a9d0'];

        this.dropStatsKeyList = [
            "discard",
            "pull",
            "invalid_if",
            "invalid_arp",
            "trap_no_if",
            "nowhere_to_go",
            "flow_queue_limit_exceeded",
            "flow_no_memory",
            "flow_invalid_protocol",
            "flow_nat_no_rflow",
            "flow_action_drop",
            "flow_action_invalid",
            "flow_unusable",
            "flow_table_full",
            "interface_tx_discard",
            "interface_drop",
            "duplicated",
            "push",
            "ttl_exceeded",
            "invalid_nh",
            "invalid_label",
            "invalid_protocol",
            "interface_rx_discard",
            "invalid_mcast_source",
            "head_alloc_fail",
            "pcow_fail",
            "mcast_clone_fail",
            "rewrite_fail",
            "misc",
            "invalid_packet",
            "cksum_err",
            "no_fmd",
            "invalid_vnid",
            "frag_err",
            "invalid_source",
            "mcast_df_bit",
            "l2_no_route",
            "vlan_fwd_tx",
            "vlan_fwd_enq"
        ];
    };

    return MonitorInfraConstants;
});
