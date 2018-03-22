
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/port/ui/js/views/portFormatters',
    'config/networking/port/ui/js/models/fixedIPModel',
    'config/networking/port/ui/js/models/allowAddressPairModel',
    'config/networking/port/ui/js/models/dhcpOptionModel',
    'config/common/ui/js/models/fatFlowModel',
    'config/networking/port/ui/js/models/portBindingModel'
], function (_, ContrailConfigModel, PortFormatters, FixedIPModel,
             AllowAddressPairModel, DHCPOptionModel, FatFlowModel,
             PortBindingModel) {
    var portFormatters = new PortFormatters();
    var self;
    var PortModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'display_name': null,
            'fq_name': null,
            'parent_type': 'project',
            'id_perms':{'enable':true},
            'virtual_network_refs':[],
            'virtualNetworkName' : '',
            'port_security_enabled': true,
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
            'security_logging_object_refs':[],
            'virtualMachineValue':'',
            'service_health_check_refs':'',
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
            'virtual_machine_interface_properties':{
                'sub_interface_vlan_tag':'',
                'local_preference' : "",
                'interface_mirror' : {
                    'traffic_direction' : "both",
                    'mirror_to' : {
                        'analyzer_name': null,
                        'analyzer_ip_address': null,
                        'routing_instance': null,
                        'udp_port': null,
                        'analyzer_mac_address': null,
                        'juniper_header': "enabled",
                        'nh_mode': null,
                        'static_nh_header': {
                            'vtep_dst_ip_address': null,
                            'vtep_dst_mac_address': null,
                            'vni': null
                        },
                        'nic_assisted_mirroring': false,
                        'nic_assisted_mirroring_vlan': null
                    }
                }
            },
            'is_mirror' : false,
            'mirrorToRoutingInstance': "",
            'mirrorToNHMode': "dynamic",
            'user_created_nic_assisted': false,
            'user_created_juniper_header' : "enabled",
            'fixedIPCollection': [],
            'display_name': '',
            'virtual_machine_interface_refs': [],
            'disablePort':false,
            'is_sub_interface':false,
            'subInterfaceVMIValue':'',
            'templateGeneratorData': 'rawData',
            'disable_sub_interface' : false,
            'subnetGroupVisible': true,
            'isParent' : false,
            'ecmp_hashing_include_fields': {/*
                'hashing_configured': false,
                'source_ip': true,
                'destination_ip': true,
                'ip_protocol': true,
                'source_port': true,
                'destination_port': true*/
            },
            'virtual_machine_interface_disable_policy': false,
            'qos_config_refs': [],
            'bridge_domain_refs': [],
            'user_created_bridge_domain': '',
            'user_created_bridge_domain_list': []
        },
        onVNSelectionChanged: function(portFormatters, newValue, mode) {
            var subnetDSDetails = portFormatters.fixedIpSubnetDDFormatter(
                    self.getVNData(),
                    newValue);
            if(subnetDSDetails.flatSubnetIPAMIds.length > 0) {
                self.getFlatSubnets(newValue, subnetDSDetails.flatSubnetIPAMIds,
                        function(flatSubnets) {
                    subnetDSDetails.SubnetDS =
                        subnetDSDetails.SubnetDS.concat(flatSubnets);
                    self.manageFixedIPSection(subnetDSDetails.SubnetDS,
                            mode);
                });
            } else {
                self.manageFixedIPSection(subnetDSDetails.SubnetDS,
                        mode);
            }
            this.getBridgeDomains(newValue);
        },

        manageFixedIPSection: function(subnetDS, mode){
            if(subnetDS.length > 0) {
                self.setSubnetDataSource(subnetDS);
                self.subnetGroupVisible(true);
            } else {
                self.subnetGroupVisible(false);
            }
            if(mode === ctwl.CREATE_ACTION) {
                self.model().attributes.fixedIPCollection.reset();
                self.addFixedIP();
            }
        },

        getBridgeDomains: function(vnName) {
            if(!vnName) {
                return;
            }
            var self = this, ajaxConfig = {};
            ajaxConfig.type = 'POST';
            ajaxConfig.data = JSON.stringify({data: [{type: "bridge-domains",
                parent_type: "virtual-network",
                parent_fq_name_str: vnName}]});
            ajaxConfig.url = ctwc.URL_GET_CONFIG_DETAILS;
            contrail.ajaxHandler(ajaxConfig, null,
                function(response) {
                    self.user_created_bridge_domain_list(
                            portFormatters.bridgeDomainDDFormatter(response));
                    self.bridge_domain_refs(self.user_created_bridge_domain());
                },
                function(error){
                });
        },

        setVNData: function(allNetworks) {
            self.allNetworks = allNetworks;
        },
        getVNData: function() {
            return self.allNetworks;
        },

        getFlatSubnets: function (vnName, ipamIds, callback) {
            if(!vnName || !ipamIds ||
                    !ipamIds.length) {
                return;
            }
            var uniqueIPAMIds = _.unique(ipamIds);
            var self = this, ajaxConfig = {};
            ajaxConfig.type = 'POST';
            ajaxConfig.data = JSON.stringify({data: [{type: "network-ipams",
               obj_uuids: uniqueIPAMIds}]});
            ajaxConfig.url = ctwc.URL_GET_CONFIG_DETAILS;
            contrail.ajaxHandler(ajaxConfig, null,
                function(response) {
                    callback(portFormatters.flatSubnetsDDFormatter(response));
                },
                function(error){
                    callback([]);
                });
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
            modelConfig['display_name'] = ctwu.getDisplayNameOrName(modelConfig);
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
                        modelConfig['floatingIpValue'].
                            push(uuid + cowc.DROPDOWN_VALUE_SEPARATOR + toStr);
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
                    var fixedIP = getValueByJsonPath(fixedIPobj,
                        "fixedip", null, false);
                    if(fixedIP !== null) {
                        var val = JSON.stringify(
                                  {"subnet_uuid":fixedIP.subnet_uuid});
                        fixedIP_obj.subnetDataSource.push({'text':'',
                                            'value':val})
                        fixedIP_obj.fixedIp = fixedIP.ip;
                        fixedIP_obj.subnet_uuid = fixedIP.subnet_uuid;
                        fixedIP_obj.uuid = fixedIPobj.uuid;
                        fixedIP_obj.disableFIP = true;
                        fixedIP_obj.visibleSubnet = false;
                        var fixedIPModel = new FixedIPModel(fixedIP_obj);
                        fixedIPModels.push(fixedIPModel);
                    }
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
            var dhcpModelArray = [],
                dhcpList = getValueByJsonPath(modelConfig,
                    "virtual_machine_interface_dhcp_option_list;dhcp_option", []);
            if(dhcpList.length) {
                var dhcpLen = dhcpList.length;
                for(var i = 0; i < dhcpLen; i++) {
                    var dhcp_obj = dhcpList[i],
                        dhcpVal = getValueByJsonPath(dhcpList[i],
                            "dhcp_option_value", null, false),
                        dhcpValBytes = getValueByJsonPath(dhcpList[i],
                            "dhcp_option_value_bytes", null, false),
                        dhcp = {}, dhcpOptionModel;
                     dhcp.dhcp_option_name = dhcpList[i].dhcp_option_name;
                     dhcp.dhcp_option_value = dhcpVal;
                     dhcp.dhcp_option_value_bytes = dhcpValBytes;
                     dhcpOptionModel = new DHCPOptionModel(dhcp);
                     dhcpModelArray.push(dhcpOptionModel);
                }
            }
            var dhcpCollectionModel = new Backbone.Collection(dhcpModelArray);
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
            //Modal config default Health Check formatting
            healthCheck =  getValueByJsonPath(modelConfig, 'service_health_check_refs', []);
            if (healthCheck.length > 0) {
                var healthCheckTo = getValueByJsonPath(healthCheck[0], 'to', '');
                var healthCheckuuid = getValueByJsonPath(healthCheck[0],
                                         'uuid', '');
                if (healthCheckTo != "" && healthCheckuuid != "") {
                    healthCheckVal = healthCheckTo.join(":") +
                        cowc.DROPDOWN_VALUE_SEPARATOR + healthCheckuuid;
                    modelConfig['service_health_check_refs'] = healthCheckVal;
                }
            }

            //Modal config default qos formatting
            var qosToArry = getValueByJsonPath(modelConfig,
                    "qos_config_refs;0;to", []);
            if(qosToArry.length === 3){
                modelConfig["qos_config_refs"] = qosToArry[0] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + qosToArry[1] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + qosToArry[2];
            } else {
                modelConfig["qos_config_refs"] = "";
            }

            //bridge domain
            var bdRef = getValueByJsonPath(modelConfig,
                    "bridge_domain_refs;0;to", []);
            if(bdRef.length === 4){
                modelConfig["bridge_domain_refs"] = bdRef[0] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + bdRef[1] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + bdRef[2] +
                    cowc.DROPDOWN_VALUE_SEPARATOR + bdRef[3];
                modelConfig["user_created_bridge_domain"] =
                    modelConfig["bridge_domain_refs"];
            } else {
                modelConfig["bridge_domain_refs"] = "";
            }

            //Modal config default ECMP formatting
            var ecmpHashIncFields = [];
            if ('ecmp_hashing_include_fields' in modelConfig) {
                var ecmpHashIncFieldsObj =
                    modelConfig['ecmp_hashing_include_fields'];
                var hashingConfigured = getValueByJsonPath(ecmpHashIncFieldsObj,
                     'hashing_configured', false);

                if (hashingConfigured != false) {
                    for (var key in ecmpHashIncFieldsObj) {
                        if (true == ecmpHashIncFieldsObj[key] &&
                            ecmpHashIncFieldsObj[key] != "hashing_configured") {
                            ecmpHashIncFields.push(key);
                        }
                    }
                }
            }
            modelConfig['ecmp_hashing_include_fields'] =
                ecmpHashIncFields.join(',');

            //mirroring
            var mirrorAnalyzerName = getValueByJsonPath(modelConfig,
                          "virtual_machine_interface_properties;" +
                          "interface_mirror;mirror_to;analyzer_name",
                          "");
            if(mirrorAnalyzerName) {
                var nicAssistedMirroring = getValueByJsonPath(modelConfig,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;nic_assisted_mirroring",
                        false, false), routingInst, nhMode, jnprHeader;
                modelConfig['is_mirror'] = true;
                modelConfig["user_created_nic_assisted"] = nicAssistedMirroring;
                if(nicAssistedMirroring) {
                    //modelConfig["user_created_nic_assisted"] = "enabled";
                } else {
                    //modelConfig["user_created_nic_assisted"] = "disabled";
                    routingInst =  getValueByJsonPath(modelConfig,
                        "virtual_machine_interface_properties;" +
                        "interface_mirror;mirror_to;routing_instance",
                        ""),
                    nhMode = getValueByJsonPath(modelConfig,
                            "virtual_machine_interface_properties;" +
                            "interface_mirror;mirror_to;nh_mode",
                            ctwc.MIRROR_DYNAMIC),
                    jnprHeader = getValueByJsonPath(modelConfig,
                            "virtual_machine_interface_properties;" +
                            "interface_mirror;mirror_to;juniper_header",
                            true);
                    if (routingInst != "") {
                        modelConfig['mirrorToRoutingInstance'] = routingInst;
                    } else {
                        modelConfig['mirrorToRoutingInstance'] = null;
                    }
                    modelConfig["mirrorToNHMode"] = nhMode;
                    modelConfig["user_created_juniper_header"] =
                            jnprHeader === true ? "enabled" : "disabled";
                }
            } else {
                modelConfig['is_mirror'] = false;
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
            var devOwner = getValueByJsonPath(modelConfig, 'virtual_machine_interface_device_owner');
            if ("compute" == devOwner.substring(0,7)) {
                devOwner = "compute";
            }
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
                    if(devOwner == "compute" &&
                      (port_binding_obj.key == "SR-IOV (vnic_type:direct)" ||
                       port_binding_obj.key == "vnic_type" ||
                       port_binding_obj.key == "vif_type" ||
                       port_binding_obj.key == "vif_details")) {
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
            var devOwner = getValueByJsonPath(modelConfig,
                'virtual_machine_interface_device_owner', "");
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
                                        cowc.DROPDOWN_VALUE_SEPARATOR +
                                        logicalRouterUUID;
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
                        deviceVMIValue = vmUUID + cowc.DROPDOWN_VALUE_SEPARATOR
                            + vmRefTo.join(":");
                        modelConfig["virtualMachineValue"] = deviceVMIValue;
                        modelConfig["deviceComputeShow"] = true;
                    }
                }
            } else {
                deviceOwnerValue = devOwner.trim() ? devOwner : "none";
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
                    var subInterfaceVMI = vmiRefUUID +
                        cowc.DROPDOWN_VALUE_SEPARATOR + vmiRefTo.join(":");
                    modelConfig["subInterfaceVMIValue"] = subInterfaceVMI;
                    modelConfig["disable_sub_interface"] = true;
                }
            }
            var portUUID = getValueByJsonPath(modelConfig, "uuid", null);
            if(vlanTag == "" && portUUID != null) {
                modelConfig['isParent'] = true;
            }
            modelConfig['deviceOwnerValue'] = deviceOwnerValue;
            modelConfig['security_logging_object_refs'] = ctwu.securityLoggingObjectFormatter(modelConfig, 'edit');
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);

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
                'virtual_machine_interface_properties.local_preference' :
                    function(value, attr, finalObj) {
                    if(value){
                        var numVal = Number(value);
                        if(isNaN(numVal) || !Number.isInteger(numVal)){
                            return "Local Preference has to be a integer";
                        }
                        if(numVal < 0 || numVal > 4294967295){
                            return "Local Preference has to be between 0 - 4294967295";
                        }
                    }
                },
                'is_sub_interface': function(value, attr, finalObj) {
                    if(value == true && finalObj.deviceOwnerValue.toLowerCase() == "compute") {
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
                       finalObj.deviceOwnerValue .toLowerCase()== "router") {
                        return "Floating Ip cannot be assigned to Router port";
                    }
                },
                'virtualMachineValue': function(value, attr, finalObj) {
                    if(value == "" &&
                       finalObj.deviceOwnerValue.toLowerCase() == "compute") {
                        return "Device Owner UUID cannot be empty.";
                    }
                },
                'logicalRouterValue': function(value, attr, finalObj) {
                    if(value == "" &&
                       finalObj.deviceOwnerValue.toLowerCase() == "router") {
                        return "Device Owner UUID cannot be empty.";
                    }
                },
                'deviceOwnerValue': function(value, attr, finalObj) {
                    if (value.toLowerCase() == "router") {
                        if (finalObj.isParent == true) {
                            return "Router cannot be set to a parent port.";
                        }
                        if (finalObj.is_sub_interface == true) {
                            return "Router cannot be set to a Sub Interface.";
                        }
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
                            /*if(portBindingArr[i].key == "vnic_type" &&
                               portBindingArr[i].value == "direct" &&
                                finalObj.deviceOwnerValue != "compute") {
                                return "Device owner compute has to be set for SRIOV.";
                            }*/
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
                'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_name': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true) {
                        if(!value) {
                            return "Enter a valid analyzer name";
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_ip_address': function(value, attr, finalObj) {
                    if((finalObj.is_mirror == true) &&
                            (finalObj.user_created_nic_assisted === false) &&
                            (finalObj.mirrorToNHMode !== ctwc.MIRROR_STATIC)) {
                        if(!isValidIP(value)) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                        if(value && value.split("/").length > 1) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.udp_port': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true && finalObj.user_created_nic_assisted === false) {
                        if(value !== "" && value !== null) {
                            var vlanVal = Number(String(value).trim());
                            if (isNaN(vlanVal) ||
                                    (vlanVal < 1 || vlanVal > 65535)) {
                                return "Enter UDP Port between 1 to 65535";
                            }
                        }
                    }
                },
                'user_created_juniper_header': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true &&
                        finalObj.user_created_nic_assisted === false &&
                        finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC &&
                        value !== 'disabled') {
                        return "Static Nexthop cannot be used with Juniper Header Enabled";
                    }
                },
                'mirrorToRoutingInstance': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true &&
                            finalObj.user_created_juniper_header === "disabled" &&
                            finalObj.user_created_nic_assisted === false) {
                        if (!value || value.trim() == "") {
                            return "Select Routing Instance";
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_mac_address': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true && finalObj.user_created_nic_assisted === false) {
                        if(value !== null && value !== "") {
                            if(!isValidMACAddress(value)) {
                                return "Enter valid Analyzer MAC Address";
                            }
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vtep_dst_mac_address': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true && finalObj.user_created_nic_assisted === false &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                        if(value !== null && value !== "") {
                            if(!isValidMACAddress(value)) {
                                return "Enter valid VTEP Destination MAC Address";
                            }
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vtep_dst_ip_address': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true && finalObj.user_created_nic_assisted === false &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                       if(!isValidIP(value)) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                        if(value && value.split("/").length > 1) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vni': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true && finalObj.user_created_nic_assisted === false &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                        var vlanVal = Number(String(value).trim());
                        if (isNaN(vlanVal) || vlanVal < 1 || vlanVal > 16777215) {
                            return "Enter VxLAN ID between 1 - 16777215";
                        }
                    }
                },
                'virtual_machine_interface_properties.interface_mirror.mirror_to.nic_assisted_mirroring_vlan': function(value, attr, finalObj) {
                    if(finalObj.is_mirror == true &&
                            finalObj.user_created_nic_assisted === true) {
                        var vlanVal = Number(String(value).trim());
                        if (isNaN(vlanVal) || vlanVal < 1 || vlanVal > 4094) {
                            return "Enter NIC Assisted VLAN ID between 1 - 4094";
                        }
                    }
                },
                'dhcpOptionCollection': function(value, attr, finalObj) {
                    var dhcpOptCol = finalObj["dhcpOptionCollection"] ?
                        finalObj["dhcpOptionCollection"].toJSON() : [],
                        i, dhcpOptColCnt, dhcpOptionVal, dhcpOptionValBytes;
                    if(dhcpOptCol.length) {
                        dhcpOptColCnt = dhcpOptCol.length;
                        for(i = 0; i < dhcpOptColCnt; i++) {
                            if(dhcpOptCol[i]) {
                                dhcpOptionVal = dhcpOptCol[i].dhcp_option_value() ?
                                    dhcpOptCol[i].dhcp_option_value().trim() : null;
                                dhcpOptionValBytes = dhcpOptCol[i].dhcp_option_value_bytes() ?
                                    dhcpOptCol[i].dhcp_option_value_bytes().trim() : null;
                                if(!(dhcpOptionVal ||  dhcpOptionValBytes)) {
                                    return "Invalid option value";
                                }
                            }
                        }
                        dhcpOptCol = _.map(dhcpOptCol, function(dhcpOpt) {
                            return dhcpOpt.dhcp_option_name();
                        });
                        for(i = 0; i < dhcpOptCol.length; i++){
                            if(dhcpOptCol[i] === dhcpOptCol[i + 1]){
                                return "DHCP Options are repeated";
                            }
                        }
                    }
                }
            }
        },
        // Function to update the routing Instance when the network is changed
        updateMirrorRoutingInterface: function(portModel, newValue) {
            var vnName = newValue.split(":");
            vnName = getValueByJsonPath(vnName, "2");
            portModel.mirrorToRoutingInstance(newValue+":"+vnName);
        },
        // fixed IP collection Adding
        addFixedIP: function() {
            if(self.subnetDataSource instanceof Array) {
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
        // fixed IP collection Adding
        addFixedIPByIndex: function(data, fixedIP) {
            if(self.subnetDataSource instanceof Array) {
                var selectedRuleIndex = data.model().collection.indexOf(fixedIP.model());
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
                    fixedIPList.add([fixedIPModel],{at: selectedRuleIndex+1});
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
        addAAPByIndex: function(data, aap) {
            var selectedRuleIndex = data.model().collection.indexOf(aap.model());
            var aapList = this.model().attributes['allowedAddressPairCollection'],
                allowAddressPairModel = new AllowAddressPairModel();
            aapList.add([allowAddressPairModel],{at: selectedRuleIndex+1});
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
        addDHCPByIndex: function(data, dhcp) {
            var selectedRuleIndex = data.model().collection.indexOf(dhcp.model());
            var dhcpList = this.model().attributes['dhcpOptionCollection'],
                dhcpOptionModel = new DHCPOptionModel();
            dhcpList.add([dhcpOptionModel],{at: selectedRuleIndex+1});
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

        //Fat Flow Add
        addFatFlowByIndex: function(data, fatFlow) {
            var selectedRuleIndex = data.model().collection.indexOf(fatFlow.model());
            var fatFlowList = this.model().attributes['fatFlowCollection'],
                fatFlowModel = new FatFlowModel();
            this.enableDisablePort(fatFlowModel);
            fatFlowList.add([fatFlowModel],{at: selectedRuleIndex+1});
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

        addPortBindingByIndex: function(data, binding) {
            var selectedRuleIndex = data.model().collection.indexOf(binding.model());
            var portBindingList = this.model().attributes['portBindingCollection'],
                portBindingModel = new PortBindingModel();
                this.enableDisablePortBindingValue(portBindingModel, "add");
            portBindingList.add([portBindingModel],{at: selectedRuleIndex+1});
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
                if(mode == ctwl.EDIT_ACTION) {
                    if((this.key() == "vnic_type" ||
                       this.key() == "vif_type" ||
                       this.key() == "vif_details") && this.disablePortBindKey()) {
                       return true;
                    } else if(this.key() == "SR-IOV (vnic_type:direct)") {
                        this.value("direct");
                        return true
                    }
                } else if(mode == ctwl.CREATE_ACTION) {
                    if(this.key() == "SR-IOV (vnic_type:direct)") {
                       this.value("direct");
                       return true;
                    }
                }
                return false
            }), portBindingModel);
        },
        getNonDefaultECMPHashingFields: function() {
            return { 'source_ip': false, 'destination_ip': false,
                'ip_protocol': false, 'source_port': false,
                'destination_port': false};
        },
        configurePorts: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
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
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if(this.isDeepValid(validations)) {
                var newPortData = $.extend(true, {}, this.model().attributes),
                    selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                    selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT);

                ctwu.setNameFromDisplayName(newPortData);

                newPortData.fq_name = [selectedDomain,
                                     selectedProject];
                if(newPortData["name"] && newPortData["name"].trim() != "") {
                    newPortData["fq_name"][2] = newPortData["name"].trim();
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
                if(newPortData.port_security_enabled == true && sgData != "") {
                    var msSGselectedData = sgData.split(cowc.DROPDOWN_VALUE_SEPARATOR);
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
                        //aapLocal[i]["mac"] = null;
                        if (aapCollection[i].mac() != "") {
                            aapLocal[i]["mac"] = aapCollection[i].mac();
                        }
                        if(ip != ""){
                            aapLocal[i]["ip"] = {};
                            if(ip.split("/").length == 2) {
                                prefix = Number(ip.split("/")[1]);
                                ip = ip.split("/")[0];
                            }
                            aapLocal[i]["ip"]["ip_prefix"] = ip;
                            aapLocal[i]["ip"]["ip_prefix_len"] = prefix;
                        }
                        aapLocal[i]["address_mode"] = aapCollection[i].address_mode();
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
                newPortData.virtual_machine_interface_fat_flow_protocols.fat_flow_protocol = [];
                if (fatFlowCollection && fatFlowCollection.length > 0) {
                    var fatFlowLocal = [];
                    for(i = 0 ; i< fatFlowCollection.length ; i++){
                        fatFlowLocal[i] = {};
                        fatFlowLocal[i]["protocol"] = fatFlowCollection[i].protocol();
                        fatFlowLocal[i]["port"] = Number(fatFlowCollection[i].port());
                        fatFlowLocal[i]["ignore_address"] = fatFlowCollection[i].ignore_address();
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
                var allDHCPValues = newPortData["dhcpOptionCollection"] ?
                    newPortData["dhcpOptionCollection"].toJSON() : [];
                newPortData.virtual_machine_interface_dhcp_option_list = {};
                if (allDHCPValues && allDHCPValues.length > 0) {
                    var returnDHCPOptionsList = [];
                    var dhcpLen = allDHCPValues.length;
                    for(i = 0; i < dhcpLen; i++){
                        var dhcpCode = allDHCPValues[i].dhcp_option_name(),
                            dhcpValue = allDHCPValues[i].dhcp_option_value(),
                            dhcpValueBytes =
                                allDHCPValues[i].dhcp_option_value_bytes();
                        returnDHCPOptionsList[i] = {};
                        returnDHCPOptionsList[i]["dhcp_option_name"] =
                                                   dhcpCode.trim();
                        returnDHCPOptionsList[i]["dhcp_option_value"] =
                                                   dhcpValue.trim();
                        returnDHCPOptionsList[i]["dhcp_option_value_bytes"] =
                                                   dhcpValueBytes.trim();
                    }
                    newPortData.virtual_machine_interface_dhcp_option_list.dhcp_option
                        = returnDHCPOptionsList;
                } else {
                    delete(newPortData.virtual_machine_interface_dhcp_option_list.dhcp_option);
                }
                newPortData.interface_route_table_refs = [];
        // Static Route
                var staticRoute = getValueByJsonPath(newPortData,
                           "staticRoute","");
                if(staticRoute != "") {
                    var msSRselectedData = staticRoute.split(cowc.DROPDOWN_VALUE_SEPARATOR);
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
        // Health Check
                var healthCheck = getValueByJsonPath(newPortData,
                           "service_health_check_refs","");
                if(healthCheck != "") {
                    var healthCheckArr =
                        healthCheck.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    newPortData.service_health_check_refs = [];
                    newPortData.service_health_check_refs[0] = {};
                    newPortData.service_health_check_refs[0].to = healthCheckArr[0].split(":");
                    newPortData.service_health_check_refs[0].uuid = healthCheckArr[1];
                    /* This annotation is required to attach service
                      health check object to non service vmi */
                    newPortData["annotations"] = {};
                    newPortData["annotations"]["key_value_pair"] =
                        [{ "key": "_service_vm_", "value": "False"}];
                } else {
                    newPortData.service_health_check_refs = [];
                }

         //QoS
            var qos = getValueByJsonPath(newPortData, "qos_config_refs", ""),
                qosList = [];
            if(qos !== "none" && qos.trim() !== "") {
                qosList.push({"to": qos.split(cowc.DROPDOWN_VALUE_SEPARATOR)});
            }
            newPortData["qos_config_refs"] = qosList;

        //Bridge Domain
            var bridgeDomain = getValueByJsonPath(newPortData,
                    "bridge_domain_refs", ""),
                bridgeDomainList = [];
            if(bridgeDomain !== "none" && bridgeDomain.trim() !== "") {
                bridgeDomainList.push({
                    "to": bridgeDomain.split(cowc.DROPDOWN_VALUE_SEPARATOR),
                    "attr": {"vlan_tag": 0}});
            }
            newPortData["bridge_domain_refs"] = bridgeDomainList;

        /* ECMP Hashing */
                var ecmpHashIncFields = this.getNonDefaultECMPHashingFields();
                var count = 0;
                if (null != newPortData['ecmp_hashing_include_fields']) {
                    var tmpEcmpHashIncFields =
                        newPortData['ecmp_hashing_include_fields'].split(',');
                    var cnt = tmpEcmpHashIncFields.length;
                    for (var i = 0; i < cnt; i++) {
                        if (tmpEcmpHashIncFields[i].length > 0 &&
                            tmpEcmpHashIncFields[i] != "hashing_configured") {
                            ecmpHashIncFields[tmpEcmpHashIncFields[i]] = true;
                            count++;
                        }
                    }
                }
                ecmpHashIncFields.hashing_configured = true;
                if (count == 0) {
                    ecmpHashIncFields = {};
                }
                newPortData['ecmp_hashing_include_fields']
                    = ecmpHashIncFields;
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

                if(newPortData.deviceOwnerValue.toLowerCase() == "none"){
                    newPortData["virtual_machine_interface_device_owner"] = "";
                    newPortData.virtual_machine_refs = [];
                    newPortData.logical_router_back_refs = [];
                } else if(newPortData.deviceOwnerValue.toLowerCase() == "router"){
                    newPortData.virtual_machine_interface_device_owner =
                                                     "network:router_interface";
                    newPortData.logical_router_back_refs = [];
                    newPortData.virtual_machine_refs = [];
                    var deviceUUIDArr =
                        newPortData.logicalRouterValue.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    var to = deviceUUIDArr[0].split(":");
                    var uuid = deviceUUIDArr[1];
                    newPortData.logical_router_back_refs[0] = {};
                    newPortData.logical_router_back_refs[0].to = to;
                    newPortData.logical_router_back_refs[0].uuid = uuid;
                    //delete(newPortData.logicalRouterValue);
                } else if(newPortData.deviceOwnerValue.toLowerCase() == "compute"){
                     if(newPortData.virtual_machine_interface_device_owner.substring(0,7)
                        != "compute") {
                        newPortData.virtual_machine_interface_device_owner = "compute:nova";
                    }
                    newPortData.logical_router_back_refs = [];
                    newPortData.virtual_machine_refs = [];
                    var deviceuuidval = newPortData.virtualMachineValue;

                    var deviceUUIDArr =
                        deviceuuidval.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    var uuid = deviceUUIDArr[0];
                    newPortData.virtual_machine_refs[0] = {};
                    if(deviceUUIDArr[1] != null) {
                        var to = deviceUUIDArr[1].split(":");
                        newPortData.virtual_machine_refs[0].to = to;
                    }
                    newPortData.virtual_machine_refs[0].uuid = uuid;
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
                        floatingip =
                            allfloatingIP[i].split(cowc.DROPDOWN_VALUE_SEPARATOR);
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
                    var subIntrface = newPortData.subInterfaceVMIValue.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    var uuid = subIntrface[0];
                    var to = subIntrface[1].split(":");
                    newPortData.virtual_machine_interface_refs[0] = {};
                    newPortData.virtual_machine_interface_refs[0].to = to;
                    newPortData.virtual_machine_interface_refs[0].uuid = uuid;
                } else {
                    newPortData.virtual_machine_interface_properties.sub_interface_vlan_tag = null;
                    if (newPortData.isParent != true) {
                        newPortData.virtual_machine_interface_refs = [];
                    }
                }

                //mirroring
                if(newPortData.is_mirror === true) {
                    var nicAssistedMirroring =
                            newPortData.user_created_nic_assisted,
                        udpPort, routingInstance, jnprHeader, analyzerName,
                        nicAssistedVlan;
                    if(nicAssistedMirroring === true) {
                        analyzerName = getValueByJsonPath(newPortData,
                                "virtual_machine_interface_properties;" +
                                "interface_mirror;mirror_to;analyzer_name",
                                null),
                        nicAssistedVlan = getValueByJsonPath(newPortData,
                                "virtual_machine_interface_properties;" +
                                "interface_mirror;mirror_to;nic_assisted_mirroring_vlan",
                                null);
                        delete newPortData.virtual_machine_interface_properties.interface_mirror;
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"] = {};
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"] = {};
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["analyzer_name"] =
                                analyzerName;
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["nic_assisted_mirroring"] =
                                true;
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["nic_assisted_mirroring_vlan"] =
                                Number(nicAssistedVlan);
                    } else {
                        newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["nic_assisted_mirroring"] = false;
                        delete newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["nic_assisted_mirroring_vlan"];
                        udpPort = getValueByJsonPath(newPortData,
                                "virtual_machine_interface_properties;" +
                                "interface_mirror;mirror_to;udp_port", null);
                        jnprHeader = newPortData.user_created_juniper_header;
                        if(udpPort) {
                            newPortData["virtual_machine_interface_properties"]
                                ["interface_mirror"]["mirror_to"]["udp_port"] =
                                    Number(udpPort);
                        }

                        newPortData["virtual_machine_interface_properties"]
                        ["interface_mirror"]["mirror_to"]["nh_mode"] =
                            newPortData["mirrorToNHMode"];
                        if(newPortData["mirrorToNHMode"] === ctwc.MIRROR_DYNAMIC) {
                            newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["static_nh_header"] =
                                null;
                        } else {
                            var vni = getValueByJsonPath(newPortData,
                                    "virtual_machine_interface_properties;" +
                                    "interface_mirror;mirror_to;static_nh_header;vni", null);
                            if(vni) {
                                newPortData["virtual_machine_interface_properties"]
                                ["interface_mirror"]["mirror_to"]["static_nh_header"]["vni"] =
                                    Number(vni);
                            }
                        }
                        if(jnprHeader === 'enabled') {
                            newPortData["virtual_machine_interface_properties"]
                                ["interface_mirror"]["mirror_to"]["juniper_header"] =
                                true;
                            delete newPortData["virtual_machine_interface_properties"]
                            ["interface_mirror"]["mirror_to"]["routing_instance"];
                        } else {
                            newPortData["virtual_machine_interface_properties"]
                                ["interface_mirror"]["mirror_to"]["juniper_header"] =
                                false;
                            routingInstance = getValueByJsonPath(newPortData,
                                    'mirrorToRoutingInstance', '');
                            if(routingInstance) {
                                newPortData["virtual_machine_interface_properties"]
                                ["interface_mirror"]["mirror_to"]["routing_instance"] =
                                    routingInstance;
                            }
                        }
                    }

                } else {
                    newPortData["virtual_machine_interface_properties"]
                    ["interface_mirror"] = null;
                }

                newPortData.virtual_machine_interface_properties.local_preference =
                    parseInt(newPortData.virtual_machine_interface_properties.local_preference);

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
                newPortData['security_logging_object_refs'] = ctwu.setSloToModel(newPortData);
                //permissions
                this.updateRBACPermsAttrs(newPortData);

                ctwu.deleteCGridData(newPortData);

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
                delete(newPortData.templateGeneratorData);
                delete(newPortData.rawData);
                delete(newPortData.vmi_ref);
                delete(newPortData.disablePort);
                delete(newPortData.disable_sub_interface);
                delete(newPortData.subnetGroupVisible);
                delete(newPortData.disablePort);
                delete(newPortData.is_mirror);
                delete(newPortData.mirrorToRoutingInstance);
                delete(newPortData.isParent);
                delete(newPortData.mirrorToNHMode);
                delete(newPortData.user_created_bridge_domain);
                delete(newPortData.user_created_bridge_domain_list);
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
                delete newPortData.user_created_juniper_header;
                delete newPortData.user_created_nic_assisted;

                var type = "";
                var url = "";
                if(mode == ctwl.CREATE_ACTION) {
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
                vmiData = {"virtual-machine-interface": newPortData};
                if(mode == ctwl.CREATE_ACTION) {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                ajaxConfig.type = 'POST';
                ajaxConfig.data = JSON.stringify(vmiData);
                //ajaxConfig.url = url;
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
                                     (ctwc.PORT_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deletePort: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var delDataID = [];
            var parentPort = [];
            var isParentPortBool;
            var sendData = [];
            var subInterface = [];
            var pushedUUIDForParent = [];
            for (var i = 0; i < selectedGridData.length; i++) {
                var vmiRelation = portFormatters.getVMIRelation(selectedGridData[i]);
                switch (vmiRelation){
                    case "vmi": {
                        delDataID.push({"type": "virtual-machine-interface",
                                        "deleteIDs": [selectedGridData[i]["uuid"]],
                                        "userData" : null});
                        break;
                    }
                    case "subInterface": {
                        subInterface.push(selectedGridData[i]["uuid"]);
                        break;
                    }
                    case "primaryInterface": {
                        var chiledUUID = [];
                        var children = getValueByJsonPath(selectedGridData[i],
                                            "virtual_machine_interface_refs",
                                            []);
                        var vmiChildlen = children.length;
                        for (var j = 0; j < vmiChildlen; j++) {
                            var tempUUID = getValueByJsonPath(
                                           children[j], "uuid");
                            chiledUUID.push(tempUUID);
                            pushedUUIDForParent.push(tempUUID)
                        }
                        parentPort.push({"type": "virtual-machine-interface",
                        "deleteIDs": [selectedGridData[i]["uuid"]],
                        "userData" : chiledUUID});
                        break;
                    }
                }
            }
            for (var j = 0; j < subInterface.length; j++) {
                if (!(_.contains(pushedUUIDForParent, subInterface[j]))) {
                    delDataID.push({"type": "virtual-machine-interface",
                                    "deleteIDs": [subInterface[j]],
                                    "userData" : null})
                };
            }
            delDataID = delDataID.concat(parentPort);
            delDataID = _.uniq(delDataID);
            if (delDataID.length > 0) {
                var sentData = delDataID;
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
            }
            return returnFlag;
        },
        deleteAllPort: function(selectedProjectId, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            ajaxConfig.async = false;
            ajaxConfig.type = "DELETE";
            ajaxConfig.url = "/api/tenants/config/delete-all-ports?uuid=" +
                selectedProjectId;
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
