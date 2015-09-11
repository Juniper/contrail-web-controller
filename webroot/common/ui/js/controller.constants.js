~/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTConstants = function () {

        this.URL_ALL_DOMAINS = '/api/tenants/config/domains';
        this.URL_ALL_PROJECTS = '/api/tenants/config/projects';

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
        this.URL_NETWORK_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port';
        this.URL_CONNECTED_NETWORK_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vn?minsSince={0}&srcVN={1}&destVN={2}&sampleCnt={3}&useServerTime=true';

        this.URL_INSTANCE_CONNECTED_GRAPH = '/api/tenant/monitoring/instance-connected-graph?fqName={0}&instanceUUID={1}';
        this.URL_INSTANCE_CONFIG_GRAPH = '/api/tenant/monitoring/instance-config-graph?fqName={0}';
        this.URL_INSTANCE_DETAIL = '/api/tenant/networking/virtual-machine?fqNameRegExp={0}?flat';
        this.URL_INSTANCES_SUMMARY = '/api/tenant/networking/virtual-machines/summary';
        this.URL_INSTANCE_DETAILS_IN_CHUNKS = '/api/tenant/networking/virtual-machines/details?count={0}&startAt={1}';
        this.URL_INSTANCE_TRAFFIC_STATS = '/api/tenant/networking/flow-series/vm?minsSince={0}&fqName={1}&sampleCnt={2}&ip={3}&vmName={4}&vmVnName={5}&useServerTime=true';
        this.URL_INSTANCE_PORT_DISTRIBUTION = '/api/tenant/networking/network/stats/top?minsSince=10&fqName={0}&useServerTime=true&type=port&ip={1}';

        this.URL_VM_VN_STATS = '/api/tenant/networking/stats';
        this.URL_VM_INTERFACES = '/api/tenant/networking/virtual-machine-interfaces/summary';

        this.URL_QUERY = '/api/admin/reports/query';
        this.URL_GET_GLOBAL_VROUTER_CONFIG = '/api/tenants/config/global-vrouter-config';
        this.URL_GET_PROJECT_QUOTA_USED =
            '/api/tenants/config/project-quotas-info?id={0}';
        this.URL_GET_GLOBAL_VROUTER_CONFIG =
            '/api/tenants/config/global-vrouter-config';
        this.URL_GET_GLOBAL_ASN =
            '/api/tenants/admin/config/global-asn';
        this.URL_GET_SECURITY_GROUP_DETAILS =
            '/api/tenants/config/securitygroup-details?projUUID={0}'
        this.URL_GET_SEC_GRP_LIST =
            '/api/tenants/config/securitygroup';

        this.FILTERS_COLUMN_VN = ['UveVirtualNetworkAgent:interface_list', 'UveVirtualNetworkAgent:in_bandwidth_usage', 'UveVirtualNetworkAgent:out_bandwidth_usage',
            'UveVirtualNetworkConfig:connected_networks', 'UveVirtualNetworkAgent:virtualmachine_list', 'UveVirtualNetworkAgent:acl', 'UveVirtualNetworkAgent:total_acl_rules',
            'UveVirtualNetworkAgent:ingress_flow_count', 'UveVirtualNetworkAgent:egress_flow_count',
            'UveVirtualNetworkAgent:in_tpkts', 'UveVirtualNetworkAgent:out_tpkts',
            //'UveVirtualNetworkAgent:vrf_stats_list', 'UveVirtualNetworkAgent:vn_stats',
            'UveVirtualNetworkAgent:in_bytes', 'UveVirtualNetworkAgent:out_bytes'
         ];


        this.FILTERS_INSTANCE_LIST_INTERFACES= [
            'UveVMInterfaceAgent:virtual_network', 'UveVMInterfaceAgent:ip6_address', 'UveVMInterfaceAgent:ip_address',
            'UveVMInterfaceAgent:ip6_active', 'UveVMInterfaceAgent:vm_name', 'UveVMInterfaceAgent:if_stats'
        ];

        this.FILTERS_COLUMN_VM = ['UveVirtualMachineAgent:interface_list', 'UveVirtualMachineAgent:vrouter', 'UveVirtualMachineAgent:fip_stats_list',
            'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:if_bmap_list', 'UveVirtualMachineAgent:cpu_info', 'UveVirtualMachineAgent:vm_name', 'UveVirtualMachineAgent:uuid'
            //'VirtualMachineStats:if_stats'
        ];

        this.URL_NETWORK = '/#p=mon_networking_networks&q[type]=network&q[view]=details&q[focusedElement][fqName]={{key}}&q[focusedElement][type]=virtual-network';
        this.URL_INSTANCE = '/#p=mon_networking_instances&q[type]=instance&q[view]=details&q[focusedElement][fqName]={{params.vn}}&q[focusedElement][uuid]={{key}}&q[focusedElement][type]=virtual-network';
        this.URL_VROUTER = '/#p=mon_infra_vrouter&q[node]={{key}}';

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
        this.TMPL_FORM_RESULT = 'form-result-page-template';

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
        this.UCID_BC_DOMAIN_ALL_PROJECTS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-projects';
        this.UCID_BC_PROJECT_ALL_NETWORKS = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-networks';
        this.UCID_BC_NETWORK_ALL_INSTANCES = this.UCID_PREFIX_BREADCRUMB + ':{0}:all-instances';

        this.UCID_PROJECT_VN_PORT_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:port-stats";
        this.UCID_PROJECT_VM_PORT_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:port-stats";
        this.UCID_NETWORK_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:traffic-stats";
        this.UCID_INSTANCE_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:{2}:traffic-stats";
        this.UCID_CONNECTED_NETWORK_TRAFFIC_STATS_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:traffic-stats";
        this.UCID_INSTANCE_INTERFACE_LIST = this.UCID_PREFIX_MN_LISTS + "{0}:{1}:interfaces";
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
        this.COLOR_SEVERITY_MAP = {
             red : 'error',
             orange : 'warning',
             blue : 'default',
             green : 'okay'
        };
        this.LINK_CONNECTOR_STRING = " --- ";
        
        // Underlay constants
        this.UNDERLAY_TABS_VIEW_ID = 'underlayTabsView';
        this.UNDERLAY_TAB_ID = 'underlayTabs';
        this.TRACEFLOW_RADIOBUTTON_ID = 'traceFlowRadioBtns';
        this.TRACEFLOW_DROPDOWN_ID = 'traceFlowDropdown';
        this.TRACEFLOW_RESULTS_GRID_ID = 'traceFlowResultsGrid';
        this.DEFAULT_INTROSPECTPORT = '8085';
        this.UNDERLAY_PROUTER_INTERFACE_TAB_ID = 'pRouterInterfaces';
        this.UNDERLAY_TRACEFLOW_TAB_ID = 'traceFlow';
        this.UNDERLAY_DETAILS_TAB_ID = 'details';
        this.FLOW_RECORD_TABLE = "FlowRecordTable";
        this.FR_QUERY_PREFIX = "fr";
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
        this.UNDERLAY_PROUTER_TAB_INDEXES = [2, 3];
        this.UNDERLAY_LINK_TAB_INDEX = [4];
        this.UNDERLAY_VM_TAB_INDEXES = [5, 6, 7, 8, 9, 10];
        this.UNDERLAY_VROUTER_TAB_INDEXES = [11, 12, 13, 14, 15, 16];
        
        this.getProjectsURL = function (domain) {
            //If the role is admin then we will display all the projects else the projects which has access
            var url = '/api/tenants/projects/' + domain,
                role = globalObj['webServerInfo']['role'],
                activeOrchModel = globalObj['webServerInfo']['loggedInOrchestrationMode'];

            if (activeOrchModel == 'vcenter' || role.indexOf(roles['TENANT']) > -1) {
                url = '/api/tenants/config/projects';
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

        //Alarm constants
        this.URL_ALARM_DETAILS_IN_CHUNKS =
            '/api/tenant/monitoring/alarms?count={0}&startAt={1}';

        //Physical Routers constants
        this.URL_PHYSICAL_ROUTERS_DETAILS_IN_CHUNKS =
            '/api/tenants/config/physical-routers-with-intf-count';
        this.URL_VIRTUAL_ROUTER_DETAILS =
            '/api/tenants/config/virtual-routers-detail';
        this.URL_PHYSICAL_ROUTER_CREATE =
            '/api/tenants/config/physical-routers';
        this.URL_BGP_ROUTER_DETAILS = 'api/admin/nodes/bgp';
        this.URL_VIRTUAL_NETWORK_DETAILS =
            'api/tenants/config/virtual-networks';
        this.SNMP_VERSION_DATA = [
            {'value' : 'v2', "text" : '2'},
            {'value' : 'v3', "text" : '3'}
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
