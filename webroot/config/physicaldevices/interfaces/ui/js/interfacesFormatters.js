/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var infFormatters = function() {
        var self = this;

        /*
         * @virtualNetworkFormatter
         */
        self.virtualNetworkFormatter = function(r, c, v, cd, dc) {
            var virtualNetwork = '';
            var vmiRefs = ifNull(dc['virtual_machine_interface_refs'], []);
            if(vmiRefs.length > 0) {
                var vmiRef = vmiRefs[0]['virtual-machine-interface'];
                if('virtual_network_refs' in vmiRef) {
                    virtualNetwork = vmiRef['virtual_network_refs'][0].to;
                    virtualNetwork =
                        virtualNetwork[2] + ' (' + virtualNetwork[0] +
                            ':' + virtualNetwork[1] + ')';
                } else {
                    virtualNetwork = '-';
                }
            } else {
                virtualNetwork = '-';
            }
            return virtualNetwork;
        };

        /*
         * @serversFormatter
         */
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

        /*
         * @subnetFormatter
         */
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
        };

        /*
         * @interfaceNameFormatter
         */
        self.interfaceNameFormatter = function(r, c, v, cd, dc) {
            return dc.display_name != null ? dc.display_name : dc.name;
        };

        /*
         * @interfaceTypeFormatter
         */
        self.interfaceTypeFormatter = function(r, c, v, cd, dc) {
            return dc.type === ctwl.PHYSICAL_INF ? 'Physical' : 'Logical';
        };

        /*
         * @logicalInterfacesFormatter
         */
        self.logicalInterfacesFormatter = function(r, c, v, cd, dc) {
            var lInterfaceNames = '';
            var logicalInterfaces = ifNull(dc['logical_interfaces'], []);
            if(logicalInterfaces.length > 0) {
                for(var j = 0; j < logicalInterfaces.length;j++) {
                    var lInterfaceName =
                        self.getActInterfaceName(logicalInterfaces[j].to[3]);
                    if(lInterfaceNames === ''){
                        lInterfaceNames = lInterfaceName;
                    } else {
                        lInterfaceNames += ', ' + lInterfaceName;
                    }
                }
            } else {
               lInterfaceNames = '-';
            }
            return lInterfaceNames;
        };
        self.getActInterfaceName = function(name) {
            var actName = name;
            if(name.indexOf('__') != -1){
                actName = name.replace('__',':');
            }
            return actName;
        };

        /*
         * @parentFormatter
         */
        self.parentFormatter = function(r, c, v, cd, dc) {
            var parent = '-';
            if(dc.type === ctwl.PHYSICAL_INF) {
                parent = dc.fq_name[1];
            } else if(dc.type === ctwl.LOGICAL_INF) {
                parent = dc.parent_type == ctwl.PARENT_TYPE_PROUTER ?
                    dc.fq_name[1] :
                    self.getActInterfaceName(dc.fq_name[2]);
            }
            return parent;
        };

        /*
         * @physicalInfRefsFormatter
         */
        self.physicalInfRefsFormatter = function(r, c, v, cd, dc) {
            var piRefs, toArray, formattedPIName, physicalInfStr = "",
                currentPRName;
            if(dc.type === ctwl.PHYSICAL_INF) {
                currentPRName = contrail.getCookie(ctwl.PROUTER_KEY);
                piRefs = getValueByJsonPath(dc,
                    "physical_interface_refs", []);
                _.each(piRefs, function(piRef, index){
                    toArray = getValueByJsonPath(piRef,
                        "to", [], false);
                    if(toArray.length === 3) {
                        if(toArray[1] !== currentPRName) {
                            formattedPIName = toArray[2] + " (" + toArray[1] + ")";
                        } else {
                            formattedPIName = toArray[2];
                        }
                        if(index === 0) {
                            physicalInfStr = formattedPIName;
                        } else {
                            physicalInfStr += ", " + formattedPIName;
                        }
                    }
                });
            }
            if(!physicalInfStr) {
                physicalInfStr = "-";
            }
            return physicalInfStr;
        };

        /*
         * @vlanFormatter
         */
        self.vlanFormatter = function(r, c, v, cd, dc) {
            return dc.logical_interface_vlan_tag != null ?
                dc.logical_interface_vlan_tag : '-';
        };

        /*
         * @logicalInterfaceTypeFormatter
         */
        self.logicalInterfaceTypeFormatter = function(r, c, v, cd, dc) {
            var logicalInterfaceType = '';

            if(dc.logical_interface_type != null) {
                logicalInterfaceType = dc.logical_interface_type ===
                    ctwl.LOGICAL_INF_L2_TYPE ? 'L2' : 'L3';
            } else {
                logicalInterfaceType = '-'
            }
            return logicalInterfaceType;
        };
    };
    return infFormatters;
});