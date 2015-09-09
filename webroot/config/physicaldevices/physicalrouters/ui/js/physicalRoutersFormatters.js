/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var pRoutersFormatters = function() {
        var self = this;
        self.managementIPFormatter = function(r, c, v, cd, dc) {
            return dc['physical_router_management_ip'] ?
                dc['physical_router_management_ip'] : '-';
        };
        self.dataplaneIPFormatter = function(r, c, v, cd, dc) {
            return dc['physical_router_dataplane_ip'] ?
                dc['physical_router_dataplane_ip'] : '-';
        };
        self.infCntFormatter = function(r, c, v, cd, dc) {
            return dc['totalIntfCount'] ?
                dc['totalIntfCount'] : 'None';
        };
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
        self.virtualNetworksFormatter = function(r, c, v, cd, dc) {
            var virtualNetworks  = [];
            if(dc['virtual_network_refs'].length > 0){
                var vnRefs  = dc['virtual_network_refs'];
                $.each(vnRefs, function(i,d){
                    virtualNetworks.push(
                        d.to[2] + ' (' + d.to[0] + ':' + d.to[1] + ')');
                });
            } else {
                virtualNetworks = '-';
            }
            return virtualNetworks;
        };
        self.netConfUserNameFormatter = function(r, c, v, cd, dc) {
            var userName = '-';
            var credentials = dc['physical_router_user_credentials']
            if(credentials['username'] != null &&
                credentials['username'].trim() != '') {
                userName = credentials['username'];
            }
            return userName;
        };
        self.autoConfigFormatter = function(r, c, v, cd, dc) {
            var autoConfig = '-';
            if(dc['physical_router_vnc_managed'] != null) {
                autoConfig =
                    dc['physical_router_vnc_managed'] ?  'Enabled' : 'Disabled';
            }
            return autoConfig;
        };
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
    };
    return pRoutersFormatters;
});