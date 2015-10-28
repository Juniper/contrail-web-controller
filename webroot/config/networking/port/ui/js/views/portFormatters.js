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
                for(var i = 0; i < instIP_length && i < 3 ;i++) {
                    var ip = getValueByJsonPath(instIP[i], "fixedip;ip", "");
                    instanceIP += ip;
                    if(instanceIP != "") {
                        instanceIP += "<br> ";
                    }
                }
                if(instIP_length > 3) {
                    instanceIP += "(" + Number(Number(instIP_length)-3)+" more)";
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
                for(var i = 0; i < fip_length && i < 3 ;i++) {
                    floatingIP += fipData[i]["floatingip"]["ip"];
                    if(floatingIP != "") {
                        floatingIP += "<br>";
                    }
                }
                if(fip_length > 3) {
                    floatingIP += "(" + Number(Number(fip_length)-3)+" more)";
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
                    instanceIP += instIP[i]["fixedip"]["ip"];
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
                dhcp = "<table><tr><td>Code</td><td>Value</td></tr>"
                for(var i = 0; i < dhcp_length;i++) {
                    var dhcpVal = dhcpVals[i];
                    dhcp += "<tr><td>";
                    dhcp += dhcpVal["dhcp_option_name"]
                    dhcp += "</td><td>";
                    dhcp += dhcpVal["dhcp_option_value"]
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
            if(staticRoutValues.length > 0 &&
               "sharedip" in staticRoutValues[0] &&
               "route" in staticRoutValues[0]["sharedip"] &&
               staticRoutValues[0]["sharedip"]["route"].length > 0) {
                var staticRout_length =
                    staticRoutValues[0]["sharedip"]["route"].length;
                for(var i = 0; i < staticRout_length;i++) {
                    var staticRoutVal =
                        staticRoutValues[0]["sharedip"]["route"][i];
                    if(staticRout != "") staticRout += ", ";
                    staticRout += staticRoutVal["prefix"];
                }
            } else {
                staticRout = "-";
            }
            return staticRout;
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
                    if(childrensUUID != "") childrensUUID += "<br>&nbsp;&nbsp;";
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
            if("virtual_machine_interface_refs" in dc &&
               (!("virtual_machine_interface_properties" in dc) ||
               ("sub_interface_vlan_tag" in
                dc["virtual_machine_interface_properties"] ))){
                var len = dc["virtual_machine_interface_refs"].length-1;
                for(var i=0;i<=len;i++){
                    if(parentUUIDFormatter != "") {
                        parentUUIDFormatter+="<br>&nbsp;&nbsp;";
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
                portModel.model.virtualNetworkToName(response[0].value);
            }
            return response;
        }
        /*
            Create / Edit Security Group drop down data formatter
        */
        this.sgDDFormatter = function(response, edit, portModel) {
            var sgList = [];
            var sg = response["security-groups"];
            var responseLen = sg.length;
            var defaultSelectedVal = [];
            var sgResponseVal = "";
            for(var i = 0; i < responseLen; i++) {
                var sgResponse = getValueByJsonPath(sg[i], 'fq_name', '');
                if(sgResponse != '') {
                    sgResponseVal = sgResponse.join(":");
                    var objArr = sgResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(sgResponse)
                    if(text == "default") {
                        defaultSelectedVal.push(sgResponseVal);
                    }
                    sgList.push({value: sgResponseVal, text: text});
                }
            }
            if(!edit) {
                //portModel.model.is_sec_grp = true;//KO stops working if we put this
                //portModel.model.is_sec_grp_disabled = false;
                portModel.model.securityGroupValue(defaultSelectedVal);
            }
            return sgList;
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
            if((!edit && returnComputeUUID.length > 0) ||
               (edit && portModel.model.deviceOwnerValue() != "compute")) {
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
            if((!edit && lrReturn.length > 0) ||
                (edit && portModel.model.deviceOwnerValue() != "router")) {
                portModel.model.logicalRouterValue(lrReturn[0].value);
            }
            return lrReturn;
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
                                      "instance_ip_back_refs;0;fixedipip", "");
                        if(fixedIp != "") {
                            subInterfaceParentText += fixedIp;
                        }
                        /*if(ip["instance_ip_back_refs"] != undefined &&
                            ip["instance_ip_back_refs"] != null &&
                            ip["instance_ip_back_refs"][0]["to"] != undefined &&
                            ip["instance_ip_back_refs"][0]["to"] != null){
                                subInterfaceParentText +=
                                ip["instance_ip_back_refs"][0]["fixedip"]["ip"];
                        }*/
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
                        subInterfaceParentDatas.push(
                                                {"text":subInterfaceParentText,
                                                "value":subInterfaceVMI});
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
    }
    return PortFormatters;
});
