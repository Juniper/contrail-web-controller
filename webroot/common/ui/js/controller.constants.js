/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {

        this.URL_ALL_DOMAINS = '/api/tenants/config/domains';

        this.URL_PROJECT_CONNECTED_GRAPH = '/api/tenant/monitoring/project-connected-graph?fqName={0}';
        this.URL_PROJECT_CONFIG_GRAPH = '/api/tenant/monitoring/project-config-graph?fqName={0}';
        this.URL_PROJECT_INSTANCES_IN_CHUNKS = '/api/tenant/networking/virtual-machines/details?fqnUUID={0}&count={1}&type={2}&startAt={3}';
        this.URL_PROJECT_NETWORKS_IN_CHUNKS = '/api/tenant/networking/virtual-networks/details?count={0}&fqn={1}&startAt={2}';
        this.URL_PROJECT_ALL_NETWORKS = '/api/tenants/networks/{0}';

        this.URL_NETWORK_CONNECTED_GRAPH = '/api/tenant/monitoring/network-connected-graph?fqName={0}';
        this.URL_NETWORK_CONFIG_GRAPH = '/api/tenant/monitoring/network-config-graph?fqName={0}';
        this.URL_NETWORK_SUMMARY = 'api/tenant/networking/virtual-network/summary?fqNameRegExp={0}';
        this.URL_ALL_NETWORKS_DETAILS = '/api/tenant/networking/virtual-networks/details';

        this.URL_NETWORKS_DETAILS_IN_CHUNKS = '/api/tenant/networking/virtual-networks/details?count={0}&startAt={1}';
        this.URL_NETWORK_SUMMARY = '/api/tenant/networking/virtual-network/summary?fqNameRegExp={0}';

        this.URL_NETWORK_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vn?minsSince={0}&fqName={1}&sampleCnt={2}&useServerTime=true';

        this.URL_INSTANCE_SUMMARY = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp={0}?flat';
        this.URL_INSTANCE_DETAILS_IN_CHUNKS = '/api/tenant/networking/virtual-machines/details?count={0}&startAt={1}';
        this.URL_INSTANCE_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vm?minsSince={0}&fqName={1}&sampleCnt={2}&ip={3}&vmName={4}&vmVnName={5}&useServerTime=true';

        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';
        this.URL_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';

        this.FILTERS_COLUMN_VN = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
            'UveVirtualNetworkConfig:connected_networks', 'UveVirtualNetworkAgent:virtualmachine_list', 'UveVirtualNetworkAgent:acl', 'UveVirtualNetworkAgent:total_acl_rules',
            //'UveVirtualNetworkAgent:ingress_flow_count', 'UveVirtualNetworkAgent:egress_flow_count', 'UveVirtualNetworkAgent:vrf_stats_list',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes'];

        this.FILTERS_COLUMN_VM = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list',
            'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:if_bmap_list'];

        this.TYPE_VIRTUAL_NETWORK = "virtual-network";
        this.TYPE_VIRTUAL_MACHINE = "virtual-machine";

        this.URL_NETWORK = '/#p=mon_networking_networks&q[fqName]={{params.fqName}}&q[uuid]=&q[type]=network&q[view]=details';
        this.URL_INSTANCE = '/#p=mon_networking_instances&q[uuid]={{key}}&q[vn]={{params.vn}}&q[type]=instance&q[view]=details';

        this.get = function () {
            var args = arguments;
            return cowc.getValueFromTemplate(args);
        };

        this.TMPL_VN_PORT_HEAT_CHART = "network-port-heat-chart-template";
        this.TMPL_INSTANCE_TRAFFIC_STATS = "instance-traffic-stats-tab-template";

        this.DEFAULT_DOMAIN = "default-domain";
        this.UCID_PREFIX_MN = "monitor-networking";
        this.UCID_PREFIX_BREADCRUMB = "breadcrumb";
        this.UCID_PREFIX_GRAPHS = "graphs";
        this.UCID_PREFIX_CHARTS = "charts";
        this.UCID_PREFIX_LISTS = "lists";
        this.UCID_PREFIX_MN_LISTS = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_LISTS + ":";
        this.UCID_PREFIX_MN_GRAPHS = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_GRAPHS + ":";
        this.UCID_PREFIX_MN_CHARTS = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_CHARTS + ":";

        this.UCID_ALL_VN_LIST = this.UCID_PREFIX_MN_LISTS + "all-virtual-networks";
        this.UCID_ALL_VM_LIST = this.UCID_PREFIX_MN_LISTS + "all-virtual-machines";
        this.UCID_DEFAULT_DOMAIN_VN_LIST = this.UCID_PREFIX_MN_LISTS + this.DEFAULT_DOMAIN + ":virtual-networks";
        this.UCID_DEFAULT_DOMAIN_PROJECT_LIST = this.UCID_PREFIX_MN_LISTS + this.DEFAULT_DOMAIN + ":projects";

        this.UCID_BC_ALL_DOMAINS = this.UCID_PREFIX_BREADCRUMB + ':all-domains';
        this.UCID_BC_DOMAIN_ALL_PROJECTS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-projects';
        this.UCID_BC_PROJECT_ALL_NETWORKS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-networks';
        this.UCID_BC_NETWORK_ALL_INSTANCES = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-instances';

        this.UCID_PROJECT_VN_PORT_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:port-stats";
        this.UCID_NETWORK_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:traffic-stats";
        this.UCID_INSTANCE_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:{2}:traffic-stats";

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };

        this.UMID_INSTANCE_UVE = "uve:{0}";
        this.SERVICE_VN_EXCLUDE_LIST = ['svc-vn-left','svc-vn-right','svc-vn-mgmt'];
        this.PROTOCOL_MAP = [{'id': 6, 'text': 'TCP'}, {'id': 17, 'text': 'UDP'}, {'id': 1, 'text': 'ICMP'}];
    };
    return CTConstants;
});
