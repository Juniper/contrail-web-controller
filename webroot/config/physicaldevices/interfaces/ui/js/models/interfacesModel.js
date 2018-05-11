/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-config-model',
    'config/physicaldevices/interfaces/ui/js/models/serversModel'
], function (_, ContrailConfigModel, ServersModel) {
    var self;
    var InterfacesModel = ContrailConfigModel.extend({
        defaultConfig: {
            'uuid' : null,
            'name' : null,
            'display_name' : null,
            'type' : ctwl.LOGICAL_INF,
            'parent' : null,
            'logical_interface_type' : ctwl.LOGICAL_INF_L2_TYPE,
            'logical_interface_vlan_tag' : null,
            'isSubnetVMICreate' : false,
            'showClearPorts' : false,
            'clearPorts' : false,
            'user_created_virtual_network' : null,
            'virtual_machine_interface_refs' : [],
            'user_created_subnet' : null,
            'subnet_back_refs' : {
                'subnet': {
                    "subnet_ip_prefix": {
                        "ip_prefix": null,
                        "ip_prefix_len": null
                    }
                }
            },
            'parent_type' : null,
            'physical_interface_refs' : [],
            'user_created_physical_interface' : null,
            'ethernet_segment_identifier': null
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            /*
                Populating ServersModel
             */
            var servers = (modelConfig['virtual_machine_interface_refs'] != null) ?
                (modelConfig['virtual_machine_interface_refs']) : [],
                serverModels = [],
                serverCollectionModel;
            var serverModel;
            if(servers.length > 0) {
                for(var i = 0; i < servers.length; i++) {
                    var vmi = servers[i]['virtual-machine-interface'];
                    self.count = self.count + i;
                    serverModel = new ServersModel(
                        {
                            'virtual-machine-interface' : vmi,
                            isVMICreate : false,
                            disable : true,
                        }
                    );
                    self.subscribeServerModelChangeEvents(serverModel);
                    serverModels.push(serverModel)
                    //populate user_created_subnet
                    if('subnet_back_refs' in vmi) {
                        var subnetBackRef = vmi['subnet_back_refs'][0];
                        var subnetExp =
                            subnetBackRef['subnet']['subnet_ip_prefix'];
                        modelConfig['user_created_subnet'] =
                            subnetExp['ip_prefix'] + '/' +
                            subnetExp['ip_prefix_len'];
                    }
                }
                //populate user_created_virtual_network
                var vmi = servers[0]['virtual-machine-interface'];
                if('virtual_network_refs' in vmi) {
                    var vnRef = vmi['virtual_network_refs'][0];
                    modelConfig['user_created_virtual_network'] = vnRef.uuid;
                } else {
                    modelConfig['user_created_virtual_network'] = 'none';
                }
            } else {
                 modelConfig['user_created_virtual_network'] = 'none';
            }
            serverCollectionModel = new Backbone.Collection(serverModels);
            modelConfig['servers'] = serverCollectionModel;

            //populate physical interface refs data source
            if(modelConfig["type"] ===  ctwl.PHYSICAL_INF) {
                var physicalInf = getValueByJsonPath(modelConfig,
                    "physical_interface_refs;0;to", []);
                if(physicalInf.length === 3) {
                    modelConfig["user_created_physical_interface"] =
                    physicalInf[0] + ctwc.PHYSICAL_INF_LINK_PATTERN +
                    physicalInf[1] + ctwc.PHYSICAL_INF_LINK_PATTERN + physicalInf[2];
                } else {
                    modelConfig["user_created_physical_interface"] =  "none";
                }

            } else {
                modelConfig["user_created_physical_interface"] =  "none";
            }
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        subscribeServerModelChangeEvents: function (serverModel) {
            serverModel.__kb.view_model.model().on('change:user_created_mac_address',
                function(model, text){
                     self.setServerIP(model, text);
                }
            );
        },
        getPhysicalInterfaceData : function(refs, physicalInfName) {
            var pInterfaceDS = [], self = this;
            if(self.interfaceData !== undefined){
                pInterfaceDS = $.extend(true, [],
                        self.interfaceData.pInterfaceDS);
            }
            if(refs) {
                pInterfaceDS =
                    [{text: "None", value: "none"}].concat(pInterfaceDS);
            }
            if(physicalInfName) {
                $.each(pInterfaceDS, function(id, pInterface) {
                    if(pInterface.text === physicalInfName) {
                        pInterfaceDS.splice(id, 1);
                        return false;
                    }
                });
            }
            return pInterfaceDS;
        },
        setServerDataSource : function() {
            var servers = this.model().attributes['servers'].toJSON();
            for(var i = 0; i < servers.length; i++) {
                var server = servers[i];
                server.dataSource(self.infEditView.vmiDataSrc);
            }
        },
        formatServer : function(server) {
            var parts = server.trim().split(' ');
            var retStr = '';
            return {
                ip : parts[1] != null ?
                    parts[1].replace(')','').replace('(','') : ''
            };
        },
        getServerList : function(attr) {
            var serverCollection = attr.servers.toJSON(),
                serverArray = [];
            for(var i = 0; i < serverCollection.length; i++) {
                serverArray.push(
                    {
                        mac : serverCollection[i].user_created_mac_address(),
                        ip : serverCollection[i].user_created_instance_ip_address(),
                        isVMICreate : serverCollection[i].isVMICreate(),
                        uuid : (serverCollection[i].isVMICreate() ? "" :
                            serverCollection[i]['virtual-machine-interface']().uuid),
                    }
                );
            }
            return serverArray;
        },
        addServer: function() {
            self = this;
            var servers = this.model().attributes['servers'];
            var newServer = new ServersModel(
                {
                    user_created_mac_address: "",
                    user_created_instance_ip_address : "",
                    isVMICreate : false,
                    dataSource : this.infEditView.vmiDataSrc
                }
            );
            self.subscribeServerModelChangeEvents(newServer);
            servers.add([newServer]);
        },
        setServerIP : function(item, text) {
            var model = self.getCurrentServer(item.cid);
            if(model != null) {
                var ipObj = text.trim().split(' ');
                if(ipObj.length === 2) {
                   var mac = ipObj[0];
                   var ip = ipObj[1].replace(/[()]/g,'');
                   self.setVMIModelObject(model, text, ip);
                } else {
                    if(this.isServerExist(self.infEditView.vmiDataSrc, text)) {
                        self.setVMIModelObject(model, ipObj[0], ' ');
                    } else {
                        model.user_created_instance_ip_address('');
                        model.isVMICreate(true);
                        model.disable(false);
                    }
                }
            }
        },
        setVMIModelObject : function(model, mac, ip) {
            var currentVMI = self.getSelectedVMIItem(mac, ip);
            var uuid = currentVMI ? currentVMI.uuid : "";
            model["virtual-machine-interface"]().uuid = uuid;
            model.user_created_instance_ip_address(ip);
            model.isVMICreate(false);
            model.disable(true);
        },
        isServerExist : function(ds, text){
            var isExist = false;
            if(ds.length > 0) {
                for(var i = 0; i < ds.length; i++) {
                    if(ds[i].text === text) {
                       isExist = true;
                       break;
                    }
                }
            }
            return isExist;
        },
        getCurrentServer: function(id){
            var model;
            var servers = this.model().attributes['servers'].toJSON();
            for(var i = 0; i < servers.length; i++) {
                if(servers[i].model().cid === id) {
                    model = servers[i];
                    break;
                }
            }
            return model;
        },
        addServerByIndex: function(data, kbInterface) {
            self = this;
            var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var servers = this.model().attributes['servers'];
            var newServer = new ServersModel(
                {
                    user_created_mac_address: "",
                    user_created_instance_ip_address : "",
                    isVMICreate : false,
                    dataSource : this.infEditView.vmiDataSrc
                }
            );
            self.subscribeServerModelChangeEvents(newServer);
            servers.add([newServer],{at: selectedRuleIndex+1});
        },


        deleteServer: function(data, kbInterface) {
            var serverCollection = data.model().collection,
                server = kbInterface.model();
            serverCollection.remove(server);
        },
        configInterface: function (callbackObj, ajaxOpt, editView) {
            var validations = [
                {
                    key: null,
                    type: cowc.OBJECT_TYPE_MODEL,
                    getValidation: 'configureValidation'
                },
                {
                    key: 'servers',
                    type: cowc.OBJECT_TYPE_COLLECTION,
                    getValidation: 'serverValidation'
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if(this.isDeepValid(validations)) {
                self = this;
                self.vmiDetails = [];
                self.editView = editView;
                //Fetch the server tuples and create vmis appropriately
                var attr = $.extend(true, {}, this.model().attributes);
                var serverTuples = this.getServerList(attr);
                var requireVMICreation = false;
                var liType = attr.logical_interface_type;
                var selectedServerDetails = [];
                if (serverTuples && serverTuples.length > 0) {
                    for(i = 0 ; i< serverTuples.length ; i++){
                        var serverIp = serverTuples[i].ip;
                        var serverMac = serverTuples[i].mac;
                        var isVMICreate = serverTuples[i].isVMICreate;
                        selectedServerDetails.push(
                            {
                                "serverMac":serverMac,
                                "serverIp":serverIp,
                                "isVMICreate":isVMICreate
                            }
                        );
                        if(isVMICreate){
                            requireVMICreation = true;
                        }
                    }
                }

                var postObject;
                if(requireVMICreation && liType === ctwl.LOGICAL_INF_L2_TYPE){
                    //L2 Server type
                    var createPortsData= [];
                    for(var i=0; i < selectedServerDetails.length; i++){
                        if(selectedServerDetails[i].isVMICreate) {
                            var mac = self.getMacFromText(
                                selectedServerDetails[i].serverMac);
                            var ip = selectedServerDetails[i].serverIp != '' ?
                                selectedServerDetails[i].serverIp.trim() : '';
                            createPortsData.push({mac : mac, ip : ip});
                        }
                    }
                    self.createPorts(createPortsData, attr, callbackObj,
                        ajaxOpt, editView);
                } else if(attr.isSubnetVMICreate &&
                    liType === ctwl.LOGICAL_INF_L3_TYPE) {
                    //Subnet creation flow
                    self.createPort({mac : '', ip : ''}, attr, callbackObj,
                        ajaxOpt, editView);
                } else {
                    /* No VMI or subnet creation just go ahead with the
                    Physical/Logical Interface creation */
                    self.createUpdatePhysicalInterface(attr, callbackObj,
                        ajaxOpt, editView);
                }
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                        ctwl.INTERFACE_PREFIX_ID));
                }
            }
        },
        getSelectedVNItem : function(val) {
            var data = this.editView.vnDataSrc;
            for(var i = 0; i < data.length; i++) {
                if(val === data[i].value) {
                    return JSON.parse(data[i].data);
                }
            }
            return {};
        },
        prepareVMIPostObject : function(input) {
            var curDomain = input.fqName[0];
            var curProject = input.fqName[1];
            var postObj = {};
            postObj["virtual-machine-interface"] = {};
            postObj["virtual-machine-interface"]["parent_type"] = "project";
            postObj["virtual-machine-interface"]["fq_name"] =
                [curDomain, curProject];
            postObj["virtual-machine-interface"]["virtual_network_refs"] =
                [{ "to": input.fqName}];
            if(input.mac != undefined) {
                postObj["virtual-machine-interface"]
                ["virtual_machine_interface_mac_addresses"] =
                {"mac_address": [input.mac]};
            }
            if(input.ip != undefined) {
                var IpAddressFamily;
                if(isIPv4(input.ip)) {
                    IpAddressFamily = "v4";
                } else if(isIPv6(input.ip)) {
                    IpAddressFamily = "v6";
                }
                postObj["virtual-machine-interface"]["instance_ip_back_refs"]
                    = [
                        {
                           "instance_ip_address" : [
                           {
                               "fixedIp": input.ip,
                               "domain": curDomain,
                               "project": curProject,
                               "instance_ip_family": IpAddressFamily
                           }
                        ]}
                      ];
            }
            postObj["virtual-machine-interface"]
                ["virtual_machine_interface_device_owner"] =
                    ctwc.LI_VMI_DEVICE_OWNER;
            if (input.isDefaultSG) {
                            postObj["virtual-machine-interface"]["security_group_refs"] =
                [{"to" :[curDomain,curProject,"default"]}];
            }
            return postObj;
        },
        createPort : function(portDetails, attr, callbackObj, ajaxOpt,
            editView) {
            var selVN = self.getSelectedVNItem(attr.user_created_virtual_network);
            self.checkDefaultSG(selVN.fqName,function(isDefaultSG) {
                var postObjInput = {};
                var ajaxConfig = {};
                postObjInput.subnetId = selVN.subnetId;
                postObjInput.fqName = selVN.fqName;
                postObjInput.isDefaultSG = isDefaultSG;
                if(portDetails.mac != '') {
                    postObjInput.mac = portDetails.mac;
                }
                postObjInput.ip = portDetails.ip;

                ajaxConfig.type = "POST";
                ajaxConfig.url = '/api/tenants/config/ports';
                ajaxConfig.data =
                    JSON.stringify(self.prepareVMIPostObject(postObjInput));
                contrail.ajaxHandler(ajaxConfig, function () {
                        callbackObj.init();
                }, function (result) {
                    if(result != null && result['virtual-machine-interface']
                        && result['virtual-machine-interface']['fq_name']) {
                        self.vmiDetails = [result];
                        var vmiId =
                            result['virtual-machine-interface']['fq_name'][2];
                        self.createUpdatePhysicalInterface(attr, callbackObj,
                            ajaxOpt, editView);
                        if (attr.logical_interface_type === ctwl.LOGICAL_INF_L3_TYPE) {
                            self.setVMIRefsToSubnet(vmiId, attr.subnet_back_refs);
                        }
                    } else {
                        callbackObj.success();
                    }
                }, function (error) {
                        callbackObj.error(error);
                });
            });
        },
        /**Checks if a sg name default is present in the project**/
        checkDefaultSG : function(fqName,callback) {
            var ajaxConfig = {};
            ajaxConfig.type = "POST";
            ajaxConfig.url = 'api/tenants/config/get-config-list';
            ajaxConfig.data =
                 JSON.stringify({
                                "data" : [ {
                                    "type" : "security-groups"
                                } ]
                            });
            contrail.ajaxHandler(ajaxConfig, null, function (result) {
                if(result != null && result.length > 0 &&
                        result[0]['security-groups']) {
                    var securityGroups = result[0]['security-groups'];
                    var isDefaultSG = false;
                    var defaultSG = fqName[0] + ":" + fqName[1] + ':default';
                    for(var i = 0 ; i < securityGroups.length; i++) {
                        var sgfqname =
                            cowu.getValueByJsonPath(securityGroups[i],
                                    'fq_name');
                        if(sgfqname.join(':') == defaultSG){
                            isDefaultSG = true;
                            break;
                        }
                    }
                    callback(isDefaultSG);
                } else {
                    callback(false);
                }
            }, function (error) {
                callback(false);
            });
        },
        setVMIRefsToSubnet : function(vmiId, subnet_back_refs) {
            var ajaxConfig = {};
            /*var subnetArry = subnet.split('/');
            var subnetPostObj = {
                "subnet": {
                    "subnet_ip_prefix": {
                        "ip_prefix": subnetArry[0],
                        "ip_prefix_len": parseInt(subnetArry[1])
                    }
                }
            };*/
            ajaxConfig.type = "POST";
            ajaxConfig.url =
                '/api/tenants/config/set-vmi-refs-to-subnet/' + vmiId;
            ajaxConfig.data = JSON.stringify(subnet_back_refs);

            contrail.ajaxHandler(ajaxConfig, null,
                function (result) {
                }, function (error) {
                }
            );
        },
        createPorts : function(portsDetails, attr, callbackObj, ajaxOpt,
            editView) {
            var selVN = self.getSelectedVNItem(attr.user_created_virtual_network);
            self.checkDefaultSG(selVN.fqName, function(isDefaultSG) {
                var portCreateAjaxs = [];
                for(var i = 0; i < portsDetails.length; i++){
                    var postObjInput = {};
                    postObjInput.subnetId = selVN.subnetId;
                    postObjInput.fqName = selVN.fqName;
                    postObjInput.isDefaultSG = isDefaultSG;
                    if(portsDetails[i].mac != '') {
                        postObjInput.mac = portsDetails[i].mac;
                    }
                    postObjInput.ip = portsDetails[i].ip;
                    portCreateAjaxs.push($.ajax({
                        url : '/api/tenants/config/ports',
                        type : "POST",
                        contentType : 'application/json',
                        data :
                            JSON.stringify(self.prepareVMIPostObject(postObjInput))
                    }));
                }
                var defer = $.when.apply($, portCreateAjaxs);
                defer.done(function(){
    
                    /* This is executed only after every ajax request has been
                    completed */
                    if(portCreateAjaxs.length > 1){
                        $.each(arguments, function(index, result){
                            result = result[0];//0 element contains the response
                            if(result != null && result['virtual-machine-interface']
                                    && result['virtual-machine-interface']
                                    ['fq_name']) {
                                self.vmiDetails.push(result);
                            } else {
                                callbackObj.success();
                            }
                        });
                        if(self.vmiDetails.length >= 1) {
                            self.createUpdatePhysicalInterface(attr, callbackObj,
                            ajaxOpt, editView);
                        }
                    } else {
                        var result = arguments[0];
                        if(result != null && result['virtual-machine-interface']
                                && result['virtual-machine-interface']['fq_name']) {
                            self.vmiDetails.push(result);
                            self.createUpdatePhysicalInterface(attr, callbackObj,
                            ajaxOpt, editView);
                        } else {
                            callbackObj.success();
                        }
                    }
                }).fail(function(error){
                     //failure
                     var r = arguments;
                     callbackObj.error(error);
                     if(self.vmiDetails.length > 0) {
                         self.deleteVirtulMachineInterfaces(
                             self.prepareDeletePortListForFailedLI());
                     }
                });
            });
        },
        getMacFromText : function(mac) {
            mac = mac.trim();
            if(mac != null) {
                if(mac.indexOf('(') != -1) {
                    mac = mac.split(' ')[0];
                }
            }
            return mac;
        },
        getSelectedVMIItem : function(mac, ip) {
            var data = self.infEditView.vmiDataSrc;
            ip = ip ? ip.trim() : "";
            for(var i = 0; i < data.length; i++) {
                if(ip){
                    if(mac === data[i].text && ip === data[i].ip) {
                        return data[i];
                    }
                } else {
                    if(mac === data[i].text) {
                        return data[i];
                    }
                }
            }
            return '';
        },
        getParentUUID : function(txt, dataSource) {
            var uuid = '';
            if(dataSource != null && dataSource.length > 0) {
                for(var i = 0; i < dataSource.length; i++) {
                    if(dataSource[i].text === txt){
                        uuid = dataSource[i].value;
                    }
                }
            }
            return uuid;
        },
        setPostDataPhysicaInfDetails : function(piName, piDispName, prName,
            attr, ajaxOpt) {
            var postObject = {};
            var ajaxConfig = {};
            var piRef = attr.user_created_physical_interface,
            actPIRef = [];
            ajaxConfig.url = ajaxOpt.url + '/' + ctwl.PHYSICAL_INF;
            postObject["physical-interface"] = {};
            postObject["physical-interface"]["fq_name"] =
                ["default-global-system-config",
                prName, piName];
            postObject["physical-interface"]["parent_type"] =
                "physical-router";
            postObject["physical-interface"]["name"] = piName;
            postObject["physical-interface"]["display_name"] =
                piDispName;
            if(piRef && piRef !== "none") {
                if(piRef.indexOf(ctwc.PHYSICAL_INF_LINK_PATTERN) !== -1) {
                   piRef = piRef.split(ctwc.PHYSICAL_INF_LINK_PATTERN);
                   if(piRef.length === 3) {
                       _.each(piRef, function(pi) {
                           actPIRef.push(pi);
                       });
                       postObject["physical-interface"]
                           ["physical_interface_refs"] = [{ "to" : actPIRef}];
                   }
                }
            } else {
                postObject["physical-interface"]["physical_interface_refs"] = [];
            }
            //ethernet segment identifier
            postObject["physical-interface"]["ethernet_segment_identifier"] =
                attr.ethernet_segment_identifier ? attr.ethernet_segment_identifier : null;
            if(ajaxOpt.type === 'PUT') {
                postObject["physical-interface"]["uuid"] = attr.uuid;
                ajaxConfig.url = ajaxConfig.url + '/' + attr.uuid;
            }
            //permissions
            this.updateRBACPermsAttrs(attr);
            postObject["physical-interface"]["perms2"] =
                attr["perms2"];
            ajaxConfig.data = JSON.stringify(postObject);
            ajaxConfig.type = ajaxOpt.type;
            return ajaxConfig;
        },
        createUpdatePhysicalInterface : function(attr, callbackObj, ajaxOpt,
            editView) {
            var ajaxConfig = {};
            var postObject = {};
            var type = attr.type;
            var parentType = attr.parent_type;
            var name = attr.name.trim();
            var actName = self.handleInterfaceName(name);
            var vlan =  attr.logical_interface_vlan_tag != null &&
                attr.logical_interface_vlan_tag.toString().trim() != ''?
                parseInt(attr.logical_interface_vlan_tag.toString().trim()) :
                0;
            var pRouterDD = editView.pRouterSelData;
            var pRouterUUID = pRouterDD.value;
            var postObject = {};
            ajaxConfig.type = ajaxOpt.type;
            //Only Physical interface case
            if(type === ctwl.PHYSICAL_INF) {
                ajaxConfig = self.setPostDataPhysicaInfDetails(actName,
                    name, pRouterDD.name, attr, ajaxOpt);
                contrail.ajaxHandler(ajaxConfig, function () {
                        callbackObj.init();
                }, function (response) {
                        callbackObj.success();
                }, function (error) {
                        callbackObj.error(error);
                });
            } else {//Logical interface case
                var liType = attr.logical_interface_type;
                var parent = attr.parent;

               //Fetch the server tuples
                var serverTuples = this.getServerList(attr);
                var selectedServerDetails = []
                if (serverTuples && serverTuples.length > 0) {
                    for(i = 0 ; i< serverTuples.length ; i++){
                        var vmiData =
                            self.getSelectedVMIItem(serverTuples[i].mac,
                                serverTuples[i].ip);
                        var vmiFQName = null;
                        if(typeof vmiData === 'object') {
                            selectedServerDetails.push(
                                JSON.parse(vmiData.data));
                        }
                        var serverIp = serverTuples[i].ip;
                    }
                }
                //End of fetching the server tuples
                var vmiRefs = [];
                for(var j = 0; j < self.vmiDetails.length ; j++){
                    if(self.vmiDetails[j] != null) {
                        var vmiData = self.vmiDetails[j]
                            ['virtual-machine-interface']['fq_name'];
                        vmiRefs.push({"to" : [vmiData[0], vmiData[1],
                            vmiData[2]], "uuid": self.vmiDetails[j]
                            ['virtual-machine-interface']['uuid']});
                    }
                }
                for(var j = 0; j < selectedServerDetails.length; j++){
                    var vmiFqname = 'none';
                    vmiFqname = selectedServerDetails[j]['fq_name'];
                    vmiRefs.push({"to" : [vmiFqname[0], vmiFqname[1],
                    vmiFqname[2]],"uuid": selectedServerDetails[j]['uuid']});
                }
                //Logical interface directly under pRouter case
                if(attr.parent_type === ctwl.PARENT_TYPE_PROUTER) {
                    postObject["logical-interface"] = {};
                    postObject["logical-interface"]["fq_name"] =
                    ["default-global-system-config", pRouterDD.name, actName];
                    postObject["logical-interface"]["parent_type"] =
                    attr.parent_type;
                    postObject["logical-interface"]["name"] = actName;
                    postObject["logical-interface"]["display_name"] = name;
                    if(vlan !== null){
                    postObject["logical-interface"]
                        ["logical_interface_vlan_tag"] = vlan;
                    }
                    postObject["logical-interface"]
                        ['virtual_machine_interface_refs'] = vmiRefs;
                    postObject["logical-interface"]
                        ["logical_interface_type"] = liType;
                    //permissions
                    this.updateRBACPermsAttrs(attr);
                    postObject["logical-interface"]["perms2"] =
                        attr["perms2"];
                    if(ajaxOpt.type === 'PUT') {
                        postObject["logical-interface"]["uuid"] =
                            attr.uuid;
                        ajaxConfig.url = ajaxOpt.url + '/' + type + '/' +
                            attr.uuid;
                    } else {
                        ajaxConfig.url = ajaxOpt.url + '/' + type;
                    }
                    ajaxConfig.data = JSON.stringify(postObject);
                    contrail.ajaxHandler(ajaxConfig, function () {
                            callbackObj.init();
                    }, function (response) {
                            //clear ports
                            if(ajaxOpt.type === 'PUT') {
                                if(attr.clearPorts) {
                                    self.deleteVirtulMachineInterfaces(
                                       self.prepareDeletePortListForEdit(attr));
                                } else {
                                    self.setEmptyDeviceOwnerForRemovedPorts(
                                       self.preparePortListForDeviceOwner(attr)
                                    );
                                }
                                setCookie(ctwl.BM_CLEAR_VMI, attr.clearPorts);
                            }
                            callbackObj.success();
                    }, function (error) {
                            callbackObj.error(error);
                    });
                } else {
                    var piDispName = parent.trim();
                    var piName = self.handleInterfaceName(piDispName);
                    /*Double creation case where Physical
                    interface is created first*/
                    var pInterfaceDS = self.getPhysicalInterfaceData();
                    if(!editView.isItemExists(parent, pInterfaceDS)) {
                        ajaxConfig = self.setPostDataPhysicaInfDetails(piName,
                            piDispName, pRouterDD.name, attr, ajaxOpt);
                        contrail.ajaxHandler(ajaxConfig, function () {
                            callbackObj.init();
                        },
                        function (response) {
                            if(response != null &&
                                response["physical-interface"] != null) {
                                var uuid =
                                response["physical-interface"].uuid;
                                postObject = self.liPostObject(
                                    pRouterDD.name, piName, actName, uuid, name,
                                    vlan, vmiRefs, liType, ajaxOpt, attr);
                                postObject["logical-interface"]["perms2"] =
                                    attr["perms2"];
                                ajaxConfig.data = JSON.stringify(postObject);
                                ajaxConfig.url = ajaxOpt.url + '/' + type;
                                contrail.ajaxHandler(ajaxConfig, function () {
                                    callbackObj.init();
                                }, function (response) {
                                    callbackObj.success();
                                }, function (error) {
                                    callbackObj.error(error);
                                    if(self.vmiDetails.length > 0) {
                                        self.deleteVirtulMachineInterfaces(
                                            self.
                                            prepareDeletePortListForFailedLI()
                                        );
                                    }
                                });
                            }
                        }, function (error) {
                            callbackObj.error(error);
                        });
                    } else {
                        /*If the Physical interface already
                        exists create the Logical interface*/
                        postObject = self.liPostObject(pRouterDD.name, piName,
                            actName, this.getParentUUID(parent, pInterfaceDS),
                            name, vlan, vmiRefs,liType, ajaxOpt, attr);
                        if(ajaxOpt.type === 'PUT') {
                            postObject["logical-interface"]["uuid"] =
                                attr.uuid;
                            ajaxConfig.url = ajaxOpt.url + '/' + type + '/'
                                + attr.uuid;
                        } else {
                            ajaxConfig.url = ajaxOpt.url + '/' + type;
                        }
                        ajaxConfig.data = JSON.stringify(postObject);
                        contrail.ajaxHandler(ajaxConfig, function () {
                            callbackObj.init();
                        }, function (response) {
                            //clear ports
                            if(ajaxOpt.type === 'PUT') {
                                if(attr.clearPorts) {
                                    self.deleteVirtulMachineInterfaces(
                                       self.prepareDeletePortListForEdit(attr));
                                } else {
                                    self.setEmptyDeviceOwnerForRemovedPorts(
                                        self.preparePortListForDeviceOwner(attr)
                                    );
                                }
                                setCookie(ctwl.BM_CLEAR_VMI, attr.clearPorts);
                            }
                            callbackObj.success();
                        }, function (error) {
                            callbackObj.error(error);
                            if(self.vmiDetails.length > 0) {
                                self.deleteVirtulMachineInterfaces(
                                    self.prepareDeletePortListForFailedLI());
                            }
                        });
                    }
                }
            }
        },
        deleteVirtulMachineInterfaces : function(deleteVMIs) {
            var deleteAjaxs = [];
            for(var i = 0; i < deleteVMIs.length; i++) {
                deleteAjaxs[i] =  $.ajax({
                        url:'/api/tenants/config/ports/' + deleteVMIs[i],
                        type:'DELETE'
                    })
            }
            $.when.apply($,deleteAjaxs).then(
                function(response){
                },
                function(){
                }
            );
        },
        liPostObject : function(pRouterDDName, piName, actName,
            uuid, name, vlan, vmiRefs, liType, ajaxOpt, attr) {
            var postObject = {};
            postObject["logical-interface"] = {};
            postObject["logical-interface"]["fq_name"] =
            ["default-global-system-config", pRouterDDName,
            piName, actName];
            postObject["logical-interface"]["parent_type"] =
            "physical-interface";
            postObject["logical-interface"]["parent_uuid"] =
            uuid;
            postObject["logical-interface"]["name"] = actName;
            postObject["logical-interface"]["display_name"] =
            name;
            if(vlan !== null) {
            postObject["logical-interface"]
            ["logical_interface_vlan_tag"] = vlan;
            }
            postObject["logical-interface"]
            ['virtual_machine_interface_refs'] = vmiRefs;
            postObject["logical-interface"]
            ["logical_interface_type"] = liType;
            //permissions
            this.updateRBACPermsAttrs(attr);
            postObject["logical-interface"]["perms2"] =
                attr["perms2"];
            return postObject;
        },
        handleInterfaceName : function(name) {
            var actName = name;
            if(name.indexOf(':') != -1){
                actName = name.replace(':','__');
            }
            return actName;
        },
        filterSelectedRowsByType :  function(checkedRows, type) {
            var finalList = [];
            for(var i = 0; i < checkedRows.length; i++) {
                var row = checkedRows[i];
                if(row.type == type) {
                    var vmiId =
                        this.getPortIdsFromRefs(row.virtual_machine_interface_refs);
                    var subnetId =
                        this.getSubnetIdsFromBackRefs(row.subnet_back_refs);
                    finalList.push(
                        {
                            type : checkedRows[i].type,
                            uuid : checkedRows[i].uuid,
                            vmiIdArr : vmiId,
                            subnetId : subnetId
                        }
                    );
                }
            }
            return finalList;
        },
        getPortIdsFromRefs : function(vmiRefs) {
            var vmiUUIDList = [];
            var refs = ifNull(vmiRefs, []);
            for(var i = 0; i < refs.length; i++) {
                vmiUUIDList.push(refs[i]['virtual-machine-interface'].uuid);
            }
            return vmiUUIDList;
        },
        getSubnetIdsFromBackRefs : function(subnetBackRefs) {
            var subnetUUIDList = [];
            var refs = ifNull(subnetBackRefs, []);
            for(var i = 0; i < refs.length; i++) {
                subnetUUIDList.push(refs[i]['subnet'].uuid);
            }
            return subnetUUIDList;
        },
        deletePhysicalInterfaces : function(checkedRows, callbackObj) {
            self = this;
            self.selAllRows = checkedRows;
            //delete logical interfaces
            var selRowsByLI = self.filterSelectedRowsByType(self.selAllRows,
                ctwl.LOGICAL_INF);
            self.deleteInterface(selRowsByLI, callbackObj);
        },
        deleteInterface : function(selRowsByType, callbackObj) {
            var ajaxConfig = {};
            ajaxConfig.type = "POST";
            ajaxConfig.url = '/api/tenants/config/interfaces/delete';
            ajaxConfig.data = JSON.stringify(selRowsByType);
            ajaxConfig.timeout = 300000;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                //delete physical interfaces
                var selRowsByPI =
                    self.filterSelectedRowsByType(
                        self.selAllRows, ctwl.PHYSICAL_INF);
                if(selRowsByPI.length > 0) {
                    self.deleteInterface(selRowsByPI, callbackObj);
                    self.selAllRows = [];
                } else {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        deleteAllInterfaces : function (data, callbackObj) {
            var ajaxConfig = {}, that = this;
            ajaxConfig.type = "DELETE";
            ajaxConfig.url = '/api/tenants/config/delete-all-interfaces?prUUID='
                + data.value;
            ajaxConfig.timeout = 300000;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },

        setEmptyDeviceOwnerForRemovedPorts : function(portRefs) {
            var putDataList = {}, ajaxConfig = {};
            putDataList.data = [];
            _.each(portRefs, function(portRef){
                var putData = {},
                    port = getValueByJsonPath(portRef,
                        "virtual-machine-interface", {}, false);
                putData["virtual-machine-interface"] = {};
                putData["virtual-machine-interface"]["fq_name"] = port.fq_name;
                putData["virtual-machine-interface"]["uuid"] = port.uuid;
                putData["virtual-machine-interface"]["parent_type"] = "project";
                putData["virtual-machine-interface"]
                    ["virtual_machine_interface_device_owner"] = "";
                putData.simple_edit = true;
                putDataList.data.push({
                    "data": putData,
                    "reqUrl" : '/virtual-machine-interface/' + port.uuid});
            })
            if(putDataList.data.length) {
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECTS;
                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(putDataList);
                contrail.ajaxHandler(ajaxConfig, null,
                        function(success){},
                        function(error){}
                );
            }
        },

        preparePortListForDeviceOwner : function(attr) {
            var deleteVMIList = [],
                serverTuples = this.getServerList(attr),
                allVMIRefs = getValueByJsonPath(attr,
                        'virtual_machine_interface_refs', [], false),
                selVMIList = [];
            _.each(serverTuples, function(server){
                if(server.uuid) {
                    selVMIList.push(server.uuid);
                }
            });
            if(selVMIList.length > 0) {
                _.each(allVMIRefs, function(vmiRef){
                    var vmi = getValueByJsonPath(vmiRef,
                        'virtual-machine-interface', {}, false);
                    if($.inArray(vmi.uuid, selVMIList) == -1) {
                        deleteVMIList.push(vmiRef);
                    }
                })
            } else {
                deleteVMIList = allVMIRefs;
            }
            return deleteVMIList;
        },

        prepareDeletePortListForEdit : function(attr) {
            var deleteVMIList = [];
            var serverTuples = this.getServerList(attr);
            var selectedServerDetails = []
            var extIdList =
                this.getPortIdsFromRefs(attr['virtual_machine_interface_refs']);
            var selVMIList = [];
            if (serverTuples && serverTuples.length > 0) {
                for(var i = 0 ; i< serverTuples.length ; i++){
                    var server = serverTuples[i];
                    if(server.uuid) {
                        selVMIList.push(server.uuid);
                    }
                }
            }
            if(selVMIList.length > 0) {
                for(var i = 0; i < extIdList.length; i++) {
                    if($.inArray(extIdList[i], selVMIList) == -1) {
                        deleteVMIList.push(extIdList[i]);
                    }
                }
            } else {
                deleteVMIList = extIdList;
            }
            return deleteVMIList;
        },
        prepareDeletePortListForFailedLI : function() {
            var deleteVMIList = [];
                for(var j = 0; j < self.vmiDetails.length ; j++){
                    if(self.vmiDetails[j] != null &&
                        self.vmiDetails[j]['virtual-machine-interface'] != null
                        && self.vmiDetails[j]['virtual-machine-interface']
                        ['uuid'] != null) {
                        deleteVMIList.push(
                            self.vmiDetails[j]['virtual-machine-interface']
                                ['uuid']
                        );
                    }
                }
            return deleteVMIList;
        },
        validations: {
            configureValidation: {
                name : {
                    required : true,
                    msg : "Interface Name is required"
                },
                logical_interface_vlan_tag : function(value, attr, finalObj){
                    if(value != null && value != '') {
                        var vlan = parseInt(value.toString().trim());
                        if(isNaN(vlan) || vlan < 0 || vlan > 4094) {
                             return 'VLAN Id should be in  "0 - 4094" range';
                        }
                    }
                },
                user_created_subnet : function(value, attr, finalObj){
                    if(finalObj.logical_interface_type ===
                        ctwl.LOGICAL_INF_L3_TYPE) {
                        if(finalObj.user_created_virtual_network != 'none' &&
                            (value == null || value.split("/").length != 2)) {
                            return "Enter a valid Subnet in xxx.xxx.xxx.xxx/xx";
                        }
                    }
                },
                user_created_virtual_network : function(value, attr, finalObj){
                    if(finalObj.logical_interface_type ===
                        ctwl.LOGICAL_INF_L3_TYPE) {
                        if(finalObj.user_created_virtual_network === 'none') {
                            return "Select a Virtual Network";
                        }
                   }
                },
                parent_type : function(value, attr, finalObj){
                    if(finalObj.type !== ctwl.PHYSICAL_INF) {
                        if(value === null) {
                            return  "Select a Parent Type";
                        }
                    }
                },
                servers : function(value, attr, finalObj){
                    var serverArray =  finalObj.servers.toJSON();
                    var macAddresses = [];
                    var isRepeated = false;
                    if(serverArray) {
                        _.each(serverArray, function(item){
                            var macAddress = item.user_created_mac_address();
                            macAddresses.push(
                                macAddress.indexOf('(') ?
                                macAddress.split(' ')[0] : macAddress);
                        });
                        var sortedMacAddress= macAddresses.sort();
                        for(var i = 0; i < sortedMacAddress.length; i++){
                            if(sortedMacAddress[i] === sortedMacAddress[i + 1]){
                                return "MAC Addresses are repeated";
                            }
                        }
                    }
                },
                ethernet_segment_identifier : function(value, attr, finalObj){
                    if(finalObj.type === 'physical'){
                        if(value != null && value.trim() != "" && !ctwp.isValidEsi(value)){
                            return 'Please enter valid ESI string format.';
                        }
                    }
                }
            }
        }
    });
    return InterfacesModel;
});
