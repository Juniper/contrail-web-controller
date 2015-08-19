/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var LogicalRouterModel = ContrailModel.extend({
        defaultConfig: {
            'routerName': "",
            'uuid':"",
            'externalGatewayVal':"",
            'connectedNetworkArr':[],
            'lRouterStatus':"Up",
            'checkSNAT':"true",
            'idPermsUUID':"",
            'connectedNetworksVMI':[]
        },
        validations: {
            logicalRouterValidations: {
                'routerName': {
                    required: true,
                    msg: 'Enter a valid Router name.'
                }
            }
        },
        configureLogicalRouter: function (mode, allNetworksDS, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var network_subnet = allNetworksDS;
            if (this.model().isValid(true, "logicalRouterValidations")) {
                var newLRData = $.extend({},this.model().attributes);
                selectedValue = cobdcb.getSelectedValue();
                selectedDomain = selectedValue["domain"]["name"];
                selectedProject = selectedValue["project"]["name"];
                var lRouter = {};
                lRouter["logical-router"] = {};
                lRouter["logical-router"]["parent_type"] = "project";
                lRouter["logical-router"]["fq_name"] = [];
                lRouter["logical-router"]["fq_name"] = [selectedDomain,
                                                       selectedProject,
                                                       newLRData["routerName"]];
                var status = true;
                if(newLRData["lRouterStatus"] == "Down") {
                    status = false;
                }
                lRouter["logical-router"]["id_perms"] = {};
                lRouter["logical-router"]["id_perms"]["enable"] = status;
                                         ;
                lRouter["logical-router"]["virtual_network_refs"] = [];


                if(newLRData.externalGatewayVal != ""){
                    lRouter["logical-router"]["virtual_network_refs"][0] = {};
                    var obj = {};
                    extGatewayArray = newLRData.externalGatewayVal.split(",");
                    obj.to = extGatewayArray[0].split(":");
                    obj.uuid = extGatewayArray[1];
                    lRouter["logical-router"]["virtual_network_refs"][0] = obj;
                }
                var selConnectedNetworks = newLRData.connectedNetworkArr;
                if(selConnectedNetworks != "") {
                    selConnectedNetworks = selConnectedNetworks.split(",");
                } else {
                    selConnectedNetworks = [];
                }
                if(selConnectedNetworks.length > 0){
                    lRouter["logical-router"]["virtual_machine_interface_refs"]
                                             = [];
                }
                var inc = 0;
                for(var i=0; i<selConnectedNetworks.length; i++) {
                    var selectedSubnet = [];
                    var uuid = "";
                    var to = [];
                    var connectedNetworkValue = selConnectedNetworks[i];
                    for(var j = 0;j<network_subnet.length;j++){
                        if(network_subnet[j]["value"] == connectedNetworkValue){
                            selectedSubnet = network_subnet[j]["subnet"];
                        }
                    }
                    if(newLRData.connectedNetworksVMI.length > 0){
                        for(var tempInc = 0;
                                tempInc < newLRData.connectedNetworksVMI.length;
                                tempInc++){
                            if("virtual_network_refs" in
                                newLRData.connectedNetworksVMI[tempInc]){
                                if(newLRData.connectedNetworksVMI[tempInc]
                                    ["virtual_network_refs"][0]["to"].join(":")
                                    == connectedNetworkValue){
                                    uuid = newLRData.connectedNetworksVMI
                                           [tempInc]["uuid"];
                                    to = newLRData.connectedNetworksVMI
                                           [tempInc]["to"];
                                }
                            }
                        }
                    }
                    var curConnectedNetwork = connectedNetworkValue.split(":")
                    lRouter["logical-router"]["virtual_machine_interface_refs"]
                                             [i] = {};
                    var vmiRef = {};
                    if(uuid != "" ) {
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
                                                      curConnectedNetwork;
                        vmiRef["virtual_machine_interface_device_owner"] =
                                                    "network:router_interface";
                        if(selectedSubnet.length > 0){
                            var ipRef = vmiRef["instance_ip_back_refs"];
                            ipRef = [];
                            ipRef[0] = {};
                            ipRef[0]["instance_ip_address"] = [];
                            ipRef[0]["instance_ip_address"][0] = {};
                            ipRef[0]["instance_ip_address"][0]["fixedIp"] = "";
                            ipRef[0]["instance_ip_address"][0]["domain"] =
                                                           selectedDomain;
                            ipRef[0]["instance_ip_address"][0]["project"] =
                                                           selectedProject;
                        }
                    }
                    lRouter["logical-router"]
                           ["virtual_machine_interface_refs"][i] = vmiRef
                }
                var type = "";
                var url = "";
                if(mode == "add") {
                //create//
                    type = "POST";
                    url = ctwc.URL_LOGICAL_ROUTER_POST;
                } else {
                    type = "PUT";
                    lRouter["logical-router"]["uuid"] = newLRData["uuid"];
                    lRouter["logical-router"]["id_perms"]["uuid"] =
                                             newLRData["idPermsUUID"];
                    url = ctwc.get(ctwc.URL_LOGICAL_ROUTER_PUT,
                                   newLRData["uuid"]);
                }
                ajaxConfig = {};
                ajaxConfig.async = false;
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(lRouter);
                ajaxConfig.url = url;
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                                     (ctwl.LOGICAL_ROUTER_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteLogicalRouter: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = selectedGridData[0]["uuid"];
            ajaxConfig.async = false;
            ajaxConfig.type = "DELETE";
            ajaxConfig.data = JSON.stringify(selectedGridData[0]);
            ajaxConfig.url = "/api/tenants/config/logicalrouter/" + uuid;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }

    });
    return LogicalRouterModel;
});
