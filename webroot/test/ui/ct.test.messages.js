/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var TMessages = function() {
        this.NM_UNIT_TEST_MODULE = 'Network Monitoring Unit Tests -';
        this.CT_UNIT_TEST_MODULE = 'Controller Unit Tests -';

        this.NETWORKS_LIST_VIEW_COMMON_TEST_MODULE = 'Neworks List view - Common Tests';
        this.NETWORKS_GRID_VIEW_TEST_MODULE = 'Networks grid view test module';
        this.NETWORKS_VIEW_COMMON_TEST_MODULE = 'Neworks View - Common Tests';
        this.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE = 'Projects List view - Common Tests';
        this.PROJECTS_VIEW_COMMON_TEST_MODULE = 'Projects view - Common Tests';
        this.INSTANCES_LIST_VIEW_COMMON_TEST_MODULE = 'Instances List view - Common Tests';
        this.INSTANCE_VIEW_COMMON_TEST_MODULE = 'Instance view - Common Tests';

        this.INTERFACES_LIST_VIEW_COMMON_TEST_MODULE = 'Interfaces List view - Common Tests';

        this.FLOW_LIST_VIEW_COMMON_TEST_MODULE = 'Flow List view - Common Tests';
        this.FLOW_GRID_VIEW_COMMON_TEST_MODULE = 'Flow Grid view - Common Tests';

        this.NETWORKS_GRID_MODULE = 'Networks Grid -  NM Tests';
        this.PROJECTS_GRID_MODULE = 'Projects Grid -  NM Tests';
        this.INSTANCES_GRID_MODULE = 'Instances Grid -  NM Tests';

        this.NETWORK_LIST_VIEW_CUSTOM_TEST = 'Networks List view - Custom Tests';
        this.PROJECT_LIST_VIEW_CUSTOM_TEST = 'Project List view - Custom Tests';
        this.INSTANCE_LIST_VIEW_CUSTOM_TEST = 'Instance List view - Custom Tests';

        this.NETWORKS_GRID_COLUMN_VALUE_CHECK = "Network grid check for a particular column value equality";

        this.PHYSICAL_ROUTERS_GRID_VIEW_COMMON_TEST_MODULE = 'Physical Routers Grid View - Common Tests';
        this.PHYSICAL_INTERFACES_GRID_VIEW_COMMON_TEST_MODULE = 'Physical Interfaces Grid View - Common Tests';
        this.BGP_GRID_VIEW_COMMON_TEST_MODULE = 'BGP Routers Grid View - Common Tests';
        this.DNS_SERVERS_GRID_VIEW_TEST_MODULE = 'DNS Servers Grid View - Common Tests';
        this.DNS_RECORDS_GRID_VIEW_TEST_MODULE = 'DNS Records Grid View - Common Tests';
        this.ACTIVE_DNS_GRID_VIEW_TEST_MODULE = 'Active DNS Grid View - Common Tests';
        this.BGP_AS_A_SERVICE_GRID_VIEW_COMMON_TEST_MODULE = 'BGP as a Service Grid View - Common Tests';
        this.ROUTE_AGGREGATE_GRID_VIEW_COMMON_TEST_MODULE = 'Route Aggregate Grid View - Common Tests';
        this.PORT_GRID_VIEW_COMMON_TEST_MODULE = 'Port Grid View - Common Tests';
        this.VN_GRID_VIEW_COMMON_TEST_MODULE = 'Virtual Networks Grid View - Common Tests';
        this.SEC_GRP_GRID_VIEW_COMMON_TEST_MODULE = 'Security Group Grid View - Common Tests';
        this.POLICY_GRID_VIEW_COMMON_TEST_MODULE = 'Policy Grid View - Common Tests';
        this.SLO_GRID_VIEW_COMMON_TEST_MODULE = 'SLO Grid View - Common Tests';
        this.GLOBAL_SLO_GRID_VIEW_COMMON_TEST_MODULE = 'Gloabl SLO Grid View - Common Tests';
        this.QOS_GRID_VIEW_COMMON_TEST_MODULE = 'QOS Grid View - Common Tests';
        this.GLOBAL_QOS_GRID_VIEW_COMMON_TEST_MODULE = 'Gloabl QOS Grid View - Common Tests';
        this.SVC_TEMP_GRID_VIEW_COMMON_TEST_MODULE = 'Service Template Grid View - Common Tests';
        this.INSTANCE_TEMP_GRID_VIEW_COMMON_TEST_MODULE = 'Instances Grid View - Common Tests';
        this.SVC_HEALTH_CHECK_GRID_VIEW_COMMON_TEST_MODULE = 'Health Check Grid View - Common Tests';
        this.IPAM_GRID_VIEW_COMMON_TEST_MODULE = 'IPAM Grid View - Common Tests';
        this.FLOATING_IPS_GRID_VIEW_COMMON_TEST_MODULE = 'Floating IPs Grid View - Common Tests';
        this.ROUTERS_GRID_VIEW_COMMON_TEST_MODULE = 'Routers Grid View - Common Tests';
        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };
    };
    return new TMessages();
});