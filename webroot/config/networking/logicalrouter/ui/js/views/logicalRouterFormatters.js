/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var logicalRouterFormatters = function() {
        var self = this;
        this.idPermsFormatter = function(d, c, v, cd, dc) {
            var adminState = "-";
            if(dc["id_perms"]["enable"] === true ||
               dc["id_perms"]["enable"] === "true"){
                adminState = "Up";
            } else if(dc["id_perms"]["enable"] === false ||
                      dc["id_perms"]["enable"] === "false"){
                adminState = "Down";
            }
            return adminState;
        };

        this.extGatewayFormatter = function(d, c, v, cd, dc) {
            var extGateway = "-";
            if(dc["virtual_network_refs"] != "" &&
                        dc["virtual_network_refs"] != undefined &&
                        dc["virtual_network_refs"] != null){
                var domainName = ctwu.getGlobalVariable('domain').name;
                var projectName = ctwu.getGlobalVariable('project').name;
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
        this.showSNAT = function(d, c, v, cd, dc) {
            return "Enabled";
        }
        this.interfaceDetailFormatter = function(d, c, v, cd, dc) {
            var domainName = ctwu.getGlobalVariable('domain').name;
            var projectName = ctwu.getGlobalVariable('project').name;
            if("virtual_machine_interface_refs" in dc &&
               dc["virtual_machine_interface_refs"] != null &&
               dc["virtual_machine_interface_refs"].length > 0) {
                var vmi = dc["virtual_machine_interface_refs"];
                var vmi_len = vmi.length;
                var interfaceDetailStr = "<table class='col-xs-12 row-fluid'>";
                interfaceDetailStr +=
                              "<tr><th class='col-xs-3'>UUID</th>";
                interfaceDetailStr +=
                              "<th class='col-xs-3'>Network</th>";
                interfaceDetailStr +=
                              "<th class='col-xs-3'>IP</th></tr>";

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
                        interfaceDetailStr += ("<tr><td>" + uuid +
                                               "</td><td>" + network +
                                               "</td><td>" + ip+"<tr>");
                    }
                }
                interfaceDetailStr += "</table>";
            } else {
                interfaceDetailStr = "No Interface found.";
            }
            return interfaceDetailStr;
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

        this.conNetworkFormatter = function(d, c, v, cd, dc) {
            var connectedNetworks = "",
                vmiRefs = getValueByJsonPath(dc,
                        "virtual_machine_interface_refs", [], false);
            if(vmiRefs.length > 0) {
                var vmi_length = vmiRefs.length;
                var domainName = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var projectName = contrail.getCookie(cowc.COOKIE_PROJECT);
                for(var i = 0; i < vmi_length && i < 3 ;i++) {
                    var vmiNetworks = getValueByJsonPath(vmiRefs[i],
                            "virtual_network_refs;0;to", [], false);
                    if(vmiNetworks.length === 0) {
                        continue;
                    }
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
                    connectedNetworks += " (" + (vmi_length-3) + " more)";
                }
            }

            if(connectedNetworks == "") {
                connectedNetworks = "-";
            }
            return connectedNetworks;
        };
        this.physicalRouterFormatterExpand = function (d, c, v, cd, dc) {
            var formattedPRStr, physicalRouterRefs = getValueByJsonPath(dc,
                    'physical_router_refs;0;to', []);
            if(physicalRouterRefs.length === 2) {
                formattedPRStr = physicalRouterRefs[1]
            } else {
                formattedPRStr = 'None';
            }
            return formattedPRStr;
        }
        this.conNetworkFormatterExpand = function(d, c, v, cd, dc) {
            var connectedNetworks = "",
                vmiRefs = getValueByJsonPath(dc,
                        "virtual_machine_interface_refs", [], false);
            if(vmiRefs.length > 0) {
                var vmi_length = vmiRefs.length;
                var domainName = contrail.getCookie(cowc.COOKIE_DOMAIN)
                var projectName = contrail.getCookie(cowc.COOKIE_PROJECT);
                for(var i = 0; i < vmi_length;i++) {
                    var vmiNetworks = getValueByJsonPath(vmiRefs[i],
                            "virtual_network_refs;0;to", [], false);
                    if(vmiNetworks.length === 0){
                        continue;
                    }
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
                }
            }

            if(connectedNetworks == "") {
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
                        connectedNetworksVMI[tempInc]["virtual_network_refs"][0];
                        if(vmi_vn["uuid"] == vmi.value){
                            uuid = connectedNetworksVMI[tempInc]["uuid"];
                            to = connectedNetworksVMI[tempInc]["to"];
                        }
                    }
                }
            }
            if(uuid != null ) {
                vmiRef["uuid"] = uuid;
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

        this.connectedNetworkParser = function(results) {
            var returnNetwork = [];
            var selectedProjectName = ctwu.getGlobalVariable('project').name;
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
                    != true &&
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
        this.externalNetworkParser = function(results) {
            var returnExternalNetwork = [];
            var selectedProjectName = ctwu.getGlobalVariable('project').name;
            var localNetworks = results;
            returnExternalNetwork.push({'text':"None",
                                        'value':"None",
                                        'default':"true"})
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
