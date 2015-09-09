/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model',
    'config/physicaldevices/interfaces/ui/js/models/ServersModel'
], function (_, ContrailModel, ServersModel) {
    var self;
    var InterfacesModel = ContrailModel.extend({
        defaultConfig: {
            'uuid' : '',
            'name' : '',
            'type' : 'Logical',
            'parent' : 'ge-2/2/2',
            'logicalInfType' : 'L2',
            'vlan' : '',
            'vnUUID' : 'none',
            'infSubnet' : '',
            'servers' : [],
            'isSubnetVMICreate' : false
        },
        formatModelConfig: function (modelConfig) {
            /*
                Populating ServersModel
             */
            var servers = (modelConfig['server'] != null) ?
                (modelConfig['server']) : [],
                serverModels = [], serverModel,
                serverCollectionModel;
            if(servers.length > 0) {
                for(var i = 0; i < servers.length; i++) {
                    var formattedServer = this.formatServer(servers[i]);
                    var mac = formattedServer.mac;
                    if(formattedServer.ip != null &&
                        formattedServer.ip != '-' && formattedServer.ip != ''){
                        mac = mac + ' (' + formattedServer.ip + ')';
                    }
                    serverModel = new ServersModel(
                        {
                            mac : mac,
                            ip : formattedServer.ip,
                            isVMICreate : false
                        }
                    );
                    serverModels.push(serverModel)
                }
            }
            serverCollectionModel = new Backbone.Collection(serverModels);
            modelConfig['servers'] = serverCollectionModel;
            return modelConfig;
        },
        formatServer : function(server) {
            var parts = server.trim().split(' ');
            return {
                mac : parts[0],
                ip : parts[1] != null ?
                    parts[1].replace(')','').replace('(','') : ''
            };
        },
        getServersList : function(attr) {
            var serverCollection = attr.servers.toJSON(),
                serverArray = [];
            for(var i = 0; i < serverCollection.length; i++) {
                serverArray.push(
                    {
                        mac : serverCollection[i].mac(),
                        ip : serverCollection[i].ip(),
                        isVMICreate : serverCollection[i].isVMICreate()
                    }
                );
            }
            return serverArray;
        },
        addServer: function() {
            var servers = this.model().attributes['servers'],
                newServer = new ServersModel({mac: "", ip : "",
                    isVMICreate : false});
            servers.add([newServer]);
            if(this.infEditView.mode == ctwl.CREATE_ACTION) {
                var macCB =  $('#mac_combobox').data('contrailCombobox');
                macCB.setData(this.infEditView.vmiDataSrc);
            }
        },
        deleteServer: function(data, kbInterface) {
            var serverCollection = data.model().collection,
                server = kbInterface.model();
            serverCollection.remove(server);
        },
        configInterface: function (callbackObj, ajaxOpt, editView) {
            if (this.model().isValid(true, "configureValidation")) {
                self = this;
                self.vmiDetails = [];
                self.editView = editView;
                //Fetch the server tuples and create vmis appropriately
                var attr = this.model().attributes;
                var serverTuples = this.getServersList(attr);
                var requireVMICreation = false;
                var liType = attr.logicalInfType;
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
                if(requireVMICreation && liType === 'L2'){
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
                } else if(attr.isSubnetVMICreate && liType === 'L3') {
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
                    return data[i];
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
                postObj["virtual-machine-interface"]["instance_ip_back_refs"]
                    = [
                        {
                           "instance_ip_address" : [
                           {
                               "fixedIp": input.ip,
                               "domain": curDomain,
                               "project": curProject
                           }
                        ]}
                      ];
            }
            postObj["virtual-machine-interface"]
                ["virtual_machine_interface_device_owner"] = "";
            postObj["virtual-machine-interface"]["security_group_refs"] =
                [{"to" :[curDomain,curProject,"default"]}];
            return postObj;
        },
        createPort : function(portDetails, attr, callbackObj, ajaxOpt,
            editView) {
            var postObjInput = {};
            var ajaxConfig = {};
            var selVN = self.getSelectedVNItem(attr.vnUUID);
            selVN = JSON.parse(selVN.data);
            postObjInput.subnetId = selVN.subnetId;
            postObjInput.fqName = selVN.fqName;
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
                    if (attr.logicalInfType === 'L3' &&
                        attr.infSubnet.trim() != '') {
                        self.setVMIRefsToSubnet(vmiId, attr.infSubnet.trim());
                    }
                } else {
                    callbackObj.success();
                }
            }, function (error) {
                    callbackObj.error(error);
            });
        },
        setVMIRefsToSubnet : function(vmiId, subnet) {
            var ajaxConfig = {};
            var subnetArry = subnet.split('/');
            var subnetPostObj = {
                "subnet": {
                    "subnet_ip_prefix": {
                        "ip_prefix": subnetArry[0],
                        "ip_prefix_len": parseInt(subnetArry[1])
                    }
                }
            };
            ajaxConfig.type = "POST";
            ajaxConfig.url =
                '/api/tenants/config/set-vmi-refs-to-subnet/' + vmiId;
            ajaxConfig.data = JSON.stringify(subnetPostObj);

            contrail.ajaxHandler(ajaxConfig, null,
                function (result) {
                }, function (error) {
                }
            );
        },
        createPorts : function(portsDetails, attr, callbackObj, ajaxOpt,
            editView) {
            var portCreateAjaxs = [];
            for(var i = 0; i < portsDetails.length; i++){
                var postObjInput = {};
                var selVN = self.getSelectedVNItem(attr.vnUUID);
                if(selVN != {}) {
                    selVN = JSON.parse(selVN.data);
                    postObjInput.subnetId = selVN.subnetId;
                    postObjInput.fqName = selVN.fqName;
                }
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
            }).fail(function(){
                 //failure
                 var r = arguments;
                 callbackObj.success();
                 /*if(vmiDetails.length > 0) {
                    deleteVirtulMachineInterfaces(prepareDeletePortListForFailedLI(), []);
                 }*/
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
        getSelectedVMIItem : function(val) {
            var data = self.editView.vmiDataSrc;
            for(var i = 0; i < data.length; i++) {
                if(val === data[i].text) {
                    return data[i];
                }
            }
            return '';
        },
        createUpdatePhysicalInterface : function(attr, callbackObj, ajaxOpt,
            editView) {
            var ajaxConfig = {};
            var postObject = {};
            var type = attr.type;
            var name = attr.name.trim();
            var actName = self.handleInterfaceName(name);
            var vlan =  attr.vlan === '' ? 0 : parseInt(attr.vlan);
            var pRouterDD = editView.pRouterSelData;
            var pRouterUUID = pRouterDD.value;
            var postObject = {};
            ajaxConfig.type = ajaxOpt.type;
            //Only Physical interface case
            if(type === 'Physical') {
                postObject["physical-interface"] = {};
                postObject["physical-interface"]["fq_name"] =
                ["default-global-system-config", pRouterDD.name, actName];
                    postObject["physical-interface"]["parent_type"] =
                "physical-router";
                postObject["physical-interface"]["name"] = actName;
                postObject["physical-interface"]["display_name"] = name;
                if(ajaxOpt.type === 'PUT') {
                    postObject["physical-interface"]["uuid"] = attr.uuid;
                }
                ajaxConfig.url = ajaxOpt.url + '/' + 'Physical';
                ajaxConfig.data = JSON.stringify(postObject);
                contrail.ajaxHandler(ajaxConfig, function () {
                        callbackObj.init();
                }, function (response) {
                        callbackObj.success();
                }, function (error) {
                        callbackObj.error(error);
                });
            } else {//Logical interface case
                var liType = attr.logicalInfType;
                liType = (liType == 'l2Gateway' || liType == 'L2') ?
                    'l2' : 'l3';
                var parent = $('#parent_dropdown').data('contrailDropdown');//attr.parent;

               //Fetch the server tuples
                var serverTuples = this.getServersList(attr);
                var selectedServerDetails = []
                if (serverTuples && serverTuples.length > 0) {
                    for(i = 0 ; i< serverTuples.length ; i++){
                        var vmiData =
                            self.getSelectedVMIItem(serverTuples[i].mac);
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
                if(pRouterDD.value === parent.value()) {
                    postObject["logical-interface"] = {};
                    postObject["logical-interface"]["fq_name"] =
                    ["default-global-system-config", pRouterDD.name, actName];
                    postObject["logical-interface"]["parent_type"] =
                    "physical-router";
                    postObject["logical-interface"]["name"] = actName;
                    postObject["logical-interface"]["display_name"] = name;
                    postObject["logical-interface"]
                        ["logical_interface_vlan_tag"] = vlan;
                    postObject["logical-interface"]
                        ['virtual_machine_interface_refs'] = vmiRefs;
                    postObject["logical-interface"]
                        ["logical_interface_type"] = liType;
                    if(ajaxOpt.type === 'PUT') {
                        postObject["logical-interface"]["uuid"] =
                            attr.uuid;
                        ajaxConfig.url = ajaxOpt.url + '/' + 'Logical' + '/' +
                            attr.uuid;
                    } else {
                        ajaxConfig.url = ajaxOpt.url + '/' + 'Logical';
                    }
                    ajaxConfig.data = JSON.stringify(postObject);
                    contrail.ajaxHandler(ajaxConfig, function () {
                            callbackObj.init();
                    }, function (response) {
                            callbackObj.success();
                    }, function (error) {
                            callbackObj.error(error);
                    });
                } else {
                    var piDispName = parent.text().trim();
                    var piName = self.handleInterfaceName(piDispName);
                    /*Double creation case where Physical
                    interface is created first*/
                    var pInterfaceDS;
                    if(window.inf !== undefined){
                        pInterfaceDS = window.inf.pInterfaceDS;
                    }
                    if(!editView.isItemExists(parent.text(), pInterfaceDS)) {
                        postObject["physical-interface"] = {};
                        postObject["physical-interface"]["fq_name"] =
                            ["default-global-system-config",
                            pRouterDD.name, piName];
                        postObject["physical-interface"]["parent_type"] =
                            "physical-router";
                        postObject["physical-interface"]["name"] = piName;
                        postObject["physical-interface"]["display_name"] =
                            piDispName;
                        if(ajaxOpt.type === 'PUT') {
                            postObject["physical-interface"]["uuid"] =
                                attr.uuid;
                        }
                        ajaxConfig.data = JSON.stringify(postObject);
                        ajaxConfig.url = ajaxOpt.url + '/' + 'Physical';
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
                                    vlan, vmiRefs, liType, ajaxOpt);
                                ajaxConfig.data = JSON.stringify(postObject);
                                ajaxConfig.url = ajaxOpt.url + '/' + 'Logical';
                                contrail.ajaxHandler(ajaxConfig, function () {
                                    callbackObj.init();
                                }, function (response) {
                                    callbackObj.success();
                                }, function (error) {
                                    callbackObj.error(error);
                                });
                            }
                        }, function (error) {
                            callbackObj.error(error);
                        });
                    } else {
                        /*If the Physical interface already
                        exists create the Logical interface*/
                        postObject = self.liPostObject(pRouterDD.name, piName,
                            actName, parent.value(), name, vlan, vmiRefs,
                            liType, ajaxOpt);
                        if(ajaxOpt.type === 'PUT') {
                            postObject["logical-interface"]["uuid"] =
                                attr.uuid;
                            ajaxConfig.url = ajaxOpt.url + '/' + 'Logical' + '/'
                                + attr.uuid;
                        } else {
                            ajaxConfig.url = ajaxOpt.url + '/' + 'Logical';
                        }
                        ajaxConfig.data = JSON.stringify(postObject);
                        contrail.ajaxHandler(ajaxConfig, function () {
                            callbackObj.init();
                        }, function (response) {
                            callbackObj.success();
                        }, function (error) {
                            callbackObj.error(error);
                        });
                    }
                }
            }
        },
        liPostObject : function(pRouterDDName, piName, actName,
            uuid, name, vlan, vmiRefs, liType, ajaxOpt) {
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
            postObject["logical-interface"]
            ["logical_interface_vlan_tag"] = vlan;
            postObject["logical-interface"]
            ['virtual_machine_interface_refs'] = vmiRefs;
            postObject["logical-interface"]
            ["logical_interface_type"] = liType;
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
                    var vmiId = row.vmi_uuid != null &&
                        row.vmi_uuid.length > 0 ? row.vmi_uuid : null;
                    var subnetId = row.subnetUUIDArr != null &&
                        row.subnetUUIDArr != '-' &&
                        row.subnetUUIDArr.length > 0 ? row.subnetUUIDArr : null;
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
        deletePhysicalInterface : function(checkedRows, callbackObj) {
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
        validations: {
            configureValidation: {
                name : {
                    required : true,
                    msg : "Name is required"
                },
                torAgent1 : function(value, attr, finalObj){
                    if(finalObj.virtualRouterType == 'TOR Agent' &&
                    value.trim() === "" && finalObj.torAgent2.trim() === ""){
                         return "Select or Enter atleast one ToR";
                    }
                }
            }
        }
    });
    return InterfacesModel;
});

