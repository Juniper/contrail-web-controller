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

            label = label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
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
            pRouterName : "Name",
            snmpLocalPort : "Local Port",
            snmpRetries : "Retries",
            snmpTimeout : "Timeout(secs)",
            snmpV2Community : "Community",
            snmpVersion : "SNMP Version",
            expDetSnmpVersion : "SNMP Version",
            snmpV3SecurityName : "Security Name",
            snmpV3SecurityLevel : "Security Level",
            snmpv3AuthProtocol : "Authentication Protocol",
            snmpv3AuthPasswd : "Password",
            snmpv3PrivProtocol : "Privacy Protocol",
            snmpv3PrivPasswd : "Password",
            snmpV3SecurityEngineId : "Security Engine Id",
            snmpv3Context : "Context",
            snmpv3ContextEngineId : "Context Engine Id",
            snmpv3EngineId : "Engine Id",
            snmpv3EngineBoots : "Engine Boots",
            snmpv3EngineTime : "Engine Time",
            displayVirtualRouters : "Associated Virtual Router(s)",
            totalInterfacesCount : "Interfaces",
            isJunosPortEnabled : "Junos Service Ports",
            netConfUserName : "Netconf Username",
            netConfPasswd : "Password",
            bgpGateWay : "BGP Gateway",
            vns : "Virtual Networks",
            virtualRouterType : 'Type',
            netconfManaged : 'Netconf Managed'
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
        this.PROJECT_INSTANCE_GRID_ID = "project-instance-grid";
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

        this.TITLE_FLOWS= "Flows";
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

        //Config node summary page labels
        this.CONFIGNODE_SUMMARY_PAGE_ID = 'monitor-config-nodes';
        this.CONFIGNODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/confignodes/summary';
        this.CONFIGNODE_SUMMARY_TITLE = 'Config Nodes';
        this.CONFIGNODE_SUMMARY_GRID_ID = 'config-nodes-grid';
        this.CONFIGNODE_SUMMARY_SCATTERCHART_ID = 'config-nodes-scatterchart';
        this.CONFIGNODE_SUMMARY_GRID_SECTION_ID = "config-nodes-grid-section";
        this.CONFIGNODE_SUMMARY_CHART_ID = 'config-nodes-chart';
        this.CONFIGNODE_SUMMARY_LIST_SECTION_ID = 'config-nodes-list-section';
        this.CONFIGNODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'config-nodes-scatterchart-section';
        this.CACHE_CONFIGNODE = 'cache-config-nodes';

        //Control node summary page labels
        this.CONTROLNODE_SUMMARY_PAGE_ID = 'monitor-control-nodes';
        this.CONTROLNODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/controlnodes/summary';
        this.CONTROLNODE_SUMMARY_TITLE = 'Control Nodes';
        this.CONTROLNODE_SUMMARY_GRID_ID = 'control-nodes-grid';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_ID = 'control-nodes-scatterchart';
        this.CONTROLNODE_SUMMARY_GRID_SECTION_ID = "control-nodes-grid-section";
        this.CONTROLNODE_SUMMARY_CHART_ID = 'control-nodes-chart';
        this.CONTROLNODE_SUMMARY_LIST_SECTION_ID = 'control-nodes-list-section';
        this.CONTROLNODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'control-nodes-scatterchart-section';
        this.CACHE_CONTROLNODE = 'cache-control-nodes';

        //Database node summary page labels
        this.DATABASENODE_SUMMARY_PAGE_ID = 'monitor-database-nodes';
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
        this.CACHE_DATABASENODE = 'cache-database-nodes';

        //Analytics node summary page labels
        this.ANALYTICSNODE_SUMMARY_PAGE_ID = 'monitor-analytics-nodes';
        this.ANALYTICSNODE_SUMMARY_URL =
            '/api/admin/monitor/infrastructure/analyticsnodes/summary';
        this.ANALYTICSNODE_SUMMARY_TITLE = 'Analytics Nodes';
        this.ANALYTICSNODE_SUMMARY_GRID_ID = 'analytics-nodes-grid';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_ID =
            'analytics-nodes-scatterchart';
        this.ANALYTICSNODE_SUMMARY_GRID_SECTION_ID =
            "analytics-nodes-grid-section";
        this.ANALYTICSNODE_SUMMARY_CHART_ID = 'analytics-nodes-chart';
        this.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID =
            'analytics-nodes-list-section';
        this.ANALYTICSNODE_SUMMARY_SCATTERCHART_SECTION_ID =
            'analytics-nodes-scatterchart-section';
        this.CACHE_ANALYTICSNODE = 'cache-analytics-nodes';

        this.TMPL_CORE_GENERIC_EDIT = 'core-generic-edit-form-template';
        this.TMPL_CORE_GENERIC_DEL = 'core-generic-delete-form-template';

        this.CONFIG_LINK_LOCAL_SERVICES_PAGE_ID =
            'config-link-local-services-page';
        this.CONFIG_LINK_LOCAL_SERVICES_LIST_VIEW_ID =
            'config-link-local-services-list';
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
        this.CONFIG_PHYSICAL_ROUTERS_SECTION_ID =
            "config-physical-routers-section";
        this.CONFIG_PHYSICAL_ROUTERS_ID = "config-physical-routers";
        this.TITLE_PHYSICAL_ROUTERS = "Physical Routers";
        this.CONFIG_PHYSICAL_ROUTERS_LIST_VIEW_ID =
            "config-physical-routers-list-view";
        this.PHYSICAL_ROUTERS_GRID_ID = "physical-routers-grid";
        this.TITLE_ADD_PHYSICAL_ROUTER = "Add Physical Router";
        this.CREATE_OVSDB_MANAGED_TOR = "OVSDB Managed ToR";
        this.TITLE_OVSDB_MANAGED_TOR = "Add OVSDB Managed ToR";
        this.CREATE_NETCONF_MANAGED_PHYSICAL_ROUTER =
             "Netconf Managed Physical Router";
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
        this.TITLE_EDIT_NETCONF_MANAGED_PR =
            'Edit Netconf Managed Physical Router';
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
    };
    return CTLabels;
});
