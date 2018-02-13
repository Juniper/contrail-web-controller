/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var FipPoolFormatters = function() {
        var self = this;
        //Start of grid data formating//
        //Grid column label: Network//
        //Grid column expand label : Network//
        self.networkFormater = function(d, c, v, cd, dc) {
            console.log("network called",network);
            var network = "-";
            network = getValueByJsonPath(dc, "fq_name;2", "-");
            return network;
        };
        self.networkDescriptionFormater = function(d, c, v, cd, dc) {
            var description = "-";
            description = getValueByJsonPath(dc, "id_perms;description", "-");
            return description;
        };
        //Grid column expand label : Name//
        self.fqNameFormater = function(d, c, v, cd, dc) {
            var fqname = "-";
            var fqNameData = getValueByJsonPath(dc, "fq_name", []);
            if(fqNameData.length >= 3){
                fqname = fqNameData[2];
            }
            return fqname;
        };
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
        self.getProjectFqn = function(fqn) {
            if (null == fqn) {
                return getCookie('domain') + ':' +
                    getCookie('project');
            }
            return fqn;
        };
        self.formatNetworksData = function(portEditView, result, mode) {
            var formattedNetworks =
                self.networkDDFormatter(result),
                selectedVN, subnetDS;
            portEditView.model.setVNData(result);
            return formattedNetworks;
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
    }
    return FipPoolFormatters;
});
