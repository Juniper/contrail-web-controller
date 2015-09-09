/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTLabels = function () {
        this.get = function (key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return labelMap[key];
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return labelMap[newKey];
                } else {
                    return newKey.charAt(0).toUpperCase() + newKey.slice(1);
                }
            }
        };

        this.isExistKey = function (key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return true;
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return true;
                }
            }

            return false;
        };

        this.getInLowerCase = function (key) {
            var label = this.get(key);
            return label.toLowerCase();
        };

        this.getInUpperCase = function (key) {
            var label = this.get(key);
            return label.toUpperCase();
        };

        this.getFirstCharUpperCase = function (key) {
            var label = this.get(key);

            label = label.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                return letter.toUpperCase();
            });
            return label;
        };

        var labelMap = {

            /* Network Details */
            name: 'Name',
            connected_networks: 'Connected Networks',
            instCnt: "Instances",
            ingress_flow_count: 'Ingress Flow Count',
            egress_flow_count: 'Egress Flow Count',
            acl: 'ACL',
            total_acl_rules: 'Total ACL Rules',
            interface_list: 'Interfaces',
            in_bytes: 'Total In Bytes',
            out_bytes: 'Total Out bytes',
            virtualmachine_list: 'Instances',
            encaps: 'Encaps',
            l2_encaps: 'L2 Encaps',
            out_tpkts: "Total Out packets",
            in_tpkts: "Total In packets",
            ingressFlowCount: "Ingress Flow Count",
            egressFlowCount: "Egress Flow Count",

            /* Monitor Infra */
            vrouter_routes_radio: 'Show Routes',

            /* Instance Details */
            cpu_one_min_avg: 'CPU Utilization (%)',
            rss: 'Used Memory',
            vm_memory_quota: 'Total Memory',
            vrouter: 'Virtual Router',
            vRouter: 'Virtual Router',
            vm_name: "Virtual Machine Name",
            vn: "Virtual Networks",
            virtual_network: "Virtual Network",

            /*Interface Details */
            uuid: 'UUID',
            mac_address: 'MAC Address',
            ip: 'IP Address',
            ip_address: 'IP Address',
            ip6_address: 'IPV6 Address',
            gateway: 'Gateway',
            label: 'Label',
            active: 'Active',
            l2_active: 'L2 Active',
            floatingIP: 'Floating IPs',

            /*Connected Network Details */
            src: 'Source Network',
            dst: 'Destination Network',
            service_inst: 'Service Instances',
            pkts: "Packets",

            /*Project Details*/
            intfCnt: "Interfaces",
            vnCnt: "Virtual Networks",
            inBytes: "Total In Bytes",
            outBytes: "Total Out Bytes",
            outTpkts: "Total Out Packets",
            inTpkts: "Total In Packets",
            throughput: "Total Throughput",

            /* PortDistribution */
            sport: 'Source Port',
            dport: 'Destination Port',

            /* Link Local Services */
            linklocal_service_name: 'Service Name',
            linklocal_service_ip: 'Service IP Address',
            linklocal_service_port: 'Service Port',
            ip_fabric_service_ip: 'Fabric IP',
            ip_fabric_service_port: 'Fabric Port',
            lls_fab_address_ip: 'Address Type',
            ip_fabric_DNS_service_name: 'Fabric DNS',

            /*Physical Routers*/
            pmodel: 'Model',
            snmpMntd: "SNMP Monitored",
            mgmtIP: "Management IP",
            dataIP: "VTEP Address",
            torAgent1: "TOR Agent1",
            torAgent2: "TOR Agent2",
            tsn1: "TSN1",
            tsn2: "TSN2",
            physical_router: "Physical Router",
            pRouterName: "Name",
            snmpLocalPort: "Local Port",
            snmpRetries: "Retries",
            snmpTimeout: "Timeout(secs)",
            snmpV2Community: "Community",
            snmpVersion: "SNMP Version",
            expDetSnmpVersion: "SNMP Version",
            snmpV3SecurityName: "Security Name",
            snmpV3SecurityLevel: "Security Level",
            snmpv3AuthProtocol: "Authentication Protocol",
            snmpv3AuthPasswd: "Password",
            snmpv3PrivProtocol: "Privacy Protocol",
            snmpv3PrivPasswd: "Password",
            snmpV3SecurityEngineId: "Security Engine Id",
            snmpv3Context: "Context",
            snmpv3ContextEngineId: "Context Engine Id",
            snmpv3EngineId: "Engine Id",
            snmpv3EngineBoots: "Engine Boots",
            snmpv3EngineTime: "Engine Time",
            displayVirtualRouters: "Associated Virtual Router(s)",
            totalInterfacesCount: "Interfaces",
            isJunosPortEnabled: "Junos Service Ports",
            netConfUserName: "Username",
            netConfPasswd: "Password",
            bgpGateWay: "BGP Gateway",
            vns: "Virtual Networks",
            virtualRouterType: 'Type',
            netconfManaged: 'Netconf Managed',
            autoConfig : 'Auto Configuration',
            junosServicePorts : 'Junos Service Ports',

            /*Virtual Router Config*/
            virtual_router_type: "Type",
            physical_router_back_refs: "Physical Routers",
            virtual_router_ip_address: "IP Address",

            /*Interfaces*/
            infName : 'Name',
            logical_interface_type : 'Logical Interface Type',
            infSubnet : 'Subnet',
            virtualNetwork : 'Virtual Network',
            logical_interface_vlan_tag : 'VLAN Id',
            servers_display : 'Servers',
            subnetCIDRArr : 'Subnet',
            lInterfaces : 'Logical Interfaces'

        };

        this.TOP_CONTENT_CONTAINER = "top-content-container";
        this.BOTTOM_CONTENT_CONTAINER = "bottom-content-container";

        this.MONITOR_PROJECT_LIST_ID = "monitor-project-list";
        this.MONITOR_PROJECT_ID = "monitor-project";
        this.MONITOR_PROJECT_VIEW_ID = "monitor-project-view";
        this.MONITOR_PROJECT_PAGE_ID = "monitor-project-page";
        this.MONITOR_PROJECT_LIST_PAGE_ID = "monitor-project-list-page";
        this.MONITOR_PROJECT_LIST_VIEW_ID = "monitor-project-list-view";
        this.MONITOR_NETWORK_PAGE_ID = "monitor-network-page";
        this.MONITOR_NETWORK_LIST_PAGE_ID = "monitor-network-list-page";
        this.MONITOR_NETWORK_LIST_ID = "monitor-network-list";
        this.MONITOR_NETWORK_LIST_VIEW_ID = "monitor-network-list-view";
        this.MONITOR_NETWORK_ID = "monitor-network";
        this.MONITOR_NETWORK_VIEW_ID = "monitor-network-view";
        this.MONITOR_INSTANCE_LIST_ID = "monitor-instance-list";
        this.MONITOR_INSTANCE_PAGE_ID = "monitor-instance-page";
        this.MONITOR_INSTANCE_LIST_PAGE_ID = "monitor-instances-list-page";
        this.MONITOR_INSTANCE_LIST_VIEW_ID = "monitor-instance-list-view";
        this.MONITOR_INTERFACE_LIST_VIEW_ID = "monitor-interface-list-view";
        this.MONITOR_INSTANCE_ID = "monitor-instance";
        this.MONITOR_INSTANCE_VIEW_ID = "monitor-instance-view";
        this.MONITOR_FLOW_LIST_ID = "monitor-flow-list";
        this.MONITOR_FLOW_LIST_VIEW_ID = "monitor-flow-list-view";
        this.MONITOR_FLOWS_PAGE_ID = "monitor-flows-page";

        this.DOMAINS_BREADCRUMB_DROPDOWN = "domains-breadcrumb-dropdown";

        this.PROJECTS_ID = "projects";
        this.PROJECT_GRAPH_ID = "project-graph";
        this.PROJECT_DETAILS_ID = "project-details";
        this.PROJECT_TABS_ID = "project-tabs";
        this.PROJECT_INSTANCE_GRID_ID = "project-instance-grid";
        this.PROJECTS_GRID_ID = "projects-grid";
        this.PROJECT_PORTS_SCATTER_CHART_ID = "project-ports-scatter-chart";
        this.PROJECT_NETWORKS_ID = "project-networks";
        this.PROJECT_NETWORK_GRID_ID = "project-network-grid";
        this.PROJECT_INSTANCES_ID = "project-instances";
        this.PROJECTS_SCATTER_CHART_ID = "projects-scatter-chart";
        this.PROJECT_FLOW_GRID_ID = "project-flow-grid";
        this.PROJECT_FILTER_PROTOCOL_MULTISELECT_ID = "project-filter-protocol-multiselect-id";
        this.PROJECTS_BREADCRUMB_DROPDOWN = "projects-breadcrumb-dropdown";

        this.NETWORK_GRAPH_ID = "network-graph";
        this.NETWORKS_PORTS_SCATTER_CHART_ID = "networks-ports-scatter-chart";
        this.NETWORK_TABS_ID = "network-tabs";
        this.NETWORK_DETAILS_ID = "network-details";
        this.NETWORK_PORT_DIST_ID = "network-port-distribution";
        this.NETWORK_INSTANCES_ID = "network-instances";
        this.NETWORK_TRAFFIC_STATS_ID = "network-traffic-stats";
        this.NETWORK_PORT_HEAT_CHART_ID = "network-port-heat-chart";
        this.NETWORKS_BREADCRUMB_DROPDOWN = "networks-breadcrumb-dropdown";

        this.INSTANCE_GRAPH_ID = "instance-graph";
        this.INSTANCES_CPU_MEM_CHART_ID = "instances-cpu-mem-chart";
        this.INSTANCE_TABS_ID = "instance-tabs";
        this.INSTANCE_DETAILS_ID = "instance-details";
        this.INSTANCE_TRAFFIC_STATS_ID = "instance-traffic-stats";
        this.INSTANCE_PORT_DIST_ID = "instance-port-dist";
        this.INSTANCE_CPU_MEM_STATS_ID = "instance-cpu-mem-stats";
        this.INSTANCE_TRAFFIC_STATS_DROPDOWN_ID = "instance-traffic-stats-dropdown";
        this.INSTANCE_PORT_DIST_DROPDOWN_ID = "instance-port-dist-dropdown";
        this.INSTANCE_TRAFFIC_STATS_CHART_ID = "instance-traffic-stats-chart";
        this.INSTANCE_PORT_DIST_CHART_ID = "instance-port-dist-chart";
        this.INSTANCE_PORT_HEAT_CHART_ID = "instance-port-heat-chart";
        this.INSTANCE_INTERFACE_GRID_ID = "instance-interface-grid";
        this.INSTANCE_INTERFACE_ID = "instance-interface";
        this.INSTANCE_BREADCRUMB_TEXT = "instance-breadcrumb-text";

        this.NETWORKING_GRAPH_ID = "networking-graph";
        this.GRAPH_CONNECTED_ELEMENTS_ID = "graph-connected-elements";
        this.GRAPH_CONFIG_ELEMENTS_ID = "graph-config-elements";
        this.GRAPH_LOADING_ID = "graph-loading";
        this.GRAPH_CONTROL_PANEL_ID = "graph-control-panel";

        this.MONITOR_CONNECTED_NETWORK_ID = "monitor-connected-network";
        this.MONITOR_CONNECTED_NETWORK_VIEW_ID = "monitor-connected-network-view";
        this.CONNECTED_NETWORK_TABS_ID = "connected-networks-tabs";
        this.CONNECTED_NETWORK_DETAILS_ID = "connected-network-details";
        this.CONNECTED_NETWORK_TRAFFIC_STATS_ID = "connected-network-traffic-stats";
        this.CONNECTED_NETWORK_TRAFFIC_STATS_DROPDOWN_ID = "connected-network-traffic-stats-dropdown";
        this.CONNECTED_NETWORK_TRAFFIC_STATS_CHART_ID = "connected-network-traffic-stats-chart";

        this.FLOWS_SCATTER_CHART_ID = "flows-scatter-chart";
        this.FLOWS_GRID_ID = "flows-grid";

        this.TITLE_PROJECTS = "Projects";
        this.TITLE_PROJECTS_SUMMARY = "Projects Summary";
        this.TITLE_PROJECT_DETAILS = "Project Details";


        this.TITLE_NETWORKS = "Networks";
        this.TITLE_NETWORKS_SUMMARY = "Networks Summary";
        this.TITLE_NETWORK_DETAILS = "Network Details";

        this.TITLE_INSTANCES = "Instances";
        this.TITLE_INSTANCES_SUMMARY = "Instances Summary";
        this.TITLE_INSTANCE_DETAILS = "Instance Details";

        this.TITLE_INTERFACES = "Interfaces";
        this.TITLE_INTERFACE_DETAILS = "Interface Details";
        this.TITLE_INTERFACES_SUMMARY = "Interfaces Summary";

        this.TITLE_CONNECTED_NETWORK_DETAILS = "Connected Network Details";

        this.TITLE_FLOWS = "Flows";
        this.TITLE_FLOWS_SUMMARY = "Flows Summary";
        this.TITLE_FILTER_PROTOCOL = "Filter Protocol";
        this.TITLE_FILTER_BY_PROTOCOL = "Filter by Protocol";

        this.TITLE_DETAILS = "Details";
        this.TITLE_VRF_STATS = "VRF Stats";
        this.TITLE_CPU_MEMORY_INFO = "CPU/Memory Information";
        this.TITLE_CPU_MEMORY = "CPU/Memory";
        this.TITLE_TRAFFIC_DETAILS = "Traffic Details";
        this.TITLE_FLOATING_IPS = "Floating IPs";
        this.TITLE_TRAFFIC_STATISTICS = "Traffic Statistics";
        this.TITLE_TRAFFIC_STATISTICS_IN = "Traffic Statistics In";
        this.TITLE_TRAFFIC_STATISTICS_OUT = "Traffic Statistics Out";
        this.TITLE_PORT_DISTRIBUTION = "Port Distribution";
        this.TITLE_PORT_MAP = "Port Map";

        this.X_AXIS_TITLE_PORT = "Port";
        this.Y_AXIS_TITLE_BW = "Bandwidth (Last 10 mins)";

        this.SOURCE_PORT = "Source Port";
        this.DESTINATION_PORT = "Destination Port";

        this.TITLE_GRAPH_ELEMENT_NETWORK_POLICY = 'network policy';
        this.TITLE_GRAPH_ELEMENT_SECURITY_GROUP = 'security group';
        this.TITLE_GRAPH_ELEMENT_NETWORK_IPAM = 'network ipam';
        this.TITLE_GRAPH_ELEMENT_SERVICE_INSTANCE = 'service instance';
        this.TITLE_GRAPH_ELEMENT_VIRTUAL_NETWORK = 'virtual network';
        this.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE = 'virtual machine';
        this.TITLE_GRAPH_ELEMENT_CONNECTED_NETWORK = 'link';

        //Alarms labels
        this.ALARMS_BREADCRUMB_DROPDOWN = "alarms-breadcrumb-dropdown";
        this.MONITOR_ALARMS_PAGE_ID = "monitor-alarms-page";
        this.ALARMS_GRID_ID = "monitor-alarms-grid";
        this.TITLE_ALARMS = "Alarms Dashboard";
        this.TITLE_ALARMS_SUMMARY = "Alarms";
        this.MONITOR_ALARM_LIST_ID = "monitor-alarm-list";
        this.MONITOR_ALARM_LIST_VIEW_ID = "monitor-alarm-list-view";
        this.TITLE_ACKNOWLEDGE = 'Acknowledge';
        this.TITLE_ALARM_HISTORY = 'Alarm History';
        this.TITLE_ALARM_DETAILS = 'Alarm Details';

        //Monitor Infra common
        this.MONITOR_INFRA_VIEW_PATH = 'monitor/infrastructure/common/ui/js/views/';
        this.DASHBOARD_LOGS_URL = '/api/admin/reports/query?where=&filters=&level=4' +
                    '&fromTimeUTC=now-10m&toTimeUTC=now&table=MessageTable&limit=10';
        this.CACHE_DASHBORAD_LOGS = 'cache-dashboard-logs';

        this.VROUTER_DASHBOARD_CHART_ID = 'vrouter-dashboard-chart';
        this.VROUTER_DASHBOARD_SPARKLINE_ID = 'vrouter-dashboard-sparkline';
        this.VROUTER_DASHBOARD_SECTION_ID = 'vrouter-dashboard-section';

        //Config node labels
        this.CONFIGNODE_VIEWPATH_PREFIX = 'monitor/infrastructure/confignode/ui/js/views/';
        this.CONFIGNODE_SUMMARY_PAGE_ID = 'monitor-config-nodes';
        this.CONFIGNODE_SUMMARY_URL = '/api/admin/monitor/infrastructure/confignodes/summary';
        this.CONFIGNODE_SUMMARY_TITLE = 'Config Nodes';
        this.CONFIGNODE_SUMMARY_GRID_ID = 'config-nodes-grid';
        this.CONFIGNODE_SUMMARY_SCATTERCHART_ID = 'config-nodes-scatterchart';
        this.CONFIGNODE_SUMMARY_GRID_SECTION_ID = "config-nodes-grid-section";
        this.CONFIGNODE_SUMMARY_CHART_ID = 'config-nodes-chart';
        this.CONFIGNODE_SUMMARY_LIST_SECTION_ID = 'config-nodes-list-section';
        this.CONFIGNODE_SUMMARY_SCATTERCHART_SECTION_ID = 'config-nodes-scatterchart-section';
        this.CONFIGNODE_DETAILS_PAGE_ID = 'config_nodes_details_pages';
        this.CONFIGNODE_TAB_SECTION_ID = 'config_node_tab_section';
        this.CONFIGNODE_TAB_VIEW_ID = 'config_node_tab';
        this.CONFIGNODE_DETAILS_SECTION_ID = 'config_node_details_section';
        this.CONFIGNODE_TABS_ID = 'config_node_tab'
        this.CACHE_CONFIGNODE = 'cache-config-nodes';

        //Control node labels
        this.CONTROLNODE_VIEWPATH_PREFIX = 'monitor/infrastructure/controlnode/ui/js/views/';
        this.CONTROLNODE_SUMMARY_PAGE_ID = 'monitor-control-nodes';
        this.CONTROLNODE_SUMMARY_URL = '/api/admin/monitor/infrastructure/controlnodes/summary';
        this.CONTROLNODE_SUMMARY_TITLE = 'Control Nodes';
        this.CONTROLNODE_SUMMARY_GRID_ID = 'control-nodes-grid';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_ID = 'control-nodes-scatterchart';
        this.CONTROLNODE_SUMMARY_GRID_SECTION_ID = "control-nodes-grid-section";
        this.CONTROLNODE_SUMMARY_CHART_ID = 'control-nodes-chart';
        this.CONTROLNODE_SUMMARY_LIST_SECTION_ID = 'control-nodes-list-section';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_SECTION_ID = 'control-nodes-scatterchart-section';
        this.CACHE_CONTROLNODE = 'cache-control-nodes';

        this.CONTROLNODE_DETAILS_PAGE_ID = 'control_nodes_details';
        this.CONTROLNODE_DETAIL_PAGE_ID = 'control_nodes_detail_page'
        this.CONTROLNDOE_DETAILS_SECTION_ID = 'control_nodes_details_section';
        this.CONTROLNODE_TAB_SECTION_ID = 'control_nodes_tab_section';
        this.CONTROLNODE_TAB_VIEW_ID = 'control_nodes_tab_view';
        this.CONTROLNODE_DETAILS_TABS_ID = 'control_nodes_details-tab';
        this.CONTROLNODE_PEERS_GRID_SECTION_ID = 'control_node_peers_grid_section_id';
        this.CONTROLNODE_PEERS_GRID_VIEW_ID = 'control_node_peers_id';
        this.CONTROLNODE_PEERS_GRID_ID = "control_node_peers_grid_id";
        this.CONTROLNODE_PEERS_TITLE = "Peers";
        this.CONTROLNODE_ROUTES_GRID_VIEW_ID = 'control_node_routes_grid_view';
        this.CONTROLNODE_ROUTES_ID = 'control_node_routes';
        this.CONTROLNODE_ROUTES_GRID_ID = 'control_node_route_grid';
        this.CONTROLNODE_ROUTES_RESULT_VIEW = 'control_node_route_results_view';
        this.CONTROLNODE_ROUTES_RESULTS = 'controlroutes-results';


        //vRouter summary page labels
        this.VROUTER_VIEWPATH_PREFIX = 'monitor/infrastructure/vrouter/ui/js/views/';
        this.VROUTER_SUMMARY_PAGE_ID = 'monitor-vrouter-nodes';
        this.VROUTER_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/vrouters/summary';
        this.VROUTER_SUMMARY_TITLE = 'Virtual Routers';
        this.VROUTER_SUMMARY_GRID_ID = 'vrouter-nodes-grid';
        this.VROUTER_SUMMARY_CROSSFILTER_ID = 'vrouter-nodes-corssfilter';
        this.VROUTER_SUMMARY_SCATTERCHART_ID = 'vrouter-nodes-scatterchart';
        this.VROUTER_SUMMARY_GRID_SECTION_ID = "vrouter-nodes-grid-section";
        this.VROUTER_SUMMARY_CHART_ID = 'vrouter-nodes-chart';
        this.VROUTER_SUMMARY_LIST_SECTION_ID = 'vrouter-nodes-list-section';
        this.VROUTER_SUMMARY_SCATTERCHART_SECTION_ID =
            'vrouter-nodes-scatterchart-section';
        this.CACHE_VROUTER = 'cache-vrouter-nodes';
        
        this.VROUTER_TAB_SECTION_ID = 'vrouter_tab_section';
        this.VROUTER_TAB_VIEW_ID = 'vrouter_tab_view';
        this.VROUTER_DETAILS_SECTION_ID = 'vrouter_details_section';
        this.VROUTER_DETAILS_TABS_ID = 'vrouter_details_tab';
        this.VROUTER_DETAIL_ID = 'vrouter_detail_id;'

        // this.VROUTER_NETWORKS_GRID_SECTION_ID = 'vrouter_networks_grid_section_id';
        this.VROUTER_NETWORKS_GRID_VIEW_ID = 'vrouter_networks_id';
        this.VROUTER_NETWORKS_TITLE = "Networks";
        this.VROUTER_NETWORKS_RESULTS_VIEW = 'vrouter_networks_results_view';
        this.VROUTER_NETWORKS_RESULTS = 'vrouter_networks-results';
        this.VROUTER_NETWORKS_PREFIX =  'vrouter_networks';
        this.VROUTER_NETWORKS_GRID_ID = this.VROUTER_NETWORKS_PREFIX + '-results';

        // this.VROUTER_INTERFACES_GRID_SECTION_ID = 'vrouter_interfaces_grid_section_id';
        this.VROUTER_INTERFACES_GRID_VIEW_ID = 'vrouter_interfaces_id';
        this.VROUTER_INTERFACES_TITLE = "Interfaces";
        this.VROUTER_INTERFACES_RESULTS_VIEW = 'vrouter_interfaces_results_view';
        this.VROUTER_INTERFACES_RESULTS = 'vrouter_interfaces-results';
        this.VROUTER_INTERFACES_PREFIX = 'vrouter_interfaces';
        this.VROUTER_INTERFACES_GRID_ID = this.VROUTER_INTERFACES_PREFIX + '-results';

        this.VROUTER_ROUTES_PREFIX = 'vrouter_routes';

        // this.VROUTER_ROUTES_GRID_SECTION_ID = 'vrouter_routes_grid_section_id';
        this.VROUTER_ROUTES_TITLE = "Routes";
        this.VROUTER_ROUTES_RESULTS_VIEW = 'vrouter_routes_results_view';
        this.VROUTER_ROUTES_RESULTS = 'vrouter_routes-results';
        this.VROUTER_ROUTES_PREFIX = 'vrouter_routes';
        this.VROUTER_ROUTES_GRID_ID = this.VROUTER_ROUTES_PREFIX + '-results';

        // this.VROUTER_ACL_GRID_SECTION_ID = 'vrouter_acl_grid_section_id';
        this.VROUTER_ACL_GRID_VIEW_ID = 'vrouter_acl_id';
        this.VROUTER_ACL_TITLE = "ACL";
        this.VROUTER_ACL_RESULTS_VIEW = 'vrouter_acl_results_view';
        this.VROUTER_ACL_RESULTS = 'vrouter_acl-results';
        this.VROUTER_ACL_PREFIX = 'vrouter_acl';
        this.VROUTER_ACL_GRID_ID = this.VROUTER_ACL_PREFIX + '-results';

        // this.VROUTER_FLOWS_GRID_SECTION_ID = 'vrouter_flows_grid_section_id';
        this.VROUTER_FLOWS_GRID_VIEW_ID = 'vrouter_flows_id';
        this.VROUTER_FLOWS_TITLE = "Flows";
        this.VROUTER_FLOWS_RESULTS_VIEW = 'vrouter_flows_results_view';
        this.VROUTER_FLOWS_RESULTS = 'vrouter_flows-results';
        this.VROUTER_FLOWS_PREFIX = 'vrouter_flows';
        this.VROUTER_FLOWS_GRID_ID = this.VROUTER_FLOWS_PREFIX + '-results';
 
        //Database node labels
        this.DATABASENODE_VIEWPATH_PREFIX =
            'monitor/infrastructure/databasenode/ui/js/views/';

        //Database node summary page labels
        this.DATABASENODE_SUMMARY_PAGE_ID = 'monitor-database-nodes';
        this.DATABASENODE_SUMMARY_URL = '/api/admin/monitor/infrastructure/dbnodes/summary';
        this.DATABASENODE_SUMMARY_TITLE = 'Database Nodes';
        this.DATABASENODE_SUMMARY_GRID_ID = 'database-nodes-grid';
        this.DATABASENODE_SUMMARY_SCATTERCHART_ID = 'database-nodes-scatterchart';
        this.DATABASENODE_SUMMARY_GRID_SECTION_ID = "database-nodes-grid-section";
        this.DATABASENODE_SUMMARY_CHART_ID = 'database-nodes-chart';
        this.DATABASENODE_SUMMARY_LIST_SECTION_ID = 'database-nodes-list-section';
        this.DATABASENODE_SUMMARY_SCATTERCHART_SECTION_ID = 'database-nodes-scatterchart-section';
        this.DATABASENODE_DETAILS_PAGE_ID = 'database_nodes_details_pages';
        this.DATABASENODE_TAB_SECTION_ID = 'database_node_tab_section';
        this.DATABASENODE_TAB_VIEW_ID = 'database_node_tab';
        this.DATABASENODE_DETAILS_SECTION_ID = 'database_node_details_section';
        this.DATABASENODE_TABS_ID = 'database_node_tabs';
        this.CACHE_DATABASENODE = 'cache-database-nodes';

        //Analytics node labels
        this.ANALYTICSNODE_VIEWPATH_PREFIX = 'monitor/infrastructure/analyticsnode/ui/js/views/';
        this.ANALYTICSNODE_SUMMARY_PAGE_ID = 'monitor-analytics-nodes';
        this.ANALYTICSNODE_SUMMARY_URL = '/api/admin/monitor/infrastructure/analyticsnodes/summary';
        this.ANALYTICSNODE_SUMMARY_TITLE = 'Analytics Nodes';
        this.ANALYTICSNODE_SUMMARY_GRID_ID = 'analytics-nodes-grid';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_ID = 'analytics-nodes-scatterchart';
        this.ANALYTICSNODE_SUMMARY_GRID_SECTION_ID = "analytics-nodes-grid-section";
        this.ANALYTICSNODE_SUMMARY_CHART_ID = 'analytics-nodes-chart';
        this.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID = 'analytics-nodes-list-section';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_SECTION_ID = 'analytics-nodes-scatterchart-section';
        this.CACHE_ANALYTICSNODE = 'cache-analytics-nodes';
        this.ANALYTICSNODE_DETAILS_PAGE_ID = 'analytics_nodes_details';
        this.ANALYTICSNODE_TAB_SECTION_ID = 'analytics_nodes_tab_section';
        this.ANALYTICSNODE_TAB_VIEW_ID = 'analytics_nodes_tab_view';
        this.ANALYTICSNODE_TABS_ID = 'analytics_nodes_tab';
        this.ANALYTICSNODE_DETAILS_SECTION_ID = 'analytics_nodes_detail_section';
        this.ANALYTICSNODE_DETAIL_PAGE_ID = 'analytics_node_detail_page';
        this.ANALYTICSNODE_GENERATORS_GRID_SECTION_ID = 'analytics_node_generators_grid_section';
        this.ANALYTICSNODE_GENERATORS_GRID_ID = 'analytics_node_generators_grid';
        this.ANALYTICSNODE_GENERATORS_TITLE = 'Generators';
        this.ANALYTICSNODE_QEQUERIES_GRID_ID = 'analytics_node_qequeries_grid';
        this.ANALYTICSNODE_QEQUERIES_TITLE = 'QE Queries';


        this.TMPL_CORE_GENERIC_EDIT = 'core-generic-edit-form-template';
        this.TMPL_CORE_GENERIC_DEL = 'core-generic-delete-form-template';

        this.CONFIG_LINK_LOCAL_SERVICES_PAGE_ID = 'config-link-local-services-page';
        this.CONFIG_LINK_LOCAL_SERVICES_LIST_VIEW_ID = 'config-link-local-services-list';
        this.CONFIG_LINK_LOCAL_SERVICES_SECTION_ID = 'lls';
        this.CONFIG_LINK_LOCAL_SERVICES_ID = 'config-link-local-services';
        this.TITLE_LINK_LOCAL_SERVICES = 'Link Layer Services';
        this.LINK_LOCAL_SERVICES_GRID_ID = 'link-local-services-grid';
        this.LINK_LOCAL_SERVICES_PREFIX_ID = 'link_local_services';
        this.TITLE_CREATE_LLS = 'Create Link Local Service';
        this.TITLE_DEL_LLS = 'Delete Link Local Service';
        this.TITLE_EDIT_LLS = 'Edit Link Local Service';
        this.LINK_LOCAL_SERVICE_DETAILS = 'Link Local Service Details';

        //Physical Routers labels
        this.CONFIG_PHYSICAL_ROUTERS_PAGE_ID = "config-physical-routers-page";
        this.CONFIG_PHYSICAL_ROUTERS_LIST_ID = "config-physical-routers-list";
        this.CONFIG_PHYSICAL_ROUTERS_SECTION_ID = "config-physical-routers-section";
        this.CONFIG_PHYSICAL_ROUTERS_ID = "config-physical-routers";
        this.TITLE_PHYSICAL_ROUTERS = "Physical Routers";
        this.CONFIG_PHYSICAL_ROUTERS_LIST_VIEW_ID = "config-physical-routers-list-view";
        this.PHYSICAL_ROUTERS_GRID_ID = "physical-routers-grid";
        this.TITLE_ADD_PHYSICAL_ROUTER = "Add Physical Router";
        this.CREATE_OVSDB_MANAGED_TOR = "OVSDB Managed ToR";
        this.TITLE_OVSDB_MANAGED_TOR = "Add OVSDB Managed ToR";
        this.CREATE_NETCONF_MANAGED_PHYSICAL_ROUTER = "Netconf Managed Physical Router";
        this.TITLE_NETCONF_MANAGED_TOR = "Add Netconf Managed Physical Router";
        this.CREATE_CPE_ROUTER = "CPE Router";
        this.CREATE_PHYSICAL_ROUTER = "Physical Router";
        this.PHYSICAL_ROUTER_ADD = "Add";
        this.PHYSICAL_ROUTER_PREFIX_ID = 'physical_router';
        this.SELECT_ENTER_NAME = "Select or Enter Name";
        this.SNMP_AUTH = "auth";
        this.SNMP_AUTHPRIV = "authpriv";
        this.TITLE_PHYSICAL_ROUTER_PROPERTIES = "Physical Router Properties";
        this.TITLE_NETCONF_SETTINGS = "Netconf Settings";
        this.TITLE_SNMP_SETTINGS = "SNMP Settings";
        this.OVSDB_ACCORDION = "ovsdb_accordion";
        this.OVSDB_SNMP_SECTION = "OVSDB_snmp_section";
        this.OVSDB_SNMP_SECTION_TITLE = "SNMP Settings";
        this.OVSDB_V2_VERSION_ID = "v2_version_content";
        this.OVSDB_V3_VERSION_ID = "v3_version_content";
        this.TITLE_EDIT_OVSDB_MANAGED_TOR = "Edit OVSDB Managed ToR";
        this.TITLE_DELETE_CONFIG = "Delete";
        this.OVSDB_TYPE = "ovsdb";
        this.NET_CONF_TYPE = 'netconf';
        this.CPE_ROUTER_TYPE = 'cpe';
        this.PHYSICAL_ROUTER_TYPE = 'prouter';
        this.TITLE_EDIT_NETCONF_MANAGED_PR = 'Edit Netconf Managed Physical Router';
        this.TITLE_CPE_ROUTER = "Add VCPE";
        this.TITLE_EDIT_VCPE_ROUTER = "Edit VCPE";
        this.CREATE_ACTION = "create";
        this.EDIT_ACTION = "edit";
        this.ASSOCIATED_VR_ACCORDION = "associated_vr_accordion";
        this.ASSOCIATED_VR_SECTION = "associated_vr_section";
        this.ASSOCIATED_VR_TITLE = "Associated Virtual Routers";
        this.TOR_AGENT_SECTION = "tor_agent_section";
        this.NETCONF_SETTINGS_SECTION = 'netconf_settings_section';
        this.NETCONF_SETTINGS_TITLE = 'Netconf Settings';
        this.TOR_AGENT = "TOR Agent";
        this.TITLE_EDIT_PHYSICAL_ROUTER = "Edit Physical Router";

        // Query Engine labels
        this.QE_FLOW_SERIES_ID = "qe-flow-series";
        this.QE_FLOW_SERIES_SECTION_ID = "qe-flow-series-section";
        this.QE_FLOW_SERIES_TAB_ID = "qe-flow-series-tab";
        this.QE_FLOW_SERIES_GRID_ID = "qe-flow-series-grid";
        this.QE_FLOW_SERIES_CHART_ID = "qe-flow-series-chart";
        this.QE_FLOW_SERIES_CHART_PAGE_ID = 'qe-flow-series-chart-page';
        this.QE_FLOW_SERIES_LINE_CHART_ID = "qe-flow-series-line-chart"
        this.QE_FLOW_SERIES_CHART_GRID_ID = "qe-flow-series-chart-grid";
        this.QE_SELECT_STAT_TABLE = "Select Statistic Table";

        this.QE_STAT_QUERY_ID = "qe-stat-query";
        this.QE_STAT_QUERY_SECTION_ID = "qe-stat-query-section";
        this.QE_STAT_QUERY_TAB_ID = "qe-stat-query-tab";
        this.QE_STAT_QUERY_GRID_ID = "qe-stat-query-grid";
        this.QE_STAT_QUERY_CHART_ID = "qe-stat-query-chart";
        this.QE_STAT_QUERY_CHART_PAGE_ID = 'qe-stat-query-chart-page';
        this.QE_STAT_QUERY_LINE_CHART_ID = "qe-stat-query-line-chart"
        this.QE_STAT_QUERY_CHART_GRID_ID = "qe-stat-query-chart-grid";

        this.QE_OBJECT_LOGS_ID = "qe-object-logs";
        this.QE_OBJECT_LOGS_SECTION_ID = "qe--object-logs-section";
        this.QE_OBJECT_LOGS_TAB_ID = "qe-object-logs-tab";
        this.QE_OBJECT_LOGS_GRID_ID = "qe-object-logs-grid";
        this.QE_SELECT_OBJECT_TABLE = "Select Object Table";

        this.TITLE_QUERY = "Query";
        this.TITLE_RESULTS = "Results";
        this.TITLE_CHART = "Chart";
        this.TITLE_FLOW_SERIES = "Flow Series";
        this.TITLE_FLOW_SERIES_RESULTS = "Flow Series Results";
        this.TITLE_STATS_QUERY = "Statistics Query";
        this.TITLE_OBJECT_LOGS = "Object Logs";

        // VRouter Config labels
        this.CFG_VROUTER_PAGE_ID = 'config-vrouter-page';
        this.CFG_VROUTER_LIST_ID = 'config-vrouter-list';
        this.CFG_VROUTER_LIST_VIEW_ID = 'config-vrouter-list-view';
        this.CFG_VROUTER_GRID_ID = 'config-vrouter-grid';
        this.CFG_VROUTER_PREFIX_ID = 'config_vrouter';
        this.CFG_VROUTER_TITLE = 'Virtual Routers';
        this.CFG_VROUTER_TITLE_SUMMARY = 'Virtual Routers Summary';
        this.CFG_VROUTER_TITLE_DETAILS = 'Virtual Router Details';
        this.CFG_VROUTER_TITLE_EDIT = 'Edit Virtual Router';
        this.CFG_VROUTER_TITLE_CREATE = 'Create Virtual Router';
        this.CFG_VROUTER_TITLE_DELETE = 'Delete Virtual Router';
        this.CFG_VROUTER_TITLE_MULTI_DELETE = 'Delete Virtual Router(s)';

        // IPAM Config labels
        this.CFG_IPAM_PAGE_ID = 'config-ipam-page';
        this.CFG_IPAM_LIST_ID = 'config-ipam-list';
        this.CFG_IPAM_LIST_VIEW_ID = 'config-ipam-list-view';
        this.CFG_IPAM_GRID_ID = 'config-ipam-grid';
        this.CFG_IPAM_PREFIX_ID = 'IPAM';
        this.CFG_IPAM_TITLE = 'IP Address Management';
        this.CFG_IPAM_TITLE_SUMMARY = 'IPAM Summary';
        this.CFG_IPAM_TITLE_DETAILS = 'Details';
        this.CFG_IPAM_TITLE_EDIT = 'IP Address Mgmt';
        this.CFG_IPAM_TITLE_CREATE = 'Create IPAM';
        this.CFG_IPAM_TITLE_DELETE = 'Delete IPAM';
        this.CFG_IPAM_TITLE_MULTI_DELETE = 'Delete IPAM(s)';

        // FIP Config labels
        this.CFG_FIP_PAGE_ID = 'config-fip-page';
        this.CFG_FIP_LIST_ID = 'config-fip-list';
        this.CFG_FIP_LIST_VIEW_ID = 'config-fip-list-view';
        this.CFG_FIP_GRID_ID = 'config-fip-grid';
        this.CFG_FIP_PREFIX_ID = 'fip';
        this.CFG_FIP_TITLE = 'Floating IPs';
        this.CFG_FIP_TITLE_SUMMARY = 'Floating IP Summary';
        this.CFG_FIP_TITLE_DETAILS = 'Details';
        this.CFG_FIP_TITLE_ALLOCATE = 'Allocate Floating IP';
        this.CFG_FIP_TITLE_RELEASE = 'Release Floating IP(s)';
        this.CFG_FIP_TITLE_ASSOCIATE = 'Associate Floating IP to Port';
        this.CFG_FIP_TITLE_DISASSOCIATE = 'Disassociate Floating IP';

        // SVC TEMPLATE Config labels
        this.CFG_SVC_TEMPLATE_PAGE_ID = 'config-svc-template-page';
        this.CFG_SVC_TEMPLATE_LIST_ID = 'config-svc-template-list';
        this.CFG_SVC_TEMPLATE_LIST_VIEW_ID = 'config-svc-template-list-view';
        this.CFG_SVC_TEMPLATE_GRID_ID = 'config-svc-template-grid';
        this.CFG_SVC_TEMPLATE_PREFIX_ID = 'service_template';
        this.CFG_SVC_TEMPLATE_TITLE = 'Service Templates';
        this.CFG_SVC_TEMPLATE_TITLE_SUMMARY = 'Service Templates Summary';
        this.CFG_SVC_TEMPLATE_TITLE_DETAILS = 'Details';
        this.CFG_SVC_TEMPLATE_TITLE_CREATE = 'Create Service Template';
        this.CFG_SVC_TEMPLATE_TITLE_DELETE = 'Delete Service Template';
        this.CFG_SVC_TEMPLATE_TITLE_MULTI_DELETE = 'Delete Service Template(s)';

        /* Quotas */
        this.TITLE_QUOTAS = 'Project Quotas';
        this.CONFIG_QUOTAS_PAGE_ID = 'config-quotas-page';
        this.CONFIG_QUOTAS_SECTION_ID = 'config-quotas-section';
        this.CONFIG_QUOTAS_ID = 'config-quotas';
        this.QUOTAS_GRID_ID = 'quotas-grid';
        this.QUOTAS_PREFIX_ID = 'qts';
        this.TITLE_EDIT_QUOTAS = 'Edit Project Quotas';

        /* Global Config */
        this.CONFIG_GLOBAL_CONFIG_PAGE_ID = 'config-global-config-page';
        this.CONFIG_GLOBAL_CONFIG_SECTION_ID = 'config-global-config-section';
        this.CONFIG_GLOBAL_CONFIG_ID = 'config-global-config';
        this.GLOBAL_CONFIG_GRID_ID = 'global-config-grid';
        this.GLOBAL_CONFIG_PREFIX_ID = 'glblCfg';
        this.TITLE_EDIT_GLOBAL_CONFIG = 'Edit Global Config';
        this.TITLE_GLOBAL_CONFIG = 'Global Config';

        /* Security Group */
        this.CONFIG_SEC_GRP_PAGE_ID =
            'config-sec—grppage';
        this.CONFIG_SEC_GRP_LIST_VIEW_ID =
            'config-sec—grplist';
        this.CONFIG_SEC_GRP_SECTION_ID = 'secGrp';
        this.CONFIG_SEC_GRP_ID = 'config-sec-grp';
        this.TITLE_SEC_GRP = 'Security Groups';
        this.SEC_GRP_GRID_ID = 'sec—grp-grid';
        this.SEC_GRP_PREFIX_ID = 'security_group';
        this.TITLE_CREATE_SEC_GRP = 'Create Security Group';
        this.TITLE_DEL_SEC_GRP = 'Delete Security Group';
        this.TITLE_EDIT_SEC_GRP = 'Edit Security Group';
        this.SEC_GRP_DETAILS = 'Security Group Details';
        
        //Interfaces
        this.CONFIG_INTERFACES_LIST_ID = "config-interfaces-list";
        this.PROUTER_BREADCRUMB_DROPDOWN = "prouter-breadcrumb-dropdown";
        this.PROUTER_KEY = "prouter";
        this.NO_PROUTER_FOUND = "No Physical Router found";
        this.CONFIG_INTERFACES_SECTION_ID = "config-interfaces-section";
        this.CONFIG_INTERFACES_ID = "config-interfaces";
        this.TITLE_INTERFACES = "Interfaces";
        this.INF_VIEW_PATH_PREFIX =
            "config/physicaldevices/interfaces/ui/js/views/";
        this.CONFIG_INTERFACES_LIST_VIEW_ID = "config-interfaces-list";
        this.INTERFACES_GRID_ID = "interfaces-grid";
        this.TITLE_ADD_INTERFACE = "Add Interface";
        this.INTERFACE_PREFIX_ID = "interface"
        this.LOGICAL_INF_ACCORDION = "logical_inf_accordion";
        this.LOGICAL_INF_SECTION = "logical_inf_section";
        this.LOGICAL_INF_SECTION_TITLE =
            "Logical Interface Properties";
        this.ENTER_SERVER = "Enter or Choose mac";
        this.TITLE_EDIT_INF = "Edit Interface";
        this.PHYSICAL_INF = "Physical";
        this.LOGICAL_INF = "Logical";
        this.LOGICAL_INF_L2_TYPE = 'L2';
        this.LOGICAL_INF_L3_TYPE = 'L3';
        this.VLAN = 'logical_interface_vlan_tag';
        this.LOGICAL_INF_TYPE = 'logical_interface_type';
        this.TITLE_DELETE_ALL_CONFIG = "Delete All";
        this.BM_CLEAR_VMI = "bm_clear_vmi";
        this.INF_PROPERTIES = 'Interface Properties';
        this.INF_ED_TMPL = 'BlockListTemplateGenerator';
        this.INF_TG = 'TextGenerator';
        this.IP_PH = 'Auto Allocate or Enter an IP';
        this.PARENT_TYPE_PROUTER = 'physical_router';
        this.PARENT_TYPE_PINF = 'physical_interface';
    };
    return CTLabels;
});
