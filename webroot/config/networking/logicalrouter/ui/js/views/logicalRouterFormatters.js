/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var logicalRouterFormatters = function() {
        var self = this;
        this.idPermsFormater = function(d, c, v, cd, dc) {
            var adminState = "-";
            if(dc["id_perms"]["enable"] === true ){
                adminState = "Up";
            } else if(dc["id_perms"]["enable"] === false){
                adminState = "Down";
            }
            return adminState;
        };

        this.extGatewayFormater = function(d, c, v, cd, dc) {
            var extGateway = "-";
            if(dc["virtual_network_refs"] != "" &&
                        dc["virtual_network_refs"] != undefined &&
                        dc["virtual_network_refs"] != null){
                var domainName = breadcrumbSelectedObj.domain.name;
                var projectName = breadcrumbSelectedObj.project.name;
                var externalNet = dc["virtual_network_refs"][0]["to"];
                if(externalNet[0] == domainName &&
                   externalNet[1] == projectName){
                   extGateway = externalNet[2];
                } else {
                   extGateway = externalNet[2] + " (" +
                                externalNet[0] + ":" +
                                externalNet[1] +")";
                }
            }
            return extGateway;
        };
        this.interfaceDetailFormater = function(d, c, v, cd, dc) {
            var domainName = breadcrumbSelectedObj.domain.name;
            var projectName = breadcrumbSelectedObj.project.name;
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

        this.conNetworkFormater = function(d, c, v, cd, dc) {
            var connectedNetworks = "";
            if("virtual_machine_interface_refs" in dc &&
               dc["virtual_machine_interface_refs"] != null &&
               dc["virtual_machine_interface_refs"].length > 0) {
                var vmi_length = dc["virtual_machine_interface_refs"].length;
                var domainName = breadcrumbSelectedObj.domain.name;
                var projectName = breadcrumbSelectedObj.project.name;
                for(var i = 0; i < vmi_length && i < 3 ;i++) {
                    var vmiNetworks = dc["virtual_machine_interface_refs"]
                                        [i]["virtual_network_refs"][0]["to"];
                    if(connectedNetworks != "") {
                        connectedNetworks += ", ";
                    }
                    if(vmiNetworks[0] == domainName &&
                       vmiNetworks[1] == projectName){
                       connectedNetworks += vmiNetworks[2];
                    } else {
                       connectedNetworks += vmiNetworks[2]+" (" +
                                            vmiNetworks[0] +":"+
                                            vmiNetworks[1] +")";
                    }
                }
                if (vmi_length <= 0) {
                    connectedNetworks = "-";
                } if (vmi_length > 3) {
                    connectedNetworks += " " + (vmi_length-3) + " more";
                }
            } else {
                connectedNetworks = "-";
            }
            return connectedNetworks;
        };
        this.buildVMIObj = function(vmi,connectedNetworksVMI,
                                    selectedDomain, selectedProject) {
            var vmiRef = {};
            var uuid = null;
            var to = [];
            if(connectedNetworksVMI.length > 0){
                for(var tempInc = 0; tempInc < connectedNetworksVMI.length;
                                     tempInc++){
                    if("virtual_network_refs" in connectedNetworksVMI[tempInc]){
                        var vmi_vn =
                        connectedNetworksVMI[tempInc]["virtual_network_refs"];
                        if(vmi_vn["uuid"] == vmi.value){
                            uuid = vmi_vn[0]["uuid"];
                            to = vmi_vn[0]["to"];
                        }
                    }
                }
            }
            if(vmi.uuid != null ) {
                vmiRef["uuid"] = vmi.uuid;
                vmiRef["to"] = [];
                vmiRef["to"] = to;
            } else {
                vmiRef["parent_type"] = "project";
                vmiRef["fq_name"] = [];
                vmiRef["fq_name"][0] = selectedDomain;
                vmiRef["fq_name"][1] = selectedProject;
                vmiRef["virtual_network_refs"] = [];
                vmiRef["virtual_network_refs"][0] = {};
                vmiRef["virtual_network_refs"][0]["to"] =
                                              vmi.fqname.split(":");
                vmiRef["virtual_machine_interface_device_owner"] =
                                            "network:router_interface";
                if(vmi.subnet.length > 0){
                    var ipRef = [];
                    ipRef[0] = {};
                    ipRef[0]["instance_ip_address"] = [];
                    ipRef[0]["instance_ip_address"][0] = {};
                    ipRef[0]["instance_ip_address"][0]["fixedIp"] = "";
                    ipRef[0]["instance_ip_address"][0]["domain"] =
                                                   selectedDomain;
                    ipRef[0]["instance_ip_address"][0]["project"] =
                                                   selectedProject;
                    vmiRef["instance_ip_back_refs"] = ipRef;
                }
            }
            return vmiRef;
        }

        this.connectedNetworkParser_LR = function(results) {
            var returnNetwork = [];
            var selectedProjectName = breadcrumbSelectedObj.project.name;
            var localNetworks = results;
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                val = localNetwork.uuid;
                var networkText = "";
                var fq_name = localNetwork.fq_name.join(":");
                if(localNetwork.fq_name[1] != selectedProjectName){
                    networkText = localNetwork.fq_name[2] +
                                  " ("+localNetwork.fq_name[0]+":"+
                                  localNetwork.fq_name[1]+")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                if(localNetworks[j]["virtual-network"]["router_external"]
                    == false &&
                  "network_ipam_refs" in localNetworks[j]["virtual-network"] &&
                  localNetworks[j]["virtual-network"]
                                  ["network_ipam_refs"].length > 0){
                    var subnet = localNetwork["network_ipam_refs"];
                    returnNetwork.push({'text':networkText,
                                        'value':val,
                                        "fqname":fq_name,
                                        "subnet":subnet});
                }
            }

            return returnNetwork;
        }
        this.externalNetworkParser_LR = function(results) {
            var returnExternalNetwork = [];
            var selectedProjectName = breadcrumbSelectedObj.project.name;
            var localNetworks = results;
            returnExternalNetwork.push({'text':"None", 'value':""})
            for(var j=0;j < localNetworks.length;j++){
                var localNetwork = localNetworks[j]["virtual-network"];
                var val = localNetwork.fq_name.join(":");
                var uuid = localNetwork.uuid;
                var networkText = "";
                if(localNetwork.fq_name[1] != selectedProjectName){
                    networkText = localNetwork.fq_name[2] + " ("+
                                  localNetwork.fq_name[0] + ":" +
                                  localNetwork.fq_name[1] + ")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                returnExternalNetwork.push({'text':networkText,
                                            'value':uuid,
                                            'fqname':val})
            }
            return returnExternalNetwork;
        }
    }
    return logicalRouterFormatters;
});
