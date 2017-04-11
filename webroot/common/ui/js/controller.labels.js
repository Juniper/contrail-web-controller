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
                if (keyArray.length > 1 && _.has(labelMap,
                        newKey)) {
                    return labelMap[newKey];
                } else {
                    return newKey.charAt(0).toUpperCase() +
                        newKey.slice(1);
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
                if (keyArray.length > 1 && _.has(labelMap,
                        newKey)) {
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

            label = label.toLowerCase().replace(/\b[a-z]/g,
                function (letter) {
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
            health_check_instance_list: 'Health Check Instance List',
            is_health_check_active: 'Health Check Active',

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
            /*DNS Server*/
            //dnsserver_name: 'Name',
            dnsserver_domain_name: 'Domain Name',
            dnsserver_forwarder: 'DNS Forwarder',
            dnsserver_record_resolution_order: 'Record Resolution Order',
            dnsserver_floating_ip_record: 'Floating IP Record',
            dns_time_to_live: 'Time To Live',
            dns_associate_ipams: 'Associate IPAMs',

            /*DNS Records*/
            dnsrecords_domain_name: 'Domain Name',
            dnsrecords_forwarder: 'DNS Forwarder',
            dnsrecords_record_resolution_order: 'Record Resolution Order',
            dnsrecords_floating_ip_record: 'Floating IP Record',
            dns_time_to_live: 'Time To Live',
            dns_associate_ipams: 'Associate IPAMs',

            /*Virtual Router Config*/
            virtual_router_type: "Type",
            physical_router_back_refs: "Physical Routers",
            virtual_router_ip_address: "IP Address",

            /* Underlay Labels */
            traceflow_radiobtn_name: '',
            traceFlowDropdown: '',

            /* Introspect */
            'control': 'Control Node',
            'dns': 'DNS',
            'control-nodemgr': 'Node Manager',
            'vrouter-agent': 'Agent',
            'vrouter-nodemgr': 'Node Manager',
            'api': 'API',
            'svc-monitor': 'SVC Monitor',
            'config-nodemgr': 'Node Manager',
            'analytics-api': 'Analytics API',
            'analytics-nodemgr': 'Node Manager',

            /* Query */
            table_name: 'Table',
            time_range: 'Time Range',
            from_time_utc: 'From Time',
            to_time_utc: 'To Time',
            opsQueryId: 'Analytics QueryId',
            queryId: 'QueryId',
            startTime: 'Time Issued',
            timeTaken: 'Time Taken',
            filters: 'Filter'
        };

        this.TOP_CONTENT_CONTAINER = "top-content-container";
        this.BOTTOM_CONTENT_CONTAINER = "bottom-content-container";

        this.MONITOR_PROJECT_LIST_ID = "monitor-project-list";
        this.MONITOR_PROJECT_VIEW_ID = "monitor-project-view";
        this.MONITOR_PROJECT_PAGE_ID = "monitor-project-page";
        this.MONITOR_PROJECT_LIST_PAGE_ID = "monitor-project-list-page";
        this.MONITOR_NETWORK_PAGE_ID = "monitor-network-page";
        this.MONITOR_NETWORK_LIST_PAGE_ID = "monitor-network-list-page";
        this.MONITOR_NETWORK_LIST_ID = "monitor-network-list";
        this.MONITOR_NETWORK_VIEW_ID = "monitor-network-view";
        this.MONITOR_INSTANCE_LIST_ID = "monitor-instance-list";
        this.MONITOR_INTERFACE_LIST_ID = "monitor-interface-list";
        this.MONITOR_INSTANCE_PAGE_ID = "monitor-instance-page";
        this.MONITOR_INSTANCE_LIST_PAGE_ID = "monitor-instances-list-page";
        this.MONITOR_INSTANCE_LIST_VIEW_ID = "monitor-instance-list-view";
        this.MONITOR_INSTANCE_VIEW_ID = "monitor-instance-view";
        this.MONITOR_FLOW_LIST_ID = "monitor-flow-list";
        this.MONITOR_FLOWS_PAGE_ID = "monitor-flows-page";
        //GLOBALCONTROLLER Labels
        this.GLOBAL_CONTROLLER_SYSTEM_CPU_TITLE= "System CPU across all nodes (%)";
        this.GLOBAL_CONTROLLER_SYSTEM_MAX_CPU_UTILIZATION= "Max CPU Utilization";
        this.GLOBAL_CONTROLLER_SYSTEM_MEMORY_TITLE= "System Memory across all nodes";
        this.GLOBAL_CONTROLLER_SYSTEM_MAX_MEMORY_UTILIZATION= "Max Memory Utilization";
        this.GLOBAL_CONTROLLER_BANDWIDTH_IN_TITLE= "Bandwidth across all vRouters";
        this.GLOBAL_CONTROLLER_SYSTEM_MAX_BANDWIDTH_IN= "Max Bandwidth In";
        this.GLOBAL_CONTROLLER_DISK_USAGE_TITLE= "Disk Usage across all nodes";
        this.GLOBAL_CONTROLLER_SYSTEM_CPU_UTILIZATION= "Max Disk Utilization";

        this.DOMAINS_BREADCRUMB_DROPDOWN = "domains-breadcrumb-dropdown";
        this.SASET_BREADCRUMB_DROPDOWN = "service-appliance-set-breadcrumb-dropdown";
        this.GLOBALSYS_BREADCRUMB_DROPDOWN = "global-system-config-breadcrumb-dropdown";

        this.PROJECTS_ID = "projects";
        this.PROJECT_GRAPH_ID = "project-graph";
        this.PROJECT_TABS_ID = "project-tabs";
        this.PROJECT_INSTANCE_GRID_ID = "project-instance-grid";
        this.PROJECTS_GRID_ID = "projects-grid";
        this.PROJECT_PORTS_SCATTER_CHART_ID = "project-ports-scatter-chart";
        this.PROJECT_NETWORKS_ID = "project-networks";
        this.PROJECT_NETWORK_GRID_ID = "project-network-grid";
        this.PROJECT_INSTANCES_ID = "project-instances";
        this.PROJECT_INTERFACES_ID = "project-interfaces";
        this.PROJECT_INTERFACE_GRID_ID = "project-interface-grid";
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
        this.NETWORK_INTERFACES_ID = "network-interfaces";
        this.NETWORK_TRAFFIC_STATS_ID = "network-traffic-stats";
        this.NETWORK_PORT_HEAT_CHART_ID = "network-port-heat-chart";
        this.NETWORKS_BREADCRUMB_DROPDOWN = "networks-breadcrumb-dropdown";
        this.NETWORK_INTERFACE_GRID_ID = "network-interface-grid";

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

        this.INTERFACE_GRID_ID = "interface-grid";
        this.INTERFACES_TRAFFIC_THROUGHPUT_CHART_ID = "instances-traffic-throughput-chart";

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

        this.TITLE_FLOW_SERIES = "Flow Series";
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

        this.TITLE_CPU = "CPU Share (%)";
        this.TITLE_CPU_LOAD = "CPU Load";
        this.TITLE_MEMORY = "Memory";
        this.RESPONSE_SIZE = 'Response Size';
        this.RESPONSE_TIME = 'Response Time';
        this.SYSTEM_CPU_SHARE = "System CPU Share (%)";
        this.SYSTEM_MEMORY_USED = "System Memory Usage";
        this.DISK_USAGE = 'Disk Usage';

        /** Titles used in node details chart widget **/
        this.TITLE_CONTROLNODE_CPU_MEM_UTILIZATION = 'Control Node CPU/Memory Utilization';
        this.TITLE_VROUTER_AGENT_CPU_MEM_UTILIZATION = 'Virtual Router Agent CPU/Memory Utilization';
        this.TITLE_VROUTER_SYSTEM_CPU_MEM_UTILIZATION = 'System CPU/Memory Utilization';
        this.TITLE_VROUTER_BANDWIDTH_UTILIZATION = 'Physical Bandwidth Utilization';
        this.TITLE_ANALYTICS_COLLECTOR_CPU_MEM_UTILIZATION = 'Collector CPU/Memory Utilization';
        this.TITLE_ANALYTICS_QE_CPU_MEM_UTILIZATION = 'Query Engine CPU/Memory Utilization';
        this.TITLE_ANALYTICS_ANALYTICS_CPU_MEM_UTILIZATION = 'OpServer CPU/Memory Utilization';
        this.TITLE_CONFIGNODE_APISERVER_CPU_MEM_UTILIZATION = 'API Server CPU/Memory Utilization';
        this.TITLE_CONFIGNODE_SERVICE_MONITOR_CPU_MEM_UTILIZATION = 'Service Monitor CPU/Memory Utilization';
        this.TITLE_CONFIGNODE_SCHEMA_CPU_MEM_UTILIZATION = 'Schema CPU/Memory Utilization';
        this.TITLE_DATABASENODE_DISK_USAGE = 'Disk Usage';
        /**ENDS Titles used in node details chart widget **/

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

        this.TITLE_GRAPH_ELEMENT_INTERFACE = 'interface';
        this.TITLE_NO_INTERFACES_AVAIL= 'No Interfaces Available.';

        //Underlay labels
        this.UNDERLAY_TOPOLOGY_PAGE_ID = 'underlay-topology-page';
        this.UNDERLAY_TOPOLOGY_ID = 'underlay-topology';
        this.UNDERLAY_GRAPH_ID = "underlay-graph";
        this.URL_UNDERLAY_TOPOLOGY = '/api/tenant/networking/underlay-topology';
        this.URL_UNDERLAY_TOPOLOGY_REFRESH = this.URL_UNDERLAY_TOPOLOGY + '?forceRefresh';
        this.TMPL_UNDERLAY_GRAPH_VIEW = 'underlay-graph-template';
        this.UNDERLAY_CONTROLPANEL = 'underlay-controlpanel';
        this.TITLE_GRAPH_ELEMENT_PHYSICAL_ROUTER = 'Physical Router';
        this.TITLE_GRAPH_ELEMENT_VIRTUAL_ROUTER = 'Virtual Router';
        this.UNDERLAY_VIEWPATH_PREFIX = 'monitor/infrastructure/underlay/ui/js/views/';
        this.UNDERLAY_TRACEFLOW_TITLE = 'Trace Flows';
        this.UNDERLAY_PROUTER_INTERFACES_TITLE = 'Interfaces';
        this.UNDERLAY_PROUTER_DETAILS = 'Physical Router Details';
        this.UNDERLAY_SEARCHFLOW_TITLE = 'Map Flows';
        this.UNDERLAY_TRAFFIC_STATISTICS = 'Traffic Statistics';
        this.UNDERLAY_SEARCHFLOW_WIDGET_TITLE = 'Query Flow Records';


        //Monitor Infra common
        this.MONITOR_INFRA_VIEW_PATH = 'monitor/infrastructure/common/ui/js/views/';
        this.CPU_SHARE_PERCENTAGE = "CPU Share % (in 3 mins)";
        this.VROUTER_DASHBOARD_CHART_ID = 'vrouter-dashboard-chart';
        this.VROUTER_DASHBOARD_SPARKLINE_ID = 'vrouter-dashboard-sparkline';
        this.VROUTER_DASHBOARD_SECTION_ID = 'vrouter-dashboard-section';
        //Analytics node labels
        this.ANALYTICS_CHART_SANDESH_SECTION_ID = "analytics-chart-sandesh-section-id";
        this.ANALYTICS_CHART_SANDESH_STACKEDBARCHART_ID = "analytics-chart-sandesh-stackedbarchart-id";
        this.ANALYTICS_CHART_SANDESH_LABEL = "Sandesh messages";
        this.ANALYTICS_CHART_QUERIES_SECTION_ID = "analytics-chart-queries-section-id";
        this.ANALYTICS_CHART_QUERIES_STACKEDBARCHART_ID = "analytics-chart-queries-stackedbarchart-id";
        this.ANALYTICS_CHART_QUERIES_LABEL = "Queries";
        this.ANALYTICS_CHART_FAILED_QUERIES = "Failed Queries";
        this.ANALYTICS_CHART_DATABASE_READ_SECTION_ID = "analytics-chart-database-read-section-id";
        this.ANALYTICS_CHART_DATABASE_READ_STACKEDBARCHART_ID = "analytics-chart-database-read-stackedbarchart-id";
        this.ANALYTICS_CHART_DATABASE_READ_LABEL = "DB Reads";
        this.ANALYTICS_CHART_FAILED_DATABASE_READS = "Failed DB Reads";
        this.ANALYTICS_CHART_DATABASE_USAGE = "DB Usage";
        this.ANALYTICS_CHART_DATABASE_WRITE_SECTION_ID = "analytics-chart-database-write-section-id";
        this.ANALYTICS_CHART_DATABASE_WRITE_STACKEDBARCHART_ID = "analytics-chart-database-write-stackedbarchart-id";
        this.ANALYTICS_CHART_DATABASE_WRITE_LABEL = "DB Writes";
        this.ANALYTICS_CHART_FAILED_DATABASE_WRITES = "Failed DB Writes";
        this.ANALYTICS_CHART_DATABASE_READ = "SUM(table_info.reads)";
        this.ANALYTICS_CHART_DATABASE_READ_FAILS = "SUM(table_info.read_fails)";
        this.ANALYTICS_CHART_DATABASE_WRITE = "SUM(table_info.writes)";
        this.ANALYTICS_CHART_DATABASE_WRITE_FAILS = "SUM(table_info.write_fails)";
        this.ANALYTICS_NODES = 'Analytics Nodes';
        this.CACHE_ANALYTICSNODE_SANDESH_CHARTS = 'cache-analyticsnode-sandesh-charts';
        this.CACHE_ANALYTICSNODE_QUERIES_CHARTS = 'cache-analyticsnode-queries-charts';
        this.CACHE_ANALYTICSNODE_DATABASEREADWRITE_CHARTS = 'cache-analyticsnode-databsereadwrite-charts';
        this.CACHE_DATABASE_USAGE_CHARTS = 'cache-databse-usage-charts';
        this.ANALYTICS_CHART_PERCENTILE_SECTION_ID = "analytics-chart-percentile-section-id";
        this.ANALYTICS_CHART_PERCENTILE_TEXT_VIEW = "analytics-chart-percentile-text-view";
        this.ANALYTICSNODE_CHART_PERCENTILE_TITLE = "95th Percentile - Messages (per min)";
        this.ANALYTICSNODE_CHART_PERCENTILE_COUNT = "Count";
        this.ANALYTICSNODE_CHART_PERCENTILE_SIZE = "Size";
        //Config node labels
        this.CONFIGNODE_VIEWPATH_PREFIX = 'monitor/infrastructure/confignode/ui/js/views/';
        this.CONFIGNODE_SUMMARY_PAGE_ID = 'monitor-config-nodes';
        this.CONFIGNODE_SUMMARY_URL = '/api/admin/monitor/infrastructure/confignodes/summary';
        this.CONFIGNODE_SUMMARY_TITLE = 'Config Nodes';
        this.CONFIGNODE_SUMMARY_GRID_ID = 'config-nodes-grid';
        this.CONFIGNODE_SUMMARY_STACKEDCHART_ID = 'config-nodes-stackedchart';
        this.CONFIGNODE_SUMMARY_DONUTCHART_SECTION_ID = 'config-nodes-donutchart-section';
        this.CONFIGNODE_SUMMARY_DONUTCHART_ONE_ID = 'config-nodes-donutchart-one';
        this.CONFIGNODE_SUMMARY_DONUTCHART_TWO_ID = 'config-nodes-donutchart-two';
        this.CONFIGNODE_SUMMARY_LINEBARCHART_ID = 'config-nodes-linebarchart';
        this.CONFIGNODE_SUMMARY_GRID_SECTION_ID = "config-nodes-grid-section";
        this.CONFIGNODE_SUMMARY_CHART_ID = 'config-nodes-chart';
        this.CONFIGNODE_SUMMARY_LIST_SECTION_ID = 'config-nodes-list-section';
        this.CONFIGNODE_SUMMARY_CHART_SECTION_ID = 'config-nodes-chart-section';
        this.CONFIGNODE_CHART_PERCENTILE_SECTION_ID = "confignode-chart-percentile-section-id";
        this.CONFIGNODE_CHART_PERCENTILE_TEXT_VIEW = "confignode-chart-percentile-text-view";
        this.CONFIGNODE_CHART_PERCENTILE_TITLE = "95th Percentile - Response";
        this.CONFIGNODE_CHART_PERCENTILE_TIME = "Time";
        this.CONFIGNODE_CHART_PERCENTILE_SIZE = "Size";
        //Config node scatter chart
        this.CONFIGNODE_SUMMARY_SCATTERCHART_ID = 'config-nodes-scatterchart';
        this.CONFIGNODE_SUMMARY_SCATTERCHART_SECTION_ID = 'config-nodes-scatterchart-section';
        this.CONFIGNODE_DETAILS_PAGE_ID = 'config_nodes_details_pages';
        this.CONFIGNODE_TAB_SECTION_ID = 'config_node_tab_section';
        this.CONFIGNODE_TAB_VIEW_ID = 'config_node_tab';
        this.CONFIGNODE_DETAILS_SECTION_ID = 'config_node_details_section';
        this.CONFIGNODE_TABS_ID = 'config_node_tab'
        this.CACHE_CONFIGNODE = 'cache-config-nodes';
        this.CACHE_CONFIGNODE_CHARTS = 'cache-config-nodes-charts';
        this.CONFIGNODE_DETAILS_APISERVER_CHART_SECTION_ID = 'config_node_details_apiserver_agent_chart_section';
        this.CONFIGNODE_DETAILS_APISERVER_LINE_CHART_ID = 'config_node_details_apiserver_line_chart';
        this.CONFIGNODE_DETAILS_SERVICE_MONITOR_CHART_SECTION_ID = 'config_node_details_service_monitor_chart_section';
        this.CONFIGNODE_DETAILS_SERVICE_MONITOR_LINE_CHART_ID = 'config_node_details_service_monitor_line_chart';
        this.CONFIGNODE_DETAILS_SCHEMA_CHART_SECTION_ID = 'config_node_details_schema_chart_section';
        this.CONFIGNODE_DETAILS_SCHEMA_LINE_CHART_ID = 'config_node_details_schema_line_chart';
        this.CONFIGNODE_DETAILS_APISERVER_CHART_WIDGET = 'config_node_details_apiserver_chart_widget';
        this.CONFIGNODE_DETAILS_SERVICE_MONITOR_CHART_WIDGET = 'config_node_details_service_monitor_chart_widget';
        this.CONFIGNODE_DETAILS_SCHEMA_CHART_WIDGET = 'config_node_details_schema_chart_widget';
        this.CONFIGNODE_CONSOLE_LOGS_VIEW_ID = 'config_node_console_logs_view';
        this.CONFIGNODE_ALARMS_GRID_VIEW_ID = "config_node_alarms_grid_view_id";
        this.CONFIG_NODE_ALARMS_GRID_SECTION_ID = "config_node_alarm_grid_section_id";
        this.CONFIG_NODE_OBJECT_USAGE_TITLE = 'Object Wise Usage';
        this.CONFIG_NODE_PROCESS_WISE_USAGE = 'Process Wise Usage';
        this.CONFIG_NODE_CLIENT_WISE_USAGE = 'Client Wise Usage';
        this.CONFIG_NODE_PROJECT_WISE_USAGE = 'Project Wise Usage';
        this.CONFIG_NODE_SCHEMA_CPU_SHARE = 'Schema CPU Share (%)';
        this.CONFIG_NODE_API_CPU_SHARE = 'API CPU Share (%)';
        this.CONFIG_NODE_SERVICE_MONITOR_CPU_SHARE = 'ServiceMon CPU Share (%)';
        this.CONFIG_NODE_DEVICE_MANAGER_CPU_SHARE = 'Device Manager CPU Share (%)';
        this.CONFIG_NODE_IFMAP_CPU_SHARE = 'IFMAP CPU Share (%)';

        //Control node labels
        this.CONTROLNODE_VIEWPATH_PREFIX =
            'monitor/infrastructure/controlnode/ui/js/views/';
        this.CONTROLNODE_SUMMARY_PAGE_ID = 'monitor-control-nodes';
        this.CONTROLNODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/controlnodes/summary';
        this.CONTROLNODE_SUMMARY_TITLE = 'Control Nodes';
        this.CONTROLNODE_SUMMARY_GRID_ID = 'control-nodes-grid';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_ID =
            'control-nodes-scatterchart';
        this.CONTROLNODE_SUMMARY_GRID_SECTION_ID =
            "control-nodes-grid-section";
        this.CONTROLNODE_SUMMARY_CHART_ID = 'control-nodes-chart';
        this.CONTROLNODE_SUMMARY_LIST_SECTION_ID =
            'control-nodes-list-section';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'control-nodes-scatterchart-section';
        this.CACHE_CONTROLNODE = 'cache-control-nodes';

        this.CONTROLNODE_DETAILS_PAGE_ID = 'control_nodes_details';
        this.CONTROLNODE_DETAIL_PAGE_ID =
            'control_nodes_detail_page'
        this.CONTROLNODE_DETAILS_CHART_SECTION_ID =
            'control_nodes_details_chart_section';
        this.CONTROLNODE_TAB_SECTION_ID =
            'control_nodes_tab_section';
        this.CONTROLNODE_TAB_VIEW_ID = 'control_nodes_tab_view';
        this.CONTROLNODE_DETAILS_TABS_ID =
            'control_nodes_details-tab';
        this.CONTROLNODE_DETAILS_LINE_CHART_ID =
            'control_node_details_chart';
        this.CONTROLNODE_DETAILS_CHART_WIDGET =
            'controlnode-details-chart-widget';

        this.CONTROLNODE_PEERS_GRID_SECTION_ID =
            'control_node_peers_grid_section_id';
        this.CONTROLNODE_PEERS_GRID_VIEW_ID =
            'control_node_peers_id';
        this.CONTROLNODE_PEERS_GRID_ID =
            "control_node_peers_grid_id";
        this.CONTROLNODE_PEERS_TITLE = "Peers";
        this.CONTROLNODE_ROUTES_GRID_VIEW_ID =
            'control_node_routes_grid_view';
        this.CONTROLNODE_CONSOLE_LOGS_VIEW_ID =
            'control_node_console_logs_view';
        this.CONTROLNODE_ROUTES_ID = 'control_node_routes';
        this.CONTROLNODE_ROUTES_GRID_ID = 'control_node_route_grid';
        this.CONTROLNODE_ROUTES_RESULT_VIEW =
            'control_node_route_results_view';
        this.CONTROLNODE_ROUTES_RESULTS = 'controlroutes-results';
        this.CONTROLNODE_ALARMS_GRID_VIEW_ID =
            "control_node_alarms_grid_view_id";
        this.CONTROL_NODE_ALARMS_GRID_SECTION_ID =
            "control_node_alarms_grid_section_id";
        this.CONTROLNODE_ROUTER_TITLE =
            "Search Routes";

        this.CONTROLNODE_CPU_SHARE_LINE_CHART_SEC_ID = 'control-nodes-cpu-line-chart-section';
        this.CONTROLNODE_CPU_SHARE_LINE_CHART_ID = 'control-nodes-cpu-line-chart';
        this.CONTROLNODE_MEM_SHARE_LINE_CHART_SEC_ID = 'control-nodes-mem-line-chart-section';
        this.CONTROLNODE_MEM_SHARE_LINE_CHART_ID = 'control-nodes-mem-line-chart';
        this.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_SEC_ID = 'control-nodes-sent-updates-scatter-chart-section';
        this.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_ID = 'control-nodes-sent-updates-scatter-chart';
        this.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_SEC_ID = 'control-nodes-received-updates-scatter-chart-section';
        this.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_ID = 'control-nodes-received-updates-scatter-chart';
        this.CONTROL_NODE_SENT_UPDATES = 'Sent Updates';
        this.CONTROL_NODE_RECEIVED_UPDATES = 'Received Updates';
        this.CONTROL_NODE_CPU_SHARE = 'BGP CPU Share (%)';
        this.CONTROL_NODE_MEMORY = 'BGP Memory Usage';
        this.CONTROL_NODE_CONTROL_CPU_SHARE = 'BGP CPU Share (%)';
        this.CONTROL_NODE_NODE_MANAGER_CPU_SHARE = 'Node Manager CPU Share (%)';
        this.CONTROL_DNS_CPU_SHARE = 'DNS CPU Share (%)';
        this.CONTROL_NAMED_CPU_SHARE = "'Named' CPU Share (%)";
        //vRouter summary page labels
        this.VROUTER_VIEWPATH_PREFIX =
            'monitor/infrastructure/vrouter/ui/js/views/';
        this.VROUTER_SUMMARY_PAGE_ID = 'monitor-vrouter-nodes';
        this.VROUTER_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/vrouters/summary';
//            'vRouters_1000_latest.json';
        this.VROUTER_SUMMARY_TITLE = 'Virtual Routers';
        this.VROUTER_SUMMARY_GRID_ID = 'vrouter-nodes-grid';
        this.VROUTER_SUMMARY_CROSSFILTER_ID =
            'vrouter-nodes-corssfilter';
        this.VROUTER_SUMMARY_SCATTERCHART_ID =
            'vrouter-nodes-scatterchart';
        this.VROUTER_SUMMARY_GRID_SECTION_ID =
            "vrouter-nodes-grid-section";
        this.VROUTER_SUMMARY_CHART_ID = 'vrouter-nodes-chart';
        this.VROUTER_SUMMARY_LIST_SECTION_ID =
            'vrouter-nodes-list-section';
        this.VROUTER_SUMMARY_SCATTERCHART_SECTION_ID =
            'vrouter-nodes-scatterchart-section';
        this.CACHE_VROUTER = 'cache-vrouter-nodes';
        this.VROUTER_TAB_SEARCH_PREFIX = 'Search';
        this.VROUTER_TAB_SECTION_ID = 'vrouter_tab_section';
        this.VROUTER_TAB_VIEW_ID = 'vrouter_tab_view';
        this.VROUTER_DETAILS_PAGE_ID = 'vrouter_details';
        this.VROUTER_DETAILS_SECTION_ID = 'vrouter_details_section';
        this.VROUTER_DETAILS_TABS_ID = 'vrouter_details_tab';
        this.VROUTER_DETAIL_ID = 'vrouter_detail_id;'
        this.VROUTER_DETAILS_AGENT_CHART_SECTION_ID =
            'vrouter_details_vrouter_agent_chart_section';
        this.VROUTER_DETAILS_AGENT_LINE_CHART_ID =
            'vrouter_details_agent_line_chart';
        this.VROUTER_DETAILS_SYSTEM_CHART_SECTION_ID =
            'vrouter_details_system_chart_section';
        this.VROUTER_DETAILS_SYSTEM_LINE_CHART_ID =
            'vrouter_details_system_line_chart';
        this.VROUTER_DETAILS_BANDWIDTH_CHART_SECTION_ID =
            'vrouter_details_bandwidth_chart_section';
        this.VROUTER_DETAILS_BANDWIDTH_LINE_CHART_ID =
            'vrouter_details_bandwidth_line_chart';
        this.VROUTER_DETAILS_AGENT_CHART_WIDGET =
            'vrouter_details_agent_chart_widget';
        this.VROUTER_DETAILS_SYSTEM_CHART_WIDGET =
            'vrouter_details_system_chart_widget';
        this.VROUTER_DETAILS_BANDWIDTH_CHART_WIDGET =
            'vrouter_details_bandwidth_chart_widget';

        // this.VROUTER_NETWORKS_GRID_SECTION_ID = 'vrouter_networks_grid_section_id';
        this.VROUTER_NETWORKS_GRID_VIEW_ID = 'vrouter_networks_id';
        this.VROUTER_NETWORKS_TITLE = "Networks";
        this.VROUTER_NETWORKS_RESULTS_VIEW = 'vrouter_networks_results_view';
        this.VROUTER_NETWORKS_RESULTS = 'vrouter_networks-results';
        this.VROUTER_NETWORKS_PREFIX = 'vrouter_networks';
        this.VROUTER_NETWORKS_GRID_ID = this.VROUTER_NETWORKS_PREFIX + '-results';
        this.VROUTER_NETWORKS_TAB_IDX = 2;

        // this.VROUTER_INTERFACES_GRID_SECTION_ID = 'vrouter_interfaces_grid_section_id';
        this.VROUTER_INTERFACES_GRID_VIEW_ID = 'vrouter_interfaces_id';
        this.VROUTER_INTERFACES_TITLE = "Interfaces";
        this.VROUTER_INTERFACES_RESULTS_VIEW = 'vrouter_interfaces_results_view';
        this.VROUTER_INTERFACES_RESULTS = 'vrouter_interfaces-results';
        this.VROUTER_INTERFACES_PREFIX = 'vrouter_interfaces';
        this.VROUTER_INTERFACES_GRID_ID = this.VROUTER_INTERFACES_PREFIX + '-results';
        this.VROUTER_INTERFACES_TAB_IDX = 1;

        this.VROUTER_ROUTES_PREFIX = 'vrouter_routes';

        // this.VROUTER_ROUTES_GRID_SECTION_ID = 'vrouter_routes_grid_section_id';
        this.VROUTER_ROUTES_TITLE = "Routes";
        this.VROUTER_ROUTES_RESULTS_VIEW = 'vrouter_routes_results_view';
        this.VROUTER_ROUTES_RESULTS = 'vrouter_routes-results';
        this.VROUTER_ROUTES_PREFIX = 'vrouter_routes';
        this.VROUTER_ROUTES_GRID_ID = this.VROUTER_ROUTES_PREFIX + '-results';
        this.VROUTER_ROUTES_TAB_IDX = 5;

        // this.VROUTER_ACL_GRID_SECTION_ID = 'vrouter_acl_grid_section_id';
        this.VROUTER_ACL_GRID_VIEW_ID = 'vrouter_acl_id';
        this.VROUTER_ACL_TITLE = "ACL";
        this.VROUTER_ACL_RESULTS_VIEW = 'vrouter_acl_results_view';
        this.VROUTER_ACL_RESULTS = 'vrouter_acl-results';
        this.VROUTER_ACL_PREFIX = 'vrouter_acl';
        this.VROUTER_ACL_GRID_ID = this.VROUTER_ACL_PREFIX + '-results';
        this.VROUTER_ACL_TAB_IDX = 3;

        // this.VROUTER_FLOWS_GRID_SECTION_ID = 'vrouter_flows_grid_section_id';
        this.VROUTER_FLOWS_GRID_VIEW_ID = 'vrouter_flows_id';
        this.VROUTER_FLOWS_TITLE = "Flows";
        this.VROUTER_FLOWS_RESULTS_VIEW = 'vrouter_flows_results_view';
        this.VROUTER_FLOWS_RESULTS = 'vrouter_flows-results';
        this.VROUTER_FLOWS_PREFIX = 'vrouter_flows';
        this.VROUTER_FLOWS_GRID_ID = this.VROUTER_FLOWS_PREFIX + '-results';
        this.VROUTER_FLOWS_TAB_IDX = 4;
        this.VROUTER_ACTIVE_FLOWS_DROP_STATS = "Active Flows";
        this.VROUTER_DROP_PACKETS = "Packet Drops";
        this.VROUTER_CPU_MEM_UTILIZATION = "CPU Memory Utilization";

        this.VROUTER_BANDWIDTH_PERCENTILE = "Bandwidth Percentiles";
        this.VROUTER_SYSTEM_CPU_PERCENTILES = "System CPU Percentiles";
        this.VROUTER_SYSTEM_MEMORY_PERCENTILES = "System Memory Percentiles";
        this.VROUTER_MIN_MAX_CPU_UTILIZATION = "Max Avg Min CPU Utilization";
        this.VROUTER_SYSTEM_CPU_MEMORY = "System CPU Memory Usage";
        this.VROUTER_VN_INTF_INST = "VNs / Interfaces / Instances";
        this.VROUTER_AGENT_CPU_PERCENTILES = "VRouter Agent CPU Share Percentiles";
        this.VROUTER_AGENT_MEMORY_PERCENTILES = "VRouter Agent Memory Usage Percentiles";
        this.VROUTER_ACTIVE_FLOWS_PERCENTILES = "Active Flows Percentiles";
        this.VROUTER_ACTIVE_FLOWS_DROPS_LABEL = "Sampled Active Flows / Drops";
        this.VROUTER_AGENT_CPU_PERCENTILES = "Agent CPU Percentiles";
        this.VROUTER_AGENT_MEMORY_PERCENTILES = "Agent Memory Percentiles";

        this.VROUTER_ALARMS_GRID_VIEW_ID = "vrouter_alarms_grid_view_id";
        this.VROUTER_ALARMS_GRID_SECTION_ID = "vrouter_alarms_grid_section_id";

        this.VROUTER_INSTANCE_GRID_ID = 'vrouter_instances_grid';

        this.VROUTER_CONSOLE_LOGS_VIEW_ID =
            'vrouter_console_logs_view';

        //Database node labels
        this.DATABASENODE_VIEWPATH_PREFIX =
            'monitor/infrastructure/databasenode/ui/js/views/';

        //Database node summary page labels
        this.DATABASENODE_SUMMARY_PAGE_ID =
            'monitor-database-nodes';
        this.DATABASENODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/dbnodes/summary';
        this.DATABASENODE_SUMMARY_TITLE = 'Database Nodes';
        this.DATABASENODE_SUMMARY_GRID_ID = 'database-nodes-grid';
        this.DATABASENODE_SUMMARY_SCATTERCHART_ID =
            'database-nodes-scatterchart';
        this.DATABASENODE_SUMMARY_GRID_SECTION_ID =
            "database-nodes-grid-section";
        this.DATABASENODE_SUMMARY_CHART_ID = 'database-nodes-chart';
        this.DATABASENODE_SUMMARY_LIST_SECTION_ID =
            'database-nodes-list-section';
        this.DATABASENODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'database-nodes-scatterchart-section';
        this.DATABASENODE_DETAILS_PAGE_ID =
            'database_nodes_details_pages';
        this.DATABASENODE_TAB_SECTION_ID =
            'database_node_tab_section';
        this.DATABASENODE_TAB_VIEW_ID = 'database_node_tab';
        this.DATABASENODE_DETAILS_SECTION_ID =
            'database_node_details_section';
        this.DATABASENODE_DETAILS_CHART_SECTION_ID =
            'database_details_chart_section';
        this.DATABASENODE_DETAILS_LINE_CHART_ID =
            'database_details_line_chart';
        this.DATABASENODE_DETAILS_CHART_WIDGET =
            'database_details_chart_widget';
        this.DATABASENODE_TABS_ID = 'database_node_tabs';
        this.DATABASENODE_ALARMS_GRID_VIEW_ID = "database_node_alarms_grid_view_id";
        this.DATABASE_NODE_ALARMS_GRID_SECTION_ID = "database_node_alarm_grid_section_id";

        this.CACHE_DATABASENODE = 'cache-database-nodes';

        this.DATABASENODE_CPU_SHARE_LINE_CHART_SEC_ID = 'database-nodes-cpu-line-chart-section';
        this.DATABASENODE_CPU_SHARE_LINE_CHART_ID = 'database-nodes-cpu-line-chart';
        this.DATABASENODE_MEM_SHARE_LINE_CHART_SEC_ID = 'database-nodes-mem-line-chart-section';
        this.DATABASENODE_MEM_SHARE_LINE_CHART_ID = 'database-nodes-mem-line-chart';
        this.DATABASENODE_DISK_SPACE_USAGE_CHART_SEC_ID = 'database-nodes-disk-sapce-chart-section';
        this.DATABASENODE_DISK_SPACE_USAGE_CHART_ID = 'database-nodes-disk-sapce-chart';
        this.DATABASENODE_COMPACTIONS_CHART_SEC_ID = 'database-nodes-compactions-chart-section';
        this.DATABASENODE_COMPACTIONS_CHART_ID = 'database-nodes-compactions-chart';
        this.DATABASENODE_PERCENTILE_SECTION_ID = "database-nodes-percentile-section-id";
        this.DATABASENODE_PERCENTILE_BAR_VIEW = "database-nodes-percentile-bar-view";
        this.DATABSE_NODE_MEMORY = "Cassandra Memory Usage";
        this.DATABSE_NODE_CPU_SHARE = "Cassandra CPU Share (%)";
        this.DATABSE_NODE_DISK_SPACE_USAGE = "Disk Space Usage";
        this.DATABSE_NODE_PENDING_COMPACTIONS = "Pending Compactions";
        this.DATABASE_NODE_CASSANDRA_CPU_SHARE = "Cassandra CPU Share (%)";
        this.DATABASE_NODE_ZOOKEEPER_CPU_SHARE = "Zookeeper CPU Share (%)";
        this.DATABASE_NODE_KAFKA_CPU_SHARE = "Kafka CPU Share (%)";
        //Monitor infra widget titles
        this.CONFIG_NODE_TOP_5_USER_AGENTS = 'Process Wise Requests';
        this.CONFIG_NODE_TOP_5_PROJECTS = 'Project Wise Requests';
        this.CONFIG_NODE_TOP_5_OBJECT = 'Object Wise Requests';
        this.CONFIG_NODE_TOP_REMOTE_IP = "Client Wise Requests";
        this.CONFIG_NODE_NODE_MANAGER_CPU_SHARE = 'Node Manager CPU Share (%)';
        this.CONFIG_NODE_SCHEMA_CPU_SHARE = 'Schema CPU Share (%)';
        this.CONFIGNODE_DISCOVERY_CPU_SHARE = 'Discovery CPU Share (%)';
        this.CONFIG_NODE_API_CPU_SHARE = 'Api CPU Share (%)';
        this.CONFIG_NODE_RESPONSE_PARAMS_PERCENTILE = 'Response Parameters Percentile';
        this.CONFIG_NODE_REQUESTS_SERVED = 'Requests Served';
        this.CONFIG_NODE_RESPONSE_TIME_VS_SIZE = 'Response Time vs Response Size';
        this.CONFIG_NODE_REQUESTS_READ_VS_WRITE = 'Reads vs Writes';

        this.ANALYTICS_NODE_NODE_MANAGER_CPU_SHARE = 'Node Manager CPU Share (%)';
        this.ANALYTICS_NODE_SNMP_COLLECTOR_CPU_SHARE = 'SNMP Collector CPU Share (%)';
        this.ANALYTICS_NODE_TOPOLOGY_CPU_SHARE = 'Topology CPU Share (%)';
        this.ANALYTICS_NODE_ALARM_GEN_CPU_SHARE = 'alarmgen CPU Share (%)';
        this.ANALYTICS_NODE_COLLECTOR_CPU_SHARE = 'Collector CPU Share (%)';
        this.ANALYTICS_NODE_QE_CPU_SHARE = 'Query Engine CPU Share (%)';
        this.ANALYTICS_NODE_API_CPU_SHARE = 'Analytics API CPU Share (%)';
        this.ANALYTICS_NODE_TOP_GENERATORS = 'Generators';
        this.ANALYTICS_NODE_TOP_MESSAGE_TYPES = 'Message Types';
        this.ANALYTICS_NODE_MESSAGE_PARAMS_PERCENTILE = 'Sandesh Messages Size & Count Percentile';
        this.ANALYTICS_NODE_SANDESH_MESSAGE_DISTRIBUTION='Sandesh Messages Distribution';
        this.ANALYTICS_NODE_QUERY_DISTRIBUTION='Queries Distribution';
        this.ANALYTICS_NODE_DB_USAGE = 'DB Usage';
        this.ANALYTICS_NODE_DB_READ_WRITE = 'DB Read Writes';
        this.ANALYTICS_NODE_GENERATORS = 'Generators';
        this.ANALYTICS_NODE_AVAILABLE_CONNECTIONS = 'Available DB Connections';
        //Analytics node labels
        this.ANALYTICSNODE_VIEWPATH_PREFIX =
            'monitor/infrastructure/analyticsnode/ui/js/views/';
        this.ANALYTICSNODE_SUMMARY_PAGE_ID =
            'monitor-analytics-nodes';
        this.ANALYTICSNODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/analyticsnodes/summary';
        this.ANALYTICSNODE_SUMMARY_TITLE = 'Analytics Nodes';
        this.ANALYTICSNODE_SUMMARY_GRID_ID = 'analytics-nodes-grid';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_ID =
            'analytics-nodes-scatterchart';
        this.ANALYTICSNODE_SUMMARY_GRID_SECTION_ID =
            "analytics-nodes-grid-section";
        this.ANALYTICSNODE_SUMMARY_CHART_ID =
            'analytics-nodes-chart';
        this.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID =
            'analytics-nodes-list-section';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'analytics-nodes-scatterchart-section';
        this.CACHE_ANALYTICSNODE = 'cache-analytics-nodes';
        this.ANALYTICSNODE_DETAILS_PAGE_ID =
            'analytics_nodes_details';
        this.ANALYTICSNODE_TAB_SECTION_ID =
            'analytics_nodes_tab_section';
        this.ANALYTICSNODE_TAB_VIEW_ID = 'analytics_nodes_tab_view';
        this.ANALYTICSNODE_TABS_ID = 'analytics_nodes_tab';
        this.ANALYTICSNODE_DETAILS_SECTION_ID =
            'analytics_nodes_detail_section';
        this.ANALYTICSNODE_DETAIL_PAGE_ID =
            'analytics_node_detail_page';
        this.ANALYTICSNODE_DETAILS_COLLECTOR_CHART_SECTION_ID =
            'analytics_node_details_vrouter_collector_chart_section'
        this.ANALYTICSNODE_DETAILS_COLLECTOR_LINE_CHART_ID =
            'analytics_node_details_collector_line_chart';
        this.ANALYTICSNODE_DETAILS_QE_CHART_SECTION_ID =
            'analytics_node_details_qe_chart_section';
        this.ANALYTICSNODE_DETAILS_QE_LINE_CHART_ID =
            'analytics_node_details_qe_line_chart';
        this.ANALYTICS_DETAILS_COLLECTOR_CHART_WIDGET =
            'analytics_node_details_collector_chart_widget';
        this.ANALYTICS_DETAILS_QE_CHART_WIDGET =
            'analytics_node_details_qe_chart_widget';
        this.ANALYTICS_DETAILS_ANALYTICS_CHART_WIDGET =
            'analytics_node_details_analytics_chart_widget';

        this.ANALYTICSNODE_GENERATORS_GRID_SECTION_ID = 'analytics_node_generators_grid_section';
        this.ANALYTICSNODE_GENERATORS_GRID_ID = 'analytics_node_generators_grid';
        this.ANALYTICSNODE_GENERATORS_TITLE = 'Generators';
        this.ANALYTICSNODE_QEQUERIES_GRID_ID = 'analytics_node_qequeries_grid';
        this.ANALYTICSNODE_QEQUERIES_TITLE = 'QE Queries';
        this.ANALYTICSNODE_CONSOLE_LOGS_VIEW_ID =
            'analytics_node_console_logs_view';
        this.ANALYTICSNODE_ALARMS_GRID_VIEW_ID = "analytics_node_alarms_grid_view_id";
        this.ANALYTICS_NODE_ALARMS_GRID_SECTION_ID = "analytics_node_alarms_grid_section_view_id";

        this.TMPL_CORE_GENERIC_EDIT = 'core-generic-edit-form-template';
        this.TMPL_CORE_GENERIC_DEL = 'core-generic-delete-form-template';

        this.CONFIG_LINK_LOCAL_SERVICES_PAGE_ID = 'config-link-local-services-page';
        this.CONFIG_LINK_LOCAL_SERVICES_LIST_VIEW_ID = 'config-link-local-services-list';
        this.CONFIG_LINK_LOCAL_SERVICES_SECTION_ID = 'lls';
        this.CONFIG_LINK_LOCAL_SERVICES_ID = 'config-link-local-services';
        this.TITLE_LINK_LOCAL_SERVICES = 'Link Local Services';
        this.LINK_LOCAL_SERVICES_GRID_ID = 'link-local-services-grid';
        this.LINK_LOCAL_SERVICES_PREFIX_ID = 'link_local_services';
        this.TITLE_CREATE_LLS = 'Create Link Local Service';
        this.TITLE_DEL_LLS = 'Delete Link Local Service';
        this.TITLE_EDIT_LLS = 'Edit Link Local Service';
        this.LINK_LOCAL_SERVICE_DETAILS = 'Link Local Service Details';

        this.EDIT = "Edit";
        this.CREATE = "Create";

        /* RBAC labels */
        this.TITLE_RBAC = 'API Access';
        this.TITLE_GLOBAL_RBAC = 'Global API Access';
        this.TITLE_DOMAIN_RBAC = 'Domain API Access';
        this.TITLE_PROJECT_RBAC = 'Project API Access';
        this.TITLE_CREATE_RBAC = 'Create API Access';
        this.TITLE_DEL_RBAC = 'Delete API Access';
        this.TITLE_RBAC_MULTI_DELETE =
            "Delete API Access";
        this.TITLE_EDIT_RBAC = 'Edit API Access';
        this.TITLE_INSERT_RBAC = 'Insert API Access';

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
        this.CREATE_CPE_ROUTER = "vCPE Router";
        this.CREATE_PHYSICAL_ROUTER = "Physical Router";
        this.PHYSICAL_ROUTER_ADD = "Add";
        this.PHYSICAL_ROUTER_PREFIX_ID = 'physical_router';
        this.SELECT_ENTER_TOR_AGENT_NAME = "Select or Enter TOR Agent Name";
        this.SELECT_ENTER_TSN_NAME = "Select or Enter TSN Name";
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
        this.TITLE_CPE_ROUTER = "Add vCPE Router";
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
        this.TITLE_PHYSICAL_ROUTER_DELETE = 'Delete Physical Router';
        this.TITLE_PHYSICAL_ROUTER_MULTI_DELETE = 'Delete Physical Router(s)';

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
        this.QUOTAS_PREFIX_ID = 'quotas';
        this.TITLE_EDIT_QUOTAS = 'Edit Project Quotas';

        /* Global Config */
        this.CONFIG_GLOBAL_CONFIG_PAGE_ID = 'config-global-config-page';
        this.TITLE_BGP_OPTIONS = "BGP Options";
        this.TITLE_EDIT_BGP_OPTIONS = "Edit BGP Options";

        this.TITLE_FORWARDING_OPTIONS = "Forwarding Options";
        this.TITLE_EDIT_FORWARDING_OPTIONS = "Edit Forwarding Options";

        this.TITLE_FLOW_AGING = "Flow Aging";
        this.TITLE_EDIT_FLOW_AGING = "Edit Flow Aging ";

        this.TITLE_MAC_LEARNING = "MAC Learning Options";
        this.TITLE_EDIT_MAC_LEARNING = "Edit MAC Learning Options";

        /* Security Group */
        this.CONFIG_SEC_GRP_PAGE_ID = 'config-sec—grppage';
        this.CONFIG_SEC_GRP_LIST_VIEW_ID = 'config-sec—grplist';
        this.CONFIG_SEC_GRP_SECTION_ID = 'secGrp';
        this.CONFIG_SEC_GRP_ID = 'config-sec-grp';
        this.TITLE_SEC_GRP = 'Security Groups';
        this.SEC_GRP_GRID_ID = 'sec—grp-grid';
        this.SEC_GRP_PREFIX_ID = 'security_group';
        this.TITLE_CREATE_SEC_GRP = 'Create Security Group';
        this.TITLE_DEL_SEC_GRP = 'Delete Security Group';
        this.TITLE_EDIT_SEC_GRP = 'Edit Security Group';
        this.SEC_GRP_DETAILS = 'Security Group Details';

        /* Service Instance */
        this.CONFIG_SERVICE_INSTANCES_PAGE_ID = 'config-service-instances-page';
        this.CONFIG_SERVICE_INSTANCES_LIST_VIEW_ID = 'config-service-instances-list';
        this.CONFIG_SERVICE_INSTANCES_SECTION_ID = 'svcInst';
        this.CONFIG_SERVICE_INSTANCES_ID = 'config-service-instances';
        this.TITLE_SERVICE_INSTANCES = 'Service Instances';
        this.SERVICE_INSTANCES_GRID_ID = 'service-instances-grid';
        this.SERVICE_INSTANCES_PREFIX_ID = 'service_instance';
        this.TITLE_CREATE_SERVICE_INSTANCE = 'Create Service Instance';
        this.TITLE_ADD_SERVICE_INSTANCE = 'Add Service Instance';
        this.TITLE_DEL_SERVICE_INSTANCES = 'Delete Service Instance';
        this.TITLE_EDIT_SERVICE_INSTANCE = 'Edit Service Instance';
        this.SVC_INST_DETAILS = 'Service Instance Details';

        //Interfaces
        this.CONFIG_INTERFACES_LIST_ID = "config-interfaces-list";
        this.PROUTER_BREADCRUMB_DROPDOWN = "prouter-breadcrumb-dropdown";
        this.PROUTER_KEY = "prouter";
        this.NO_PROUTER_FOUND = "No Physical Router found";
        this.CONFIG_INTERFACES_SECTION_ID = "config-interfaces-section";
        this.CONFIG_INTERFACES_ID = "config-interfaces";
        this.TITLE_INTERFACES = "Interfaces";
        this.INF_VIEW_PATH_PREFIX = "config/physicaldevices/interfaces/ui/js/views/";
        this.CONFIG_INTERFACES_LIST_VIEW_ID = "config-interfaces-list";
        this.INTERFACES_GRID_ID = "interfaces-grid";
        this.TITLE_ADD_INTERFACE = "Add Interface";
        this.INTERFACE_PREFIX_ID = "interface"
        this.LOGICAL_INF_ACCORDION = "logical_inf_accordion";
        this.LOGICAL_INF_SECTION = "logical_inf_section";
        this.LOGICAL_INF_SECTION_TITLE = "Logical Interface Properties";
        this.ENTER_SERVER = "Enter or Choose mac";
        this.TITLE_EDIT_INF = "Edit Interface";
        this.PHYSICAL_INF = "physical";
        this.LOGICAL_INF = "logical";
        this.LOGICAL_INF_L2_TYPE = 'l2';
        this.LOGICAL_INF_L3_TYPE = 'l3';
        this.VLAN = 'logical_interface_vlan_tag';
        this.LOGICAL_INF_TYPE = 'logical_interface_type';
        this.TITLE_DELETE_ALL_CONFIG = "Delete All";
        this.BM_CLEAR_VMI = "bm_clear_vmi";
        this.INF_PROPERTIES = 'Interface Properties';
        this.INF_ED_TMPL = 'BlockListTemplateGenerator';
        this.INF_TG = 'TextGenerator';
        this.IP_PH = 'Auto Allocate or Enter an IP';
        this.PARENT_TYPE_PROUTER = 'physical-router';
        this.PARENT_TYPE_PINF = 'physical-interface';
        this.TITLE_INTERFACE_DELETE = 'Delete Interface';
        this.TITLE_INTERFACE_MULTI_DELETE = 'Delete Interface(s)';

        //BGP Router labels
        this.CONFIG_BGP_LIST_ID = "config-bgp-list";
        this.BGP_GRID_ID = "bgp-grid";
        this.CONFIG_BGP_SECTION_ID = "config-bgp-section";
        this.CONFIG_BGP_LIST_VIEW_ID = "config-bgp-list-view";
        this.TITLE_BGP = "BGP Routers";
        this.BGP_PREFIX_ID = 'bgp_router';
        this.TITLE_BGP_DETAILS = 'Details';
        this.TITLE_BGP_PROPERTIES = 'BGP Properties';
        this.TITLE_ADD_BGP = 'Create BGP Router';
        this.TITLE_EDIT_BGP = 'Edit BGP Router';
        this.CONTROL_NODE_TYPE = 'control-node';
        this.EXTERNAL_CONTROL_NODE_TYPE = 'external-control-node';
        this.BGP_ROUTER_TYPE = 'router';
        this.TITLE_BGP_DELETE = 'Delete BGP Router';
        this.TITLE_BGP_MULTI_DELETE = 'Delete BGP Router(s)';

        //Logical Router Labels
        this.CONFIG_LOGICAL_ROUTER_PAGE_ID = "config-logical-router-page";
        this.CONFIG_LOGICAL_ROUTER_TITLE = "Routers";
        this.TITLE_ADD_LOGICAL_ROUTER = "Create Routers";
        this.CONFIG_LOGICAL_ROUTER_LIST_VIEW_ID = "config-logical-router-list-view";
        this.CONFIG_LOGICAL_ROUTER_FORMAT_ID = "config-logical-router-format-id";
        this.CONFIG_LOGICAL_ROUTER_LIST = "config-logical-router-list";
        this.LOGICAL_ROUTER_GRID_ID = "config-logical-router-grid-id";
        this.TITLE_LOGICAL_ROUTER_DETAILS = "Logical Router Detail";
        this.TITLE_LOGICAL_ROUTER_EDIT = "Edit";
        this.TITLE_LOGICAL_ROUTER_DELETE = "Delete";
        this.TITLE_DEL_CONFiRM = "Confirm";
        this.LOGICAL_ROUTER_PREFIX_ID = "logical_router";
        this.TITLE_EDIT_LOGICAL_ROUTER = "Edit Logical Router";
        this.ENTER_NAME = "Enter Name";
        this.SELECT_EXT_GATEWAY = "Select External Gateway";
        this.SELECT_CONN_NET = "Select Connected Network(s)";
        this.TITLE_LOGICAL_ROUTER = 'Logical Router';

        //Port Labels
        this.CONFIG_PORT_TITLE = "Ports";
        this.TITLE_ADD_PORT = "Create Port";
        this.TITLE_ADD_SUBINTERFACE = "Add SubInterface";
        this.TITLE_PORT_DETAILS = "Port Detail";
        this.TITLE_PORT_EDIT = "Edit";
        this.TITLE_PORT_DETETE = "Delete";
        this.TITLE_PORT_DETETE_ALL = "Delete All";
        this.TITLE_EDIT_PORT = "Edit Port";
        this.TITLE_PORT = 'Port';

        //Policy Labels
        this.CONFIG_POLICIES_PAGE_ID = "config-policies-page";
        this.CONFIG_POLICIES_TITLE = "Policies";
        this.GC_POLICIES_TITLE = "Network Policies";
        this.TITLE_POLICY_RULE = "Policy Rules";
        this.TITLE_ADD_POLICY = "Create Policy";
        this.CONFIG_POLICIES_LIST_VIEW_ID = "config-policies-list-view";
        this.CONFIG_POLICY_FORMAT_ID = "config-policies-format-id";
        this.CONFIG_POLICY_LIST = "config-policies-list";
        this.POLICIES_GRID_ID = "config-policies-grid-id";
        this.TITLE_POLICY_DETAILS = "Policy Detail";
        this.TITLE_POLICY_EDIT = "Edit Policy ";
        this.TITLE_POLICY_DETETE = "Delete";
        this.TITLE_REMOVE = "Remove";
        this.POLICY_PREFIX_ID = "policy";
        this.TITLE_EDIT_POLICY = "Edit Policy";
        this.TITLE_POLICY = 'Policy';
        this.TXT_POLICY = 'policy';
        this.POLICY_NAME = 'Policy Name';

        /* Routing Policy */
        this.CONFIG_ROUTING_POLICY_PAGE_ID = 'config-routing—policypage';
        this.CONFIG_ROUTING_POLICY_LIST_VIEW_ID = 'config-sec—grplist';
        this.ROUTING_POLICY_GRID_ID = 'routing—policy-grid';
        this.CONFIG_ROUTING_POLICY_TITLE = "Routing Policies";
        this.CONFIG_ROUTING_POLICY_FORMAT_ID = "config-routing-policies-format-id";
        this.TITLE_ROUTING_POLICY_EDIT = "Edit Routing Policy ";
        this.TITLE_ROUTING_POLICY_DETAILS = "Routing Policy Detail";
        this.TITLE_ROUTING_ADD_POLICY = "Create Routing Policy";
        this.ROUTING_POLICY_PREFIX_ID = "routingPolicy";
        this.TXT_ROUTING_POLICY = 'routing policy';
        this.TITLE_REMOVE_GRID = "Remove Routing Policy";

        /* DNS Server labels */
        this.TITLE_DNS_SERVER = 'DNS Servers';
        this.TITLE_CREATE_DNS_SERVER = 'Create DNS Server';
        this.TITLE_DEL_DNS_SERVER = 'Delete DNS Server';
        this.TITLE_DNS_SERVER_MULTI_DELETE = "Delete DNS Server(s)";
        this.TITLE_EDIT_DNS_SERVER = 'Edit DNS Server';

        /* DNS Record labels */
        this.TITLE_DNS_RECORDS = 'DNS Records';
        this.TITLE_CREATE_DNS_RECORD = 'Create DNS Record';
        this.TITLE_DEL_DNS_RECORD = 'Delete DNS Record';
        this.TITLE_DNS_RECORD_MULTI_DELETE = "Delete DNS Record(s)";
        this.TITLE_EDIT_DNS_RECORD = 'Edit DNS Record';

        /* User defined counters labels */
        this.TITLE_USER_DEFINED_COUNTERS = "Log Statistic"
        this.TITLE_CREATE_USER_DEFINDED_COUNTER = 'Create Log Statistic';
        this.TITLE_DEL_USER_DEFINDED_COUNTER = 'Delete Log Statistic';
        this.TITLE_DEL_USER_DEFINDED_COUNTERS = 'Delete Log Statistic';
        this.TITLE_EDIT_USER_DEFINDED_COUNTER = 'Edit Log Statistic';
        this.COUNTERS_MUTI_SELECT_DELETE = 'countersMultiSelectDelete';

        /* RBAC labels */
        this.TITLE_RBAC = 'API Access';
        this.TITLE_CREATE_RBAC = 'Create API Access';
        this.TITLE_DEL_RBAC = 'Delete API Access';
        this.TITLE_RBAC_MULTI_DELETE =
            "Delete API Access";
        this.TITLE_EDIT_RBAC = 'Edit API Access';
        this.TITLE_INSERT_RBAC = 'Insert API Access';

        this.EDIT = "Edit";
        this.CREATE = "Create";

        /* Config Alarm labels */
        this.TITLE_ALARM_RULE = 'Alarm Rules';
        this.TITLE_EDIT_ALARM_RULE = 'Edit Alarm Rule';
        this.TITLE_ALARM_RULE_MULTI_DELETE = "Delete Alarm Rules";
        this.TITLE_ALARM_RULE_DELETE = "Delete Alarm Rule";
        this.TITLE_CREATE_ALARM_RULE = 'Create Alarm Rule';
        this.TXT_CONFIG_ALARM_RULE = 'rule';
        this.CONFIG_ALARM_TEXT_MAP = {
             0: 'Critical',
             1: 'Major',
             2: 'Minor'
        };

        //Config DB Labels - Start
        this.CDB_FQ_TABLE_NAMES_GRID_ID = "cdb-fq-table-names-grid";
        this.CDB_TITLE_FQ_TABLE_NAMES = "FQ Names Table Keys";

        this.CDB_FQ_KEY_TABLE_NAMES_SECTION_ID = "cdb-fq-key-table-names-section";
        this.CDB_FQ_TABLE_NAMES_SECTION_ID = "cdb-fq-table-names-section";
        this.CDB_UUID_TABLE_NAMES_SECTION_ID = "cdb-uuid-table-names-section";
        this.CDB_UUID_KEY_TABLE_NAMES_SECTION_ID = "cdb-uuid-key-table-names-section";
        this.CDB_SHARED_TABLE_NAMES_SECTION_ID = "cdb-shared-table-names-section";
        this.CDB_SHARED_KEY_TABLE_NAMES_SECTION_ID = "cdb-shared-key-table-names-section";

        this.CDB_FQ_KEY_TABLE_NAMES_GRID_ID = "cdb-fq-key-table-names-grid";
        this.CDB_TITLE_FQ_KEY_TABLE_NAMES = "Key Values";

        this.CDB_UUID_TABLE_GRID_ID = "cdb-uuid-table-grid";
        this.CDB_TITLE_UUID_KEY_TABLE = "UUID Table Keys";
        this.CDB_UUID_KEY_TABLE_GRID_ID = "cdb-uuid-key-table-grid";
        this.CDB_TITLE_UUID_KEY_TABLE_NAMES = "UUID Key Values";

        this.CDB_SHARED_TABLE_GRID_ID = "cdb-shared-table-grid";
        this.CDB_TITLE_SHARED_KEY_TABLE = "Shared Table Keys";
        this.CDB_SHARED_KEY_TABLE_GRID_ID = "cdb-shared-key-table-grid";
        this.CDB_TITLE_SHARED_KEY_TABLE_NAMES = "Shared Key Values";

        this.CDB_TITLE_FQ_TABLE = "FQ Name Table";
        this.CDB_TITLE_UUID_TABLE = "UUID Name Table";
        this.CDB_TITLE_SHARED_TABLE = "Shared Name Table";
        this.CDB_TITLE_DELETE_RECORD = "Delete Record";
        this.CDB_TMPL_DELETE_RECORD = "cdb-delete-template";
        this.CDB_DELETE_MODAL_ID_ = "delete-cdb";

        this.CDB_LABEL_KEY_VALUES = "keyvalues";
        this.CDB_LABEL_KEY = "keys";
        //Config DB Labels - End

        /*
         * Settings/Introspect
         */

        this.TITLE_INTROSPECT = "Introspect";

        /* Service Appliance */
        this.TITLE_SVC_APPLIANCE = 'Service Appliance';
        this.CONFIG_SVC_APPLIANCE_PAGE_ID = 'config-svc-appliance-page';
        this.CONFIG_SVC_APPLIANCE_SECTION_ID = 'config-svc-appliance-section';
        this.CONFIG_SVC_APPLIANCE_ID = 'config-svc-appliance';
        this.SVC_APPLIANCE_GRID_ID = 'svc-appliance-grid';
        this.SVC_APPLIANCE_PREFIX_ID = 'svcAppliance';
        this.TITLE_EDIT_SVC_APPLIANCE = 'Edit Service Appliance';
        this.TITLE_DEL_SVC_APPLIANCE = 'Delete Service Appliance';
        this.TITLE_CREATE_SVC_APPLIANCE = 'Create Service Appliance';
        this.SVC_APPLIANCE_DETAILS = 'Service Appliance Details';

        /* Service Appliance Set */
        this.TITLE_SVC_APPLIANCE_SET = 'Service Appliance Set';
        this.CONFIG_SVC_APPLIANCE_SET_PAGE_ID = 'config-svc-appliance-set-page';
        this.CONFIG_SVC_APPLIANCE_SET_SECTION_ID = 'config-svc-appliance-set-section';
        this.CONFIG_SVC_APPLIANCE_SET_ID = 'config-svc-appliance-set';
        this.SVC_APPLIANCE_SET_GRID_ID = 'svc-appliance-set-grid';
        this.SVC_APPLIANCE_SET_PREFIX_ID = 'svcApplianceSet';
        this.TITLE_EDIT_SVC_APPLIANCE_SET = 'Edit Service Appliance Set';
        this.TITLE_DEL_SVC_APPLIANCE_SET = 'Delete Service Appliance Set';
        this.TITLE_CREATE_SVC_APPLIANCE_SET = 'Create Service Appliance Set';
        this.SVC_APPLIANCE_SET_DETAILS = 'Service Appliance Set Details';

        /* Route Table */
        this.RT_TABLE_TAB_ID = 'rt-table-tab';
        this.CONFIG_RT_TABLE_PAGE_ID = 'config-rttable—page';
        this.CONFIG_RT_TABLE_LIST_VIEW_ID = 'config-rttable-list';
        this.CONFIG_INF_RT_TABLE_LIST_VIEW_ID = 'config-inf-rttable-list';
        this.CONFIG_RT_TABLE_SECTION_ID = 'rtTable';
        this.CONFIG_RT_TABLE_ID = 'config-rt-table';
        this.NETWORK_ROUTE_TABLE_ID = 'network-rt-table';
        this.INTERFACE_ROUTE_TABLE_ID = 'interface-rt-table';
        this.TITLE_RT_TABLE = 'Route Tables';
        this.RT_TABLE_GRID_ID = 'rt-table-grid';
        this.INF_RT_TABLE_GRID_ID = 'inf_rt-table-grid';
        this.RT_TABLE_PREFIX_ID = 'route_table';
        this.TITLE_CREATE_RT_TABLE = 'Create Network Route Table';
        this.TITLE_DEL_RT_TABLE = 'Delete Network Route Table';
        this.TITLE_MULTI_DEL_RT_TABLE = 'Delete Network Route Table(s)';
        this.TITLE_CREATE_INF_RT_TABLE = 'Create Interface Route Table';
        this.TITLE_DEL_INF_RT_TABLE = 'Delete Interface Route Table';
        this.TITLE_MULTI_DEL_INF_RT_TABLE = 'Delete Interface Route Table(s)';
        this.TITLE_EDIT_RT_TABLE = 'Edit Route Table';
        this.RT_TABLE_DETAILS = 'Route Table Details';
        this.RT_GRID_TITLE = 'Network Route Tables';
        this.INF_RT_GRID_TITLE = 'Interface Route Tables';
 
        /* BGP as a Service */
        this.TITLE_BGP_AS_A_SERVICE = 'BGP as a Service';
        this.TITLE_EDIT_BGP_AS_A_SERVICE = 'Edit BGP as a Service';
        this.TITLE_BGP_AS_A_SERVICE_DELETE = 'Delete BGP as a Service';
        this.TITLE_BGP_AS_A_SERVICE_MULTI_DELETE = 'Delete BGP as a Service(s)';
        this.TITLE_ADD_BGP_AS_A_SERVICE = 'Create BGP as a Service';

        // VN Config labels
        this.CFG_VN_PAGE_ID = 'config-vn-page';
        this.CFG_VN_LIST_ID = 'config-vn-list';
        this.CFG_VN_LIST_VIEW_ID = 'config-vn-list-view';
        this.CFG_VN_GRID_ID = 'config-vn-grid';
        this.CFG_VN_PREFIX_ID = 'network';
        this.CFG_VN_TITLE = 'Networks';
        this.CFG_VN_TITLE_SUMMARY = 'Network Summary';
        this.CFG_VN_TITLE_DETAILS = 'Details';
        this.CFG_VN_TITLE_EDIT = 'Edit Network';
        this.CFG_VN_TITLE_CREATE = 'Create Network';
        this.CFG_VN_TITLE_DELETE = 'Delete Network';
        this.CFG_VN_TITLE_MULTI_DELETE = 'Delete Network(s)';
        // End VN Config labels

        /* Route Aggregate Labels */
        this.TITLE_ROUTE_AGGREGATE = 'Route Aggregates';
        this.TITLE_EDIT_ROUTE_AGGREGATE = 'Edit Route Aggregate';
        this.TITLE_ROUTE_AGGREGATE_DELETE = 'Delete Route Aggregate';
        this.TITLE_ROUTE_AGGREGATE_MULTI_DELETE = 'Delete Route Aggregate(s)';
        this.TITLE_ADD_ROUTE_AGGREGATE = 'Create Route Aggregate';

        /* Analytics Node Config Labels */
        this.TITLE_ANALYTICS_NODE = 'Analytics Nodes';
        this.TITLE_EDIT_ANALYTICS_NODE = 'Edit Analytics Node';
        this.TITLE_ANALYTICS_NODE_DELETE = 'Delete Analytics Node';
        this.TITLE_ANALYTICS_NODE_MULTI_DELETE = 'Delete Analytics Node(s)';
        this.TITLE_ADD_ANALYTICS_NODE = 'Create Analytics Node';
        this.TITLE_ANALYTICS_NODE_DETAILS = 'Analytics Node Details';

        /* Config Node Cfg Labels */
        this.TITLE_CONFIG_NODE = 'Config Nodes';
        this.TITLE_EDIT_CONFIG_NODE = 'Edit Config Node';
        this.TITLE_CONFIG_NODE_DELETE = 'Delete Config Node';
        this.TITLE_CONFIG_NODE_MULTI_DELETE = 'Delete Config Node(s)';
        this.TITLE_ADD_CONFIG_NODE = 'Create Config Node';
        this.TITLE_CONFIG_NODE_DETAILS = 'Config Node Details';

        /* Database Node Config Labels */
        this.TITLE_DATABASE_NODE = 'Database Nodes';
        this.TITLE_EDIT_DATABASE_NODE = 'Edit Database Node';
        this.TITLE_DATABASE_NODE_DELETE = 'Delete Database Node';
        this.TITLE_DATABASE_NODE_MULTI_DELETE = 'Delete Database Node(s)';
        this.TITLE_ADD_DATABASE_NODE = 'Create Database Node';
        this.TITLE_DATABASE_NODE_DETAILS = 'Database Node Details';

        /* QOS labels */
        this.TITLE_QOS = 'QoS';
        this.TITLE_CREATE_QOS = 'Create QoS';
        this.TITLE_GLOBAL_CREATE_VHOST_QOS = 'Create vHost QoS';
        this.TITLE_GLOBAL_CREATE_PHYSICAL_QOS = 'Create Fabric QoS';
        this.TITLE_DEL_QOS = 'Delete QoS';
        this.TITLE_QOS_MULTI_DELETE =
            'Delete QoS';
        this.TITLE_EDIT_QOS = 'Edit QoS';

        /* Forwarding Class labels */
        this.TITLE_FORWARDING_CLASS = 'Forwarding Classes';
        this.TITLE_CREATE_FORWARDING_CLASS = 'Create Forwarding Class';
        this.TITLE_DEL_FORWARDING_CLASS = 'Delete Forwarding Class';
        this.TITLE_FORWARDING_CLASS_MULTI_DELETE =
            "Delete Forwarding Classes";
        this.TITLE_EDIT_FORWARDING_CLASS = 'Edit Forwarding Class';

        // Health Check Config labels
        this.CFG_SVC_HEALTH_CHK_PAGE_ID = 'config-svc-health-chk-page';
        this.CFG_SVC_HEALTH_CHK_LIST_ID = 'config-svc-health-chk-list';
        this.CFG_SVC_HEALTH_CHK_LIST_VIEW_ID = 'config-svc-health-chk-list-view';
        this.CFG_SVC_HEALTH_CHK_GRID_ID = 'config-svc-health-chk-grid';
        this.CFG_SVC_HEALTH_CHK_PREFIX_ID = 'HealthCheckServices';
        this.CFG_SVC_HEALTH_CHK_TITLE = 'Health Check Services';
        this.CFG_SVC_HEALTH_CHK_TITLE_SUMMARY = 'Health Check Summary';
        this.CFG_SVC_HEALTH_CHK_TITLE_DETAILS = 'Details';
        this.CFG_SVC_HEALTH_CHK_TITLE_EDIT = 'Edit Health Check Service';
        this.CFG_SVC_HEALTH_CHK_TITLE_CREATE = 'Create Health Check Service';
        this.CFG_SVC_HEALTH_CHK_TITLE_DELETE = 'Delete Health Check Service';
        this.CFG_SVC_HEALTH_CHK_TITLE_MULTI_DELETE = 'Delete Health Check Service(s)';

        /* Packet Capture Labels */
        this.TITLE_PACKET_CAPTURE = 'Analyzers';
        this.TITLE_EDIT_PACKET_CAPTURE = 'Edit Analyzer';
        this.TITLE_PACKET_CAPTURE_DELETE = 'Delete Analyzer';
        this.TITLE_PACKET_CAPTURE_MULTI_DELETE = 'Delete Analyzer(s)';
        this.TITLE_ADD_PACKET_CAPTURE = 'Create Analyzer';
        this.ERROR_LABEL_PACKET_CAPTURE = 'Analyzer';
    };
    return CTLabels;
});
