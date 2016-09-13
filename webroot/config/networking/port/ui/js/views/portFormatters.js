/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var PortFormatters = function() {
        var self = this;
        ////Data formating with the result from API////
        //Getting all the data Inside virtual-machine-interface//
        this.formatVMIGridData = function(response){
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
        this.uuidWithName = function(d, c, v, cd, dc) {
            var uuidName = "-";
            var uuid = getValueByJsonPath(dc, "uuid", "")
            var name = getValueByJsonPath(dc, "fq_name;2", "")
            if(uuid != name){
                uuidName = name + " (" + uuid+ ")";
            } else {
                uuidName = uuid;
            }
            return uuidName;
        };
        //Start of grid data formating//
        //Grid column label: Network//
        //Grid column expand label : Network//
        this.networkFormater = function(d, c, v, cd, dc) {
            var network = "-";
            var vn_ref = getValueByJsonPath(dc, "virtual_network_refs", "")
            if(vn_ref != ""){
                network = ctwu.formatCurrentFQName(vn_ref[0]["to"])
            }
            return network;
        };
        //Grid column label: Fixed IP//
        this.fixedIPFormater = function(d, c, v, cd, dc) {
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
        this.floatingIPFormatter = function(d, c, v, cd, dc) {
            var floatingIP = "";
            var fipData = getValueByJsonPath(dc, "floating_ip_back_refs", []);
            if(fipData.length > 0) {
                var fip_length = fipData.length;
                for(var i = 0; i < fip_length && i < 2 ;i++) {
                    floatingIP += fipData[i]["floatingip"]["ip"];
                    if(floatingIP != "") {
                        floatingIP += "<br>";
                    }
                }
                if(fip_length > 2) {
                    floatingIP += "(" + Number(Number(fip_length)-2)+" more)";
                }
            } else {
                floatingIP = "-";
            }
            return floatingIP;
        };
        //Grid column label: Device//
        //Grid column expand label: Device//
        this.deviceOwnerFormatter = function(d, c, v, cd, dc) {
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
        this.fqNameFormater = function(d, c, v, cd, dc) {
            var fqname = "-";
            var fqNameData = getValueByJsonPath(dc, "fq_name", []);
            if(fqNameData.length >= 3){
                fqname = fqNameData[2];
            }
            return fqname;
        };
        //Grid column expand label: Admin State//
        this.AdminStateFormatter = function(d, c, v, cd, dc) {
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
        this.MACAddressFormatter = function(d, c, v, cd, dc) {
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
        this.localPrefFormater = function(d, c, v, cd, dc) {
            var localPref = "-";
            var localPrefValue = getValueByJsonPath(dc,
                                "virtual_machine_interface_properties;local_preference",
                                "")
            if(localPrefValue != ""){
                localPref = localPrefValue;
            }
            return localPref;
        };
        //Grid column expand label: Fixed IPs//
        this.fixedIPFormaterExpand = function(d, c, v, cd, dc) {
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
        this.floatingIPFormatterExpand = function(d, c, v, cd, dc) {
            var floatingIP = "";
            var fipData = getValueByJsonPath(dc, "floating_ip_back_refs", []);
            if(fipData.length > 0) {
                var fip_length = fipData.length;
                for(var i = 0; i < fip_length;i++) {
                    floatingIP += fipData[i]["floatingip"]["ip"];
                    if(floatingIP != "") {
                        floatingIP += "<br>";
                    }
                }
            } else {
                floatingIP = "-";
            }
            return floatingIP;
        };
        //Grid column expand label: Security Groups//
        this.sgFormater = function(d, c, v, cd, dc) {
            var sg = "";
            var domainName = ctwu.getGlobalVariable('domain').name;
            var projectName = ctwu.getGlobalVariable('project').name;
            var sgData = getValueByJsonPath(dc, "security_group_refs", []);
            if(sgData.length > 0) {
                var sg_length = sgData.length;
                for(var i = 0; i < sg_length;i++) {
                    if(sg != "") sg += ", ";
                    sg += ctwu.formatCurrentFQName(sgData[i]["to"]);
                    /*if(sgVal[0] == domainName &&
                       sgVal[1] == projectName){
                       sg += sgVal[2];
                    } else {
                       sg += sgVal.joint(":")
                    }*/
                }
            } else {
                sg = "-";
            }
            return sg;
        };
        //Grid column expand label: DHCP Options//
        this.DHCPFormatter = function(d, c, v, cd, dc) {
            var dhcp = "";
            var dhcpVals = getValueByJsonPath(dc,
                           "virtual_machine_interface_dhcp_option_list;dhcp_option",
                           "");
            if(dhcpVals != "" && dhcpVals.length > 0){
                var dhcp_length = dhcpVals.length;
                dhcp = "<table><tr><td>Code</td><td>Value</td><td>Value in Bytes</td></tr>"
                for(var i = 0; i < dhcp_length;i++) {
                    var dhcpVal = dhcpVals[i];
                    dhcp += "<tr><td>";
                    dhcp += dhcpVal["dhcp_option_name"];
                    dhcp += "</td><td>";
                    dhcp += dhcpVal["dhcp_option_value"] ?
                        dhcpVal["dhcp_option_value"] : "-";
                    dhcp += "</td><td>";
                    dhcp += dhcpVal["dhcp_option_value_bytes"] ?
                        dhcpVal["dhcp_option_value_bytes"] : "-";
                    dhcp += "</td></tr>";
                }
                dhcp += "</table>";
            } else {
                dhcp = "-";
            }
            return dhcp;
        };
        //Grid column expand label: Static Routes//
        this.staticRoutFormatter = function(d, c, v, cd, dc) {
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
        this.serviceHealthCheckFormatter = function(d, c, v, cd, dc) {
            var serviceHealthCheck = "";
            var serviceHealthCheckValues = getValueByJsonPath(dc,
                                   "service_health_check_refs",
                                   []);
            if(serviceHealthCheckValues.length > 0) {
                var serviceHealthChecklength = serviceHealthCheckValues.length;
                for(var i = 0; i < serviceHealthChecklength;i++) {
                    var serviceHealthCheckTo =
                        getValueByJsonPath(serviceHealthCheckValues[i], "to", []);
                    temp = ctwu.formatCurrentFQName(serviceHealthCheckTo);
                    serviceHealthCheck += temp;
                }
            } else {
                serviceHealthCheck = "-";
            }
            return serviceHealthCheck;
        };
        //Grid column expand label: Static Routes//
        this.ECMPHashingFormatter = function(d, c, v, cd, dc) {
            var ecmp = getValueByJsonPath(dc, "ecmp_hashing_include_fields", ""),
                dispStr = '-';
                fields = [];
            var hashingConfigured = getValueByJsonPath(ecmp,
                    'hashing_configured', false);
            if (hashingConfigured == false) {
                return fields;
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
            return dispStr;
        };
        //Grid column expand label: Fat Flow//
        this.FatFlowFormatter = function(d, c, v, cd, dc) {
            var fatFlow = "";
            var fatFlowData = getValueByJsonPath(dc,
                          "virtual_machine_interface_fat_flow_protocols;fat_flow_protocol",
                          []);
            if(fatFlowData.length > 0) {
                var fatFlow_length = fatFlowData.length;
                fatFlow = "<table><tr><td>Protocol</td><td>Port</td></tr>"
                for(var i = 0; i < fatFlow_length;i++) {
                    var fatFlowVal = fatFlowData[i];
                    fatFlow += "<tr><td>";
                    fatFlow += fatFlowVal["protocol"];
                    fatFlow += "</td><td>";
                    fatFlow += fatFlowVal["port"];
                    fatFlow += "</td></tr>";
                }
                fatFlow += "</table>";
            } else {
                fatFlow = "-";
            }
            return fatFlow;
        };
        //Grid column expand label: Port Binding//
        this.PortBindingFormatter = function(d, c, v, cd, dc) {
            var portBinding = "";
            var portBindingData = getValueByJsonPath(dc,
                          "virtual_machine_interface_bindings;key_value_pair",
                          []);
            if(portBindingData.length > 0) {
                var portBinding_length = portBindingData.length;
                portBinding = "<table><tr><td>Key</td><td>Value</td></tr>"
                for(var i = 0; i < portBinding_length;i++) {
                    var portBindingVal = portBindingData[i];
                    portBinding += "<tr><td>";
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
                portBinding += "</table>";
            } else {
                portBinding = "-";
            }
            return portBinding;
        };
        //Grid column expand label: Allowed address pairs//
        this.AAPFormatter = function(d, c, v, cd, dc) {
            var AAP = "";
            var AAPData = getValueByJsonPath(dc,
                          "virtual_machine_interface_allowed_address_pairs;allowed_address_pair",
                          []);
            if(AAPData.length > 0) {
                var AAP_length = AAPData.length;
                AAP = "Enabled<br><table><tr><td>IP</td><td>MAC</td></tr>"
                for(var i = 0; i < AAP_length;i++) {
                    var AAPVal = AAPData[i];
                    AAP += "<tr><td>";
                    AAP += AAPVal["ip"]["ip_prefix"] + "/" +
                           AAPVal["ip"]["ip_prefix_len"]
                    AAP += "</td><td>";
                    AAP += AAPVal["mac"];
                    AAP += "</td></tr>";
                }
                AAP += "</table>";
            } else {
                AAP = "Disabled";
            }
            return AAP;
        };
        //Grid column expand label: Mirror//
        this.mirrorFormatter = function(d, c, v, cd, dc) {
            var mirror = "";
            var mirrorDirection = getValueByJsonPath(dc,
                          "virtual_machine_interface_properties;interface_mirror;traffic_direction",
                          "");
            if (mirrorDirection != "") {
                mirror += this.addTableRow(["Mirror Direction", " : ", mirrorDirection]);
            }
            var mirrorObj = getValueByJsonPath(dc,
                          "virtual_machine_interface_properties;interface_mirror;mirror_to",
                          "");
            if (mirrorObj != "") {
                var temp = getValueByJsonPath(mirrorObj, "analyzer_name", "");
                mirror += this.addTableRow(["Analyzer Name", " : ", temp]);

                temp = getValueByJsonPath(mirrorObj, "analyzer_ip_address", "-");
                var temp1 = getValueByJsonPath(mirrorObj, "udp_port", "-");

                mirror += this.addTableRow(["Analyzer IP Address", " : ",
                                            temp + ", UDP port : " + temp1]);

                temp = getValueByJsonPath(mirrorObj, "routing_instance", "");
                if (temp != "") {
                    var routingInst = temp.split(":");
                    temp = ctwu.formatCurrentFQName(routingInst);
                } else {
                    temp = "-";
                }
                mirror += this.addTableRow(["Routing Instance", " : ", temp]);
            }
            if (mirror == "") {
                mirror = "-";
            } else {
                mirror = "<table>" + mirror + "</table>";
            }
            return mirror;
        };
        this.addTableRow = function(arr) {
            var str = "<tr>";
            var arrLen = arr.length;
            for (var i = 0; i < arr.length; i++) {
                str += "<td>"+arr[i]+"</td>";
            }
            str += "<tr>";
            return str;
        }
        //Grid column expand label: Device ID//
        this.deviceUUIDFormatter = function(d, c, v, cd, dc) {
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
        this.childrensUUID = function(d, c, v, cd, dc) {
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
        this.subInterfaceVXLANUUID = function(d, c, v, cd, dc) {
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
        this.parentUUIDFormatter = function(d, c, v, cd, dc) {
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
        this.isSubInterface = function(dc) {
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
        this.networkDDFormatter = function(response) {
            var domainName = ctwu.getGlobalVariable('domain').name;
            var projectName = ctwu.getGlobalVariable('project').name;
            var networkList = [];
            var responseLen = response.length;
            for(var i = 0; i < responseLen; i++) {
                var networkResponse =
                        getValueByJsonPath(response[i]["virtual-network"],
                        'fq_name', '');
                if(networkResponse != '') {
                    var objArr = networkResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(networkResponse)
                    var networkResponseVal = networkResponse.join(":");
                    networkList.push({value: networkResponseVal, text: text});
                }
            }
            return networkList;
        };
        this.vnDDFormatter = function(response, edit, portModel) {
            if(!edit && response.length > 0) {
                portModel.model.virtualNetworkName(response[0].value);
            }
            return response;
        }
        /*
            Create / Edit Security Group drop down data formatter
        */
        this.sgDDFormatter = function(response, edit, portEditView) {
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
                    text = ctwu.formatCurrentFQName(sgResponse)
                    sgList.push({value: sgResponseVal, text: text});
                }
            }
            return sgList;
        };
        /*
            Create / Edit StaticRout drop down data formatter
        */
        this.srDDFormatter = function(response, edit, portModel) {
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
                    text = ctwu.formatCurrentFQName(rtResponse)
                    rtList.push({value: rtResponseVal, text: text});
                }
            }
            return rtList;
        };
        /*
            Create / Edit Routing Instance drop down data formatter
        */
        this.routingInstDDFormatter = function(response, edit, portModel) {
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
                    text = ctwu.formatCurrentFQName(routingInstResponse)
                    routingInstList.push({value: routingInstResponseVal, text: text});
                }
            }
            return routingInstList;
        };
        /*
            Create / Edit Floating IP drop down data formatter
        */
        this.floatingIPDDFormatter = function(response) {
            var domainName = ctwu.getGlobalVariable('domain').name;
            var projectName = ctwu.getGlobalVariable('project').name;
            var floatingIPList = [];
            var floatingIP = response["floating_ip_back_refs"];
            var responseLen = floatingIP.length;
            var fip = {};
            var uuid = "";
            var to = [];
            var toStr = "";
            for(var i = 0; i < responseLen; i++) {
                fip = floatingIP[i]["floating-ip"];
                uuid = getValueByJsonPath(fip, 'uuid', '');
                fq_name = getValueByJsonPath(fip, 'fq_name', '');
                toStr = fq_name.join(":");
                var val = uuid + " " + toStr;
                if(fip != '') {
                    var fipText = "";
                    if(projectName != fip.fq_name[1]) {
                        fipText = fip.floating_ip_address +" ["+
                                      fip.fq_name[2] +":"+
                                      fip.fq_name[3] +" ("+
                                      fip.fq_name[0] +":"+
                                      fip.fq_name[1] + ")]";
                    } else {
                        fipText = fip.floating_ip_address +" ["+
                                  fip.fq_name[2] +":"+
                                  fip.fq_name[3]+"]";
                    }
                    floatingIPList.push({value: val, text: fipText});
                }
            }
            return floatingIPList;
        };
        /*
            Create / Edit Compute UUID drop down data formatter
        */
        this.subnetDDFormatter = function(response, edit, portModel) {
            if(!edit && response.length > 0) {
                portModel.model.subnet_uuid(response[0].value);
            }
            return response;
        }
        /*
            Create / Edit Compute UUID drop down data formatter
        */
        this.computeUUIDFormatter = function(response, edit, portModel) {
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
                deviceVMIValue = uuid +" "+to;
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
        this.routerFormater = function(response, edit, portModel) {
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
                    deviceLRArr = to +" "+ uuid;
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
        this.healthCheckDDFormatter = function(response, edit, portModel) {
            var healthCheckDataReturn = [];
            var healthCheckData = response[0]["service-health-checks"];
            var healthCheckLen = healthCheckData.length;
            var healthCheckVal = {};
            for(var i = 0; i < healthCheckLen; i++) {
                var healthCheckFQName = getValueByJsonPath(healthCheckData[i], 'fq_name', []);
                var healthCheckUUID = getValueByJsonPath(healthCheckData[i], 'uuid', '');
                if(healthCheckFQName.length > 0) {
                    healthCheckVal = healthCheckFQName.join(":") + " " + healthCheckUUID;
                    var text = ctwu.formatCurrentFQName(healthCheckFQName);
                    healthCheckDataReturn.push({value: healthCheckVal, text: text});
                }
            }
            return healthCheckDataReturn;
        }
        
        /*
            Create / Edit Sub Interface drop down data formatter
        */
        this.subInterfaceFormatter = function(response, edit, portModel) {
            var subInterfaceParentDatas = [];
            var selectedPortUUID = "";
            var selectedProject = ctwu.getGlobalVariable('project').name;

            var vmiArray = getValueByJsonPath(response, 'data', '');
            var vmiArrayLen = vmiArray.length;
            var subInterfaceParentDatas = [];
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
                       (subInterfaceProject == selectedProject)){
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
                        var subInterfaceVMI = uuid + " " + to;
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

        this.fixedIpSubnetDDFormatter = function(allNetworkData, selectedNetwork) {
            var selectedFqname = selectedNetwork;
            var fqname;
            var currentVNSubnetDetail = [];
            if(allNetworkData == null || allNetworkData.length <= 0) {
                return[];
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
            return currentVNSubnetDetail;
        }

        this.interfaceDetailFormater = function(d, c, v, cd, dc) {
            var domainName = ctwu.getGlobalVariable('domain').name;
            var projectName = ctwu.getGlobalVariable('project').name;
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
        this.LogicalRouterDataParser = function(response) {
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
        this.getProjectFqn = function(fqn) {
            if (null == fqn) {
                return getCookie('domain') + ':' +
                    getCookie('project');
            }
            return fqn;
        };
        this.isParentPort = function(selectedGridData) {
            var vlanTag = getValueByJsonPath(selectedGridData,
                       "virtual_machine_interface_properties;sub_interface_vlan_tag","");
            var vmiRefTo = getValueByJsonPath(selectedGridData,
                                "virtual_machine_interface_refs",[]);
            if (vmiRefTo.length > 0 && vlanTag == "") {
                return true;
            }
            return false;
        };
        this.getVMIRelation = function(selectedGridData) {
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
        this.disablePolicyFormatter = function(d, c, v, cd, dc) {
            return v && v.toString() === "true" ? "True" : "False";
        };
    }
    return PortFormatters;
});
