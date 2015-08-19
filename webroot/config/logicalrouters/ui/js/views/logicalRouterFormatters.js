/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var logicalRouterFormatters = function() {
        var self = this;

        this.LogicalRouterDataParser = function(response) {
            var LogicalRouterConfig = response.data;
            var idCount = 0;
            var LogicalRouterData = [];
            if(LogicalRouterConfig != null && LogicalRouterConfig != undefined){
                var LRLen = LogicalRouterConfig.length;
                for(var j=0;j < LRLen;j++) {
                    var logicalRouter =
                            LogicalRouterConfig[j]['logical-router'];
                    var vmUUIds = [];
                    var logicalObjectObj =
                            this.mapLogicalRouterData(logicalRouter);
                    LogicalRouterData.push({"Id":idCount++,
                        "routerName":logicalObjectObj.routerName,
                        "uuid":logicalObjectObj.uuid,
                        "externalGateway":logicalObjectObj.externalGateway,
                        "externalGatewayVal":
                                logicalObjectObj.externalGatewayValue,
                        "connectedNetwork":logicalObjectObj.connectedNetwork,
                        "connectedNetworkArr":
                                logicalObjectObj.connectedNetworkArr,
                        "connectedNetworksVMI":
                                logicalObjectObj.connectedNetworksVMI,
                        "InterfaceDetailArr":
                                logicalObjectObj.InterfaceDetailArr,
                        "InterfaceDetailString":
                                logicalObjectObj.InterfaceDetailString,
                        "lRouterStatus":logicalObjectObj.lRouterStatus,
                        "idPermsUUID":logicalObjectObj.idPermsUUID,
                        "checkSNAT":true
                    });
                }
            }
            return LogicalRouterData;
        };
        this.mapLogicalRouterData = function(LogicalRuter){
            var resultObject = {};
            var selectedDomainProject = cobdcb.getSelectedValue();
            var domainName = selectedDomainProject["domain"]["name"];
            var projectName = selectedDomainProject["project"]["name"];
            resultObject.routerName = LogicalRuter["fq_name"][2];
            resultObject.uuid = LogicalRuter["uuid"];
            resultObject.idPermsUUID = LogicalRuter["id_perms"]["uuid"];
            if(LogicalRuter["id_perms"]["enable"] === true ){
                resultObject.lRouterStatus = "Up";
            } else {
                resultObject.lRouterStatus = "Down";
            }
            resultObject.externalGatewayValue = "None"
            if(LogicalRuter["virtual_network_refs"] != "" &&
                        LogicalRuter["virtual_network_refs"] != undefined &&
                        LogicalRuter["virtual_network_refs"] != null){
                resultObject.externalGatewayValue =
                            (LogicalRuter["virtual_network_refs"]
                                         [0]["to"].join(":"));
                resultObject.externalGatewayValue += ","+
                            LogicalRuter["virtual_network_refs"][0]["uuid"];
                var externalNet = LogicalRuter["virtual_network_refs"][0]["to"];
                if (externalNet[0] == domainName &&
                   externalNet[1] == projectName) {
                   resultObject.externalGateway = externalNet[2];
                } else {
                   resultObject.externalGateway = externalNet[2]+
                                        " (" +externalNet[0] +":"+
                                        externalNet[1] +")";
                }
            }
            resultObject.connectedNetwork = "";
            resultObject.connectedNetworkArr = [];
            resultObject.InterfaceDetailArr = [];
            resultObject.InterfaceDetailString = "";
            resultObject.connectedNetworksVMI = [];
            if (LogicalRuter["virtual_machine_interface_refs"] != undefined &&
                     LogicalRuter["virtual_machine_interface_refs"] != ""){
                for (var inc = 0 ;
                     inc < LogicalRuter["virtual_machine_interface_refs"].length;
                     inc++) {
                    if("virtual_network_refs" in
                       LogicalRuter["virtual_machine_interface_refs"][inc]) {
                        var connectedNetwork =
                               LogicalRuter["virtual_machine_interface_refs"]
                               [inc]["virtual_network_refs"][0]["to"];
                        var uuid =
                               LogicalRuter["virtual_machine_interface_refs"]
                               [inc]["uuid"];
                        var network = "";
                        var ip = "";
                        if("instance_ip_back_refs" in
                           LogicalRuter["virtual_machine_interface_refs"][inc]
                           && LogicalRuter["virtual_machine_interface_refs"][inc]
                           ["instance_ip_back_refs"].length  > 0 &&
                           "ip" in LogicalRuter["virtual_machine_interface_refs"]
                           [inc]["instance_ip_back_refs"][0]){
                            ip = LogicalRuter["virtual_machine_interface_refs"]
                                 [inc]["instance_ip_back_refs"][0]["ip"];
                        }
                        resultObject.connectedNetworkArr.push(
                                     connectedNetwork.join(":"));
                        if(resultObject.connectedNetwork != "") {
                            resultObject.connectedNetwork += ", ";
                        }
                        if(connectedNetwork[0] == domainName &&
                           connectedNetwork[1] == projectName) {
                           resultObject.connectedNetwork += connectedNetwork[2];
                           network = connectedNetwork[2];
                        } else {
                           resultObject.connectedNetwork +=
                                              connectedNetwork[2] + " (" +
                                              connectedNetwork[0] + ":" +
                                              connectedNetwork[1] +")";
                           network = connectedNetwork[2] +" (" +
                                     connectedNetwork[0] + ":" +
                                     connectedNetwork[1] +")";;
                        }
                        resultObject.InterfaceDetailArr.push(
                                    {"uuid":uuid,"network":network,"ip":ip});
                        resultObject.InterfaceDetailString +=
                                     uuid + ", " + network + ", " + ip +"<br>";
                    }
                }
                resultObject.connectedNetworksVMI =
                             LogicalRuter["virtual_machine_interface_refs"];
            }
            return resultObject;
        };

        this.connectedNetworkParser_LR = function(results) {
            var returnNetwork = [];
            var project = cobdcb.getSelectedValue("project");
            var projectName = project["name"];
            var localNetworks = results;
            for(var j=0;j < localNetworks.length;j++){
                var val="";
                var localNetwork = localNetworks[j]["virtual-network"];
                val = localNetwork.fq_name.join(":")
                var networkText = "";
                var fq_name = localNetwork.fq_name.join(":");
                if(localNetwork.fq_name[1] != projectName){
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
            var project = cobdcb.getSelectedValue("project");
            var projectName = project["name"];
            var localNetworks = results;
            returnExternalNetwork.push({'text':"None", 'value':""})
            for(var j=0;j < localNetworks.length;j++){
                var localNetwork = localNetworks[j]["virtual-network"];
                var val = localNetwork.fq_name.join(":");
                val += ","+ localNetwork.uuid;
                var fq_name = localNetwork.fq_name.join(":");
                var networkText = "";
                if(localNetwork.fq_name[1] != projectName){
                    networkText = localNetwork.fq_name[2] + " ("+
                                  localNetwork.fq_name[0] + ":" +
                                  localNetwork.fq_name[1] + ")";
                } else {
                    networkText = localNetwork.fq_name[2];
                }
                returnExternalNetwork.push({'text':networkText,
                                            'value':val,
                                            'fq_name':fq_name})
            }
            return returnExternalNetwork;
        }
    }
    return logicalRouterFormatters;
});
