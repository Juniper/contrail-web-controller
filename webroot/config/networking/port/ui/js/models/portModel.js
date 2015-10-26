
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/port/ui/js/views/portFormatters',
    'config/networking/port/ui/js/models/fixedIPModel',
    'config/networking/port/ui/js/models/allowAddressPairModel',
    'config/networking/port/ui/js/models/dhcpOptionModel',
    'config/networking/port/ui/js/models/staticRouteModel'
], function (_, ContrailModel, PortFormatters, FixedIPModel,
             AllowAddressPairModel, DHCPOptionModel, StaticRouteModel) {
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
            'virtualNetworkToName' : '',
            'is_sec_grp':true,
            'security_group_refs':[],
            'securityGroupValue':'',
            'floating_ip_back_refs':[],
            'floatingIpValue':'',
            'virtual_machine_interface_allowed_address_pairs':{
                        'allowed_address_pair':[]
                    },
            'allowedAddressPairCollection':[],
            'staticRouteCollection':[],
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
            'virtual_machine_interface_properties':{'sub_interface_vlan_tag':''},
            'fixedIPCollection': [],
            'display_name': '',
            'virtual_machine_interface_refs': [],
            'is_sub_interface':false,
            'subInterfaceVMIValue':'',
            'templateGeneratorData': 'rawData',
            'deviceComputeShow' : false,
            'deviceRouterShow' : false,
            'disable_sub_interface' : false
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
                                 modelConfig['virtual_network_refs'][0],"to","");
            if(virtualNetwork != "") {
            modelConfig['virtualNetworkToName'] =
                       modelConfig['virtual_network_refs'][0]["to"].join(":");
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
            if(modelConfig['security_group_refs'].length <= 0 &&
               modelConfig['is_sec_grp'] !== true) {
                modelConfig['is_sec_grp'] = false;
            }

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
                    var val = JSON.stringify({"subnet_uuid":fixedIPobj.fixedip.subnet_uuid});
                    fixedIP_obj.subnetDataSource.push({'text':'',
                                        'value':val})
                    fixedIP_obj.fixedIp = fixedIPobj.fixedip.ip;
                    fixedIP_obj.subnet_uuid = fixedIPobj.fixedip.subnet_uuid;
                    fixedIP_obj.uuid = fixedIPobj.uuid;
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
            var staticRoutVal =
                getValueByJsonPath(modelConfig["interface_route_table_refs"][0],
                                  'sharedip;route', null);
            if(staticRoutVal != null) {
                var staticRouteList =
                  modelConfig["interface_route_table_refs"][0]["sharedip"]["route"];
                if(staticRouteList != null && staticRouteList.length > 0) {
                    var staticRouteLen = staticRouteList.length;
                    for(var i = 0; i < staticRouteLen; i++) {
                        var staticRoute_obj = staticRouteList[i];
                        var staticRouteOptionModel =
                                          new DHCPOptionModel(staticRoute_obj);
                        staticRoute.push(staticRouteOptionModel);

                    }
                }
            }
            var staticRouteCollectionModel =
                                     new Backbone.Collection(staticRoute);
            modelConfig['staticRouteCollection'] = staticRouteCollectionModel;

            //Modal config default Device Owner formatting
            var deviceOwnerValue = "none";
            var devOwner = modelConfig['virtual_machine_interface_device_owner'];
            if(devOwner == "network:router_interface"){
                // if it is Logical Router Device Owner
                deviceOwnerValue = "router";
                if("logical_router_back_refs" in modelConfig &&
                   modelConfig["logical_router_back_refs"].length > 0 ){
                    var deviceLRValue = [];
                    var to =
                     modelConfig["logical_router_back_refs"][0]["to"].join(":");
                    var uuid =
                        modelConfig["logical_router_back_refs"][0]["uuid"];
                    deviceLRValue = to +" "+uuid;
                    modelConfig["logicalRouterValue"] = deviceLRValue;
                    modelConfig["deviceRouterShow"] = true;
                }
            } else  if("compute" == devOwner.substring(0,7)){
                if("virtual_machine_refs" in modelConfig &&
                   modelConfig["virtual_machine_refs"].length >= 0 ){
                   // if it is VM for Device Owner
                    deviceOwnerValue = "compute";
                    var deviceVMIValue = [];
                    var to =
                        modelConfig["virtual_machine_refs"][0]["to"].join(":");
                    var uuid =
                        modelConfig["virtual_machine_refs"][0]["uuid"];
                    deviceVMIValue = uuid +" "+to;
                    modelConfig["virtualMachineValue"] = deviceVMIValue;
                    modelConfig["deviceComputeShow"] = true;
                }
            } else if ("logical_interface_back_refs" in modelConfig) {
                var LILen =
                   modelConfig["logical_interface_back_refs"][0]["to"].length;
                logicalInterfaceName =
                   modelConfig["logical_interface_back_refs"][0]["to"][LILen-1];
            }

            //Modal config default SubInterface formatting
            if("virtual_machine_interface_properties" in modelConfig &&
               "sub_interface_vlan_tag" in
               modelConfig["virtual_machine_interface_properties"] &&
               modelConfig["virtual_machine_interface_properties"]["sub_interface_vlan_tag"] != ""){
                if(modelConfig["virtual_machine_interface_properties"]["sub_interface_vlan_tag"]
                    == "addSubInterface")
                    modelConfig["virtual_machine_interface_properties"]["sub_interface_vlan_tag"] = "";
                modelConfig["is_sub_interface"] = true;
                if("virtual_machine_interface_refs" in modelConfig &&
                    modelConfig["virtual_machine_interface_refs"].length > 0){
                    var uuid =
                        modelConfig["virtual_machine_interface_refs"][0]["uuid"];
                    var to =
                        modelConfig["virtual_machine_interface_refs"][0]["to"].join(":");
                    var subInterfaceVMI = uuid + " " + to;
                    modelConfig["subInterfaceVMIValue"] = subInterfaceVMI;
                }
            }
            modelConfig['deviceOwnerValue'] = deviceOwnerValue;
            return modelConfig;
        },
        validations: {
            portValidations: {
                'virtualNetworkToName': {
                    required: true,
                    msg: 'Enter a valid Network name.'
                }
            }
        },
        // fixed IP collection Adding
        addFixedIP: function() {
            var fixedIPList = this.model().attributes['fixedIPCollection'],
                fixedIPModel = new FixedIPModel();
                fixedIPModel.subnetDataSource = self.subnetDataSource;
            fixedIPList.add([fixedIPModel]);
        },
        //fixed IP Delete
        deleteFixedIP: function(data, fixedIP) {
            var fixedIPCollection = data.model().collection,
                delFixedIp = fixedIP.model();
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

        // Static Route Add
        addStaticRoute: function() {
            var staticRouteList = this.model().attributes['staticRouteCollection'],
                staticRouteModel = new StaticRouteModel();
            staticRouteList.add([staticRouteModel]);
        },
        //Static Route Delete
        deleteStaticRoute: function(data, staticRoute) {
            var staticRouteCollection = data.model().collection,
                delStaticRoute = staticRoute.model();
            staticRouteCollection.remove(delStaticRoute);
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
            if (this.model().isValid(true, "portValidations")) {
                var newPortData = $.extend({},this.model().attributes),
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
                var selectedVN = newPortData["virtualNetworkToName"].split(":");
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
                var msSGselectedData =
                    newPortData.securityGroupValue.split(",");
                if (msSGselectedData && msSGselectedData.length > 0) {
                    for (var i = 0; i < msSGselectedData.length; i++) {
                        if(msSGselectedData[i] != "") {
                            var sgDta = (msSGselectedData[i]).split(":");
                            var sgval = {};
                            sgval.to = sgDta;
                            newPortData.security_group_refs.push(sgval);
                        }
                    }
                }

        //Allow Address Pair
                var aapCollection =
                      newPortData["allowedAddressPairCollection"].toJSON();
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
        //DHCP
                var allDHCPValues = newPortData["dhcpOptionCollection"].toJSON();
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
        // Static Route
                var StaticRouteCollection =
                      newPortData["staticRouteCollection"].toJSON();
                if (StaticRouteCollection && StaticRouteCollection.length > 0) {
                    var StaticRouteCollectionVal = [];
                    for(i = 0 ; i< StaticRouteCollection.length ; i++) {
                        StaticRouteCollectionVal[i] = {};
                        StaticRouteCollectionVal[i]["prefix"] =
                              StaticRouteCollection[i].prefix();
                        StaticRouteCollectionVal[i]["next_hop"] =
                              StaticRouteCollection[i].next_hop();
                        StaticRouteCollectionVal[i]["next_hop_type"] =
                              StaticRouteCollection[i].next_hop_type();
                    }
                    temp_val = getValueByJsonPath(newPortData,
                               "interface_route_table_refs;0;sharedip","");
                    if(temp_val == "") {
                        newPortData.interface_route_table_refs[0] = {};
                        newPortData.interface_route_table_refs[0].sharedip = {};
                    }
                    newPortData.interface_route_table_refs[0].sharedip.route =
                                                       StaticRouteCollectionVal;
                }
        /* Fixed IP*/
        var allFixedIPCollectionValue =
                      newPortData["fixedIPCollection"].toJSON();
        if (allFixedIPCollectionValue && allFixedIPCollectionValue.length > 0) {
            newPortData.instance_ip_back_refs = [];
            var allFixedIPLen = allFixedIPCollectionValue.length;
            var fixedIPArr = [];
            for(i = 0 ; i< allFixedIPLen ; i++){
                fixedIPArr[i] = {};
                var instanceIp = {};
                instanceIp.fixedIp = allFixedIPCollectionValue[i].fixedIp();
                instanceIp.domain = selectedVN[0];
                instanceIp.project = selectedVN[1];

                fixedIPArr[i] = {};
                fixedIPArr[i]["instance_ip_address"] = [];
                fixedIPArr[i]["instance_ip_address"][0] = {};
                fixedIPArr[i]["instance_ip_address"][0] = instanceIp;
                var subnet_uuid = "";
                try {
                    var obj =
                        JSON.parse(allFixedIPCollectionValue[i].subnet_uuid());
                    subnet_uuid = obj.subnet_uuid;
                } catch (exception) {
                    subnet_uuid = allFixedIPCollectionValue[i].subnet_uuid();
                }
                fixedIPArr[i]["subnet_uuid"] = subnet_uuid;

                var subnetIP = instanceIp.fixedIp;
                if(isIPv4(subnetIP)){
                    fixedIPArr[i]["instance_ip_family"] = "v4";
                } else if(isIPv6(subnetIP)){
                    fixedIPArr[i]["instance_ip_family"] = "v6";
                }

                if(mode == "edit"){
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
                if (newPortData.floatingIpValue != "" &&
                    allfloatingIP && allfloatingIP.length > 0) {
                    newPortData["floating_ip_back_refs"] = [];
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
                }// else {
                //    if(selectedParentVMIObject.length > 0) {
                //        newPortData["virtual_machine_interface_refs"] = selectedParentVMIObject;
                //    }
                //}


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
                if(temp_val ==  ""){
                    delete(newPortData.routing_instance_refs);
                }
                delete(newPortData.virtualNetworkToName);
                delete(newPortData.macAddress);
                delete(newPortData.is_sec_grp);
                delete(newPortData.is_sub_interface);
                delete(newPortData.securityGroupValue);
                delete(newPortData.floatingIpValue);
                delete(newPortData.allowedAddressPairCollection);
                delete(newPortData.staticRouteCollection);
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
