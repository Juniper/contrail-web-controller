~/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    "protocol",
    'core-constants',
    'contrail-common'
], function (_, protocolUtils, cowc, Contrail) {
    var contrail = new Contrail()

    var CTConstants = function () {

        this.URL_ALL_DOMAINS = '/api/tenants/config/all-domains';
        this.URL_ALL_PROJECTS = '/api/tenants/config/all-projects';
        this.URL_PROJECTS = '/api/tenants/config/projects';
        this.URL_ALL_PROJECTS_VCENTER_OR_CONFIG = '/api/tenants/projects';

        this.URL_PROJECT_CONNECTED_GRAPH = '/api/tenant/monitoring/project-connected-graph?fqName={0}';
        this.URL_PROJECT_CONFIG_GRAPH = '/api/tenant/monitoring/project-config-graph?fqName={0}';
        this.URL_PROJECT_INSTANCES_IN_CHUNKS = '/api/tenant/networking/virtual-machines/details?fqnUUID={0}&count={1}&nextCount={2}&type={3}&startAt={4}';
        this.URL_PROJECT_NETWORKS_IN_CHUNKS = '/api/tenant/networking/virtual-networks/details?count={0}&nextCount={1}&fqn={2}&startAt={3}';
        this.URL_PROJECT_ALL_NETWORKS = '/api/tenants/networks/{0}';

        this.URL_NETWORK_CONNECTED_GRAPH = '/api/tenant/monitoring/network-connected-graph?fqName={0}';
        this.URL_NETWORK_CONFIG_GRAPH = '/api/tenant/monitoring/network-config-graph?fqName={0}';
        this.URL_NETWORK_SUMMARY = 'api/tenant/networking/virtual-network/summary?fqNameRegExp={0}';
        this.URL_ALL_NETWORKS_DETAILS = '/api/tenant/networking/virtual-networks/details';

        this.URL_NETWORKS_DETAILS_IN_CHUNKS = '/api/tenant/networking/virtual-networks/details?count={0}&nextCount={1}&startAt={2}';
        this.URL_NETWORK_SUMMARY = '/api/tenant/networking/virtual-network/summary?fqNameRegExp={0}';

        this.URL_NETWORK_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vn?minsSince={0}&fqName={1}&sampleCnt={2}&useServerTime=true';
        this.URL_NETWORK_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';
        this.URL_CONNECTED_NETWORK_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vn?minsSince={0}&srcVN={1}&destVN={2}&sampleCnt={3}&useServerTime=true';

        this.URL_INSTANCE_CONNECTED_GRAPH = '/api/tenant/monitoring/instance-connected-graph?fqName={0}&instanceUUID={1}';
        this.URL_INSTANCE_CONFIG_GRAPH = '/api/tenant/monitoring/instance-config-graph?fqName={0}';
        this.URL_INSTANCE_DETAIL = '/api/tenant/networking/virtual-machine?fqNameRegExp={0}?flat';
        this.URL_INSTANCES_SUMMARY = '/api/tenant/networking/virtual-machines/summary';
        this.URL_INSTANCE_DETAILS_IN_CHUNKS = '/api/tenant/networking/virtual-machines/details?count={0}&nextCount={1}&startAt={2}';
        this.URL_INSTANCE_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vm?minsSince={0}&fqName={1}&sampleCnt={2}&ip={3}&vmName={4}&vmVnName={5}&useServerTime=true';
        this.URL_INSTANCE_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port&ip={1}';

        this.URL_GET_INSTANCES_LIST = '/api/tenant/networking/get-instances-list?startAt={0}';
        this.URL_GET_NETWORK_INSTANCES = '/api/tenant/networking/get-instances?count={0}&nextCount={1}&startAt={2}';
        this.URL_GET_INTERFACES_LIST = '/api/tenant/networking/get-interfaces-list?startAt={0}';
        this.URL_GET_NETWORK_INTERFACES = '/api/tenant/networking/get-interfaces?count={0}&nextCount={1}&startAt={2}';
        this.URL_GET_VIRTUAL_NETWORKS_LIST = '/api/tenant/networking/get-virtual-networks-list?startAt={0}';
        this.URL_GET_VIRTUAL_NETWORKS = '/api/tenant/networking/get-virtual-networks?count={0}&nextCount={1}&startAt={2}';
        this.URL_GET_VMI_UUID_LIST = '/api/tenants/config/get-config-uuid-list?type=virtual-machine-interface&parentUUID={0}';
        this.URL_CONFIG_GET_VM_DETAILS_PAGED = '/api/tenants/config/get-virtual-machine-details-paged';

        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';
        this.URL_VM_INTERFACES = '/api/tenant/networking/virtual-machine-interfaces/summary';

        this.URL_GET_GLOBAL_VROUTER_CONFIG = '/api/tenants/config/global-vrouter-config';

        this.URL_GET_PROJECT_QUOTA_USED = '/api/tenants/config/project-quotas-info?id={0}';
        this.URL_GET_GLOBAL_VROUTER_CONFIG = '/api/tenants/config/global-vrouter-config';
        this.URL_GET_GLOBAL_ASN = '/api/tenants/admin/config/global-asn';
        this.URL_GET_SECURITY_GROUP_DETAILS = '/api/tenants/config/securitygroup-details?projUUID={0}';
        this.URL_GET_SECURITY_GROUP = '/api/tenants/config/securitygroup-details';
        this.URL_GET_SEC_GRP_LIST = '/api/tenants/config/securitygroup';
        this.URL_GET_LIST_SERVICE_INSTS_CONFIG = '/api/tenants/config/list-service-instances/{0}';
        this.URL_GET_SERVICE_INSTS_STATUS = '/api/tenants/config/service-instances-status/{0}';
        this.URL_GET_SERVICE_INSTS_NOVA_STATUS =
            '/api/tenants/config/service-instances-nova-status?projId={0}&count={1}&lastKey={2}';
        this.URL_GET_SERVICE_INST_TMPLTS = '/api/tenants/config/service-instance-templates/{0}';

        this.FILTERS_COLUMN_VN = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
            'UveVirtualNetworkConfig:connected_networks', 'UveVirtualNetworkAgent:virtualmachine_list', 'UveVirtualNetworkAgent:acl', 'UveVirtualNetworkAgent:total_acl_rules',
            'UveVirtualNetworkAgent:ingress_flow_count', 'UveVirtualNetworkAgent:egress_flow_count',
            'UveVirtualNetworkAgent:in_tpkts', 'UveVirtualNetworkAgent:out_tpkts',
            //'UveVirtualNetworkAgent:vrf_stats_list', 'UveVirtualNetworkAgent:vn_stats',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes'
         ];


        this.FILTERS_INSTANCE_LIST_INTERFACES= [
            //Generic Details
            'UveVMInterfaceAgent:vm_name',
            'UveVMInterfaceAgent:uuid',
            'UveVMInterfaceAgent:vm_uuid',
            'UveVMInterfaceAgent:mac_address',
            'UveVMInterfaceAgent:active',
            'UveVMInterfaceAgent:is_health_check_active',
            'UveVMInterfaceAgent:health_check_instance_list',
            'UveVMInterfaceAgent:gateway',
            'UveVMInterfaceAgent:in_bw_usage',
            'UveVMInterfaceAgent:out_bw_usage',
            'UveVMInterfaceAgent:if_stats',
            //Networking
            'UveVMInterfaceAgent:virtual_network',
            'UveVMInterfaceAgent:ip6_address',
            'UveVMInterfaceAgent:ip_address',
            'UveVMInterfaceAgent:ip6_active',
            'UveVMInterfaceAgent:floating_ips',
            'UveVMInterfaceAgent:fip_agg_stats'
        ];

        this.FILTERS_COLUMN_VM = [
            'UveVirtualMachineAgent:vm_name',
            'UveVirtualMachineAgent:uuid',
            'UveVirtualMachineAgent:vrouter',
            'UveVirtualMachineAgent:cpu_info',
            'UveVirtualMachineAgent:interface_list',
            'UveVirtualMachineAgent:fip_stats_list',
            'UveVirtualMachineAgent:if_bmap_list',
            //'VirtualMachineStats:if_stats'
        ];

        this.URL_NETWORK = '/#p=mon_networking_networks&q[type]=network&q[view]=details&q[focusedElement][fqName]={{key}}&q[focusedElement][type]=virtual-network';
        this.URL_INSTANCE = '/#p=mon_networking_instances&q[type]=instance&q[view]=details&q[focusedElement][fqName]={{params.vn}}&q[focusedElement][uuid]={{key}}&q[focusedElement][type]=virtual-network';
        this.URL_VROUTER = '/#p=mon_infra_vrouter&q[node]={{key}}';

        this.URL_LOGICAL_ROUTER_IN_CHUNKS = '/api/admin/config/get-data?type=logical-router&count={0}&fqnUUID={1}';
        this.URL_All_NETWORK_IN_PROJECT = '/api/tenants/config/all-virtual-networks?uuid={0}';
        this.URL_All_EXTERNAL_NETWORK = '/api/tenants/config/external-virtual-networks';
        this.URL_LOGICAL_ROUTER_POST = '/api/tenants/config/logicalrouter';
        this.URL_LOGICAL_ROUTER_PUT = '/api/tenants/config/logicalrouter/{0}';
        this.URL_LOGICAL_ROUTER_VIEW_PATH_PREFIX = 'config/networking/logicalrouter/ui/js/views/';

        this.URL_POLICIES_VIEW_PATH_PREFIX = 'config/networking/policy/ui/js/views/';
        this.URL_POLICIES_IN_CHUNKS = '/api/admin/config/get-data?type=network-policy&count={0}&fqnUUID={1}';
        this.URL_NETWORK_POLICIES = '/api/admin/config/get-data?type=network-policy';

        this.URL_ROUTING_POLICY_PATH_PREFIX = 'config/networking/routingpolicy/ui/js/views/';
        this.URL_ROUTING_POLICY_IN_CHUNKS = '/api/tenants/config/routingpolicy/{0}';

        this.URL_PORT_POST = '/api/tenants/config/ports';
        this.URL_PORT_PUT = '/api/tenants/config/ports/{0}';
        this.URL_PORT_VIEW_PATH_PREFIX = 'config/networking/port/ui/js/views/';
        this.URL_GET_PORT_UUID = '/api/tenants/config/get-config-uuid-list?type=virtual-machine-interface&parentUUID={0}';
        this.URL_GET_PORT = '/api/tenants/config/get-virtual-machine-details-paged';
        this.get = function () {
            var args = arguments;
            return cowc.getValueFromTemplate(args);
        };

        this.TYPE_DOMAIN = "domain";
        this.TYPE_PROJECT = "project";
        this.TYPE_NETWORK = "network";
        this.TYPE_INSTANCE = "instance";
        this.ALL_NETWORKS = "all networks";
        this.ALL_PROJECTS = "all projects";
        this.TYPE_VN = 'vn';
        this.TYPE_VIRTUAL_NETWORK = "virtual-network";
        this.TYPE_VIRTUAL_MACHINE = "virtual-machine";
        this.TYPE_VIRTUAL_MACHINE_INTERFACE = "virtual-machine-interface";

        this.ALL_PROJECT_DROPDOWN_OPTION = [{
            name: 'all projects', value: 'all', fq_name: 'all', display_name: 'all projects'
        }];
        this.ALL_NETWORK_DROPDOWN_OPTION = [{
            name: 'all networks', value: 'all', fq_name: 'all', display_name: 'all networks'
        }];

        this.TMPL_VN_PORT_HEAT_CHART = "network-port-heat-chart-template";
        this.TMPL_TRAFFIC_STATS_TAB = "traffic-stats-tab-template";
        this.TMPL_GRAPH_CONTROL_PANEL_SEARCH = "graph-control-panel-search-template";
        this.TMPL_FORM_RESULT = 'form-result-page-template';
        this.TMPL_SESSION_ANALYZER = "session-analyzer-view-template";

        this.COOKIE_VIRTUAL_NETWORK = contrail.getCookie(this.TYPE_VIRTUAL_NETWORK);
        this.UCID_PREFIX_MN = "monitor-networking";
        this.UCID_PREFIX_BREADCRUMB = "breadcrumb";
        this.UCID_PREFIX_GRAPHS = "graphs";
        this.UCID_PREFIX_CHARTS = "charts";
        this.UCID_PREFIX_UVES = "uves";
        this.UCID_PREFIX_LISTS = "lists";
        this.UCID_PREFIX_MN_LISTS = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_LISTS + ":";
        this.UCID_PREFIX_MN_GRAPHS = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_GRAPHS + ":";
        this.UCID_PREFIX_MN_UVES = this.UCID_PREFIX_MN + ":" + this.UCID_PREFIX_UVES + ":";

        this.UCID_ALL_VN_LIST = this.UCID_PREFIX_MN_LISTS + "all-virtual-networks";
        this.UCID_ALL_VM_LIST = this.UCID_PREFIX_MN_LISTS + "all-virtual-machines";
        this.UCID_COOKIE_DOMAIN_VN_LIST = this.UCID_PREFIX_MN_LISTS + this.COOKIE_DOMAIN + ":virtual-networks";
        this.UCID_COOKIE_DOMAIN_PROJECT_LIST = this.UCID_PREFIX_MN_LISTS + this.COOKIE_DOMAIN + ":projects";

        this.UCID_BC_ALL_DOMAINS = this.UCID_PREFIX_BREADCRUMB + ':all-domains';
        this.UCID_BC_ALL_SA_SETS = this.UCID_PREFIX_BREADCRUMB + ':all-sa-sets';
        this.UCID_BC_ALL_GLOBAL_SYS_CONFIGS = this.UCID_PREFIX_BREADCRUMB + ':all-global-sys-configs';
        this.UCID_BC_DOMAIN_ALL_PROJECTS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-projects';
        this.UCID_BC_DOMAIN_ALL_DNS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-dns';
        this.UCID_BC_PROJECT_ALL_NETWORKS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-networks';
        this.UCID_BC_NETWORK_ALL_INSTANCES = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-instances';

        this.UCID_PROJECT_VN_PORT_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:port-stats";
        this.UCID_PROJECT_VM_PORT_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:port-stats";
        this.UCID_NETWORK_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:traffic-stats";
        this.UCID_INSTANCE_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:{2}:traffic-stats";
        this.UCID_CONNECTED_NETWORK_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:traffic-stats";
        this.UCID_INSTANCE_INTERFACE_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:interfaces";
        this.UCID_PROJECT_INTERFACE_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:interfaces";
        this.UCID_NETWORK_INTERFACE_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:interfaces";
        this.UCID_ALL_INTERFACE_LIST = this.UCID_PREFIX_MN_LISTS + "all-interfaces";
        this.UCID_INSTANCE_CPU_MEMORY_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:cpu-memory";

        this.UCID_NODE_CPU_MEMORY_LIST = 'node_details' + "{0}:cpu-memory";

        this.GRAPH_DIR_LR = "LR";
        this.GRAPH_DIR_TB = "TB";

        this.DEFAULT_GRAPH_DIR = this.GRAPH_DIR_LR;

        this.ZOOMED_VN_MARGIN = {top: 5, bottom: 5, left: 15, right: 15};
        this.ZOOMED_VN_OFFSET_X = 10;
        this.VM_GRAPH_SIZE = {width: 30, height: 30};
        this.VM_GRAPH_MARGIN = {top: 10, bottom: 10, left: 0, right: 0};
        this.VM_CENTER_LINK_THICKNESS = 1;
        this.MAX_VM_TO_PLOT = 200;

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };

        this.UMID_INSTANCE_UVE = "uve:{0}";
        this.SERVICE_VN_EXCLUDE_LIST = ['svc-vn-left','svc-vn-right','svc-vn-mgmt', 'default-virtual-network', '__link_local__'];
        this.PROTOCOL_MAP = [{'id': 6, 'text': 'TCP'}, {'id': 17, 'text': 'UDP'}, {'id': 1, 'text': 'ICMP'}];

        this.GRAPH_ELEMENT_PROJECT = 'project';
        this.GRAPH_ELEMENT_NETWORK = 'virtual-network';
        this.GRAPH_ELEMENT_INSTANCE = 'virtual-machine';
        this.GRAPH_ELEMENT_CONNECTED_NETWORK = 'connected-network';
        this.GRAPH_ELEMENT_NETWORK_POLICY = 'network-policy';

        this.TOP_IN_LAST_MINS = 10;
        this.NUM_DATA_POINTS_FOR_FLOW_SERIES = 120;
        this.LINK_CONNECTOR_STRING = " --- ";
        //percentile constants
        this.PERCENTILE_TEXT_VIEW_TEMPLATE = "percentile-text-view-template";
        this.PERCENTILE_BAR_VIEW_TEMPLATE = "percentile-bar-view-template";
        // Config DB constants
        this.TMPL_CDB_ITEM_DELETE = "cdb-delete-item-template";
        this.DELETE_KEY_TYPE = "delete-key";
        this.DELETE_KEY_VALUE_TYPE = "delete-key-value";
        this.URL_OBJECT_UUID_TABLE = "/api/query/cassandra/keys/obj_uuid_table";
        this.URL_OBJECT_SHARED_TABLE = "/api/query/cassandra/keys/obj_shared_table";
        this.OBJECT_SHARED_TABLE = "obj_shared_table";
        this.OBJECT_UUID_TABLE = "obj_uuid_table";

        /*
         * Setting/Introspect
         */
        this.TMPL_INTROSPECT_PAGE = "introspect-page-template";
        this.INTROSPECT_FORM_TYPE_RESULTS = "results";
        this.INTROSPECT_CONTROL_NODE_PORTS = {
            "control-node"      :"8083",
            "dns"               :"8092",
            "node-manager"      :"8101"
        };
        this.INTROSPECT_VIRTUAL_ROUTER_PORTS = {
            "agent"             :"8085",
            "node-manager"      :"8102"
        };
        this.INTROSPECT_CONFIG_NODE_PORTS = {
            "api"               :"8084",
            "schema"            :"8087",
            "service-monitor"   :"8088",
            "device-manager"    :"8096",
            "node-manager"      :"8100"
        };
        this.INTROSPECT_ANALYTICS_NODE_PORTS = {
            // 8081: '',
            "collector"         :"8089",
            "analytics-api"     :"8090",
            "query-engine"      :"8091",
            "node-manager"      :"8104",
            "alarm-generator"   :"5995",
            "SNMP-collector"    :"5920",
            "topology"          :"5921"
        };

        this.INTROSPECT_PORT_NODE_MAP = {
            "control"           :"8083",
            "config"            :"8084",
            "vrouter"           :"8085",
            "analytics"         :"8089"
        };

        // Underlay constants
        this.UNDERLAY_TOPOLOGY_CACHE = "underlayTopology";
        this.UNDERLAY_TABS_VIEW_ID = 'underlayTabsView';
        this.UNDERLAY_TAB_ID = 'underlayTabs';
        this.TRACEFLOW_RADIOBUTTON_ID = 'traceFlowRadioBtns';
        this.TRACEFLOW_DROPDOWN_ID = 'traceFlowDropdown';
        this.TRACEFLOW_RESULTS_GRID_ID = 'traceFlowResultsGrid';
        this.DEFAULT_INTROSPECTPORT = '8085';
        this.UNDERLAY_PROUTER_INTERFACE_TAB_ID = 'pRouterInterfaces';
        this.UNDERLAY_TRACEFLOW_TAB_ID = 'traceFlow';
        this.UNDERLAY_DETAILS_TAB_ID = 'details';
        this.TIMERANGE_DROPDOWN_VALUES = [
            {'id': 600, 'text': 'Last 10 Mins'},
            {'id': 1800, 'text': 'Last 30 Mins'},
            {'id': 3600, 'text': 'Last 1 Hr'},
            {'id': 21600, 'text': 'Last 6 Hrs'},
            {'id': 43200, 'text': 'Last 12 Hrs'},
            {'id': -1, 'text': 'Custom'}
        ];
        this.TIMERANGE_DROPDOWN_ADDITIONAL_VALUES = [
            {'id': -2, 'text': 'Since'}
        ];
        this.UNDERLAY_SEARCHFLOW_TAB_ID = 'searchFlow';
        this.UNDERLAY_TRAFFICSTATS_TAB_ID = 'trafficStats';
        this.PROUTER = 'physical-router';
        this.VROUTER = 'virtual-router';
        this.VIRTUALMACHINE = 'virtual-machine';
        this.BARE_METAL_SERVER='bare-metal-server';
        this.UNDERLAY_LINK = 'link';
        this.TRACEFLOW_MAXATTEMPTS = 3;
        this.TRACEFLOW_INTERVAL = 5;
        this.UNDERLAY_FLOW_INFO_TEMPLATE = "flow-info-template";

        this.getProjectsURL = function (domainObj, dropdownOptions) {
            /* Default: get projects from keystone or API Server as specified in
             * config.global.js, getDomainProjectsFromApiServer is true, then
             * from API Server else from keystone
             */
            var getProjectsFromIdentity = null;
            var config = null;
            if (null != dropdownOptions) {
                getProjectsFromIdentity = dropdownOptions.getProjectsFromIdentity;
                config = dropdownOptions.config;
            }

            var url = '/api/tenants/config/projects/' + domainObj.name,
                role = globalObj['webServerInfo']['role'],
                activeOrchModel = globalObj['webServerInfo']['loggedInOrchestrationMode'];

            if ((((null == getProjectsFromIdentity) || (false == getProjectsFromIdentity)) && ((null == config) || (false == config)))) {
                url = '/api/tenants/projects/' + domainObj.name;
            }
            if(activeOrchModel == 'vcenter') {
                url = '/api/tenants/config/projects/' + domainObj.name;
            }

            return url;
        };

        this.constructReqURL = function (urlConfig) {
            var reqUrlParamObj = this.constructReqURLParams(urlConfig);
            return reqUrlParamObj.url + '?' + $.param(reqUrlParamObj.reqParams);
        };

        this.constructReqURLParams = function(urlConfig) {
            var url = "", length = 0, context,
                fqName = contrail.checkIfExist(urlConfig['fqName']) ? decodeURIComponent(urlConfig['fqName']) : urlConfig['fqName'];

            if (fqName != null)
                length = fqName.split(':').length;
            else
                fqName = "*";

            context = urlConfig['context'];

            //Decide context based on fqName length
            if ((context == null) && (length > 0)) {
                var contextMap = ['domain', 'project'];
                context = contextMap[length - 1];
            }

            //Pickup the correct URL in this if loop
            if (context == 'domain') {
                url = "/api/tenant/networking/domain/stats/top"
                if (urlConfig['type'] == 'summary')
                    url = "/api/tenant/networking/domain/summary"
            } else if (context == 'project') {
                url = "/api/tenant/networking/network/stats/top"
                if (urlConfig['type'] == 'summary')
                    url = "/api/tenant/networking/project/summary"
                else if (urlConfig['type'] == 'portRangeDetail')
                    url = "/api/qe/query";
            } else if (context == 'network') {
                url = "/api/tenant/networking/network/stats/top"
                if (urlConfig['type'] == 'portRangeDetail')
                    url = "/api/qe/query";
                var urlMap = {
                    summary: '/api/tenant/networking/vn/summary',
                    flowseries: '/api/tenant/networking/flow-series/vn',
                    details: '/api/tenant/networking/network/details'
                }
                if (ifNull(urlConfig['widget'], urlConfig['type']) in urlMap)
                    url = urlMap[ifNull(urlConfig['widget'], urlConfig['type'])];
            } else if (context == 'connected-nw') {
                url = "/api/tenant/networking/network/connected/stats/top"
                var urlMap = {
                    flowseries: '/api/tenant/networking/flow-series/vn',
                    summary: '/api/tenant/networking/network/connected/stats/summary'
                }
                if (ifNull(urlConfig['widget'], urlConfig['type']) in urlMap)
                    url = urlMap[ifNull(urlConfig['widget'], urlConfig['type'])];
            } else if (context == 'instance') { //Instance
                url = "/api/tenant/networking/vm/stats/top"
                var urlMap = {
                    flowseries: '/api/tenant/networking/flow-series/vm',
                    summary: '/api/tenant/networking/vm/stats/summary'
                }
                if (ifNull(urlConfig['widget'], urlConfig['type']) in urlMap)
                    url = urlMap[ifNull(urlConfig['widget'], urlConfig['type'])];
            }
            //End - pick the correct URL
            if ((urlConfig['type'] == 'instance') && (urlConfig['context'] != 'instance')) {
                url = "/api/tenant/networking/virtual-machines"
            }
            //If need statistics from the beginning
            if (urlConfig['source'] == 'uve') {
                if ($.inArray(urlConfig['type'], ['project', 'network']) > -1)
                    url = '/api/tenant/networking/virtual-network/summary'
            }
            var reqParams = {};
            //No time range required as summary stats are from the beginning
            if (urlConfig['type'] != 'summary') {
                //Retrieve only top 5 if it's not the entire list
                //Exclude list where limit is not applicable
                if ($.inArray(urlConfig['view'], ['list', 'flowseries']) == -1) {
                    if (urlConfig['widget'] != 'flowseries')
                        urlConfig['limit'] = ifNull(urlConfig['limit'], 5);
                }
                //Time-related queries
                if (urlConfig['fromUTC'] != null) {
                } else if (urlConfig['time'] == null) {
                    urlConfig['time'] = '10m';
                }
                if (urlConfig['time'] != null) {
                    var startEndUTC = getFromToUTC(urlConfig['time']);
                    delete urlConfig['time'];
                    urlConfig['fromUTC'] = startEndUTC[0];
                    urlConfig['toUTC'] = startEndUTC[1];
                }
                $.extend(reqParams, {minsSince: ctwc.TOP_IN_LAST_MINS});
            }
            if (urlConfig['limit'] != null)
                $.extend(reqParams, {limit: urlConfig['limit']});
            else
                $.extend(reqParams, {limit: 100});    //Hack
            //Rename fqName variable as per NodeJS API requirement
            if (fqName != null) {
                //For flow-series,need to pass fqName as srcVN
                if (context == 'connected-nw') {
                    $.extend(reqParams, {'srcVN': urlConfig['srcVN'], 'destVN': fqName});
                } else if (urlConfig['widget'] == 'flowseries') {
                    if (context == 'instance') {
                        $.extend(reqParams, {
                            'fqName': ifNull(urlConfig['vnName'], fqName),
                            'ip': urlConfig['ip']
                        });
                    } else
                        $.extend(reqParams, {'fqName': fqName});        //change queryParameter to fqName
                } else if (urlConfig['type'] == 'details') {
                    if (context == 'network')
                        $.extend(reqParams, {'uuid': urlConfig['uuid']});
                } else if (context == 'instance') {
                    $.extend(reqParams, {'fqName': urlConfig['vnName'], 'ip': urlConfig['ip']});
                } else
                    $.extend(reqParams, {'fqName': fqName});
            }

            //If port argument is present,just copy it..arguments that need to be copied to reqParams as it is
            $.each(['port', 'protocol', 'vmName', 'vmVnName', 'useServerTime'], function (idx, field) {
                if (urlConfig[field] != null) {
                    //$.extend(reqParams,{port:obj[field]});
                    reqParams[field] = urlConfig[field];
                }
            });
            if (urlConfig['type'] == 'portRangeDetail') {
                var fqName = fqName, protocolCode;
                reqParams['timeRange'] = 600;
                reqParams['table_name'] = 'FlowSeriesTable';
                reqParams['table_type'] = 'FLOW';
                if (urlConfig['startTime'] != null) {
                    reqParams['from_time_utc'] = urlConfig['startTime'];
                    reqParams['to_time_utc'] = urlConfig['endTime'];
                } else {
                    reqParams['from_time_utc'] = new XDate().addMinutes(-10).getTime();
                    reqParams['to_time_utc'] = new XDate().getTime();
                }

                protocolCode = [];

                $.each(urlConfig['protocol'], function (idx, value) {
                    protocolCode.push(protocolUtils.getProtocolCode(value));
                });
                if (fqName.split(':').length == 2) {
                    fqName += ':*';//modified the fqName as per the flow series queries
                }
                var portType = urlConfig['portType'] == 'src' ? 'sport' : 'dport',
                    whereArr = [];

                $.each(protocolCode, function (idx, currProtocol) {
                    if(contrail.checkIfExist(urlConfig['ip'])) {
                        whereArr.push(contrail.format("({3}={0} AND sourcevn={1} AND protocol={2} AND sourceip={4})", urlConfig['port'], fqName, currProtocol, portType, urlConfig['ip']));
                    } else {
                        whereArr.push(contrail.format("({3}={0} AND sourcevn={1} AND protocol={2})", urlConfig['port'], fqName, currProtocol, portType));
                    }
                });

                reqParams['select'] = "sourcevn, destvn, sourceip, destip, protocol, sport, dport, sum(bytes), sum(packets),flow_count";
                reqParams['where'] = whereArr.join(' OR ');
                delete reqParams['fqName'];
                delete reqParams['protocol'];
            }
            //Strip-off type if not required
            if (urlConfig['type'] != null && ($.inArray(urlConfig['type'], ['summary', 'flowdetail', 'portRangeDetail']) == -1) &&
                ($.inArray(urlConfig['widget'], ['flowseries']) == -1))
                $.extend(reqParams, {type: urlConfig['type']});

            //Add extra parameters for flowseries
            if (urlConfig['widget'] == 'flowseries') {
                $.extend(reqParams, {'sampleCnt': ctwc.NUM_DATA_POINTS_FOR_FLOW_SERIES});
                //If useServerTime flag is true then the webserver timeStamps will be send in startTime and endTime to query engine
                $.extend(reqParams, {'minsSince': 60, 'useServerTime': true, 'fip': urlConfig['fip']});
            }
            //Don't append startTime/endTime if minsSince is provided as need to use realtive times
            /*Always send the startTime and endTime instead of minsSince
             if(reqParams['minsSince'] != null) {
             reqParams['endTime'] = new Date().getTime();
             reqParams['startTime'] = new Date(new XDate().addMinutes(-reqParams['minsSince'])).getTime();
             //delete reqParams['minsSince'];
             }*/

            //Strip-off limit & minsSince if not required
            if (((urlConfig['type'] == 'instance') && (urlConfig['context'] != 'instance')) || (urlConfig['source'] == 'uve') || urlConfig['type'] == 'portRangeDetail') {
                delete reqParams['limit'];
                delete reqParams['minsSince'];
                delete reqParams['endTime'];
                delete reqParams['startTime'];
            }
            if (urlConfig['source'] == 'uve') {
                if (urlConfig['type'] != 'instance') {
                    delete reqParams['fqName'];
                    if (fqName == '' || fqName == '*')
                        reqParams['fqNameRegExp'] = '*';
                    else
                        reqParams['fqNameRegExp'] = '*' + fqName + ':*';
                } else {
                    reqParams['fqName'] = '';
                }
            }

            if ((urlConfig['portType'] != null) && (urlConfig['port'].toString().indexOf('-') > -1)) {
                //As NodeJS API expects same URL for project & network and only fqName will be different
                if (url.indexOf('/top') > -1) {
                    url = '/api/tenant/networking/network/stats/top';
                    reqParams['portRange'] = urlConfig['port'];
                    if (urlConfig['startTime'] != null)
                        reqParams['startTime'] = urlConfig['startTime'];
                    if (urlConfig['endTime'] != null)
                        reqParams['endTime'] = urlConfig['endTime'];
                    delete reqParams['port'];
                }
            }
            //reqParams['limit'] = 100;
            delete reqParams['limit'];

            return {url: url, reqParams: reqParams};
        };

        this.STATS_SELECT_FIELDS = {
            'virtual-network': {
                'inBytes': 'SUM(vn_stats.in_bytes)',
                'outBytes': 'SUM(vn_stats.out_bytes)',
                'inPkts': 'SUM(vn_stats.in_pkts)',
                'outPkts': 'SUM(vn_stats.out_pkts)'
            },
            'virtual-machine': {
                'inBytes': 'SUM(if_stats.in_bytes)',
                'outBytes': 'SUM(if_stats.out_bytes)',
                'inPkts': 'SUM(if_stats.in_pkts)',
                'outPkts': 'SUM(if_stats.out_pkts)'
            },
            'virtual-machine-interface': {
                'inBytes': 'SUM(if_stats.in_bytes)',
                'outBytes': 'SUM(if_stats.out_bytes)',
                'inPkts': 'SUM(if_stats.in_pkts)',
                'outPkts': 'SUM(if_stats.out_pkts)'
            },
            'fip': {
                'inBytes': 'SUM(fip_stats.in_bytes)',
                'outBytes': 'SUM(fip_stats.out_bytes)',
                'inPkts': 'SUM(fip_stats.in_pkts)',
                'outPkts': 'SUM(fip_stats.out_pkts)'
            },
        };

        this.CONFIGURE_NETWORK_LINK_CONFIG = {
            text: 'Go to configure network page',
            href: '/#p=config_net_vn'
        };
        //GLOBALCONTROLLER Constants
        this.GLOBAL_CONTROLER_LIST_VIEW_SECTION_ID = "global-controller-listview-sectionid";
        this.GLOBAL_CONTROLLER_REGION_BAR_SECTION_ID = "global_controller_region_bar_section_id";
        this.GLOBAL_CONTROLLER_REGION_SECTION_ID = "global_controller_region_section_id";
        this.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX_SECTION_ID = "globalcontroller_chartview_cpu_max_section_id";
        this.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX_SECTION_ID = "globalcontroller_chartview_memory_max_section_id";
        this.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE_SECTION_ID= "globalcontroller_chartview_disk_usage_section_id";
        this.GLOBAL_CONTROLLER_CHARTVIEW_BANDWDTH_PERCENTILE_SECTION_ID= "globalcontroller_chartview_bandwdth_percentile_section_id";
        this.GLOBAL_CONTROLLER_CHARTVIEW_CPU_MAX = "globalcontroller_chartview_cpu_max";
        this.GLOBAL_CONTROLLER_CHARTVIEW_MEMORY_MAX = "globalcontroller_chartview_memory_max";
        this.GLOBAL_CONTROLLER_CHARTVIEW_DISK_USAGE= "globalcontroller_chartview_disk_usage";
        //this.GLOBAL_CONTROLLER_NODESCOUNT = "global_controller_nodescnt";
        this.GLOBAL_CONTROLLER_CHARTVIEW_BANDWDTH_PERCENTILE = "globalcontroller_chartview_bandwdth_percentile";
        this.GLOBALCONTROLLER_REGIONS_SUMMARY_URL =
            '/api/tenant/networking/global-controller-overview?reqRegion=';
        this.GLOBAL_CONTROLLER_CHARTS_URL = "/api/qe/query/?reqRegion=";
        /* Global Config Constants*/
        this.GLOBAL_CONFIG_TAB_ID = "global-config-tab";
        this.GLOBAL_BGP_OPTIONS_MAP = [
            {"key": "autonomous_system", "name": "Global ASN"},
            {"key": "ibgp_auto_mesh", "name": "iBGP Auto Mesh"},
            {"key": "ip_fabric_subnets", "name": "IP Fabric Subnets"},
            {"key": "graceful_restart_parameters", "name": "Graceful Restart"},
            {"key": "bgpaas_parameters", "name": "BGP as a Service Port Range (Start Port - End Port)"},
            {"key": "bgp_always_compare_med", "name": "Always Compare MED"},
        ];
        this.GLOBAL_BGP_OPTIONS_SECTION_ID = "global-bgp-options-section";
        this.GLOBAL_BGP_OPTIONS_ID = "global-bgp-options";
        this.GLOBAL_BGP_OPTIONS_GRID_ID = "global-bgp-options-grid";
        this.GLOBAL_BGP_OPTIONS_PREFIX_ID = "global_bgp_options";
        this.GLOBAL_BGP_OPTIONS_LIST_VIEW_ID = "global-bgp-options-list-view";

        this.GLOBAL_FORWARDING_OPTIONS_MAP = [
            {'key': 'forwarding_mode', 'name': 'Forwarding Mode'},
            {'key': 'vxlan_network_identifier_mode',
                'name': 'VxLAN Identifier Mode'},
            {'key': 'encapsulation_priorities',
             'name': 'Encapsulation Priority Order',},
            {'key': 'ecmp_hashing_include_fields',
                'name': 'ECMP Hashing Fields'},
            {'key': 'flow_export_rate', 'name': 'Flow Export Rate'}
        ];
        this.GLOBAL_FORWARDING_OPTIONS_SECTION_ID = "global-forwarding-options-section";
        this.GLOBAL_FORWARDING_OPTIONS_ID = "global-forwarding-options";
        this.GLOBAL_FORWARDING_OPTIONS_GRID_ID = "global-forwarding-options-grid";
        this.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID = "global_forwarding_options";
        this.GLOBAL_FORWARDING_OPTIONS_LIST_VIEW_ID = "global-forwarding-options-list-view";

        this.GLOBAL_FLOW_AGING_SECTION_ID = "global-flow-aging-section";
        this.GLOBAL_FLOW_AGING_ID = "global-flow-aging";
        this.GLOBAL_FLOW_AGING_GRID_ID = "global-flow-aging-grid";
        this.GLOBAL_FLOW_AGING_PREFIX_ID = "global_flow_aging";
        this.GLOBAL_FLOW_AGING_LIST_VIEW_ID = "global-flow-aging-list-view";

        //User defined counters
        this.GLOBAL_SYSTEM_CONFIG = "/global-system-config/";
        this.USER_DEFINED_COUNTRERS_GLOBAL = "user-defined-counters-global";
        this.USER_DEFINED_COUNTRERS_GRID_ID = "user-defined-counters-grid";
        this.USER_DEFINED_COUNTRERS_LIST_ID = "user-defined-counters-list";
        this.GLOBAL_COUNTERS_PREFIX_ID = "user_defined_counters";
        this.GLOBAL_USER_DEFINED_COUNTRER_SECTION_ID = "user_defined_counters_section";
        this.USER_DEFINED_COUNTRER_CREATE_SECTION_ID = "user_defined_counters_create_section";

        //MAC Learning
        this.GLOBAL_MAC_LEARNING_MAP =
            [{"key": "mac_limit_control;mac_limit", "name": "MAC Limit"},
            {"key": "mac_limit_control;mac_limit_action", "name": "MAC Limit Action"},
            {"key": "mac_move_control;mac_move_limit", "name": "Mac Move Limit"},
            {"key": "mac_move_control;mac_move_limit_action", "name": "MAC Move Limit Action"},
            {"key": "mac_move_control;mac_move_time_window", "name": "MAC Move Time Window (secs)"},
            {"key": "mac_aging_time", "name": "MAC Aging Time (secs)"}];
        this.GLOBAL_MAC_LEARNING_SECTION_ID = "global-mac-learning-section";
        this.GLOBAL_MAC_LEARNING_ID = "global-mac-learning";
        this.GLOBAL_MAC_LEARNING_GRID_ID = "global-mac-learning-grid";
        this.GLOBAL_MAC_LEARNING_PREFIX_ID = "global_mac_learning";
        this.GLOBAL_MAC_LEARNING_LIST_VIEW_ID = "global-mac-learning-list-view";

        //SLO
        this.SLO_GRID_ID = "slo-grid";
        this.CONFIG_SLO_SECTION_ID = "config-slo-section";
        this.CONFIG_SLO_ID = "config-slo";
        this.CONFIG_SLO_VIEW_ID = "config-slot-view";
        this.SLO_PREFIX_ID = "security_logging_object";
        this.CONFIG_SLO_LIST_VIEW_ID = "config-slo-list-view";

        //Project settings
        this.CONFIG_PROJECT_SETTINGS_PAGE_ID = "config-project-settings-page-id";
        this.CONFIG_PROJECT_SETTINGS_TAB_ID = "config-project-settings-tab-id";
        this.CONFIG_QUOTAS_PAGE_ID = "config-quotas-page";
        this.CONFIG_QUOTAS_GRID_ID = 'quotas-grid';
        this.CONFIG_PROJECT_OTHER_SETTINGS_PAGE_ID =
            "config-project-other-settings-page-id";
        this.CONFIG_PROJECT_OTHER_SETTINGS_MAP =
            [{"key": "vxlan_routing", "name": "VxLAN Routing"}];
        this.CONFIG_PROJECT_OTHER_SETTINGS_GRID_ID =
            "config-project-other-settings-grid";
        this.CONFIG_PROJECT_OTHER_SETTINGS_SECTION_ID =
            "config-project-other-settings-section";
        this.CONFIG_PROJECT_OTHER_SETTINGS_LIST_ID =
            "config-project-other-settings-list";
        this.CONFIG_PROJECT_OTHER_SETTINGS_VIEW_CONFIG_SECTION_ID =
            'config-project-other-settings-view-config-section';
        this.CONFIG_PROJECT_OTHER_SETTINGS_ID = "config-project-other-settings";
        this.CONFIG_PROJECT_OTHER_SETTINGS_PREFIX_ID = "project_other_settings";
        this.CONFIG_VXLAN_ROUTING_ENABLED = 'enabled';
        this.CONFIG_VXLAN_ROUTING_DISABLED = 'disabled';

        //QoS Control Traffic
        this.GLOBAL_CONTROL_TRAFFIC_MAP =
            [{"key": "control_traffic_dscp;control", "name": "Control DSCP bits"},
            {"key": "control_traffic_dscp;analytics", "name": "Analytics DSCP bits"},
            {"key": "control_traffic_dscp;dns", "name": "DNS DSCP bits"}];
        this.GLOBAL_CONTROL_TRAFFIC_SECTION_ID = "global-control-traffic-section";
        this.GLOBAL_CONTROL_TRAFFIC_ID = "global-control-traffic";
        this.GLOBAL_CONTROL_TRAFFIC_GRID_ID = "global-control-traffic-grid";
        this.GLOBAL_CONTROL_TRAFFIC_PREFIX_ID = "global_control_traffic";
        this.GLOBAL_CONTROL_TRAFFIC_LIST_VIEW_ID = "global-control-traffic-list-view";

        //BGP
        this.URL_GET_BGP = '/api/tenants/config/bgp/get-bgp-routers';
        this.URL_GET_ASN = '/api/tenants/admin/config/global-asn';
        this.BGP_ADDRESS_FAMILY_DATA = [
                                           {
                                               text : 'inet-vpn',
                                               value : 'inet-vpn',
                                               locked : true
                                           },
                                           {
                                                text : 'route-target',
                                                value : 'route-target'
                                           },
                                           {
                                               text : 'inet6-vpn',
                                               value : 'inet6-vpn'
                                           },
                                           {
                                                text : 'e-vpn',
                                                value : 'e-vpn'
                                           },
                                           {
                                               text : 'inet',
                                               value : 'inet'
                                           }
                                       ];
        this.CN_ADDRESS_FAMILY_DATA = [
                                          {
                                              text : 'route-target',
                                              value : 'route-target',
                                          },
                                          {
                                              text : 'inet-vpn',
                                              value : 'inet-vpn',
                                          },
                                          {
                                               text : 'inet6-vpn',
                                               value : 'inet6-vpn',
                                          },
                                          {
                                               text : 'e-vpn',
                                               value : 'e-vpn',
                                          },
                                          {
                                               text : 'erm-vpn',
                                               value : 'erm-vpn',
                                          },
                                          {
                                              text : 'inet',
                                              value : 'inet'
                                          }
                                      ];
        this.FAMILY_ATTR_ADDRESS_FAMILY_DATA = [
                                          {
                                              text: "inet-vpn",
                                              value: "inet-vpn"
                                          },
                                          {
                                              text: "e-vpn",
                                              value: "e-vpn"
                                          },
                                          {
                                              text: "erm-vpn",
                                              value: "erm-vpn"
                                          },
                                          {
                                              text: "route-target",
                                              value: "route-target"
                                          },
                                          {
                                              text: "inet6-vpn",
                                              value: "inet6-vpn"
                                          }
                                      ];
        this.AUTHENTICATION_DATA = [
                                        {
                                            text : 'None',
                                            value : 'none'
                                        },
                                        {
                                            text : 'md5',
                                            value : 'md5'
                                        }
                                    ];
        this.BGP_AAS_ROUTERS = ["bgpaas-server", "bgpaas-client"];
        this.DEFAULT_PROJECT = 'default-project';
        this.NOT_ALLOWED_VN_LIST = ['default-virtual-network', '__link_local__'];
        this.IP_FABRIC_VN = 'ip-fabric';

        this.CONTROLLER_CONFIG_INPUT_VIEW_TEMPLATE =
            'controller-config-input-view-template';
        this.BFD = 'BFD';
        this.SEGMENT = 'segment';

        //Physical Routers constants
        this.URL_PHYSICAL_ROUTERS_DETAILS_IN_CHUNKS =
            '/api/tenants/config/physical-routers-with-intf-count';
        this.URL_VIRTUAL_ROUTER_DETAILS =
            '/api/tenants/config/virtual-routers-detail';
        this.URL_PHYSICAL_ROUTER_CREATE =
            '/api/tenants/config/physical-routers';
        this.URL_BGP_ROUTER_DETAILS = '/api/admin/nodes/bgp';
        this.URL_VIRTUAL_NETWORK_DETAILS = '/api/tenants/config/virtual-networks';
        this.SNMP_VERSION_DATA = [
            {'value' : '2', "label" : '2c'},
            {'value' : '3', "label" : '3'}
        ];
        this.SNMP_SECURITY_LEVEL = [
            {'value' : 'none', "text" : 'None'},
            {'value' : 'auth', "text" : 'Auth'},
            {'value' : 'authpriv', "text" : 'AuthPriv'}
        ];
        this.VIRTUAL_ROUTER_TYPE = [
            {'value' : 'none', "text" : 'None'},
            {'value' : 'embedded', "text" : 'Embedded'},
            {'value' : 'torAgent', "text" : 'TOR Agent'},
            {'value' : 'tsn', "text" : 'TSN'}
        ];
        this.PHYSICAL_ROUTER_ROLE_DATA = [
            {'value' : 'none', "text" : 'None'},
            {'value' : 'spine', "text" : 'Spine'},
            {'value' : 'leaf', "text" : 'Leaf'}
        ];

        // VRouter Config Constants
        this.URL_CFG_VROUTER_DETAILS =
            '/api/tenants/config/virtual-routers-detail';

        // IPAM Config Constants
        this.URL_CFG_IPAM_DETAILS =
            '/api/tenants/config/ipam-details';
        this.USER_DEFINED_SUBNET = 'user-defined-subnet';

        // FIP Config Constants
        this.URL_CFG_FIP_DETAILS =
            '/api/tenants/config/floating-ips';

        // Service Template Config Constants
        this.URL_CFG_SVC_TEMPLATE_DETAILS =
            '/api/tenants/config/service-templates';

        //Interfaces
        this.URL_PHYSICAL_ROUTER_LIST =
            '/api/tenants/config/physical-routers-list';
        this.URL_GET_INTERFACES =
            '/api/tenants/config/get-interfaces';
        this.INTERFACE_TYPE_DATA = [
            {'value' : 'physical', "text" : 'Physical'},
            {'value' : 'logical', "text" : 'Logical'}
        ];
        this.URL_GET_INTERFACE_DELIMITERS =
            '/api/admin/webconfig/physicaldevices/interface_delimiters';
        this.URL_GET_VN_INF = '/api/tenants/config/vn-list-details';
        this.URL_GET_VN_INTERNALS_INF =
            '/api/tenants/config/get-virtual-machine-details/?vn_uuid={0}';
        this.LOGICAL_INF_TYPE_DATA = [
            {'value' : 'l2', "text" : 'Server'},
            {'value' : 'l3', "text" : 'L3'}
        ];
        this.INF_PARENT_TYPE_DATA = [
            {'value' : 'physical-router', "text" : 'Physical Router'},
            {'value' : 'physical-interface', "text" : 'Physical Interface'}
        ];
        this.PHYSICAL_INF_LINK_PATTERN = ";";
        this.LI_VMI_DEVICE_OWNER = 'physical-router';

        /* Port */
        this.CONFIG_PORT_PAGE_ID = "config-port-page";
        this.CONFIG_PORT_LIST_VIEW_ID = "config-port-list-view";
        this.CONFIG_PORT_FORMAT_ID = "config-port-format-id";
        this.PORT_GRID_ID = "port-grid-id";
        this.PORT_PREFIX_ID = "Ports";
        this.TEXT_PORT = 'port';
        this.MIRROR_STATIC = 'static';
        this.MIRROR_DYNAMIC = 'dynamic';
        this.AAP_MODE_DATA =
            [{'text': 'Active-Standby', 'value': 'active-standby'},
             {'text': 'Active-Active', 'value': 'active-active'}]

        /* Policy */
        this.VN_SUBNET_DELIMITER = ":";
        this.SUBNET_ONLY = "subnet_only";
        this.ANALYZER_INSTANCE = "analyzer_instance";
        this.NIC_ASSISTED = "nic_assisted";
        this.ANALYZER_IP = "analyzer_ip";
        this.POLICY_RULE = 'network_policy_entries;policy_rule';
        this.SERVICE_GRP_RULE = 'security_group_entries;policy_rule';

        /* BGP as a Service */
        this.CONFIG_BGP_AS_A_SERVICE_LIST_ID = "config-bgp-as-a-service-list";
        this.BGP_AS_A_SERVICE_GRID_ID = "bgp-as-a-service-grid";
        this.URL_GET_BGP_AS_A_SERVICE_DATA = "/api/tenants/config/get-bgp-as-a-services/";
        this.CONFIG_BGP_AS_A_SERVICE_SECTION_ID = "config-bgp-as-a-service-section";
        this.CONFIG_BGP_AS_A_SERVICE_ID = "config-bgp-as-a-service";
        this.CONFIG_BGP_AS_A_SERVICE_LIST_VIEW_ID = "config-bgp-as-a-service-list-view";
        this.BGP_AS_A_SERVICE_PREFIX_ID = "bgp_as_a_service";
        this.URL_CREATE_BGP_AS_A_SERVICE = "/api/tenants/config/create-bgp-as-a-service";
        this.URL_UPDATE_BGP_AS_A_SERVICE = "/api/tenants/config/update-bgp-as-a-service/";
        this.BGP_AS_A_SERVICE_ADDRESS_FAMILIES = [
            {
                text: "inet",
                value: "inet",
            },
            {
                text: "inet6",
                value: "inet6",
            }
        ];

        // Virtual Network Config Constants
        this.URL_CFG_VN_DETAILS = '/api/tenants/config/virtual-network-details';

        /* DNS Server constants */
        this.ACTIVE_DNS_DATA = "/api/tenants/config/sandesh/virtual-DNS/";
        this.DNS_SERVER_GRID_ID = "dns-server-grid";
        this.CONFIG_DNS_SERVER_PAGE_ID = 'config-dns-server-page';
        this.CONFIG_DNS_SERVER_SECTION_ID = 'config-dns-server-section';
        this.CONFIG_DNS_SERVER_LIST_VIEW_ID = 'config-dns-server-list';
        this.CONFIG_DNS_SERVER_ID = 'config-dns-server';
        this.DNS_SERVER_PREFIX_ID = 'dns_server';

        /* DNS Record constants */
        this.CONFIG_DNS_RECORDS_PAGE_ID = 'config-dns-records-page';
        this.CONFIG_DNS_RECORDS_LIST_VIEW_ID = 'config-dns-records-list';
        this.CONFIG_DNS_RECORDS_SECTION_ID = 'config-dns-records-section';
        this.CONFIG_DNS_RECORDS_ID = 'config-dns-records';
        this.DNS_RECORDS_GRID_ID = 'dns-records-grid';
        this.DNS_RECORDS_PREFIX_ID = 'dns_record';

        /* Firewall constants */
        this.FW_POLICY_WIZARD = 'fw_policy_wizard';
        this.FW_WZ_SECURITY_POLICY_AS_GLOBAL_LIST_VIEW_ID = 'fw_security_policy_as_global_list_view';
        this.FW_WZ_SECURITY_POLICY_SG_GLOBAL_LIST_VIEW_ID = 'fw_security_policy_sg_global_list_view';
        this.FW_WZ_SECURITY_POLICY_AS_PROJECT_LIST_VIEW_ID = 'fw_security_policy_as_project_list_view';
        this.FW_WZ_SECURITY_POLICY_SG_PROJECT_LIST_VIEW_ID = 'fw_security_policy_sg_project_list_view';
        this.FW_WZ_SECURITY_POLICY_GLOBAL_ADDRESS_GRP_SECTION_ID = 'fw_security_policy_global_adressgroup_section_view';
        this.FW_WZ_SECURITY_POLICY_PROJECT_ADDRESS_GRP_SECTION_ID = 'fw_security_policy_project_adressgroup_section_view';
        this.FW_WZ_SECURITY_POLICY_GLOBAL_SERVICE_GRP_SECTION_ID = 'fw_security_policy_global_servicegroup_section_view';
        this.FW_WZ_SECURITY_POLICY_PROJECT_SERVICE_GRP_SECTION_ID = 'fw_security_policy_project_servicegroup_section_view';
        this.FW_WZ_SECURITY_POLICY_GLOBAL_ADDRESS_GRP = 'fw_security_policy_global_adressgroup';
        this.FW_WZ_SECURITY_POLICY_GLOBAL_SERVICE_GRP = 'fw_security_policy_global_servicegroup';
        this.FW_WZ_SECURITY_POLICY_PROJECT_SERVICE_GRP = 'fw_security_policy_project_servicegroup';
        this.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_LIST_VIEW_ID = 'fw_security_policy_as_list_view';
        this.FW_WZ_SECURITY_POLICY_SERVICE_GRP_LIST_VIEW_ID = 'fw_security_policy_service_gp_list_view';
        this.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_GRID_ID = 'fw_security_policy_as_grid_view';
        this.FW_WZ_SECURITY_POLICY_SERVICE_GRP_GRID_ID = 'fw_security_policy_service_gp_grid_view';
        this.GLOBAL_APPLICATION_POLICY_SET = 'global-application-policy-set';
        this.FW_POLICY_GLOBAL_PAGE_ID = "config-fw-policy-global-list";
        this.CONFIG_FW_POLICY_GLOBAL_SECTION_ID = "config-fw-policy-global-section";
        this.CONFIG_FW_RULE_SECTION_ID = "config-fw-rule-section";
        this.CONFIG_FW_POLICY_GLOBAL_ID = "config-fw-policy-global";
        this.CONFIG_FW_RULE_ID = "config-fw-rule";
        this.FW_POLICY_GLOBAL_TAB_ID = "config-fw-policy-tab";
        this.CONFIG_SECURITY_POLICY_PAGE_ID = 'config-security-policy-page';
        this.TITLE_SEC_GRP_TAG = "Tags";
        this.STANDALONE_FIREWALL_POLICIES = "Stand Alone Firewall Policies";
        this.ALL_FIREWALL_POLICIES = "All Firewall Policies";
        this.TITLE_SEC_GRP_SERVICE_GROUP = "Service Groups";
        this.TITLE_SEC_GRP_ADDRESS_GROUP = "Address Groups";
        this.GLOBAL_SECURITY_POLICY_TAB_ID = 'security-policy-tab';
        this.SECURITY_POLICY_TAG_GRID_ID = "security-policy-tag-grid";
        this.SECURITY_POLICY_TAG_LIST_VIEW_ID = "security-policy-tag-list-view";
        this.SECURITY_POLICY_TAG_SECTION_ID = 'security-policy-tag-section';
        this.SECURITY_POLICY_SERVICE_GRP_SECTION_ID = 'security-policy-service-group-section';
        this.SEC_POL_TAG_TITLE_CREATE = 'Create Tag';
        this.TITLE_TAG_MULTI_DELETE = 'Delete Tag (s)'
        this.SEC_POLICY_TAG_PREFIX_ID = "tag";
        this.SECURITY_POLICY_TAG_ID = 'security-policy-tag';
        this.SECURITY_POLICY_SERVICE_GRP_GRID_ID = 'security-policy-service-grp-grid'
        this.SECURITY_POLICY_SERVICE_GRP_LIST_VIEW_ID = "security-policy-service-grp-list-view";
        this.SECURITY_POLICY_SERVICE_GRP_GRID_ID = "security-policy-service-grp-grid";
        this.SECURITY_POLICY_SERVICE_GRP_ID = 'security-policy-service-group';
        this.SEC_POLICY_SERVICE_GRP_PREFIX_ID = "serviceGroup";
        this.SEC_POL_SEC_GRP_TITLE_CREATE = 'Create Service Group';
        this.SEC_POLICY_ADDRESS_GRP_PREFIX_ID = "addressgroup";
        this.SECURITY_POLICY_ADDRESS_GRP_SECTION_ID = 'security-policy-address-group-section';
        this.SECURITY_POLICY_ADDRESS_GRP_ID = 'security-policy-address-group';
        this.SECURITY_POLICY_ADDRESS_GRP_LIST_VIEW_ID = "security-policy-address-grp-list-view";
        this.SECURITY_POLICY_SERVICE_GRP_GRID_ID = "security-policy-service-grp-grid";
        this.SECURITY_POLICY_ADDRESS_GRP_GRID_ID = "security-policy-address-grp-grid";
        this.FW_POLICY_GRID_ID = "fw-policy-grid";
        this.FW_RULE_GRID_ID = "fw-rule-grid";
        this.FW_RULE_PREFIX_ID = 'firewallRule',
        this.CONFIG_FW_POLICY_LIST_VIEW_ID = "config-fw-policy-list-view";
        this.CONFIG_FW_WZ_POLICY_LIST_VIEW_ID = "config-fw-wz-policy-list-view";
        this.FW_WZ_POLICY_GRID_ID = "fw-wz-policy-grid";
        this.APPLICATION_POLICY_LIST_VIEW_ID = "application-policy-list-view";
        this.FIREWALL_APPLICATION_POLICY_SECTION_ID = 'firewall-application-policy-section';
        this.FIREWALL_APP_POLICY_ID = 'firewall-application-policy';
        this.FIREWALL_APPLICATION_POLICY_GRID_ID = "firewall-application-policy-grid";
        this.FIREWALL_APPLICATION_POLICY_LIST_VIEW_ID = "firewall-application-policy-list-view";
        this.FIREWALL_APPLICATION_POLICY_PREFIX_ID = "applicationpolicy";
        this.CONFIG_FW_RULE_LIST_VIEW_ID = "config-fw-rule-list-view";
        this.FW_POLICY_RULE_IDS = 'fw-policy-rule-ids';
        this.TRAFFIC_GROUPS_ALL_APPS = 'All Applications';
        this.CONFIG_FW_POLICY_SECTION_ID = "config-firewall_policye-section";
        this.CONFIG_FW_POLICY_ID = "config-firewall_policy";
        this.CONFIG_FW_POLICY_LIST_VIEW_ID = "config-firewall_policy-list-view";
        this.FW_POLICY_PREFIX_ID = "firewall_policy";
        this.URL_CREATE_FW_POLICY = "/firewall-policys";
        this.URL_UPDATE_FW_POLICY = "/firewall-policy/";
        this.URL_CREATE_POLICY_RULES = '/api/tenants/config/firewall-rules';
        this.URL_CREATE_POLICY_RULE = '/api/tenants/config/firewall-rule';
        this.RULE_MATCH_TAGS = [{text: "Application", value: "application"},
                                {text: 'Tier', value: 'tier'},
                                {text:'Deployment', value: 'deployment'},
                                {text: 'Site', value: 'site'},
                                {text: 'Label', value: 'label'}];
        ///Application Policy Set
        this.APPLICATION_POLICY_SET_LIST_VIEW_ID = "application-policy-set-list-view";
        this.APPLICATION_POLICY_SET_SECTION_ID = 'application-policy-set-section';
        this.APPLICATION_POLICY_SET = 'application-policy-set';
        this.APPLICATION_POLICY_SET_GRID_ID = "application-policy-set-grid";
        this.APPLICATION_POLICY_SET_PREFIX_ID = "applicationpolicyset";
        this.APS_ADDRESS_GRP_LIST_VIEW_ID = "aps-address-group-list-view";
        this.APS_ADDRESS_GRP_SECTION_ID = 'aps-address-group-section';
        this.APS_ADDRESS_GRP_ID = 'aps-address-group';
        this.APS_ADDRESS_GRP_GRID_ID = "aps-address-group-grid";
        this.APS_ADDRESS_GRP_LIST_VIEW_ID = "aps-address-group-list-view";
        this.APS_SERVICE_GRP_LIST_VIEW_ID = "aps-service-group-list-view";
        this.APS_SERVICE_GRP_SECTION_ID = 'aps-service-group-section';
        this.APS_SERVICE_GRP_ID = 'aps-service-group';
        this.APS_SERVICE_GRP_GRID_ID = "aps-service-group-grid";
        this.APS_SERVICE_GRP_LIST_VIEW_ID = "aps-service-group-list-view";
        this.APS_TAG_SECTION_ID = 'aps-tag-section';
        this.APS_TAG_ID = 'aps-tag';
        this.APS_TAG_GRID_ID = "aps-tag-grid";
        this.APS_TAG_LIST_VIEW_ID = "aps-tag-list-view";
        this.NEW_APPLICATION_POLICY_SET_LIST_VIEW_ID = "new-application-policy-set-list-view";
        this.NEW_APPLICATION_POLICY_SET_SECTION_ID = 'new-application-policy-set-section';
        this.NEW_APPLICATION_POLICY_SET = 'new-application-policy-set';
        this.NEW_APPLICATION_POLICY_SET_GRID_ID = "new-application-policy-set-grid";
        this.APS_MODAL_HEADER = 'Firewall Policy Wizard';
        this.FW_STANDALONE_ALL_POLICY_SECTION_ID = 'fw-standalone-all-policy-section';
        this.FW_STANDALONE_ALL_POLICY_ID = 'fw-standalone-all-policy-id';
        this.FW_STANDALONE_ALL_POLICY_GRID_ID = 'fw-standalone-all-policy-grid-id';
        this.FW_STANDALONE_ALL_POLICY_LIST_VIEW_ID = 'fw-standalone-all-policy-list-id';
        
        this.RULE_DATA_TAGS = 'rule-data-tags';
        this.RULE_DATA_ADDRESS_GROUPS = 'rule-data-address-groups';
        this.APPLICATION_TAG_TYPE = 'application';
        this.DEPLOYMENT_TAG_TYPE = 'deployment';
        this.SITE_TAG_TYPE = 'site';
        this.TIER_TAG_TYPE = 'tier';
        this.LABEL_TAG_TYPE = 'label';
        this.TAG_SEPARATOR = '=';
        this.INSERT_ABOVE = 'insert_above';
        this.INSERT_BELOW = 'insert_below';
        this.INSERT_AT_TOP = 'insert_at_top';
        this.INSERT_AT_END = 'insert_at_end';
        this.FIREWALL_POLICY_HEADING = 'Firewall Policy';
        this.GLOBAL_APPLICATION_POLICY_SET = 'global-application-policy-set';

        /* RBAC constants */
        this.RBAC_GLOBAL_PAGE_ID = "config-rbac-global-list";
        this.CONFIG_RBAC_GLOBAL_SECTION_ID = "config-rbac-global-section";
        this.CONFIG_RBAC_GLOBAL_ID = "config-rbac-global";
        this.RBAC_GLOBAL_TAB_ID = "config-rbac-tab";

        this.RBAC_DOMAIN_PAGE_ID = "config-rbac-domain-list";
        this.CONFIG_RBAC_DOMAIN_SECTION_ID = "config-rbac-domain-section";
        this.CONFIG_RBAC_DOMAIN_ID = "config-rbac-domain";

        this.RBAC_PROJECT_PAGE_ID = "config-rbac-project-list";
        this.CONFIG_RBAC_PROJECT_SECTION_ID = "config-rbac-project-section";
        this.CONFIG_RBAC_PROJECT_ID = "config-rbac-project";

        this.RBAC_GRID_ID = "rbac-grid";
        this.CONFIG_RBAC_LIST_VIEW_ID = "config-rbac-list-view";
        this.RBAC_ROLE_CRUD_LIST = [
                                    {text: "Create", value: "C"},
                                    {text: "Read", value: "R"},
                                    {text: "Update", value: "U"},
                                    {text: "Delete", value: "D"}];
        this.RBAC_ALL_ROLES = "All Roles (*)";
        this.RBAC_PREFIX_ID = "rbac";

        this.RBAC_GLOBAL_GRID_ID = "rbac-global-grid";
        this.RBAC_DOMAIN_GRID_ID = "rbac-domain-grid";
        this.RBAC_PROJECT_GRID_ID = "rbac-project-grid";

        /* Config Alarm Rule Constants */
        this.ALARM_PREFIX_ID = "configalarm";
        this.ALARM_GRID_ID = "config-alarm-grid";
        this.ALARM_LIST_VIEW_ID = "alarm-list-view";
        this.CONFIG_ALARM_PROJECT_SECTION_ID = "config-alarm-project-section";
        this.CONFIG_ALARM_LIST_VIEW_ID = "config-alarm-list-view";
        this.CONFIG_ALARM_PROJECT_ID = 'config-alarm-project';
        this.CONFIG_ALARM_GLOBAL_ID = "config-alarm-global";
        this.CONFIG_ALARM_GLOBAL_SECTION_ID = "config-alarm-global-section";
        this.CONFIG_ALARM_LIST_ID = "config-alarm-list";
        this.CONFIG_ALARM_SEVERITY_TEMPLATE = 'config-alarm-severity-template';

        /* Route Aggregate Constants */
        this.CONFIG_ROUTE_AGGREGATE_LIST_ID = "config-route-aggregate-list";
        this.ROUTE_AGGREGATE_GRID_ID = "route-aggregate-grid";
        this.CONFIG_ROUTE_AGGREGATE_SECTION_ID = "config-route-aggregate-section";
        this.CONFIG_ROUTE_AGGREGATE_ID = "config-route-aggregate";
        this.CONFIG_ROUTE_AGGREGATE_LIST_VIEW_ID = "config-route-aggregate-list-view";
        this.ROUTE_AGGREGATE_PREFIX_ID = "route_aggregate";
        this.URL_CREATE_ROUTE_AGGREGATE = "/route-aggregates";
        this.URL_UPDATE_ROUTE_AGGREGATE = "/route-aggregate/";
         /* Config Browser Constants */
        this.CONFIG_HEADER_TEXT = "Root Level";
        this.DEFAULT_COMMUNITIES = [
            {text:"no-export",id:"no-export"},
            {text:"accept-own",id:"accept-own"},
            {text:"no-advertise",id:"no-advertise"},
            {text:"no-export-subconfed",id:"no-export-subconfed"},
            {text:"no-reoriginate",id:"no-reoriginate"}
        ];

        /* QOS constants */
        this.QOS_GLOBAL_PAGE_ID = "config-qos-global-list";
        this.CONFIG_QOS_GLOBAL_SECTION_ID = "config-qos-global-section";
        this.CONFIG_QOS_GLOBAL_ID = "config-qos-global";

        this.QOS_PROJECT_PAGE_ID = "config-qos-project-list";
        this.CONFIG_QOS_PROJECT_SECTION_ID = "config-qos-project-section";
        this.CONFIG_QOS_PROJECT_ID = "config-qos-project";

        this.QOS_GRID_ID = "qos-grid";
        this.CONFIG_QOS_LIST_VIEW_ID = "config-qos-list-view";
        this.QOS_PREFIX_ID = "qos_cofig";
        this.QOS_CONFIG_TYPE_DATA = [{text: "vHost", value: "vhost"},
                                     {text: "Physical", value: "fabric"},
                                     {text: "Project", value: "project"}];
        this.QOS_DSCP_VALUES = [
                                { text: "ef (101110)", value: "46"},
                                { text: "af11 (001010)", value: "10"},
                                { text: "af12 (001100)", value: "12"},
                                { text: "af13 (001110)", value: "14"},
                                { text: "af21 (010010)", value: "18"},
                                { text: "af22 (010100)", value: "20"},
                                { text: "af23 (010110)", value: "22"},
                                { text: "af31 (011010)", value: "26"},
                                { text: "af32 (011100)", value: "28"},
                                { text: "af33 (011110)", value: "30"},
                                { text: "af41 (100010)", value: "34"},
                                { text: "af42 (100100)", value: "36"},
                                { text: "af43 (100110)", value: "38"},
                                { text: "be (000000)", value: "0"},
                                { text: "cs1 (001000)", value: "8"},
                                { text: "cs2 (010000)", value: "16"},
                                { text: "cs3 (011000)", value: "24"},
                                { text: "cs4 (100000)", value: "32"},
                                { text: "cs5 (101000)", value: "40"},
                                { text: "nc1/cs6 (110000)", value: "48"},
                                { text: "nc2/cs7 (111000)", value: "56"}];

        this.QOS_MPLS_EXP_VALUES = [
                                { text: "be (000)", value: "0"},
                                { text: "be1 (001)", value: "1"},
                                { text: "ef (010)", value: "2"},
                                { text: "ef1 (011)", value: "3"},
                                { text: "af11 (100)", value: "4"},
                                { text: "af12 (101)", value: "5"},
                                { text: "nc1/cs6 (110)", value: "6"},
                                { text: "nc2/cs7 (111)", value: "7"}];

        this.QOS_VLAN_PRIORITY_VALUES = [
                                { text: "be (000)", value: "0"},
                                { text: "be1 (001)", value: "1"},
                                { text: "ef (010)", value: "2"},
                                { text: "ef1 (011)", value: "3"},
                                { text: "af11 (100)", value: "4"},
                                { text: "af12 (101)", value: "5"},
                                { text: "nc1/cs6 (110)", value: "6"},
                                { text: "nc2/cs7 (111)", value: "7"}];

        /* Forwarding Class Constants */
        this.CONFIG_FORWARDING_CLASS_LIST_ID = "config-forwarding-class-list";
        this.FORWARDING_CLASS_GRID_ID = "forwarding-class-grid";
        this.CONFIG_FORWARDING_CLASS_SECTION_ID =
            "config-forwarding-class-section";
        this.CONFIG_FORWARDING_CLASS_ID = "config-forwarding-class";
        this.CONFIG_FORWARDING_CLASS_LIST_VIEW_ID =
            "config-forwarding-class-list-view";
        this.FORWARDING_CLASS_PREFIX_ID = "forwarding_class";

        /* Analytics Node Config Constants */
        this.CONFIG_ANALYTICS_NODE_LIST_ID = "config-analytics-node-list";
        this.ANALYTICS_NODE_GRID_ID = "analytics-node-grid";
        this.CONFIG_ANALYTICS_NODE_SECTION_ID = "config-analytics-node-section";
        this.CONFIG_ANALYTICS_NODE_ID = "config-analytics-node";
        this.CONFIG_ANALYTICS_NODE_LIST_VIEW_ID = "config-analytics-node-list-view";
        this.ANALYTICS_NODE_PREFIX_ID = "analytics_node";
        this.URL_CREATE_ANALYTICS_NODE = "/analytics-nodes";
        this.URL_UPDATE_ANALYTICS_NODE = "/analytics-node/";

        /* Config Node Cfg Constants */
        this.CFG_CONFIG_NODE_LIST_ID = "cfg-config-node-list";
        this.CONFIG_NODE_GRID_ID = "config-node-grid";
        this.CFG_CONFIG_NODE_SECTION_ID = "config-config-node-section";
        this.CFG_CONFIG_NODE_ID = "config-config-node";
        this.CFG_CONFIG_NODE_LIST_VIEW_ID = "config-config-node-list-view";
        this.CONFIG_NODE_PREFIX_ID = "config_node";
        this.URL_CREATE_CONFIG_NODE = "/config-nodes";
        this.URL_UPDATE_CONFIG_NODE = "/config-node/";

        /* Database Node Config Constants */
        this.CONFIG_DATABASE_NODE_LIST_ID = "config-database-node-list";
        this.DATABASE_NODE_GRID_ID = "database-node-grid";
        this.CONFIG_DATABASE_NODE_SECTION_ID = "config-database-node-section";
        this.CONFIG_DATABASE_NODE_ID = "config-database-node";
        this.CONFIG_DATABASE_NODE_LIST_VIEW_ID = "config-database-node-list-view";
        this.DATABASE_NODE_PREFIX_ID = "database_node";
        this.URL_CREATE_DATABASE_NODE = "/database-nodes";
        this.URL_UPDATE_DATABASE_NODE = "/database-node/";

        /* Packet Capture Constants */
        this.PACKET_CAPTURE_LIST_ID = "packet-capture-list";
        this.PACKET_CAPTURE_GRID_ID = "packet-capture-grid";
        this.URL_GET_PACKET_CAPTURE_DATA = "/api/tenants/config/service-instances/";
        this.PACKET_CAPTURE_SECTION_ID = "packet-capture-section";
        this.PACKET_CAPTURE_ID = "packet-capture-list";
        this.PACKET_CAPTURE_LIST_VIEW_ID = "packet-capture-list-view";
        this.PACKET_CAPTURE_PREFIX_ID = "packet_capture";
        this.URL_GET_SERVICE_TEMPLATE_IMAGES = "/api/tenants/config/service-template-images";

        /* common config url constants */
        this.URL_GET_CONFIG_OBJECTS = "/api/tenants/config/get-config-objects";
        this.URL_GET_CONFIG_DETAILS = "/api/tenants/config/get-config-details";
        this.URL_GET_CONFIG_LIST = "/api/tenants/config/get-config-list";
        this.URL_CREATE_CONFIG_OBJECT = "/api/tenants/config/create-config-object";
        this.URL_UPDATE_CONFIG_OBJECT = "/api/tenants/config/update-config-object";
       // Config Editor Constants
        this.CONFIG_OBJECT_LIST_VIEW = 'config-object-list-view';
        this.CONFIG_OBJECT_DETAILS_VIEW = 'config-object-details-view';
        this.CONFIG_API_LIST_VIEW = 'config-api-list-view';
        this.CONFIG_PATH = 'config/configEditor/ui/js/views/';
        this.TMPL_CONFIG_HREF = "config-editor-href-container";
        this.COPIED_MSG = 'Copied To Clipboard';
        this.CONFIG_EDITOR_TEMPLATE = 'config-editor-template';
        this.CONFIG_HASH_PATH = '/#p=setting_config_editor&q[objName]=';
        this.TEXT_AREA_PLACEHOLDER = 'Copy / Paste JSON data for ';
        this.MODAL_CONFIG_EDITOR_CONTAINER = 'json-editor-form-view';
        this.CONFIG_EDITOR_PATH = '/js/views/configEditor/';
        //Gohan Constants
        this.GOHAN_HASH_LIST = ['config_gc_serviceTemplates','config_gc_serviceInstance','config_gc_securityGroup','config_gc_networkPolicy','config_gc_network',
                                'config_gc_server','config_gc_idPool','config_gc_association','config_gc_flavor','config_gc_image','config_gc_location'];
        this.GOHAN_PRE_URL = './gohan_contrail/v1.0/tenant/';
        this.GOHAN_PAGE_URL = ['serviceTemplates','config/gohanUi/templates/ui/js/views/gcSvcTemplateCfgView.js',
                               'serviceInstance','config/gohanUi/instances/ui/js/views/gcSvcInstView.js',
                               'securityGroup','config/gohanUi/securitygroup/ui/js/views/gcSecGrpView.js',
                               'networkPolicy','config/gohanUi/networkpolicy/ui/js/views/gcPolicyView.js',
                               'network','config/gohanUi/networks/ui/js/views/gcVnCfgView.js',
                               'server','config/gohanUi/server/ui/js/views/gcServerView.js',
                               'idPool','config/gohanUi/idpool/ui/js/views/gcIdPoolView.js',
                               'association','config/gohanUi/routetarget/ui/js/views/gcRouteTargetView.js',
                               'flavor','config/gohanUi/flavor/ui/js/views/gcFlavorView.js',
                               'image','config/gohanUi/image/ui/js/views/gcImageView.js',
                               'location','config/gohanUi/location/ui/js/views/gcLocationView.js'];
        this.BREADCRUMB_EXCEPTION_LIST = ['location','idPool','association'];

        this.GOHAN_URL = './gohan_contrail/v1.0/';
        this.GOHAN_TENANT_URL = './gohan_contrail/v1.0/tenant/';
        this.GOHAN_PROJECT_URL = '/api/tenants/config/projects';
        this.GOHAN_FLAVOR_URL = './gohan_contrail/v1.0/tenant/flavors';
        this.GOHAN_LOCATION = './gohan_contrail/v1.0/locations';
        this.GOHAN_ID_POOL = './gohan_contrail/v1.0/admin/id_pools';
        this.GOHAN_IMAGES = './gohan_contrail/v1.0/tenant/images';
        this.SVC_INSTANCES = './gohan_contrail/v1.0/tenant/service_instances';
        this.SVC_TEMPLATES = './gohan_contrail/v1.0/tenant/service_templates';
        this.GOHAN_NETWORK = './gohan_contrail/v1.0/tenant/networks';
        this.GOHAN_NETWORK_POLICY = './gohan_contrail/v1.0/tenant/network_policies';
        this.GOHAN_ROUTE_TARGET = './gohan_contrail/v1.0/admin/route_target_associations';
        this.GOHAN_PARAM = '?sort_key=id&sort_order=asc&limit=25&offset=0';
        this.GOHAN_TENANT_PARAM = '?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id=';
        this.GOHAN_SEC_GROUP = './gohan_contrail/v1.0/tenant/security_groups';
        this.GOHAN_SEC_GRP_RULES = './gohan_contrail/v1.0/tenant/security_group_rules';
        this.GOHAN_SERVER = './gohan_contrail/v1.0/servers';
        this.NETWORK_LOCATION_GRID_HEADER = ['Location ID', 'Status', 'Name', 'Description','Subnet','Task Status'];
        this.SERVER_LOCATION_GRID_HEADER = ['Location ID', 'Status', 'Name', 'Description','Instance ID','Console','Task Status'];
        this.LOCATION_GRID_HEADER = ['Location ID', 'Status', 'Name', 'Description', 'Task Status'];
        this.MULTISELECT_VALUE_SEPARATOR = ";;";
    };

    //str will be [0-9]+(m|h|s|d)
    //Returns an array of current time and end time such that the difference beween them will be given str
    function getFromToUTC(str) {
        var startDt = new XDate(true),
            endDt = new XDate(true),
            fnMap = {d: 'addDays', m: 'addMinutes', s: 'addSeconds', h: 'addHours'},
            unit = str.charAt(str.length - 1), value = parseInt(str);

        //If unit is not specified,take it as secs
        if ($.inArray(unit, ['d', 'm', 's', 'h']) == -1)
            unit = 's';

        endDt[fnMap[unit]](value);
        return [startDt.getTime(), endDt.getTime()];
    };

    return CTConstants;
});
