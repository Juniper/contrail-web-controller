/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'lodash'
], function (_) {
    var PortFormatters = function() {
        var self = this;
        ////Data formating with the result from API////
        //Getting all the data Inside virtual-machine-interface//
        self.formatVMIGridData = function(response){
            var vmiData = [];
            var vmiConfig = response;
            if(vmiConfig != null &&
                vmiConfig != undefined){
                var vmiLen = vmiConfig.length;
                for(var j=0; j < vmiLen; j++) {
                    var vmi = vmiConfig[j]['virtual-machine-interface'];
                    vmiData.push(vmi);
                }
            }
            return vmiData;
        }
        self.uuidWithName = function(d, c, v, cd, dc) {
            var uuidName = "-";
            var uuid = getValueByJsonPath(dc, "uuid", "");
            var name = getValueByJsonPath(dc, "fq_name;2", "");
            if(uuid != name){
                uuidName = name + " (" + uuid+ ")";
            } else {
                uuidName = uuid;
            }
            return uuidName;
        };

        self.vRouterFormatter =  function(d, c, v, cd, dc) {
            var fqName = getValueByJsonPath(dc, "fq_name", []);
            if(fqName.length === 3) {
                return fqName[1];
            }
            return '-';
        };

        //Start of grid data formating//
        //Grid column label: Network//
        //Grid column expand label : Network//
        self.networkFormater = function(d, c, v, cd, dc) {
            var network = "-";
            var vn_ref = getValueByJsonPath(dc, "virtual_network_refs", "");
            if(vn_ref != ""){
                network = ctwu.formatCurrentFQName(vn_ref[0]["to"],
                    ctwu.getCurrentDomainProject());
            }
            return network;
        };
        //Grid column label: Fixed IP//
        self.fixedIPFormater = function(d, c, v, cd, dc) {
            var instanceIP = "";
            var instIP = getValueByJsonPath(dc, "instance_ip_back_refs", []);
            if(instIP.length > 0) {
                var instIP_length = instIP.length;
                for(var i = 0; i < instIP_length && i < 2 ;i++) {
                    var ip = getValueByJsonPath(instIP[i], "fixedip;ip", "");
                    instanceIP += ip;
                    if(instanceIP != "") {
                        instanceIP += "<br> ";
                    }
                }
                if(instIP_length > 2) {
                    instanceIP += "(" + Number(Number(instIP_length)-2)+" more)";
                }
            } else {
                instanceIP = "-";
            }
            return instanceIP;
        };
        //Grid column label: Floating IP//
        self.floatingIPFormatter = function(d, c, v, cd, dc) {
            var fipStr = "", floatingIP = "";
            var fipData = getValueByJsonPath(dc, "floating_ip_back_refs", []);
            if(fipData.length > 0) {
                var fip_length = fipData.length;
                for(var i = 0; i < fip_length && i < 2 ;i++) {
                    floatingIP = getValueByJsonPath(fipData[i],
                        "floatingip;ip", "", false);
                    toStr = getValueByJsonPath(fipData[i], "to", [], false);
                    if(floatingIP && toStr.length === 5) {
                        fipStr +=
                            floatingIP + " (" + toStr[2] + ":" + toStr[3] + ")";
                    }
                    if(fipStr != "") {
                        fipStr += "<br>";
                    }
                }
                if(fip_length > 2) {
                    fipStr += "(" + Number(Number(fip_length)-2)+" more)";
                }
            } else {
                fipStr = "-";
            }
            return fipStr;
        };
        //Grid column label: Device//
        //Grid column expand label: Device//
        self.deviceOwnerFormatter = function(d, c, v, cd, dc) {
            var deviceOwner = getValueByJsonPath(dc,
                               "virtual_machine_interface_device_owner", "");
            var subInterface = self.isSubInterface(dc);
            deviceOwner = subInterface ? "Sub Interface":deviceOwner;
            if(deviceOwner == ""){
                deviceOwner = "-";
            }
            return deviceOwner;
        }
        //Grid column expand label : Name//
        self.fqNameFormater = function(d, c, v, cd, dc) {
            var fqname = "-";
            var fqNameData = getValueByJsonPath(dc, "fq_name", []);
            if(fqNameData.length >= 3){
                fqname = fqNameData[2];
            }
            return fqname;
        };
        //Grid column expand label: Admin State//
        self.AdminStateFormatter = function(d, c, v, cd, dc) {
            var adminState = "Down";
            var idPermState = getValueByJsonPath(dc, "id_perms;enable","");
            if(idPermState != ""){
                if(idPermState == "true" || idPermState == true) {
                    adminState = "Up";
                }
            }
            return adminState;
        };
        //Grid column expand label: MAC Address//
        self.MACAddressFormatter = function(d, c, v, cd, dc) {
            var MACAddress = "-";
            var MACAddressvalue = getValueByJsonPath(dc,
                                "virtual_machine_interface_mac_addresses;mac_address;0",
                                "")
            if(MACAddressvalue != ""){
                MACAddress = MACAddressvalue;
            }
            return MACAddress;
        };
        //Grid column expand label: Local Preference//
        self.localPrefFormater = function(d, c, v, cd, dc) {
            var localPref = "-";
            var localPrefValue = getValueByJsonPath(dc,
                                "virtual_machine_interface_properties;local_preference",
                                "")
            if(localPrefValue !== ""){
                localPref = localPrefValue;
            }
            return localPref;
        };
        //Grid column expand label: Fixed IPs//
        self.fixedIPFormaterExpand = function(d, c, v, cd, dc) {
            var instanceIP = "";
            var instIP = getValueByJsonPath(dc, "instance_ip_back_refs", []);
            if(instIP.length > 0) {
                var vmi_length = instIP.length;
                for(var i = 0; i < vmi_length; i++) {
                    if(instanceIP != "") {
                        instanceIP += "<br>";
                    }
                    var ip = getValueByJsonPath(instIP[i],
                        "fixedip;ip", null, false);
                    if(ip !== null) {
                        instanceIP += ip;
                    }
                }

            } else {
                instanceIP = "-";
            }
            return instanceIP;
        };
        //Grid column expand label: Floating IPs//
        self.floatingIPFormatterExpand = function(d, c, v, cd, dc) {
            var fipStr = "", floatingIP = "", toStr, fip_length, i,
                fipData = getValueByJsonPath(dc, "floating_ip_back_refs", []);
            toStr = getValueByJsonPath(fipData, "to", []);
            if(fipData.length > 0) {
                fip_length = fipData.length;
                for(i = 0; i < fip_length;i++) {
                    floatingIP = getValueByJsonPath(fipData[i],
                        "floatingip;ip", "", false);
                    toStr = getValueByJsonPath(fipData[i], "to", [], false);
                    if(floatingIP && toStr.length === 5) {
                        fipStr +=
                            floatingIP + " (" + toStr[2] + ":" + toStr[3] + ")";
                    }
                    if(fipStr != "") {
                        fipStr += "<br>";
                    }
                }
            } else {
                fipStr = "-";
            }
            return fipStr;
        };
        //Grid column expand label: Security Groups//
        self.sgFormater = function(d, c, v, cd, dc) {
            var sg = "",
                portSecurity = getValueByJsonPath(dc,
                        'port_security_enabled', "-"),
                sgData = getValueByJsonPath(dc, "security_group_refs", []);
            if(portSecurity == "-"){
                return portSecurity;
            }
            if(portSecurity === true){
                sg = "Enabled<br>"
            } else{
                sg = "Disabled";
                return sg;
            }
            if(sgData.length > 0) {
                var sg_length = sgData.length;
                for(var i = 0; i < sg_length;i++) {
                    sg += ctwu.formatCurrentFQName(sgData[i]["to"],
                            ctwu.getCurrentDomainProject());
                    if(i != sg_length -1) {
                        sg += ", ";
                    }
                }
            } else {
                sg = "-";
            }
            return sg;
        };
        //Grid column expand label: DHCP Options//
        self.DHCPFormatter = function(d, c, v, cd, dc) {
            var dhcp = "";
            var dhcpVals = getValueByJsonPath(dc,
                           "virtual_machine_interface_dhcp_option_list;dhcp_option",
                           "");
            if(dhcpVals != "" && dhcpVals.length > 0){
                var dhcp_length = dhcpVals.length;
                dhcp = "<table width='100%'><thead><tr><th class='col-xs-4'>Code</th><th class='col-xs-4'>Value</th><th class='col-xs-4'>Value in Bytes</th></tr></thead><tbody>"
                for(var i = 0; i < dhcp_length;i++) {
                    var dhcpVal = dhcpVals[i];
                    dhcp += "<tr><td>";
                    dhcp += dhcpVal["dhcp_option_name"]
                    dhcp += "</td><td>";
                    dhcp += dhcpVal["dhcp_option_value"] ? dhcpVal["dhcp_option_value"] : "-";
                    dhcp += "</td><td>";
                    dhcp += dhcpVal["dhcp_option_value_bytes"] ? dhcpVal["dhcp_option_value_bytes"] : "-" ;                   
                    dhcp += "</td></tr>";
                }
                dhcp += "</tbody></table>";
            } else {
                dhcp = "-";
            }
            return dhcp;
        };
        //Grid column expand label: Static Routes//
        self.staticRoutFormatter = function(d, c, v, cd, dc) {
            var staticRout = "";
            var staticRoutValues = getValueByJsonPath(dc,
                                   "interface_route_table_refs",
                                   []);
            if(staticRoutValues.length > 0) {
                var staticRout_length = staticRoutValues.length;
                for(var i = 0; i < staticRout_length;i++) {
                    var staticRoutTo =
                        getValueByJsonPath(staticRoutValues[i], "to", []);
                    var projArr = self.getProjectFqn().split(":");
                    var selectedDomain = projArr[0];
                    var selectedProject = projArr[1];
                    var staticRoutVal = "";
                    if(staticRoutTo.length >= 2) {
                        if(staticRoutTo[0] == selectedDomain &&
                           staticRoutTo[1] == selectedProject) {
                            staticRoutVal = staticRoutTo[2];
                        } else {
                            staticRoutVal = staticRoutTo[2] +
                                            "(" + selectedDomain +
                                            ":" + selectedProject + ")";
                        }
                    }
                    if(staticRout != "" && staticRoutVal != "") {
                        staticRout += ",<br>";
                    }
                    if(staticRoutVal != "") {
                        staticRout += staticRoutVal;
                    }
                }
            } else {
                staticRout = "-";
            }
            return staticRout;
        };

        //Grid column expand label: Service Health Check//
        self.serviceHealthCheckFormatter = function(d, c, v, cd, dc) {
            var serviceHealthCheck = "";
            var serviceHealthCheckValues = getValueByJsonPath(dc,
                                   "service_health_check_refs",
                                   []);
            if(serviceHealthCheckValues.length > 0) {
                var serviceHealthChecklength = serviceHealthCheckValues.length;
                for(var i = 0; i < serviceHealthChecklength;i++) {
                    var serviceHealthCheckTo =
                        getValueByJsonPath(serviceHealthCheckValues[i], "to", []);
                    temp = ctwu.formatCurrentFQName(serviceHealthCheckTo,
                            ctwu.getCurrentDomainProject());
                    serviceHealthCheck += temp;
                }
            } else {
                serviceHealthCheck = "-";
            }
            return serviceHealthCheck;
        };
        //Grid column expand label: Static Routes//
        self.ECMPHashingFormatter = function(d, c, v, cd, dc) {
            var ecmp = getValueByJsonPath(dc, "ecmp_hashing_include_fields", ""),
                dispStr = '-';
                fields = [];
            var hashingConfigured = getValueByJsonPath(ecmp,
                    'hashing_configured', false);
            if (hashingConfigured == false) {
                return dispStr;
            }
            for (var key in ecmp) {
                if (true == ecmp[key] && key != "hashing_configured") {
                    key = key.replace('_', '-');
                    fields.push(key);
                }
            }
            if (fields.length > 0) {
                return fields.join(', ');
            }
            if(!dispStr) {
                dispStr = "-";
            }
            return dispStr;
        };
        //Grid column expand label: Port Binding//
        self.PortBindingFormatter = function(d, c, v, cd, dc) {
            var portBinding = "";
            var portBindingData = getValueByJsonPath(dc,
                          "virtual_machine_interface_bindings;key_value_pair",
                          []);
            if(portBindingData.length > 0) {
                var portBinding_length = portBindingData.length;
                portBinding = "<table width='100%'><thead><tr><th class='col-xs-4'>Key</th><th class='col-xs-12'>Value</th></tr></thead>"
                for(var i = 0; i < portBinding_length;i++) {
                    var portBindingVal = portBindingData[i];
                    portBinding += "<tbody><tr><td>";
                    if(portBindingVal["key"] == "vnic_type" &&
                       portBindingVal['value'] == "direct") {
                        portBinding += "SR-IOV (vnic_type:direct)";
                    } else {
                        portBinding += portBindingVal["key"];
                    }
                    portBinding += "</td><td>";
                    portBinding += portBindingVal["value"];
                    portBinding += "</td></tr>";
                }
                portBinding += "</tbody></table>";
            } else {
                portBinding = "-";
            }
            return portBinding;
        };
        //Grid column expand label: Allowed address pairs//
        self.AAPFormatter = function(d, c, v, cd, dc) {
            var AAP = "";
            var AAPData = getValueByJsonPath(dc,
                          "virtual_machine_interface_allowed_address_pairs;allowed_address_pair",
                          []);
            if(AAPData.length > 0) {
                var AAP_length = AAPData.length;
                AAP = "Enabled<br><table width='100%'><thead>" +
                      "<tr><th class='col-xs-4'>IP</th>" +
                      "<th class='col-xs-4'>MAC</th>" +
                      "<th class='col-xs-4'>Address Mode</th></tr></thead>"
                for(var i = 0; i < AAP_length;i++) {
                    var AAPVal = AAPData[i];
                    AAP += "<tbody><tr><td>";
                    AAP += AAPVal["ip"]["ip_prefix"] + "/" +
                           AAPVal["ip"]["ip_prefix_len"]
                    AAP += "</td><td>";
                    AAP += AAPVal["mac"] ? AAPVal["mac"] : "-";
                    AAP += "</td><td>";
                    AAP += AAPVal["address_mode"] ?
                            (AAPVal["address_mode"] === 'active-standby' ?
                                    'Active-Standby' : 'Active-Active') : "-";
                    AAP += "</td></tr>";
                }
                AAP += "</tbody></table>";
            } else {
                AAP = "Disabled";
            }
            return AAP;
        };
        //Grid column expand label: Mirror//
        self.mirrorFormatter = function(d, c, v, cd, dc) {
            var mirror = "",
                nicAssistedMirroring = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;nic_assisted_mirroring", false),
                nicAssistedVLAN = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;nic_assisted_mirroring_vlan", false),
                analyzerIP = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;analyzer_ip_address", null),
                udpPort = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;udp_port", null),
                analyzerName = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;analyzer_name", null),
                routingInst = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;routing_instance", null),
                jnprHeader = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;juniper_header", null),
                analyzerMAC = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;analyzer_mac_address", null),
                mirrorDirection = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;traffic_direction", null),
                nhMode = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;nh_mode", null),
                vtepDestIP, vtepDestMAC, VxLANId;
            if(analyzerName) {
                mirror += self.addTableRow("Analyzer Name", analyzerName);
            } else {
                return "-";
            }

            if(nicAssistedMirroring) {
                nicAssistedMirroring = nicAssistedMirroring ? "Enabled" : "Disabled";
                mirror += self.addTableRow("NIC Assisted Mirroring", nicAssistedMirroring);
                mirror += self.addTableRow("NIC Assisted VLAN", nicAssistedVLAN);
                return "<table style='width:100%'><tbody>" + mirror + "</tbody></table>";
            } else {
                nicAssistedMirroring = nicAssistedMirroring ? "Enabled" : "Disabled";
                //mirror += self.addTableRow("NIC Assisted Mirroring", nicAssistedMirroring);
            }

            if(analyzerIP) {
                mirror += self.addTableRow("Analyzer IP", analyzerIP);
            } else {
                mirror += self.addTableRow("Analyzer IP", "-");
            }

            if(analyzerMAC) {
                mirror += self.addTableRow("Analyzer MAC", analyzerMAC);
            } else {
                mirror += self.addTableRow("Analyzer MAC", "-");
            }

            if(udpPort) {
                mirror += self.addTableRow("UDP Port", udpPort);
            } else {
                mirror += self.addTableRow("UDP Port", "-");
            }

            if(jnprHeader !== null) {
                jnprHeader = jnprHeader === true ? "Enabled" : "Disabled";
                mirror += self.addTableRow("Juniper Header", jnprHeader);
            } else {
                mirror += self.addTableRow("Juniper Header", "-");
            }

            if(routingInst) {
                var ri = routingInst.split(":");
                routingInst = ctwu.formatCurrentFQName(ri,
                        ctwu.getCurrentDomainProject());
                mirror += self.addTableRow("Routing Instance", routingInst);
            } else {
                mirror += self.addTableRow("Routing Instance", "-");
            }

            if(mirrorDirection) {
                var dir = "Both";
                if(mirrorDirection  === "ingress") {
                    dir = "Ingress";
                } else if(mirrorDirection  === "egress") {
                    dir = "Egress";
                }
                mirror += self.addTableRow("Traffic Direction", dir);
            } else {
                mirror += self.addTableRow("Traffic Direction", "-");
            }

            if(nhMode) {
                var mode = "Dynamic";
                if(nhMode === ctwc.MIRROR_STATIC) {
                    mode = "Static"
                }
                mirror += self.addTableRow("Nexthop Mode", mode);
            } else {
                mirror += self.addTableRow("Nexthop Mode", "-");
            }

            if(nhMode === ctwc.MIRROR_STATIC) {
                vtepDestIP = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;static_nh_header;" +
                        "vtep_dst_ip_address", null);
                vtepDestMAC = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;static_nh_header;" +
                        "vtep_dst_mac_address", null);
                VxLANId = getValueByJsonPath(dc,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;static_nh_header;" +
                        "vni", null);
                if(vtepDestIP) {
                    mirror += self.addTableRow("VTEP Dest IP", vtepDestIP);
                } else {
                    mirror += self.addTableRow("VTEP Dest IP", "-");
                }
                if(vtepDestMAC) {
                    mirror += self.addTableRow("VTEP Dest MAC", vtepDestMAC);
                } else {
                    mirror += self.addTableRow("VTEP Dest MAC", "-");
                }
                if(VxLANId) {
                    mirror += self.addTableRow("VxLAN ID", VxLANId);
                } else {
                    mirror += self.addTableRow("VxLAN ID", "-");
                }
            }

            if (mirror == "") {
                mirror = "-";
            } else {
                mirror = "<table style='width:100%'><tbody>" + mirror + "</tbody></table>";
            }
            return mirror;
        };
        self.addTableRow = function(key, value) {
            var formattedStr = "<tr>";
            formattedStr += "<td style='width:25%'>" + key + "</td>";
            formattedStr += "<td style='font-weight:bold'>" + value + "</td>";
            formattedStr += "</tr>";
            return formattedStr;
        }
        //Grid column expand label: Device ID//
        self.deviceUUIDFormatter = function(d, c, v, cd, dc) {
            var deviceUUID = "";
            var devOwner = dc["virtual_machine_interface_device_owner"] ?
                           dc["virtual_machine_interface_device_owner"] : "";
            if(devOwner == "network:router_interface"){
                if("logical_router_back_refs" in dc &&
                   dc["logical_router_back_refs"].length > 0 ){
                    deviceUUID = dc["logical_router_back_refs"][0]["to"][2]
                    + " (" + dc["logical_router_back_refs"][0]["uuid"] +")";
                }
            } else  if("compute" == devOwner.substring(0,7)){
                if("virtual_machine_refs" in dc &&
                   dc["virtual_machine_refs"].length >= 0 ){
                    deviceUUID = dc["virtual_machine_refs"][0]["uuid"];
                }
            }
            if(deviceUUID == "") {
                deviceUUID = "-";
            }
            return deviceUUID;
        };
        //Grid column expand label: Sub Interfaces//
        self.childrensUUID = function(d, c, v, cd, dc) {
            var childrensUUID = "";
            if("virtual_machine_interface_refs" in dc &&
               (!("virtual_machine_interface_properties" in dc) ||
               !("sub_interface_vlan_tag" in
                 dc["virtual_machine_interface_properties"] ))){
                var len = dc["virtual_machine_interface_refs"].length - 1;
                for(var i = 0; i <= len; i++){
                    if(childrensUUID != "") childrensUUID += "<br>";
                    childrensUUID +=
                             dc["virtual_machine_interface_refs"][i]["uuid"];
                }
            }
            if(childrensUUID == "") {
                childrensUUID = "-";
            }
            return childrensUUID;
        };
        //Grid column expand label: Sub Interface VXLAN//
        self.subInterfaceVXLANUUID = function(d, c, v, cd, dc) {
            var subInterfaceVXLANUUID = "";
            var vmiRef = getValueByJsonPath(dc,
                         "virtual_machine_interface_refs","");
            var vxlan = getValueByJsonPath(dc,
                  "virtual_machine_interface_properties;sub_interface_vlan_tag",
                  "");
            if(vmiRef != "" && vxlan != "") {
                subInterfaceVXLANUUID = vxlan;
            } else {
                subInterfaceVXLANUUID = "-";
            }
            return subInterfaceVXLANUUID;
        };
        //Grid column expand label: Sub Interface Parent Port//
        self.parentUUIDFormatter = function(d, c, v, cd, dc) {
            var parentUUIDFormatter = "";
            var subInterface =
                   getValueByJsonPath(dc,
                   "virtual_machine_interface_properties;sub_interface_vlan_tag", "");
            var vmiRef = getValueByJsonPath(dc, "virtual_machine_interface_refs", []);
            if( vmiRef.length > 0 && subInterface != ""){
                var len = dc["virtual_machine_interface_refs"].length-1;
                for(var i=0;i<=len;i++){
                    if(parentUUIDFormatter != "") {
                        parentUUIDFormatter+="<br>";
                    }
                    parentUUIDFormatter +=
                                dc["virtual_machine_interface_refs"][i]["uuid"];
                }
            }
            return parentUUIDFormatter;
        };
        /////End of Grid data formating/////

        //Function to check if the current port is a subInterface//
        //Return true or false //
        self.isSubInterface = function(dc) {
            var vlan = getValueByJsonPath(dc,
                 "virtual_machine_interface_properties;sub_interface_vlan_tag",
                 "");
            var vmiRef = getValueByJsonPath(dc, "virtual_machine_interface_refs",
                         "");
            if(vmiRef != "" && vlan != "") {
                return true;
            }
            return false;
        }
        ///////create or edit popup related function////////
        /*
            Create / Edit Network drop down data formatter
        */
        self.networkDDFormatter = function(response) {
            var networkList = [],
                responseLen = response.length;
            for(var i = 0; i < responseLen; i++) {
                var networkResponse =
                        getValueByJsonPath(response[i]["virtual-network"],
                        'fq_name', '');
                if(networkResponse != '') {
                    var objArr = networkResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(networkResponse,
                            ctwu.getCurrentDomainProject());
                    var networkResponseVal = networkResponse.join(":");
                    networkList.push({value: networkResponseVal, text: text});
                }
            }
            return networkList;
        };
        self.vnDDFormatter = function(response, edit, portModel) {
            if(!edit && response.length > 0) {
                portModel.model.virtualNetworkName(response[0].value);
            }
            return response;
        }
        /*
            Create / Edit Security Group drop down data formatter
        */
        self.sgDDFormatter = function(response, edit, portEditView) {
            var sgList = [];
            var sg = response["security-groups"];
            var responseLen = sg.length;
            var sgResponseVal = "";
            for(var i = 0; i < responseLen; i++) {
                var sgResponse = getValueByJsonPath(sg[i], 'fq_name', '');
                if(sgResponse != '') {
                    sgResponseVal = sgResponse.join(":");
                    var objArr = sgResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(sgResponse,
                            ctwu.getCurrentDomainProject());
                    sgList.push({value: sgResponseVal, text: text});
                }
            }
            return sgList;
        };
        /*
            Create / Edit StaticRout drop down data formatter
        */
        self.srDDFormatter = function(response, edit, portModel) {
            var rtList = [];
            var rt = response[0]["interface-route-tables"];
            var responseLen = rt.length;
            var rtResponseVal = "";
            for(var i = 0; i < responseLen; i++) {
                var rtResponse = getValueByJsonPath(rt[i], 'fq_name', '');
                if(rtResponse != '') {
                    rtResponseVal = rtResponse.join(":");
                    var objArr = rtResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(rtResponse,
                            ctwu.getCurrentDomainProject());
                    rtList.push({value: rtResponseVal, text: text});
                }
            }
            return rtList;
        };
        /*
            Create / Edit Routing Instance drop down data formatter
        */
        self.routingInstDDFormatter = function(response, edit, portModel) {
            var routingInstList = [];
            var routingInst = response[0]["routing-instances"];
            var responseLen = routingInst.length;
            var routingInstResponseVal = "";
            for(var i = 0; i < responseLen; i++) {
                var routingInstResponse = getValueByJsonPath(routingInst[i], 'fq_name', '');
                if(routingInstResponse != '') {
                    routingInstResponseVal = routingInstResponse.join(":");
                    var objArr = routingInstResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(routingInstResponse,
                            ctwu.getCurrentDomainProject());
                    routingInstList.push({value: routingInstResponseVal, text: text});
                }
            }
            return routingInstList;
        };
        /*
            Create / Edit Floating IP drop down data formatter
        */
        self.floatingIPDDFormatter = function(response) {
            var floatingIPList = [],
                floatingIP = response["floating_ip_back_refs"],
                responseLen = floatingIP.length,
                fip = {},
                uuid = "",
                to = [],
                toStr = "", i, val, fipText;
            for(i = 0; i < responseLen; i++) {
                fip = floatingIP[i]["floating-ip"];
                uuid = getValueByJsonPath(fip, 'uuid', '', false);
                fq_name = getValueByJsonPath(fip, 'fq_name', [], false);

                if(fip && fip.floating_ip_address && fq_name.length === 5) {
                    toStr = fq_name.join(":");
                    val = uuid + cowc.DROPDOWN_VALUE_SEPARATOR + toStr;
                    fipText = fip.floating_ip_address + " (" +
                                  fip.fq_name[2] + ":" +
                                  fip.fq_name[3] + ")";
                    floatingIPList.push({value: val, text: fipText});
                }
            }
            return floatingIPList;
        };
        /*
            Create / Edit Compute UUID drop down data formatter
        */
        self.subnetDDFormatter = function(response, edit, portModel) {
            if(!edit && response.length > 0) {
                portModel.model.subnet_uuid(response[0].value);
            }
            return response;
        }
        /*
            Create / Edit Compute UUID drop down data formatter
        */
        self.computeUUIDFormatter = function(response, edit, portModel) {
            var vmArray = [];
            var returnComputeUUID = [];
            if(response != null && response != "" &&
               (null != response['virtual-machines'])) {
                vmArray = response['virtual-machines'];
            }
            var vmArrayLen = vmArray.length;
            for(var j=0;j < vmArrayLen;j++){
                var vm = vmArray[j];
                var text = vm["uuid"];

                var deviceVMIValue = [];
                var to = vm["fq_name"].join(":");
                var uuid = vm["uuid"];
                var uuid = vm["uuid"];
                deviceVMIValue = uuid + cowc.DROPDOWN_VALUE_SEPARATOR + to;
                returnComputeUUID.push({"text":text,"value":deviceVMIValue});
            }
            if((returnComputeUUID.length > 0) &&
               (edit && portModel.model.deviceOwnerValue().toLowerCase() != "compute")) {
                portModel.model.virtualMachineValue(returnComputeUUID[0].value);
            }
            return returnComputeUUID;
        }
        /*
            Create / Edit Logical router drop down data formatter
        */
        self.routerFormater = function(response, edit, portModel) {
            var lrReturn = [];
            if(response != null && response != "" &&
               response["logical-routers"] &&
               response["logical-routers"].length > 0) {
                var logicalRouters = response['logical-routers'];
                var logicalRoutersCnt = logicalRouters.length;
                for(var lrInc = 0; lrInc < logicalRoutersCnt; lrInc++){
                    // take it from logical router
                    var localLogicalRout = logicalRouters[lrInc];
                     var text = localLogicalRout["fq_name"][2] +
                                " (" + localLogicalRout["uuid"] + ")";
                    var deviceLRArr = [];
                    var to = localLogicalRout["fq_name"].join(":");
                    var uuid = localLogicalRout["uuid"];
                    deviceLRArr = to + cowc.DROPDOWN_VALUE_SEPARATOR + uuid;
                    lrReturn.push({"text":text,"value":deviceLRArr});
                }
            }
            if(lrReturn.length > 0) {
                if((!edit) ||
                    (edit && portModel.model.deviceOwnerValue().toLowerCase() != "router")) {
                    portModel.model.logicalRouterValue(lrReturn[0].value);
                }
            }
            return lrReturn;
        }
        /*
            Create / Edit Health check drop down data formatter
        */
        self.healthCheckDDFormatter = function(response, edit, portModel) {
            var healthCheckDataReturn = [];
            var healthCheckData = response[0]["service-health-checks"];
            var healthCheckLen = healthCheckData.length;
            var healthCheckVal = {};
            for(var i = 0; i < healthCheckLen; i++) {
                var healthCheckFQName = getValueByJsonPath(healthCheckData[i], 'fq_name', []);
                var healthCheckUUID = getValueByJsonPath(healthCheckData[i], 'uuid', '');
                if(healthCheckFQName.length > 0) {
                    healthCheckVal = healthCheckFQName.join(":") +
                        cowc.DROPDOWN_VALUE_SEPARATOR + healthCheckUUID;
                    var text = ctwu.formatCurrentFQName(healthCheckFQName, ctwu.getCurrentDomainProject());
                    healthCheckDataReturn.push({value: healthCheckVal, text: text});
                }
            }
            return healthCheckDataReturn;
        }

        /*
            Create / Edit Sub Interface drop down data formatter
        */
        self.subInterfaceFormatter = function(response, edit, portModel) {
            var subInterfaceParentDatas = [],
                selectedPortUUID = "",
                vmiArray = getValueByJsonPath(response, 'data', ''),
                vmiArrayLen = vmiArray.length,
                subInterfaceParentDatas = [],
                projectName = contrail.getCookie(cowc.COOKIE_PROJECT);
            for(var j=0;j < vmiArrayLen;j++){
                var val="";
                var mac_text = "";
                var subInterfaceParentText = "";
                if(vmiArray[j] != null && vmiArray[j] != undefined){
                    var ip = getValueByJsonPath(vmiArray[j],
                                  "virtual-machine-interface", "");
                    var vlanTag = getValueByJsonPath(ip,
                                  "virtual_machine_interface_properties;sub_interface_vlan_tag",
                                  null);
                    var subInterfaceProject = getValueByJsonPath(ip,
                                  "virtual_network_refs;0;to;1", null);
                    if((vlanTag == null) &&
                       (subInterfaceProject == projectName)){
                        subInterfaceParentText += ip["uuid"] + "\xa0\xa0";
                        var fixedIp = getValueByJsonPath(ip,
                                      "instance_ip_back_refs;0;fixedip;ip", "");
                        if(fixedIp != "") {
                            subInterfaceParentText += fixedIp;
                        }
                        var macAddress = getValueByJsonPath(ip,
                                         "virtual_machine_interface_mac_addresses;mac_address;0",
                                         null)
                        if(macAddress != null){
                            subInterfaceParentText += "\xa0\xa0[" + macAddress
                                + "]\xa0\xa0";
                        }
                        subInterfaceParentText +=
                            ip["virtual_network_refs"][0]["to"][2];
                        var uuid = ip["uuid"];
                        var to = ip["fq_name"].join(":");
                        var subInterfaceVMI = uuid +
                            cowc.DROPDOWN_VALUE_SEPARATOR + to;
                        if(!(true == edit && ip["uuid"] == portModel.model.uuid())){
                            subInterfaceParentDatas.push(
                                                {"text":subInterfaceParentText,
                                                "value":subInterfaceVMI});
                        }
                    }
                }
            }
            if(!edit && subInterfaceParentDatas.length > 0 &&
                portModel.model.disable_sub_interface() !== true) {
                portModel.model.subInterfaceVMIValue(
                                subInterfaceParentDatas[0].value);
            }
            return subInterfaceParentDatas;
        }

        self.fixedIpSubnetDDFormatter = function(allNetworkData, selectedNetwork) {
            var selectedFqname = selectedNetwork;
            var fqname;
            var currentVNSubnetDetail = [], flatSubnetIPAMIds = [];
            if(allNetworkData == null || allNetworkData.length <= 0) {
                return { SubnetDS: currentVNSubnetDetail,
                    flatSubnetIPAMIds: flatSubnetIPAMIds};
            }
            var networkLen = allNetworkData.length;
            for(var i = 0;i < networkLen; i++){
                fqname =
                    allNetworkData[i]["virtual-network"]["fq_name"].join(":");
                if(fqname === selectedFqname){
                    var subnet =
                      allNetworkData[i]["virtual-network"]["network_ipam_refs"];
                    if(subnet.length > 0){
                        for(var subnetInc = 0; subnetInc < subnet.length;
                            subnetInc++){
                            if(subnet[subnetInc]["subnet"]["ipam_uuid"]){
                                flatSubnetIPAMIds.push(
                                        subnet[subnetInc]["subnet"]["ipam_uuid"]);
                                continue;
                            }
                            var ipam_subnet =
                                subnet[subnetInc]["subnet"]["ipam_subnet"];
                            var default_gateway =
                                subnet[subnetInc]["subnet"]["default_gateway"];
                            var subnet_uuid =
                                subnet[subnetInc]["subnet"]["subnet_uuid"];
                            var SubnetVal = {};
                            SubnetVal.default_gateway = default_gateway;
                            SubnetVal.ipam_subnet = ipam_subnet;
                            SubnetVal.subnet_uuid = subnet_uuid;
                            currentVNSubnetDetail.push({
                                           "text" : ipam_subnet,
                                           "value":JSON.stringify(SubnetVal)
                                        });
                        }
                    }
                    break;
                }
            }
            return { SubnetDS: currentVNSubnetDetail,
                     flatSubnetIPAMIds: flatSubnetIPAMIds};
        }

        self.flatSubnetsDDFormatter =  function(flatSubnetIPAMs) {
            var currentVNFlatSubnets = [], flatSubnets = [],
                flatIPAMList = getValueByJsonPath(flatSubnetIPAMs,
                    '0;network-ipams', [], false);
            _.each(flatIPAMList, function(flatIPAM) {
                flatSubnets = flatSubnets.concat(getValueByJsonPath(flatIPAM,
                        'network-ipam;ipam_subnets;subnets', [], false));
            });
            if(flatSubnets.length) {
                _.each(flatSubnets, function(flatSubnet) {
                    var ipPrefix = getValueByJsonPath(flatSubnet,
                            'subnet;ip_prefix', '', false),
                        ipPrefixLen = getValueByJsonPath(flatSubnet,
                            'subnet;ip_prefix_len', '', false),
                        ipam_subnet = ipPrefix && ipPrefixLen ?
                                ipPrefix + '/' + ipPrefixLen : '',
                        default_gateway = getValueByJsonPath(flatSubnet,
                            'default_gateway', '', false),
                        subnet_uuid = getValueByJsonPath(flatSubnet,
                                'subnet_uuid', '', false),
                        SubnetVal = {};
                    if(ipam_subnet) {
                        SubnetVal.default_gateway = default_gateway;
                        SubnetVal.ipam_subnet = ipam_subnet;
                        SubnetVal.subnet_uuid = subnet_uuid;
                        currentVNFlatSubnets.push({
                                       "text" : ipam_subnet,
                                       "value":JSON.stringify(SubnetVal)
                                    });
                    }
                });
            }
            return currentVNFlatSubnets;
        };

        self.interfaceDetailFormater = function(d, c, v, cd, dc) {
            var domainName = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var projectName = contrail.getCookie(cowc.COOKIE_PROJECT);
            if("virtual_machine_interface_refs" in dc &&
               dc["virtual_machine_interface_refs"] != null &&
               dc["virtual_machine_interface_refs"].length > 0) {
                var vmi = dc["virtual_machine_interface_refs"];
                var vmi_len = vmi.length;
                var InterfaceDetailStr = "";
                for(var inc = 0 ; inc < vmi_len ;inc++){
                    if("virtual_network_refs" in vmi[inc]){
                        var connectedNetwork =
                                vmi[inc]["virtual_network_refs"][0]["to"];
                        var uuid = vmi[inc]["uuid"];
                        var network = "";
                        var ip = "";
                        if("instance_ip_back_refs" in vmi[inc] &&
                           vmi[inc]["instance_ip_back_refs"].length  > 0 &&
                           "ip" in vmi[inc]["instance_ip_back_refs"][0]){
                            ip = vmi[inc]["instance_ip_back_refs"][0]["ip"];
                        }
                        if(connectedNetwork[0] == domainName &&
                           connectedNetwork[1] == projectName){
                           network = connectedNetwork[2];
                        } else {
                           network = connectedNetwork[2]
                                     +" (" +connectedNetwork[0] +":"
                                     + connectedNetwork[1] +")";;
                        }
                        InterfaceDetailStr += ("uuid:" + uuid +
                                               ",network:" + network +
                                               ", ip:" + ip+"<br>");
                    }
                }
            }
            return InterfaceDetailStr;
        };
        self.LogicalRouterDataParser = function(response) {
            var LogicalRouterData = [];
            var LogicalRouterConfig = response.data;
            if(LogicalRouterConfig != null &&
                LogicalRouterConfig != undefined){
                var LRLen = LogicalRouterConfig.length;
                for(var j=0; j < LRLen; j++) {
                    var LR = LogicalRouterConfig[j]['logical-router'];
                    LogicalRouterData.push(LR);
                }
            }
            return LogicalRouterData;
        };
        self.getProjectFqn = function(fqn) {
            if (null == fqn) {
                return getCookie('domain') + ':' +
                    getCookie('project');
            }
            return fqn;
        };
        self.isParentPort = function(selectedGridData) {
            var vlanTag = getValueByJsonPath(selectedGridData,
                       "virtual_machine_interface_properties;sub_interface_vlan_tag","");
            var vmiRefTo = getValueByJsonPath(selectedGridData,
                                "virtual_machine_interface_refs",[]);
            if (vmiRefTo.length > 0 && vlanTag == "") {
                return true;
            }
            return false;
        };
        self.getVMIRelation = function(selectedGridData) {
            var vlanTag = getValueByJsonPath(selectedGridData,
                       "virtual_machine_interface_properties;sub_interface_vlan_tag","");
            var vmiRefTo = getValueByJsonPath(selectedGridData,
                                "virtual_machine_interface_refs",[]);
            if (vmiRefTo.length > 0 && vlanTag == "") {
                return "primaryInterface";
            }
            if (vmiRefTo.length > 0 && vlanTag != "") {
                return "subInterface";
            }
            return "vmi";
        };

        /*
         * disablePolicyFormatter
         */
        self.disablePolicyFormatter = function(d, c, v, cd, dc) {
            return v && v.toString() === "true" ? "True" : "False";
        };

        self.formatNetworksData = function(portEditView, result, mode) {
            var formattedNetworks =
                self.networkDDFormatter(result),
                selectedVN, subnetDS;
            portEditView.model.setVNData(result);
            return formattedNetworks;
        };

        /*
         * @qosDropDownFormatter
         */
        self.qosDropDownFormatter = function(response) {
            var ddQoSDataSrc = [{text: "None", id: "none"}], qos,
            qosConfigs = getValueByJsonPath(response,
                "0;qos-configs",
                [], false);
            _.each(qosConfigs, function(qosConfig) {
                if("qos-config" in qosConfig) {
                    qos = qosConfig["qos-config"];
                    ddQoSDataSrc.push({
                        text: qos.name,
                        id: qos.fq_name && qos.fq_name.length === 3 ?
                                (qos.fq_name[0] +
                                cowc.DROPDOWN_VALUE_SEPARATOR + qos.fq_name[1]
                                + cowc.DROPDOWN_VALUE_SEPARATOR +
                                qos.fq_name[2]) : qos.uuid
                    });
                }
            });
            return ddQoSDataSrc;
        };

        /*
         * @qosExpansionFormatter
         */
        self.qosExpansionFormatter = function(d, c, v, cd, dc) {
            return getValueByJsonPath(dc, "qos_config_refs;0;to;2", "-");
        };

        /*
         * @bridgeDomainDDFormatter
         */
        self.bridgeDomainDDFormatter = function(response) {
            var bdDataSource = [{text: "None", id: "none"}], bdFqName,
                 bridgeDomains = getValueByJsonPath(response,
                                      "0;bridge-domains", [], false);
            _.each(bridgeDomains, function(bd) {
                bd = getValueByJsonPath(bd, "bridge-domain", {}, false);
                bdFqName = (bd.fq_name && bd.fq_name.length === 4) ?
                        bd.fq_name : null;
                if(bdFqName) {
                    bdDataSource.push({
                        text: bdFqName[3] + " (" + bdFqName[1] + ":" + bdFqName[2] + ")",
                        id: bdFqName[0] +
                            cowc.DROPDOWN_VALUE_SEPARATOR + bdFqName[1]
                            + cowc.DROPDOWN_VALUE_SEPARATOR +
                            bdFqName[2] + cowc.DROPDOWN_VALUE_SEPARATOR +
                            bdFqName[3]
                    });
                }
            });
            return bdDataSource;
        }

        /*
         * @bridgeDomainExpFormatter
         */
        self.bridgeDomainExpFormatter = function(d, c, v, cd, dc) {
            var bdToArray = getValueByJsonPath(dc,
                    'bridge_domain_refs;0;to', null, false),
                bdFqName = (bdToArray && bdToArray.length === 4) ?
                        bdToArray: null, formattedStr;
            if(bdFqName) {
                formattedStr =
                    bdFqName[3] + " (" + bdFqName[1] + ":" + bdFqName[2] + ")";
            } else {
                formattedStr = "-";
            }
            return formattedStr;
        };
        
        self.portTagFormatter = function(d, c, v, cd, dc) {
            var tags = "";
            var formattedtags = "", refList = [];
            var tags_ref = getValueByJsonPath(dc, "tag_refs", "");
            if(tags_ref != ""){
                var tags_ref_length = tags_ref.length;
                for(var i = 0; i < tags_ref_length; i++) {
                    var tags_ref_to = getValueByJsonPath(tags_ref[i], "to", "");
                    if(tags_ref_to.length === 3){
                        var reverseTagsData = tags_ref_to.reverse();
                        reverseTagsData = reverseTagsData[0];
                        var refText = '<span>'+ reverseTagsData.toString() +'</span>';
                    }
                    else if(tags_ref_to.length === 1){
                        var refText = '<span>global:'+ tags_ref_to +'</span>';
                    }
                    refList.push(refText);
                }
                if(refList.length > 0){
                    for(var l = 0; l< refList.length,l < 4; l++){
                        if(refList[l]) {
                        	tags += refList[l] + "<br>";
                        }
                    }
                    if (refList.length > 4) {
                    	tags += '<span class="moredataText" style="color: #393939 !important;cursor: default !important;">(' +
                            (refList.length-2) + ' more)</span> \
                            <span class="moredata" style="display:none;" ></span>';
                    }
                }else{
                	tags = '-';
                }
            }else{
            	tags = '-';
            }
            return tags;
        };
    }
    return PortFormatters;
});
