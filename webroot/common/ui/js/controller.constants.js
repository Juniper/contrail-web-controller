~/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {

        this.URL_ALL_DOMAINS = '/api/tenants/config/domains';
        this.URL_ALL_PROJECTS = '/api/tenants/config/projects';
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

        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';
        this.URL_VM_INTERFACES = '/api/tenant/networking/virtual-machine-interfaces/summary';

        this.URL_QUERY = '/api/admin/reports/query';
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
            'UveVMInterfaceAgent:virtual_network', 'UveVMInterfaceAgent:ip6_address', 'UveVMInterfaceAgent:ip_address',
            'UveVMInterfaceAgent:gateway', 'UveVMInterfaceAgent:ip6_active', 'UveVMInterfaceAgent:vm_name', 'UveVMInterfaceAgent:if_stats',
            'UveVMInterfaceAgent:in_bw_usage', 'UveVMInterfaceAgent:out_bw_usage', "UveVMInterfaceAgent:mac_address",
            'UveVMInterfaceAgent:uuid', 'UveVMInterfaceAgent:vm_uuid'
        ];

        this.FILTERS_COLUMN_VM = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list',
            'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:if_bmap_list', 'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:vm_name', 'UveVirtualMachineAgent:uuid'
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
        this.TYPE_VN = 'vn';
        this.TYPE_VIRTUAL_NETWORK = "virtual-network";
        this.TYPE_VIRTUAL_MACHINE = "virtual-machine";

        this.ALL_PROJECT_DROPDOWN_OPTION = [{name: 'all projects', value: 'all', fq_name: 'all'}];
        this.ALL_NETWORK_DROPDOWN_OPTION = [{name: 'all networks', value: 'all', fq_name: 'all'}];

        this.TMPL_VN_PORT_HEAT_CHART = "network-port-heat-chart-template";
        this.TMPL_TRAFFIC_STATS_TAB = "traffic-stats-tab-template";
        this.TMPL_GRAPH_CONTROL_PANEL_SEARCH = "graph-control-panel-search-template";
        this.TMPL_QUERY_SELECT = "query-select-popup-template";
        this.TMPL_QUERY_PAGE = "query-page-template";
        this.TMPL_QUERY_QUEUE_PAGE = "query-queue-page-template";
        this.TMPL_QUERY_TEXT = "query-text-template";
        this.TMPL_FORM_RESULT = 'form-result-page-template';
        this.TMPL_SESSION_ANALYZER = "session-analyzer-view-template";

        this.DEFAULT_DOMAIN = "default-domain";
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
        this.UCID_DEFAULT_DOMAIN_VN_LIST = this.UCID_PREFIX_MN_LISTS + this.DEFAULT_DOMAIN + ":virtual-networks";
        this.UCID_DEFAULT_DOMAIN_PROJECT_LIST = this.UCID_PREFIX_MN_LISTS + this.DEFAULT_DOMAIN + ":projects";

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


        // Config DB constants
        this.TMPL_CDB_ITEM_DELETE = "cdb-delete-item-template";
        this.DELETE_KEY_TYPE = "delete-key";
        this.DELETE_KEY_VALUE_TYPE = "delete-key-value";
        this.URL_OBJECT_UUID_TABLE = "/api/query/cassandra/keys/obj_uuid_table";
        this.URL_OBJECT_SHARED_TABLE = "/api/query/cassandra/keys/obj_shared_table";
        this.OBJECT_SHARED_TABLE = "obj_shared_table";
        this.OBJECT_UUID_TABLE = "obj_uuid_table";

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
            var url = "", length = 0,
                context;

            if (urlConfig['fqName'] != null)
                length = urlConfig['fqName'].split(':').length;
            else
                urlConfig['fqName'] = "*";

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
                    url = "/api/admin/reports/query";
            } else if (context == 'network') {
                url = "/api/tenant/networking/network/stats/top"
                if (urlConfig['type'] == 'portRangeDetail')
                    url = "/api/admin/reports/query";
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
            if (urlConfig['fqName'] != null) {
                //For flow-series,need to pass fqName as srcVN
                if (context == 'connected-nw') {
                    $.extend(reqParams, {'srcVN': urlConfig['srcVN'], 'destVN': urlConfig['fqName']});
                } else if (urlConfig['widget'] == 'flowseries') {
                    if (context == 'instance') {
                        $.extend(reqParams, {
                            'fqName': ifNull(urlConfig['vnName'], urlConfig['fqName']),
                            'ip': urlConfig['ip']
                        });
                    } else
                        $.extend(reqParams, {'fqName': urlConfig['fqName']});        //change queryParameter to fqName
                } else if (urlConfig['type'] == 'details') {
                    if (context == 'network')
                        $.extend(reqParams, {'uuid': urlConfig['uuid']});
                } else if (context == 'instance') {
                    $.extend(reqParams, {'fqName': urlConfig['vnName'], 'ip': urlConfig['ip']});
                } else
                    $.extend(reqParams, {'fqName': urlConfig['fqName']});
            }

            //If port argument is present,just copy it..arguments that need to be copied to reqParams as it is
            $.each(['port', 'protocol', 'vmName', 'vmVnName', 'useServerTime'], function (idx, field) {
                if (urlConfig[field] != null) {
                    //$.extend(reqParams,{port:obj[field]});
                    reqParams[field] = urlConfig[field];
                }
            });
            if (urlConfig['type'] == 'portRangeDetail') {
                var fqName = urlConfig['fqName'], protocolCode;
                reqParams['timeRange'] = 600;
                reqParams['table'] = 'FlowSeriesTable';
                if (urlConfig['startTime'] != null) {
                    reqParams['fromTimeUTC'] = urlConfig['startTime'];
                    reqParams['toTimeUTC'] = urlConfig['endTime'];
                } else {
                    reqParams['fromTimeUTC'] = new XDate().addMinutes(-10).getTime();
                    reqParams['toTimeUTC'] = new XDate().getTime();
                }
                var protocolMap = {tcp: 6, icmp: 1, udp: 17},
                protocolCode = [];

                $.each(urlConfig['protocol'], function (idx, value) {
                    protocolCode.push(protocolMap[value]);
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
                    if (urlConfig['fqName'] == '' || urlConfig['fqName'] == '*')
                        reqParams['fqNameRegExp'] = '*';
                    else
                        reqParams['fqNameRegExp'] = '*' + urlConfig['fqName'] + ':*';
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

            return url + '?' + $.param(reqParams);
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

        /* Global Config Constants*/
        this.GLOBAL_CONFIG_TAB_ID = "global-config-tab";
        this.GLOBAL_BGP_OPTIONS_MAP = [
            {"key": "autonomous_system", "name": "Global ASN"},
            {"key": "ibgp_auto_mesh", "name": "iBGP Auto Mesh"},
            {"key": "ip_fabric_subnets", "name": "IP Fabric Subnets"}
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

        /* Route Aggregate Constants */
        this.CONFIG_ROUTE_AGGREGATE_LIST_ID = "config-route-aggregate-list";
        this.ROUTE_AGGREGATE_GRID_ID = "route-aggregate-grid";
        this.CONFIG_ROUTE_AGGREGATE_SECTION_ID = "config-route-aggregate-section";
        this.CONFIG_ROUTE_AGGREGATE_ID = "config-route-aggregate";
        this.CONFIG_ROUTE_AGGREGATE_LIST_VIEW_ID = "config-route-aggregate-list-view";
        this.ROUTE_AGGREGATE_PREFIX_ID = "route_aggregate";
        this.URL_CREATE_ROUTE_AGGREGATE = "/route-aggregates";
        this.URL_UPDATE_ROUTE_AGGREGATE = "/route-aggregate/";

        this.DEFAULT_COMMUNITIES = [
            {text:"no-export",id:"no-export"},
            {text:"accept-own",id:"accept-own"},
            {text:"no-advertise",id:"no-advertise"},
            {text:"no-export-subconfed",id:"no-export-subconfed"},
            {text:"no-reoriginate",id:"no-reoriginate"}
        ];

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
        this.URL_GET_CONFIG_DETAILS = "/api/tenants/config/get-config-details";
        this.URL_CREATE_CONFIG_OBJECT = "/api/tenants/config/create-config-object";
        this.URL_UPDATE_CONFIG_OBJECT = "/api/tenants/config/update-config-object";
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
