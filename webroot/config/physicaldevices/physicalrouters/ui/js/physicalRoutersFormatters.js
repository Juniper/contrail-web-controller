/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var pRoutersFormatters = function() {
        var self = this;

        /*
         * @managementIPFormatter
         */
        self.managementIPFormatter = function(r, c, v, cd, dc) {
            return dc['physical_router_management_ip'] ?
                dc['physical_router_management_ip'] : '-';
        };

        /*
         * @dataplaneIPFormatter
         */
        self.dataplaneIPFormatter = function(r, c, v, cd, dc) {
            return dc['physical_router_dataplane_ip'] ?
                dc['physical_router_dataplane_ip'] : '-';
        };

       /*
         * @loopbackIPFormatter
         */
        self.loopbackIPFormatter = function(r, c, v, cd, dc) {
            return dc['physical_router_loopback_ip'] ?
                dc['physical_router_loopback_ip'] : '-';
        };

        /*
         * @infCntFormatter
         */
        self.infCntFormatter = function(r, c, v, cd, dc) {
            return dc['totalIntfCount'] ?
                dc['totalIntfCount'] : 'None';
        };

        /*
         * @virtualRoutersFormatter
         */
        self.virtualRoutersFormatter = function(r, c, v, cd, dc) {
            var virtualRouterString = '-';
            if(dc['virtual_router_refs'].length > 0){
                var virtualRouterRefs = dc['virtual_router_refs'];
                $.each(virtualRouterRefs, function(i, vrouter){
                    var vrString = vrouter.name;
                    var vrType = vrouter.virtual_router_type;
                    if(vrType.indexOf('tor-service-node') >= 0){
                          vrString += ' (ToR Service Node)';
                    }
                    if(vrType.indexOf('tor-agent') >= 0){
                        vrString += ' (ToR Agent)';
                    }
                    if(vrType.indexOf('embedded') >= 0){
                        vrString += ' (Embedded)';
                    }
                    if(i != 0) {
                        virtualRouterString =
                            virtualRouterString + ', ' + vrString;
                    }
                    else {
                        virtualRouterString = vrString;
                    }
                });
            }
            return virtualRouterString;
        };

        /*
         * @bgpRoutersFormatter
         */
        self.bgpRoutersFormatter = function(r, c, v, cd, dc) {
            var bgpRoutersString  = '-';
            if(dc['bgp_router_refs'].length > 0){
                var bgpRouterRefs  = dc['bgp_router_refs'];
                $.each(bgpRouterRefs, function(i,d){
                    if(i != 0) {
                        bgpRoutersString  =
                            bgpRoutersString + ', ' + d.to[4];
                    }
                    else {
                        bgpRoutersString = d.to[4];
                    }
                });
            }
            return bgpRoutersString ;
        };

        /*
         * @virtualNetworksFormatter
         */
        self.virtualNetworksFormatter = function(r, c, v, cd, dc) {
            var virtualNetworks  = "";
            if(dc['virtual_network_refs'].length > 0){
                var vnRefs  = dc['virtual_network_refs'];
                $.each(vnRefs, function(i,d){
                    d = d.to[2] + ' (' + d.to[0] + ':' + d.to[1] + ')';
                    if(i === 0) {
                        virtualNetworks = d;
                    } else {
                        virtualNetworks += "<br>" + d;
                    }
                });
            } else {
                virtualNetworks = '-';
            }
            return virtualNetworks;
        };

        /*
         * @netConfUserNameFormatter
         */
        self.netConfUserNameFormatter = function(r, c, v, cd, dc) {
            var userName = '-';
            var credentials = dc['physical_router_user_credentials']
            if(credentials['username'] != null &&
                credentials['username'].trim() != '') {
                userName = credentials['username'];
            }
            return userName;
        };

        /*
         * @physicalRouterRoleFormatter
         */
        self.physicalRouterRoleFormatter = function(r, c, v, cd, dc) {
            var role = getValueByJsonPath(dc, 'physical_router_role', null);
            if(role) {
                role = role === 'spine' ? 'Spine' : 'Leaf';
            } else {
                role = '-';
            }
            return role;
        };

        /*
         * @autoConfigFormatter
         */
        self.autoConfigFormatter = function(r, c, v, cd, dc) {
            var autoConfig = '-';
            if(dc['physical_router_vnc_managed'] != null) {
                autoConfig =
                    dc['physical_router_vnc_managed'] ?  'Enabled' : 'Disabled';
            }
            return autoConfig;
        };

        /*
         * @servicePortsFormatter
         */
        self.servicePortsFormatter = function(r, c, v, cd, dc) {
            var servicePorts = [];
            var ports = dc['physical_router_junos_service_ports']
            if(ports['service_port'] != null &&
                ports['service_port'].length > 0) {
                servicePorts = ports['service_port'];
            } else {
                servicePorts = '-';
            }
            return servicePorts;
        };

        /*
         * @versionFormatter
         */
        self.versionFormatter = function(r, c, v, cd, dc) {
            var version =
                getValueByJsonPath(dc,
                'physical_router_snmp_credentials;version', null);
            if(version != null) {
                version = (version.toString() === '2') ?  '2c' : '3';
            } else {
                version = '-';
            }
            return version;
        };
    };
    return pRoutersFormatters;
});