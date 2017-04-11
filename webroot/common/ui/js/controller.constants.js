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
        this.URL_GET_SECURITY_GROUP_DETAILS = '/api/tenants/config/securitygroup-details?projUUID={0}'
        this.URL_GET_SEC_GRP_LIST = '/api/tenants/config/securitygroup';
        this.URL_GET_LIST_SERVICE_INSTS_CONFIG = '/api/tenants/config/list-service-instances/{0}';
        this.URL_GET_SERVICE_INSTS_STATUS = '/api/tenants/config/service-instances-status/{0}';
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

        this.ALL_PROJECT_DROPDOWN_OPTION = [{name: 'all projects', value: 'all', fq_name: 'all'}];
        this.ALL_NETWORK_DROPDOWN_OPTION = [{name: 'all networks', value: 'all', fq_name: 'all'}];

        this.TMPL_VN_PORT_HEAT_CHART = "network-port-heat-chart-template";
        this.TMPL_TRAFFIC_STATS_TAB = "traffic-stats-tab-template";
        this.TMPL_GRAPH_CONTROL_PANEL_SEARCH = "graph-control-panel-search-template";
        this.TMPL_FORM_RESULT = 'form-result-page-template';
        this.TMPL_SESSION_ANALYZER = "session-analyzer-view-template";

        this.COOKIE_DOMAIN = contrail.getCookie(this.TYPE_DOMAIN);
        this.COOKIE_PROJECT = contrail.getCookie(this.TYPE_PROJECT);
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
        this.SERVICE_VN_EXCLUDE_LIST = ['svc-vn-left','svc-vn-right','svc-vn-mgmt'];
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
            8083: 'control',
            8092: 'dns',
            8101: 'control-nodemgr'
        };
        this.INTROSPECT_VIRTUAL_ROUTER_PORTS = {
            8085: 'vrouter-agent',
            8102: 'vrouter-nodemgr'
        };
        this.INTROSPECT_CONFIG_NODE_PORTS = {
            // 5998: '',
            // 8082: '',
            8084: 'api',
            8087: 'schema',
            8088: 'svc-monitor',
            8096: 'device-manager',
            8100: 'config-nodemgr',
        };
        this.INTROSPECT_ANALYTICS_NODE_PORTS = {
            // 8081: '',
            8089: 'collector',
            8090: 'analytics-api',
            8091: 'query-engine',
            8104: 'analytics-nodemgr',
        };

        this.INTROSPECT_PORT_NODE_MAP = {
            "8083": "control",
            "8084": "config",
            "8085": "vrouter",
            "8089": "analytics",
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
        this.UNDERLAY_SEARCHFLOW_TAB_ID = 'searchFlow';
        this.UNDERLAY_TRAFFICSTATS_TAB_ID = 'trafficStats';
        this.PROUTER = 'physical-router';
        this.VROUTER = 'virtual-router';
        this.VIRTUALMACHINE = 'virtual-machine';
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
            {"key": "graceful_restart_parameters", "name": "Graceful Restart"}
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
            {'value' : 'torAgent', "text" : 'TOR Agent'}
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

        /* Policy */
        this.VN_SUBNET_DELIMITER = ":";
        this.SUBNET_ONLY = "subnet_only";
        this.ANALYZER_INSTANCE = "analyzer_instance";
        this.NIC_ASSISTED = "nic_assisted";
        this.ANALYZER_IP = "analyzer_ip";

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
        this.URL_CREATE_CONFIG_OBJECT = "/api/tenants/config/create-config-object";
        this.URL_UPDATE_CONFIG_OBJECT = "/api/tenants/config/update-config-object";
        this.URL_GET_CONFIG_LIST = "/api/tenants/config/get-config-list";
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
        //Gohan Constants
        this.GOHAN_HASH_LIST = ['config_gc_location','config_gc_heatInstance','config_gc_image','config_gc_flavor','config_gc_server','config_gc_idPool','config_gc_association'];

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
