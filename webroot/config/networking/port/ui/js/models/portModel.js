
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/port/ui/js/views/portFormatters',
    'config/networking/port/ui/js/models/fixedIPModel',
    'config/networking/port/ui/js/models/allowAddressPairModel',
    'config/networking/port/ui/js/models/dhcpOptionModel',
    'config/networking/port/ui/js/models/fatFlowModel',
    'config/networking/port/ui/js/models/portBindingModel'
], function (_, ContrailModel, PortFormatters, FixedIPModel,
             AllowAddressPairModel, DHCPOptionModel, FatFlowModel,
             PortBindingModel) {
    var portFormatters = new PortFormatters();
    var self;
    var subnetDataSource = [];
    var allNetworks = [];
    var PortModel = ContrailModel.extend({
        defaultConfig: {
            'name': '',
            'fq_name': null,
            'parent_type': 'project',
            'id_perms':{'enable':true},
            'virtual_network_refs':[],
            'virtualNetworkName' : '',
            'is_sec_grp':true,
            //'is_sec_grp_disabled':false,
            'security_group_refs':[],
            'securityGroupValue':'',
            'floating_ip_back_refs':[],
            'floatingIpValue':'',
            'virtual_machine_interface_allowed_address_pairs':{
                        'allowed_address_pair':[]
                    },
            'allowedAddressPairCollection':[],
            'staticRoute':[],
            'virtual_machine_interface_device_owner':'',
            'deviceOwnerValue' : '',
            'logical_router_back_refs':[],
            'logicalRouterValue':'',
            'virtual_machine_refs':[],
            'virtualMachineValue':'',
            'virtual_machine_interface_mac_addresses':
                    {
                     'mac_address':[]
                    },
            'macAddress':'',
            'instance_ip_back_refs':[],
            'interface_route_table_refs':[],
            'virtual_machine_interface_dhcp_option_list':{'dhcp_option':[]},
            'dhcpOptionCollection':[],
            'virtual_machine_interface_fat_flow_protocols': {
                'fat_flow_protocol':[]
            },
            'virtual_machine_interface_bindings': {
                'key_value_pair':[]
            },
            'fatFlowCollection': [],
            'portBindingCollection': [],
            'virtual_machine_interface_properties':{'sub_interface_vlan_tag':''},
            'fixedIPCollection': [],
            'display_name': '',
            'virtual_machine_interface_refs': [],
            'disablePort':false,
            'is_sub_interface':false,
            'subInterfaceVMIValue':'',
            'templateGeneratorData': 'rawData',
            'disable_sub_interface' : false,
            'subnetGroupVisible': true
        },
        setVNData: function(allNetworks) {
            self.allNetworks = allNetworks;
        },
        getVNData: function() {
            return self.allNetworks;
        },
        setSubnetDataSource: function(subnetDataSource) {
            self.subnetDataSource = subnetDataSource;
        },
        formatModelConfig: function (config) {
            self = this;
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            //virtual Network
            var virtualNetwork = getValueByJsonPath(
                                 modelConfig,"virtual_network_refs;0;to",[]);
            if(virtualNetwork.length > 0) {
                modelConfig['virtualNetworkName'] = virtualNetwork.join(":");
            }

            //Modal config default Fqname formatting
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length >= 3) {
                modelConfig['name'] = modelConfig['fq_name'][2];
            }

            var mac = getValueByJsonPath(modelConfig,
                      "virtual_machine_interface_mac_addresses;mac_address;0","");
            if(mac != "") {
                modelConfig['macAddress'] =
                    modelConfig['virtual_machine_interface_mac_addresses']['mac_address'][0];
            }

            //Modal config default Securiety Group formatting
            var sgLen = modelConfig['security_group_refs'].length;
            var SG = "";
            var SGVal = "";
            modelConfig['securityGroupValue'] = [];
            for(var i=0;i<sgLen;i++) {
                SG = getValueByJsonPath(modelConfig['security_group_refs'][i],
                                         'to', '');
                if(SG != '') {
                    SGVal = SG.join(":");
                    modelConfig['securityGroupValue'].push(SGVal);
                }
            }
/*            if(modelConfig['security_group_refs'].length <= 0 &&
               modelConfig['is_sec_grp'] !== true) {
                modelConfig['is_sec_grp'] = false;
                modelConfig['is_sec_grp_disabled'] = true;
            }*/
            //Modal config default Floating IP formatting
            if(modelConfig['floating_ip_back_refs'].length > 0) {
                var floatingIPLen = modelConfig['floating_ip_back_refs'].length;
                var uuid = "";
                var to = "";
                var floatingIPVal = "";
                modelConfig['floatingIpValue'] = [];
                for(var i = 0; i < floatingIPLen; i++) {
                    uuid = getValueByJsonPath(
                           modelConfig['floating_ip_back_refs'][i], 'uuid', '');
                    to = getValueByJsonPath(
                         modelConfig['floating_ip_back_refs'][i], 'to', '');
                    var toStr = to.join(":");
                    if(uuid != '') {
                        modelConfig['floatingIpValue'].push(uuid + " " + toStr);
                    }
                }
            }

            //Modal config default Fixed IP formatting
            var fixedIPModels = [];
            var fixedipList = modelConfig["instance_ip_back_refs"];
            if(fixedipList != null && fixedipList.length > 0) {
                var fixedIPLen = fixedipList.length;
                var localDataSource = [];
                for(var i = 0; i < fixedIPLen; i++) {
                    var fixedIPobj = fixedipList[i];
                    var fixedIP_obj = {};
                    fixedIP_obj.subnetDataSource = [];
                    var val = JSON.stringify(
                              {"subnet_uuid":fixedIPobj.fixedip.subnet_uuid});
                    fixedIP_obj.subnetDataSource.push({'text':'',
                                        'value':val})
                    fixedIP_obj.fixedIp = fixedIPobj.fixedip.ip;
                    fixedIP_obj.subnet_uuid = fixedIPobj.fixedip.subnet_uuid;
                    fixedIP_obj.uuid = fixedIPobj.uuid;
                    fixedIP_obj.disableFIP = true;
                    fixedIP_obj.visibleSubnet = false;
                    var fixedIPModel = new FixedIPModel(fixedIP_obj);
                    fixedIPModels.push(fixedIPModel);
                }
            }
            var fixedIPCollectionModel = new Backbone.Collection(fixedIPModels);
            modelConfig["fixedIPCollection"] = fixedIPCollectionModel;
            modelConfig['instance_ip_back_refs'] = fixedIPCollectionModel;

            //Modal config default Allow Address pair formatting
            var aap = [];
            var aapList =
              modelConfig["virtual_machine_interface_allowed_address_pairs"]["allowed_address_pair"];
            if(aapList != null && aapList.length > 0) {
                var aapLen = aapList.length;
                for(var i = 0; i < aapLen; i++) {
                    var aap_obj = aapList[i];
                    var allowAddressPairModel =
                                         new AllowAddressPairModel(aap_obj);
                    aap.push(allowAddressPairModel);

                }
            }
            var appCollectionModel = new Backbone.Collection(aap);
            modelConfig['allowedAddressPairCollection'] = appCollectionModel;

            //Modal config default DHCP option formatting
            var DHCP = [];
            var dhcpList =
              modelConfig["virtual_machine_interface_dhcp_option_list"]["dhcp_option"];
            if(dhcpList != null && dhcpList.length > 0) {
                var dhcpLen = dhcpList.length;
                for(var i = 0; i < dhcpLen; i++) {
                    var dhcp_obj = dhcpList[i];
                    var dhcpVal = dhcpList[i].dhcp_option_value.split(" ");
                    if(dhcpVal.length > 1) {
                        var dhcpValLen = dhcpVal.length;
                        for(var j = 0; j < dhcpValLen; j++) {
                            var dhcp = {};
                            dhcp.dhcp_option_name = dhcpList[i].dhcp_option_name;
                            dhcp.dhcp_option_value = dhcpVal[j];
                            var dhcpOptionModel = new DHCPOptionModel(dhcp);
                            DHCP.push(dhcpOptionModel);
                        }
                    } else {
                        var dhcpOptionModel = new DHCPOptionModel(dhcp_obj);
                        DHCP.push(dhcpOptionModel);
                    }
                }
            }
            var dhcpCollectionModel = new Backbone.Collection(DHCP);
            modelConfig["virtual_machine_interface_dhcp_option_list"]["dhcp_option"]
                                                = dhcpCollectionModel;
            modelConfig['dhcpOptionCollection'] = dhcpCollectionModel;

            //Modal config default Static Route formatting
            var staticRoute = [];
            var srLen = modelConfig['interface_route_table_refs'].length;
            var SR = "";
            var SRVal = "";
            modelConfig['staticRoute'] = [];
            for(var i=0;i<srLen;i++) {
                SR = getValueByJsonPath(modelConfig['interface_route_table_refs'][i],
                                         'to', '');
                if(SR != '') {
                    SRVal = SR.join(":");
                    modelConfig['staticRoute'].push(SRVal);
                }
            }
            //Modal config default Fat Flow option formatting
            var fatFlows = [];
            var fatFlowList =
              modelConfig["virtual_machine_interface_fat_flow_protocols"]["fat_flow_protocol"];
            if(fatFlowList != null && fatFlowList.length > 0) {
                var fatFlowLen = fatFlowList.length;
                for(var i = 0; i < fatFlowLen; i++) {
                    var fatFlow_obj = fatFlowList[i];
                    var fatFlowModel = new FatFlowModel(fatFlow_obj);
                    this.enableDisablePort(fatFlowModel);
                    fatFlows.push(fatFlowModel);
                }
            }
            var fatFlowCollectionModel = new Backbone.Collection(fatFlows);
            modelConfig["virtual_machine_interface_fat_flow_protocols"]["fat_flow_protocol"]
                                                = fatFlowCollectionModel;
            modelConfig['fatFlowCollection'] = fatFlowCollectionModel;

            //Modal config default Port Binding formatting
            var portBinding = [];
            var portBindingList =
              modelConfig["virtual_machine_interface_bindings"]["key_value_pair"];
            if(portBindingList != null && portBindingList.length > 0) {
                var portBindingLen = portBindingList.length;
                for(var i = 0; i < portBindingLen; i++) {
                    var port_binding_obj = portBindingList[i];
                    if(port_binding_obj.key == "vnic_type" &&
                       port_binding_obj.value == "direct" ) {
                       port_binding_obj.key = "SR-IOV (vnic_type:direct)";
                    }
                    if(port_binding_obj.key == "SR-IOV (vnic_type:direct)" ||
                       port_binding_obj.key == "vnic_type" ||
                       port_binding_obj.key == "vif_type" ||
                       port_binding_obj.key == "vif_details") {
                        port_binding_obj.disablePortBindKey = true;
                    }
                    var portBindingModel = new PortBindingModel(port_binding_obj);
                    this.enableDisablePortBindingValue(portBindingModel, "edit");
                    portBinding.push(portBindingModel);
                }
            }
            var portBindingCollectionModel = new Backbone.Collection(portBinding);
            modelConfig["virtual_machine_interface_bindings"]["key_value_pair"]
                                                = portBindingCollectionModel;
            modelConfig['portBindingCollection'] = portBindingCollectionModel;


            //Modal config default Device Owner formatting
            var deviceOwnerValue = "none";
            var devOwner = modelConfig['virtual_machine_interface_device_owner'];
            if(devOwner == "network:router_interface"){
                // if it is Logical Router Device Owner
                deviceOwnerValue = "router";
                if("logical_router_back_refs" in modelConfig &&
                   modelConfig["logical_router_back_refs"].length > 0 ){
                    var deviceLRValue = [];
                    var logicalRouterTo =
                        getValueByJsonPath(modelConfig,
                                          "logical_router_back_refs;0;to", []);
                        var logicalRouterUUID =
                        getValueByJsonPath(modelConfig,
                                          "logical_router_back_refs;0;uuid", "");
                    if(logicalRouterTo.length > 0 && logicalRouterUUID != "") {
                        deviceLRValue = logicalRouterTo.join(":") +
                                        " " + logicalRouterUUID;
                        modelConfig["logicalRouterValue"] = deviceLRValue;
                        modelConfig["deviceRouterShow"] = true;
                    }
                }
            } else  if("compute" == devOwner.substring(0,7)){
                if("virtual_machine_refs" in modelConfig &&
                   modelConfig["virtual_machine_refs"].length >= 0 ){
                   // if it is VM for Device Owner
                    deviceOwnerValue = "compute";
                    var deviceVMIValue = [];
                    var vmRefTo = getValueByJsonPath(modelConfig,
                               "virtual_machine_refs;0;to", []);
                    var vmUUID = getValueByJsonPath(modelConfig,
                               "virtual_machine_refs;0;uuid", "");
                    if(vmRefTo.length > 0 && vmUUID != "") {
                        deviceVMIValue = vmUUID +" "+vmRefTo.join(":");
                        modelConfig["virtualMachineValue"] = deviceVMIValue;
                        modelConfig["deviceComputeShow"] = true;
                    }
                }
            } else if ("logical_interface_back_refs" in modelConfig) {
                var li = getValueByJsonPath(modelConfig,
                               "logical_interface_back_refs;0;to", []);
                if(li.length > 0) {
                    logicalInterfaceName = li[li.length-1];
                }
            }

            //Modal config default SubInterface formatting
            var vlanTag = getValueByJsonPath(modelConfig,
                           "virtual_machine_interface_properties;sub_interface_vlan_tag","");
            if(vlanTag != ""){
                if(vlanTag == "addSubInterface")
                    modelConfig["virtual_machine_interface_properties"]["sub_interface_vlan_tag"] = "";
                modelConfig["is_sub_interface"] = true;
                var vmiRefUUID = getValueByJsonPath(modelConfig,
                              "virtual_machine_interface_refs;0;uuid","");
                var vmiRefTo = getValueByJsonPath(modelConfig,
                              "virtual_machine_interface_refs;0;to",[]);
                if(vmiRefUUID != "" && vmiRefTo.length > 0) {
                    var subInterfaceVMI = vmiRefUUID + " " + vmiRefTo.join(":");
                    modelConfig["subInterfaceVMIValue"] = subInterfaceVMI;
                    modelConfig["disable_sub_interface"] = true;
                }
            }
            modelConfig['deviceOwnerValue'] = deviceOwnerValue;
            return modelConfig;
        },
        validations: {
            portValidations: {
                'virtualNetworkName': {
                    required: true,
                    msg: 'Enter a valid Network name.'
                },
                'virtual_machine_interface_properties.sub_interface_vlan_tag' :
                    function(value, attr, finalObj) {
                    if(finalObj.is_sub_interface == true) {
                        var vlantag = value;
                        if(vlantag == null){
                            return "VLAN.";
                        }
                        if(!isNumber(String(vlantag).trim())){
                            return "VLAN has to be a number.";
                        }
                        var vlanVal = Number(String(vlantag).trim());
                        if(vlanVal < 1 || vlanVal > 4094 ){
                            return "VLAN has to be between 1 to 4094";
                        }
                    }
                },
                'is_sub_interface': function(value, attr, finalObj) {
                    if(value == true && finalObj.deviceOwnerValue == "compute") { 
                        return "Subinterface cannot be assigned along with Compute Device Owner."
                    }
                },
                'subInterfaceVMIValue': function(value, attr, finalObj) {
                    if(finalObj.is_sub_interface == true &&
                        value.trim() == "" ) {
                            return "Sub Interface cannot be empty.";
                    }
                },
                'macAddress': function(value, attr, finalObj) {
                    if(value.trim() != "" && !isValidMACAddress(value)) {
                        return "Enter valid MAC Address";
                    }
                },
                'floatingIpValue': function(value, attr, finalObj) {
                    if(value.length > 0 &&
                       finalObj.deviceOwnerValue == "router") {
                        return "Floating Ip cannot be assigned to Router port";
                    }
                },
                'virtualMachineValue': function(value, attr, finalObj) {
                    if(value == "" &&
                       finalObj.deviceOwnerValue == "compute") {
                        return "Device Owner UUID cannot be empty.";
                    }
                },
                'logicalRouterValue': function(value, attr, finalObj) {
                    if(value == "" &&
                       finalObj.deviceOwnerValue == "router") {
                        return "Device Owner UUID cannot be empty.";
                    }
                },
                'portBindingCollection': function(value, attr, finalObj) {
                    if(value.length > 0) {
                        var portBindingLength = value.length;
                        var portBindingArr = [];
                        for(var i = 0; i < portBindingLength; i++) {
                            portBindingArr[i] = {};
                            if(value.models[i].attributes.key() ==
                               "SR-IOV (vnic_type:direct)") {
                                portBindingArr[i].key = "vnic_type";
                            } else {
                                portBindingArr[i].key =
                                        value.models[i].attributes.key();
                            }
                            portBindingArr[i].value =
                                value.models[i].attributes.value()
                            if(portBindingArr[i].key == "vnic_type" &&
                               portBindingArr[i].value == "direct" &&
                                finalObj.deviceOwnerValue != "compute") {
                                return "Device owner compute has to be set for SRIOV.";
                            }
                        }
                        var key1 = "", key2 = "";
                        for(var i = 0; i < portBindingLength-1; i++) {
                            key1 = portBindingArr[i].key;
                            for(var j = i+1; j < portBindingLength; j++) {
                                key2 = portBindingArr[j].key;
                                if(key1 == key2) {
                                    return "Duplicate value not allowed in Port binding";
                                }
                            }
                        }
                    }
                },
                'fixedIPCollection': function(value, attr, finalObj) {
                    if(value.length > 0) {
                        var fixedIPLength = value.length;
                        var key1 = "", key2 = "";
                        for(var i = 0; i < fixedIPLength-1; i++) {
                            key1 = value.models[i].attributes.subnet_uuid();
                            if(key1 != "") {
                                for(var j = i+1; j < fixedIPLength; j++) {
                                    key2 = value.models[j].attributes.subnet_uuid();
                                    if(key2 != "") {
                                        if(key1 == key2) {
                                            return "Duplicate value not allowed in Fixed IP";
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            }
        },
        // fixed IP collection Adding
        addFixedIP: function() {
            if(self.subnetDataSource.length > 0) {
                var fixedIPList = this.model().attributes['fixedIPCollection'];
                if(fixedIPList.length < self.subnetDataSource.length) {
                    var fixedIPModel = new FixedIPModel(
                        {
                            subnetDataSource: self.subnetDataSource,
                            subnet_uuid: self.subnetDataSource[0].value,
                            fixedIp: ""
                        }
                    );
                    /*var fixedIPModel = new FixedIPModel();
                    fixedIPModel.subnetDataSource= self.subnetDataSource;
                    fixedIPModel.subnet_uuid= self.subnetDataSource[0].value;*/
                    fixedIPList.add([fixedIPModel]);
                }
                /*var addbtn = $("#fixedIPCollection").find(".editable-grid-add-link")[0];
                if(addbtn != undefined) {
                    if(fixedIPList.length >= self.subnetDataSource.length) {
                        //remove the add Fixed IP Button
                        $(addbtn).addClass("hide");
                    } else {
                        $(addbtn).removeClass("hide");
                    }
                }*/
            }
        },
        //fixed IP Delete
        deleteFixedIP: function(data, fixedIP) {
            var fixedIPCollection = data.model().collection,
                delFixedIp = fixedIP.model();
                addbtn = $("#fixedIPCollection").find(".editable-grid-add-link")[0];
            $(addbtn).removeClass("hide");
            fixedIPCollection.remove(delFixedIp);
        },

        // Allow Address Pair Add
        addAAP: function() {
            var aapList = this.model().attributes['allowedAddressPairCollection'],
                allowAddressPairModel = new AllowAddressPairModel();
            aapList.add([allowAddressPairModel]);
        },
        //Allow Address Pair Delete
        deleteAAP: function(data, aap) {
            var aapCollection = data.model().collection,
                delAAP = aap.model();
            aapCollection.remove(delAAP);
        },

        // DHCP Add
        addDHCP: function() {
            var dhcpList = this.model().attributes['dhcpOptionCollection'],
                dhcpOptionModel = new DHCPOptionModel();
            dhcpList.add([dhcpOptionModel]);
        },
        //DHCP Delete
        deleteDHCP: function(data, dhcp) {
            var dhcpCollection = data.model().collection,
                delDHCP = dhcp.model();
            dhcpCollection.remove(delDHCP);
        },

        //Fat Flow Add
        addFatFlow: function() {
            var fatFlowList = this.model().attributes['fatFlowCollection'],
                fatFlowModel = new FatFlowModel();
            this.enableDisablePort(fatFlowModel);
            fatFlowList.add([fatFlowModel]);
        },
        //Fat Flow Delete
        deleteFatFlow: function(data, fatFlow) {
            var fatFlowCollection = data.model().collection,
                delFatFlow = fatFlow.model();
            fatFlowCollection.remove(delFatFlow);
        },
        //fat flow port disable
        enableDisablePort: function(fatFlowModel) {
            fatFlowModel.disablePort = ko.computed((function() {
                if(this.protocol() == "icmp") {
                    this.port("0");
                    return true;
                } else {
                    if(this.port() == "0") { 
                        this.port("");
                    }
                    return false;
                }
            }), fatFlowModel);
        },

        //Port Binding Add
        addPortBinding: function() {
            var portBindingList = this.model().attributes['portBindingCollection'],
                portBindingModel = new PortBindingModel();
                this.enableDisablePortBindingValue(portBindingModel, "add");
            portBindingList.add([portBindingModel]);
        },
        //Binding Delete
        deletePortBinding: function(data, binding) {
            var portBindingCollection = data.model().collection,
                delPortBinding = binding.model();
            if(delPortBinding.attributes.disablePortBindKey() == false) {
                portBindingCollection.remove(delPortBinding);
            }
        },
        //Binding value disable
        enableDisablePortBindingValue: function(portBindingModel, mode) {
            portBindingModel.disablePortBindValue = ko.computed((function() {
                if(mode == "edit") {
                    if((this.key() == "vnic_type" ||
                       this.key() == "vif_type" ||
                       this.key() == "vif_details") && this.disablePortBindKey()) {
                       return true;
                    } else if(this.key() == "SR-IOV (vnic_type:direct)") {
                        this.value("direct");
                        return true
                    }
                } else if(mode == "add") {
                    if(this.key() == "SR-IOV (vnic_type:direct)") {
                       this.value("direct");
                       return true;
                    }
                }
                return false
            }), portBindingModel);
        },

        groupBy: function(array, f) {
            var groups = {};
            array.forEach( function(o) {
                var group = JSON.stringify( f(o) );
                groups[group] = groups[group] || [];
                groups[group].push(o);
            });
            return Object.keys(groups).map( function( group )
            {
              return groups[group];
            })
        },
        configurePorts: function (mode, allNetworksDS, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var network_subnet = allNetworksDS;
            var temp_val;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'portValidations'
                },
                {
                    key : 'fixedIPCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'fixedIPValidations'
                },
                {
                    key : 'allowedAddressPairCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'allowedAddressPairValidations'
                },
                {
                    key : 'dhcpOptionCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'dhcpValidations'
                },
                {
                    key : 'fatFlowCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'fatFlowValidations'
                },
                {
                    key : 'portBindingCollection',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'portBindingValidations'
                }
            ];
            if(this.isDeepValid(validations)) {
                var newPortData = $.extend(true, {}, this.model().attributes),
                    selectedDomain = ctwu.getGlobalVariable('domain').name,
                    selectedProject = ctwu.getGlobalVariable('project').name;
                newPortData.fq_name = [selectedDomain,
                                     selectedProject];
                if(newPortData["name"].trim() != ""){
                    newPortData["fq_name"][2] = newPortData["name"].trim();
                    newPortData["display_name"] = newPortData["name"].trim();
                } else {
                    delete(newPortData["name"]);
                    delete(newPortData["display_name"]);
                }
                var id_perms = JSON.parse(newPortData.id_perms.enable);
                newPortData.id_perms = {};
                newPortData.id_perms.enable = id_perms;
                var selectedVN = newPortData["virtualNetworkName"].split(":");
                temp_val = getValueByJsonPath(newPortData,
                           "virtual_network_refs;0;to","");
                if(temp_val == "") {
                   newPortData["virtual_network_refs"][0] = {};
                }
                newPortData["virtual_network_refs"][0]["to"] = selectedVN;
                temp_val = getValueByJsonPath(newPortData,
                           "virtual_network_refs;0;href","");
                if(temp_val != "") {
                    delete(newPortData.virtual_network_refs[0].href)
                }
                temp_val = getValueByJsonPath(newPortData,
                           "virtual_network_refs;0;attr","");
                if(temp_val != "") {
                    delete(newPortData.virtual_network_refs[0].attr)
                }
        //Security Group
                var sgData = getValueByJsonPath(newPortData,
                           "securityGroupValue","");
                if(newPortData.is_sec_grp == true && sgData != "") {
                    var msSGselectedData = sgData.split(",");
                    if (msSGselectedData && msSGselectedData.length > 0) {
                        newPortData.security_group_refs = []
                        for (var i = 0; i < msSGselectedData.length; i++) {
                            if(msSGselectedData[i] != "") {
                                var sgDta = (msSGselectedData[i]).split(":");
                                var sgval = {};
                                sgval.to = sgDta;
                                newPortData.security_group_refs.push(sgval);
                            }
                        }
                    }
                } else {
                    newPortData.security_group_refs = [];
                }
        //Allow Address Pair
                var aapCollection =
                      newPortData["allowedAddressPairCollection"].toJSON();
                newPortData.virtual_machine_interface_allowed_address_pairs = {};
                if (aapCollection && aapCollection.length > 0) {
                    var aapLocal = [];
                    for(i = 0 ; i< aapCollection.length ; i++){
                        aapLocal[i] = {};
                        var prefix = 32;
                        var ip = aapCollection[i].ipPrefixVal();
                        aapLocal[i]["mac"] = aapCollection[i].mac();
                        if(ip != ""){
                            aapLocal[i]["ip"] = {};
                            if(ip.split("/").length == 2) {
                                prefix = Number(ip.split("/")[1]);
                                ip = ip.split("/")[0];
                            }
                            aapLocal[i]["ip"]["ip_prefix"] = ip;
                            aapLocal[i]["ip"]["ip_prefix_len"] = prefix;
                        }
                        aapLocal[i]["address_mode"] = "active-standby";
                    }
                    newPortData.virtual_machine_interface_allowed_address_pairs.allowed_address_pair = aapLocal;
                }

                var mac = macAddress;
                if(mac != "") {
                    newPortData['virtual_machine_interface_mac_addresses']['mac_address'][0]
                                 = newPortData['macAddress'];
                    delete(newPortData['macAddress']);
                }
        //Fat Flow
                var fatFlowCollection =
                      newPortData["fatFlowCollection"].toJSON();
                newPortData.virtual_machine_interface_fat_flow_protocols = {};
                if (fatFlowCollection && fatFlowCollection.length > 0) {
                    var fatFlowLocal = [];
                    for(i = 0 ; i< fatFlowCollection.length ; i++){
                        fatFlowLocal[i] = {};
                        fatFlowLocal[i]["protocol"] = fatFlowCollection[i].protocol();
                        fatFlowLocal[i]["port"] = Number(fatFlowCollection[i].port());
                    }
                    newPortData.virtual_machine_interface_fat_flow_protocols.fat_flow_protocol = fatFlowLocal;
                }
        //Port Binding
                var portBindingCollection =
                      newPortData["portBindingCollection"].toJSON();
                if (portBindingCollection && portBindingCollection.length > 0) {
                    newPortData.virtual_machine_interface_bindings = {};
                    var portBindingLocal = [];
                    for(i = 0 ; i< portBindingCollection.length ; i++){
                        portBindingLocal[i] = {};
                        if(portBindingCollection[i].key() == "SR-IOV (vnic_type:direct)") {
                            portBindingLocal[i]["key"] = "vnic_type";
                        } else {
                            portBindingLocal[i]["key"] = portBindingCollection[i].key();
                        }
                        portBindingLocal[i]["value"] = portBindingCollection[i].value();
                    }
                    newPortData.virtual_machine_interface_bindings.key_value_pair = portBindingLocal;
                }
        //DHCP
                var allDHCPValues = newPortData["dhcpOptionCollection"].toJSON();
                newPortData.virtual_machine_interface_dhcp_option_list = {};
                if (allDHCPValues && allDHCPValues.length > 0) {
                    var unGroupedDHCPOptionsList = [];
                    var dhcpLen = allDHCPValues.length;
                    for(i = 0; i < dhcpLen; i++){
                        var dhcpCode = allDHCPValues[i].dhcp_option_name();
                        var dhcpValue = allDHCPValues[i].dhcp_option_value();
                        unGroupedDHCPOptionsList[i] = {};
                        unGroupedDHCPOptionsList[i]["dhcp_option_name"] =
                                                   dhcpCode.trim();
                        unGroupedDHCPOptionsList[i]["dhcp_option_value"] =
                                                   dhcpValue.trim();
                    }
                    if(unGroupedDHCPOptionsList.length > 0) {
                        var groupedDHCPOptionsList =
                            self.groupBy(unGroupedDHCPOptionsList, function(item)
                            { return [item.dhcp_option_name]; });
                        if (groupedDHCPOptionsList &&
                            groupedDHCPOptionsList != "" &&
                            groupedDHCPOptionsList.length > 0) {
                            returnDHCPOptionsList = [];
                            for (var i = 0; i < groupedDHCPOptionsList.length;
                                i++) {
                                var dhcpOptionsOfSameValue =
                                    jsonPath(groupedDHCPOptionsList[i],
                                    "$.*.dhcp_option_value");
                                if(dhcpOptionsOfSameValue === false)
                                    dhcpOptionsOfSameValue = "";
                                else {
                                    dhcpOptionsOfSameValue =
                                               dhcpOptionsOfSameValue.join(" ");
                                }
                                if(typeof dhcpOptionsOfSameValue === "string" &&
                                   dhcpOptionsOfSameValue.trim() !== "") {
                                        returnDHCPOptionsList.push({
                                        "dhcp_option_name":
                                            groupedDHCPOptionsList[i][0]['dhcp_option_name'],
                                        "dhcp_option_value":
                                            dhcpOptionsOfSameValue
                                        });
                                }
                            }
                            if(returnDHCPOptionsList.length > 0)
                                newPortData.virtual_machine_interface_dhcp_option_list.dhcp_option
                                    = returnDHCPOptionsList;
                        }
                    }
                } else {
                    delete(newPortData.virtual_machine_interface_dhcp_option_list.dhcp_option);
                }
                newPortData.interface_route_table_refs = [];
        // Static Route
                var staticRoute = getValueByJsonPath(newPortData,
                           "staticRoute","");
                if(staticRoute != "") {
                    var msSRselectedData = staticRoute.split(",");
                    if (msSRselectedData && msSRselectedData.length > 0) {
                        newPortData.interface_route_table_refs = []
                        for (var i = 0; i < msSRselectedData.length; i++) {
                            if(msSRselectedData[i] != "") {
                                var srDta = (msSRselectedData[i]).split(":");
                                var srval = {};
                                srval.to = srDta;
                                newPortData.interface_route_table_refs.push(srval);
                            }
                        }
                    }
                } else {
                    newPortData.interface_route_table_refs = [];
                }
        /* Fixed IP*/
        var allFixedIPCollectionValue =
                      newPortData["fixedIPCollection"].toJSON();
        newPortData.instance_ip_back_refs = [];
        if (allFixedIPCollectionValue && allFixedIPCollectionValue.length > 0) {
            newPortData.instance_ip_back_refs = [];
            var allFixedIPLen = allFixedIPCollectionValue.length;
            var fixedIPArr = [];
            for(i = 0 ; i< allFixedIPLen ; i++){
                var subnet_uuid = "";
                var instanceIp = {};
                var family = "v4";
                if(allFixedIPCollectionValue[i].disableFIP() == true) {
                    //edit case
                    var oldData = newPortData.rawData.instance_ip_back_refs;
                    var oldDataLen = oldData.length;
                    for(var j=0; j <= oldDataLen;j++) {
                        var fixedIP = allFixedIPCollectionValue[i].fixedIp();
                        if(fixedIP == oldData[j].fixedip.ip) {
                            subnet_uuid = oldData[j]["fixedip"]["subnet_uuid"];
                            instanceIp.fixedIp = allFixedIPCollectionValue[i].fixedIp();
                            instanceIp.domain = selectedVN[0];
                            instanceIp.project = selectedVN[1];
                            if(isIPv4(fixedIP)){
                                family = "v4";
                            } else if(isIPv6(fixedIP)){
                                family = "v6";
                            }
                            break;
                        }
                    }
                } else {
                //Add case
                    var obj =
                        JSON.parse(allFixedIPCollectionValue[i].subnet_uuid());
                    subnet_uuid = obj.subnet_uuid;
                    instanceIp.fixedIp = allFixedIPCollectionValue[i].fixedIp();
                    instanceIp.domain = selectedVN[0];
                    instanceIp.project = selectedVN[1];
                    var subnetIP = obj.default_gateway;
                    if(isIPv4(subnetIP)){
                        family = "v4";
                    } else if(isIPv6(subnetIP)){
                        family = "v6";
                    }
                }

                fixedIPArr[i] = {};
                fixedIPArr[i]["instance_ip_address"] = [];
                fixedIPArr[i]["instance_ip_address"][0] = {};
                fixedIPArr[i]["instance_ip_address"][0] = instanceIp;
                fixedIPArr[i]["subnet_uuid"] = subnet_uuid;
                fixedIPArr[i]["instance_ip_family"] = family;
                
                if(allFixedIPCollectionValue[i].disableFIP() == true) {
                    fixedIPArr[i]["uuid"] =
                                 allFixedIPCollectionValue[i]["uuid"]();
                }
            }
            newPortData.instance_ip_back_refs = fixedIPArr;
        }
        //delete(newPortData.instance_ip_back_refs);

                if(newPortData.deviceOwnerValue == "none"){
                    newPortData["virtual_machine_interface_device_owner"] = "";
                    newPortData.virtual_machine_refs = [];
                    newPortData.logical_router_back_refs = [];
                } else if(newPortData.deviceOwnerValue == "router"){
                    newPortData.virtual_machine_interface_device_owner =
                                                     "network:router_interface";
                    newPortData.logical_router_back_refs = [];
                    newPortData.virtual_machine_refs = [];
                    var deviceUUIDArr =
                        newPortData.logicalRouterValue.split(" ");
                    var to = deviceUUIDArr[0].split(":");
                    var uuid = deviceUUIDArr[1];
                    newPortData.logical_router_back_refs[0] = {};
                    newPortData.logical_router_back_refs[0].to = to;
                    newPortData.logical_router_back_refs[0].uuid = uuid;
                    //delete(newPortData.logicalRouterValue);
                } else if(newPortData.deviceOwnerValue == "compute"){
                     if(newPortData.virtual_machine_interface_device_owner.substring(0,7)
                        != "compute") {
                        newPortData.virtual_machine_interface_device_owner = "compute:nova";
                    }
                    newPortData.logical_router_back_refs = [];
                    newPortData.virtual_machine_refs = [];
                    var deviceuuidval = newPortData.virtualMachineValue;

                    var deviceUUIDArr = deviceuuidval.split(" ");
                    var uuid = deviceUUIDArr[0];
                    newPortData.virtual_machine_refs[0] = {};
                    newPortData.virtual_machine_refs[0].uuid = uuid;
                    if(deviceUUIDArr[1] != null) {
                        var to = deviceUUIDArr[1].split(":");
                        newPortData.virtual_machine_refs[0].to = to;
                    }
                }

        // Floating IP
                var allfloatingIP = newPortData.floatingIpValue.split(",")
                newPortData["floating_ip_back_refs"] = [];
                if (newPortData.floatingIpValue != "" &&
                    allfloatingIP && allfloatingIP.length > 0) {
                    var allfloatingIPVal = [];
                    var floatingip = [];
                    var to = [];
                    var uuid = "";
                    var floatingipLen = allfloatingIP.length;
                    for (var i = 0; i < floatingipLen; i++) {
                        floatingip = allfloatingIP[i].split(" ");
                        uuid = floatingip[0];
                        to = floatingip[1].split(":");
                        newPortData.floating_ip_back_refs[i] = {};
                        newPortData.floating_ip_back_refs[i]["to"] = to;
                        newPortData.floating_ip_back_refs[i]["uuid"] = uuid;
                    }
                }
        //Subinterface
                if (newPortData.is_sub_interface) {
                    newPortData.virtual_machine_interface_properties.sub_interface_vlan_tag =
                    parseInt(newPortData.virtual_machine_interface_properties.sub_interface_vlan_tag);
                    var subIntrface = newPortData.subInterfaceVMIValue.split(" ");
                    var uuid = subIntrface[0];
                    var to = subIntrface[1].split(":");
                    newPortData.virtual_machine_interface_refs[0] = {};
                    newPortData.virtual_machine_interface_refs[0].uuid = uuid;
                    newPortData.virtual_machine_interface_refs[0].to = to;
                } else {
                    newPortData.virtual_machine_interface_properties = {};
                    newPortData.virtual_machine_interface_refs = [];
                    //if(selectedParentVMIObject.length > 0) {
                    //    newPortData["virtual_machine_interface_refs"] = selectedParentVMIObject;
                    //}
                }


                //Delete Unwanted data.
                temp_val = getValueByJsonPath(newPortData,
                           "virtual_machine_interface_properties;sub_interface_vlan_tag",
                           "");
                if(temp_val ==  ""){
                    delete(newPortData.virtual_machine_interface_properties.sub_interface_vlan_tag);
                }
                temp_val = getValueByJsonPath(newPortData,"virtual_machine_interface_allowed_address_pairs;allowed_address_pair","");
                if(temp_val ==  ""){
                    delete(newPortData.virtual_machine_interface_allowed_address_pairs.allowed_address_pair);
                }
                temp_val = getValueByJsonPath(newPortData,
                           "logical_router_back_refs","");
                if(temp_val ==  ""){
                    delete(newPortData.logical_router_back_refs);
                }
                temp_val = getValueByJsonPath(newPortData,
                           "virtual_machine_refs","");
                if(temp_val ==  ""){
                    delete(newPortData.virtual_machine_refs);
                }
                temp_val = getValueByJsonPath(newPortData,
                    "virtual_machine_interface_mac_addresses;mac_address;0","");
                if(temp_val ==  ""){
                    delete(newPortData.virtual_machine_interface_mac_addresses);
                }

                temp_val = getValueByJsonPath(newPortData,
                   "virtual_machine_interface_dhcp_option_list;dhcp_option","");
                if(temp_val ==  ""){
                    delete(newPortData.virtual_machine_interface_dhcp_option_list.dhcp_option);
                }
                temp_val = getValueByJsonPath(newPortData,
                           "routing_instance_refs","");
                if(temp_val !=  ""){
                    delete(newPortData.routing_instance_refs);
                }
                delete(newPortData.virtualNetworkName);
                delete(newPortData.macAddress);
                delete(newPortData.is_sec_grp);
                delete(newPortData.is_sec_grp_disabled);
                delete(newPortData.is_sub_interface);
                delete(newPortData.securityGroupValue);
                delete(newPortData.floatingIpValue);
                delete(newPortData.allowedAddressPairCollection);
                delete(newPortData.fatFlowCollection);
                delete(newPortData.portBindingCollection);
                delete(newPortData.staticRoute);
                delete(newPortData.deviceOwnerValue);
                delete(newPortData.logicalRouterValue);
                delete(newPortData.virtualMachineValue);
                delete(newPortData.dhcpOptionCollection);
                delete(newPortData.fixedIPCollection);
                delete(newPortData.subInterfaceVMIValue);
                delete(newPortData.errors);
                delete(newPortData.cgrid);
                delete(newPortData.templateGeneratorData);
                delete(newPortData.elementConfigMap);
                delete(newPortData.locks);
                delete(newPortData.rawData);
                delete(newPortData.vmi_ref);
                delete(newPortData.perms2);
                delete(newPortData.disablePort);
                delete(newPortData.disable_sub_interface);
                delete(newPortData.subnetGroupVisible);
                if("parent_href" in newPortData) {
                    delete(newPortData.parent_href);
                }
                if("parent_uuid" in newPortData) {
                    delete(newPortData.parent_uuid);
                }
                if("href" in newPortData) {
                    delete(newPortData.href);
                }
                if(newPortData.name == "") {
                    delete(newPortData.href);
                }

                var type = "";
                var url = "";
                if(mode == "add" || mode == "subInterface") {
                //create//
                    type = "POST";
                    delete(newPortData["uuid"]);
                    url = ctwc.URL_PORT_POST;
                } else {
                    type = "PUT";
                    url = ctwc.get(ctwc.URL_PORT_PUT,
                                   newPortData["uuid"]);
                }
                vmiData = {};
                vmiData["virtual-machine-interface"] = {};
                vmiData["virtual-machine-interface"] = newPortData;

                ajaxConfig = {};
                ajaxConfig.async = false;
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(vmiData);
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
                                     (ctwl.PORT_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deletePort: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var delDataID = [];
            for(var i=0;i<selectedGridData.length;i++) {
                delDataID.push(selectedGridData[i]["uuid"]);
            }
             var sentData = [{"type": "virtual-machine-interface",
                              "deleteIDs": delDataID}];
            ajaxConfig.async = false;
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(sentData);
            ajaxConfig.url = "/api/tenants/config/delete";
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        },
        deleteAllPort: function(callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = ctwu.getGlobalVariable('project').uuid;
            ajaxConfig.async = false;
            ajaxConfig.type = "DELETE";
            ajaxConfig.url = "/api/tenants/config/delete-all-ports?uuid="+uuid;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return PortModel;
});
