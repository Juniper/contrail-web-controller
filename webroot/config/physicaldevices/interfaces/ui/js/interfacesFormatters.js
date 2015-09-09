/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var infFormatters = function() {
        var self = this;
        self.virtualNetworkFormatter = function(r, c, v, cd, dc) {
            var vnRefs = '-';
            if(dc['virtual_machine_interface_refs'] != null &&
                dc['virtual_machine_interface_refs'].length > 0) {
                var vmiRef = dc['virtual_machine_interface_refs'][0]['virtual-machine-interface'];
                if('virtual_network_refs' in vmiRef) {
                    vnRefs = vmiRef['virtual_network_refs'][0].to;
                    vnRefs = vnRefs[2] + ' (' + vnRefs[0] + ':' + vnRefs[1] + ')';
                }
            }
            return vnRefs;
        };
        self.serversFormatter = function(r, c, v, cd, dc) {
            var serverString = '-';
            if(dc['logical_interface_type'] === ctwl.LOGICAL_INF_L2_TYPE &&
                dc['virtual_machine_interface_refs'] != null) {
                var vmiRefs = dc['virtual_machine_interface_refs'];
                serverString = '';
                for(var i = 0; i < vmiRefs.length ; i++) {
                    var vmiDetail = vmiRefs[i]['virtual-machine-interface'];
                    if(vmiDetail != null) {
                        var macAddr =
                            vmiDetail['virtual_machine_interface_mac_addresses']['mac_address'][0].trim();
                        if('instance_ip_back_refs' in vmiDetail) {
                            var instanceIPBackRefs =
                                vmiDetail['instance_ip_back_refs'];
                            if('instance-ip' in instanceIPBackRefs[0]) {
                                var vmiIP =
                                    instanceIPBackRefs[0]['instance-ip']['instance_ip_address'].trim();
                                macAddr = macAddr +' ('+ vmiIP + ')';
                            }
                        }
                        if(i == 0){
                            serverString = macAddr;
                        } else {
                            serverString += '</br>' + macAddr;
                        }
                    }
                }
            }
            return serverString;
        };
        self.subnetFormatter = function(r, c, v, cd, dc) {
            var subnetCIDR = '-';
            if(dc['logical_interface_type'] === ctwl.LOGICAL_INF_L3_TYPE &&
                dc['virtual_machine_interface_refs'] != null &&
                dc['virtual_machine_interface_refs'].length > 0) {
                var vmiRef = dc['virtual_machine_interface_refs'][0]['virtual-machine-interface'];
                if('subnet_back_refs' in vmiRef) {
                    var subnet = vmiRef['subnet_back_refs'][0]['subnet']['subnet_ip_prefix'];
                    subnetCIDR = subnet['ip_prefix'] + '/' +
                            subnet['ip_prefix_len'];
                }
            }
            return subnetCIDR;
        }
    };
    return infFormatters;
});