/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-config-model',
    'config/physicaldevices/physicalrouters/ui/js/models/servicePortsModel'
], function (_, ContrailConfigModel, ServicePortModel) {
    var self;
    var PhysicalRouterModel = ContrailConfigModel.extend({
        defaultConfig: {
            'uuid' : null,
            'name' : null,
            'display_name' : null,
            'physical_router_vendor_name' : null,
            'physical_router_product_name' : "",
            'physical_router_management_ip' : null,
            'physical_router_dataplane_ip' : null,
            'physical_router_loopback_ip' : null,
            'snmpMntd' : false,
            'physical_router_snmp_credentials' : {
                'v2_community' : null,
                'v3_privacy_protocol' : null,
                'retries' : null,
                'v3_authentication_password' : null,
                'v3_engine_time' : null,
                'v3_engine_id' : null,
                'local_port': null,
                'v3_security_name': null,
                'v3_context': null,
                'v3_security_level': null,
                'v3_authentication_protocol': null,
                'v3_security_engine_id': null,
                'v3_context_engine_id': null,
                'version': null,
                'timeout': null,
                'v3_privacy_password': null,
                'v3_engine_boots': null

            },
            'user_created_version' : null,
            'user_created_security_level' : null,
            'physical_router_user_credentials' : {
                'username' : null,
                'password' : null
            },
            'isJunosPortEnabled' : false,
            'physical_router_junos_service_ports' : {
                'service_port' : []
            },
            'virtual_router_refs' : [],
            'user_created_torAgent1' : null,
            'user_created_torAgent2' : null,
            'user_created_tsn1' : null,
            'user_created_tsn2' : null,
            'bgp_router_refs' : [],
            'user_created_bgp_router' : null,
            'virtualRouterType' : null,
            'physical_router_vnc_managed' : false,
            'virtual_network_refs' : [],
            'user_created_virtual_network' : null,
            'physical_router_role': 'none',
            'evpn_peered_tor': false,
            'roleDataSource': ctwc.PHYSICAL_ROUTER_ROLE_DATA
        },
        formatModelConfig: function (modelConfig) {
            /*
                Populating ServicePortModel from junosServicePorts
             */
            self = this;
            var ports = getValueByJsonPath(modelConfig,
                'physical_router_junos_service_ports;service_port', []),
                portModels = [], portModel,
                portCollectionModel, bgpRouterRef;
            if(ports.length > 0) {
                modelConfig['isJunosPortEnabled'] = true;
                for(var i = 0; i < ports.length; i++) {
                    portModel = new ServicePortModel({portName : ports[i]});
                    portModels.push(portModel)
                }
            }
            portCollectionModel = new Backbone.Collection(portModels);
            modelConfig['servicePorts'] = portCollectionModel;
            //populate user created attrs
            var snmpCredentials =
                modelConfig['physical_router_snmp_credentials'];
            if(snmpCredentials) {
                snmpCredentials['v2_community'] = 'public';
                modelConfig['user_created_version'] = '2';
                modelConfig['user_created_security_level'] = 'none';
                if(snmpCredentials['version'] != null ||
                   snmpCredentials['v3_security_level'] != null) {
                    modelConfig['snmpMntd'] = true;
                    modelConfig['user_created_security_level'] =
                        snmpCredentials['v3_security_level'];
                }
                if(snmpCredentials['version'] != null ) {
                    modelConfig['user_created_version'] =
                        snmpCredentials['version'].toString();
                }
            } else {//it is required to work bindings
                modelConfig['physical_router_snmp_credentials'] = {
                    'v2_community' : null,
                    'v3_privacy_protocol' : null,
                    'retries' : null,
                    'v3_authentication_password' : null,
                    'v3_engine_time' : null,
                    'v3_engine_id' : null,
                    'local_port': null,
                    'v3_security_name': null,
                    'v3_context': null,
                    'v3_security_level': null,
                    'v3_authentication_protocol': null,
                    'v3_security_engine_id': null,
                    'v3_context_engine_id': null,
                    'version': null,
                    'timeout': null,
                    'v3_privacy_password': null,
                    'v3_engine_boots': null
                };
            }

            if(!modelConfig['physical_router_user_credentials']) {
                modelConfig['physical_router_user_credentials'] = {
                    "username" : null,
                    "password" : null
                 };
            }
            bgpRouterRef = getValueByJsonPath(modelConfig,
                "bgp_router_refs;0", null);
            if(bgpRouterRef) {
                    modelConfig['user_created_bgp_router'] =
                         bgpRouterRef.to[4] + "~" + bgpRouterRef.uuid;
            } else {
                modelConfig['user_created_bgp_router'] = "none";
            }
            modelConfig['user_created_virtual_network'] = 'None';
            if(modelConfig['virtual_network_refs'] != null &&
                modelConfig['virtual_network_refs'].length > 0) {
                var vnData = [];
                $.each(modelConfig['virtual_network_refs'], function(i,d){
                    vnData.push(
                        d.to[0] + ':' + d.to[1] + ':' + d.to[2]);
                });
                modelConfig['user_created_virtual_network'] = vnData;
            }
            //handle virtual_router_refs
            var vrType = 'None';
            var selectedVRouters = ifNull(modelConfig['virtual_router_refs'], []);
            if(selectedVRouters.length > 0){
                var torAgentCount = 1, tsnCount = 1;
                $.each(selectedVRouters,function(i,vrouter){
                    var vrname = vrouter.name.trim();
                    var vrouterType = vrouter['virtual_router_type'];
                    if(vrouterType == 'embedded'){
                        vrType = 'Embedded';
                        modelConfig['user_created_torAgent' + torAgentCount] = '';
                        modelConfig['user_created_tsn' + tsnCount] = '';
                    } else if(vrouterType == 'tor-agent'){
                        vrType = 'TOR Agent';
                        modelConfig['user_created_torAgent' + torAgentCount] = vrname;
                        torAgentCount++;
                    } else if(vrouterType == 'tor-service-node'){
                        vrType = 'TOR Agent';
                        modelConfig['user_created_tsn' + tsnCount] = vrname;
                        tsnCount++;
                    }
                });
            }
            if(vrType === "TOR Agent") {
                if(modelConfig['user_created_torAgent1'] ||
                            modelConfig['user_created_torAgent2']){
                    vrType = 'TOR Agent';
                } else {
                    vrType = 'TSN';
                }
            }
            modelConfig['virtualRouterType'] = vrType;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        getPortNameList : function(attr) {
            var portCollection = attr.servicePorts.toJSON(),
                portArray = [], portAttributes;
            for(var i = 0; i < portCollection.length; i++) {
                portArray.push(portCollection[i].portName());
            }
            return portArray;
        },
        addPort: function() {
            var ports = this.model().attributes['servicePorts'],
                newPort = new ServicePortModel({portName: ""});
            ports.add([newPort]);
        },
        addPortByIndex: function(data, kbInterface) {
          var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var ports = this.model().attributes['servicePorts'],
                newPort = new ServicePortModel({portName: ""});
            ports.add([newPort],{at: selectedRuleIndex+1});
        },
        deletePort: function(data, kbInterface) {
            var portCollection = data.model().collection,
                port = kbInterface.model();
            portCollection.remove(port);
        },
        configPhysicalRouter: function (callbackObj, ajaxOpt, type, editView) {
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'configureValidation'
                },
                {
                    key : 'servicePorts',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'servicePortValidation'
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if(this.isDeepValid(validations)) {
                var ajaxConfig = {},
                    returnFlag = false;
                var attr = $.extend(true, {}, this.model().attributes),
                    postObject = {};
                postObject["physical-router"] = {};
                postObject["physical-router"]["fq_name"] =
                    ["default-global-system-config", attr.name];
                postObject["physical-router"]["parent_type"] =
                    "global-system-config";
                postObject["physical-router"]["name"] = attr.name;
                postObject["physical-router"]["display_name"] = attr.name;
                postObject["physical-router"]['physical_router_vendor_name'] =
                    attr['physical_router_vendor_name'];
                postObject["physical-router"]["physical_router_product_name"] =
                    attr['physical_router_product_name'];
                postObject["physical-router"]["physical_router_management_ip"] =
                    attr.physical_router_management_ip;
                postObject["physical-router"]["physical_router_dataplane_ip"] =
                    attr.physical_router_dataplane_ip;
                postObject["physical-router"]["physical_router_loopback_ip"] =
                    attr.physical_router_loopback_ip;
                //Decide the creation vrouter based on the type
                if(type === ctwl.OVSDB_TYPE) {
                    //Given the tor and tsn name create them without ips
                    this.populateTORAgentVirtualRouterObjectToPostObj(
                        postObject,
                        {
                            user_created_torAgent1 : attr.user_created_torAgent1,
                            user_created_torAgent2 : attr.user_created_torAgent2,
                            user_created_tsn1 : attr.user_created_tsn1,
                            user_created_tsn2 : attr.user_created_tsn2
                        },
                        'TOR Agent',
                        editView,
                        attr
                    );
                } else if(type === ctwl.CPE_ROUTER_TYPE) {
                    //Create Embedded type vrouter implicitely
                    this.populateEmbeddedVirtualRouterObjectToPostObj(postObject
                        , attr.physical_router_management_ip, attr.name, editView);
                }
                if(type === ctwl.NET_CONF_TYPE ||
                    type === ctwl.PHYSICAL_ROUTER_TYPE){
                    var netConfUserName =
                        attr["physical_router_user_credentials"]["username"];
                    var netConfPassword =
                        attr["physical_router_user_credentials"]["password"];
                    if(netConfUserName || netConfPassword) {
                        postObject["physical-router"]
                            ['physical_router_user_credentials'] = {};
                        postObject["physical-router"]
                            ['physical_router_user_credentials']["username"] =
                            netConfUserName;
                        postObject["physical-router"]
                            ['physical_router_user_credentials']["password"] =
                            netConfPassword;
                    } else {
                        postObject["physical-router"]
                            ["physical_router_user_credentials"] = null;
                    }
                    var servicePorts = this.getPortNameList(attr);
                    if(servicePorts.length > 0) {
                        postObject["physical-router"]
                            ["physical_router_junos_service_ports"] = {};
                        postObject["physical-router"]
                            ["physical_router_junos_service_ports"]["service_port"]
                            = servicePorts;
                    } else {
                        postObject["physical-router"]
                            ["physical_router_junos_service_ports"] =  null;
                    }
                    if(attr.physical_router_role !== 'none') {
                        postObject["physical-router"]["physical_router_role"] =
                            attr.physical_router_role;
                    } else {
                        postObject["physical-router"]["physical_router_role"] =
                            null;
                    }
                    if(attr.evpn_peered_tor === true) {
                        this.populateTORAgentVirtualRouterObjectToPostObj(
                                postObject,
                                {
                                    user_created_tsn1 : attr.user_created_tsn1,
                                    user_created_tsn2 : attr.user_created_tsn2
                                },
                                "TSN",
                                editView,
                                attr
                            );
                    }
                }
                if(type === ctwl.PHYSICAL_ROUTER_TYPE) {
                    if(attr.user_created_bgp_router != null &&
                        attr.user_created_bgp_router != "none") {
                        var bgpRouterRefs =
                            attr.user_created_bgp_router.split("~");
                        bgpRouterRefs = [{"to":["default-domain",
                            "default-project" , "ip-fabric", "__default__",
                            bgpRouterRefs[0]], "uuid": bgpRouterRefs[1]}];
                        postObject["physical-router"]["bgp_router_refs"] =
                            bgpRouterRefs;
                    } else {
                        postObject["physical-router"]["bgp_router_refs"] = [];
                    }
                    postObject["physical-router"]
                        ["physical_router_vnc_managed"] =
                        attr["physical_router_vnc_managed"];
                    if(attr.user_created_virtual_network){
                        var arr = attr.user_created_virtual_network.
                            split(cowc.DROPDOWN_VALUE_SEPARATOR);
                        var vnRefs = [];
                        for(var i = 0; i < arr.length; i++) {
                            var fqName = arr[i].split(':');
                            vnRefs.push({"to":fqName});
                        }
                        postObject["physical-router"]["virtual_network_refs"] =
                            vnRefs;
                    } else {
                        postObject["physical-router"]["virtual_network_refs"] = [];
                    }
                    // This PROUTER type add. Create based on the info inputted.
                    if(attr.virtualRouterType != null &&
                        attr.virtualRouterType != 'None'){
                        var virtualRouterRefs = [];
                        if(attr.virtualRouterType == 'Embedded'){
                            this.populateEmbeddedVirtualRouterObjectToPostObj(
                                postObject, attr.physical_router_management_ip, attr.name,
                                editView);
                        } else if(attr.virtualRouterType == 'TOR Agent') {//ToR Agent case
                            this.populateTORAgentVirtualRouterObjectToPostObj(
                                postObject,
                                {
                                    user_created_torAgent1 : attr.user_created_torAgent1,
                                    user_created_torAgent2 : attr.user_created_torAgent2,
                                    user_created_tsn1 : attr.user_created_tsn1,
                                    user_created_tsn2 : attr.user_created_tsn2
                                },
                                attr.virtualRouterType,
                                editView,
                                attr
                            );
                        } else if(attr.virtualRouterType == 'TSN') {
                            this.populateTORAgentVirtualRouterObjectToPostObj(
                                    postObject,
                                    {
                                        user_created_tsn1 : attr.user_created_tsn1,
                                        user_created_tsn2 : attr.user_created_tsn2
                                    },
                                    attr.virtualRouterType,
                                    editView,
                                    attr
                                );
                        }
                    } else {
                        postObject["physical-router"]["virtual_router_refs"] =
                            [];
                    }
                }
                if(type === ctwl.NET_CONF_TYPE) {
                    postObject["physical-router"]["physical_router_vnc_managed"]
                        = true;
                }
                //Check if SNMP managed
                //SNMP Credentials
                if(attr.snmpMntd) {
                    var snmpVersion = attr['user_created_version'];
                    snmpVersion = snmpVersion != null ? parseInt(snmpVersion) : '';
                    var snmpLocalPort =
                        attr['physical_router_snmp_credentials']['local_port'];
                    snmpLocalPort =
                        snmpLocalPort != null && snmpLocalPort.toString().trim() != '' ?
                        parseInt(snmpLocalPort.toString().trim()) : 161;
                    var snmpRetries = attr['physical_router_snmp_credentials']['retries'];
                    snmpRetries = (snmpRetries != null && snmpRetries.toString().trim() != '')?
                        parseInt(snmpRetries.toString().trim()) : '';
                    var snmpTimeOut = attr['physical_router_snmp_credentials']['timeout'];
                    snmpTimeOut = (snmpTimeOut != null && snmpTimeOut.toString().trim() != '')?
                        parseInt(snmpTimeOut.toString().trim()) : '';
                    postObject["physical-router"]
                        ['physical_router_snmp_credentials'] = {};
                    postObject["physical-router"]
                        ['physical_router_snmp_credentials']['version'] =
                        snmpVersion;
                    if(snmpLocalPort != '')
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['local_port'] =
                            snmpLocalPort;
                    if(snmpRetries != '')
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['retries'] =
                            snmpRetries;
                    if(snmpTimeOut != '')
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['timeout'] =
                            snmpTimeOut;
                    if(snmpVersion == 2){//version is 2
                        var community = attr['physical_router_snmp_credentials']['v2_community'];
                        community = community != null ? community.trim() : '';
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['v2_community']
                            = community;
                    } else { //version is 3
                        var securityLevel = attr['user_created_security_level'];
                        securityLevel = securityLevel != null ? securityLevel.trim() : '';
                        var securityName = attr['physical_router_snmp_credentials']['v3_security_name'];
                        if(securityName != null && securityName != '') {
                            postObject["physical-router"]
                               ['physical_router_snmp_credentials']['v3_security_name'] =
                               securityName.trim();
                        }
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['v3_security_level'] =
                            securityLevel;
                        var securityEngineId =
                            attr['physical_router_snmp_credentials']['v3_security_engine_id'];
                        securityEngineId = securityEngineId != null ? securityEngineId.trim() : '';
                        if(securityEngineId != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_security_engine_id'] =
                                securityEngineId;
                        if (securityLevel == ctwl.SNMP_AUTH ||
                            securityLevel == ctwl.SNMP_AUTHPRIV) {
                            var authProtocal = attr['physical_router_snmp_credentials']
                                ['v3_authentication_protocol'];
                            authProtocal = authProtocal != null ? authProtocal.trim() : '';
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_authentication_protocol'] = authProtocal
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_authentication_password'] =
                                attr['physical_router_snmp_credentials']
                                ['v3_authentication_password'];
                        }
                        if (securityLevel == ctwl.SNMP_AUTHPRIV) {
                            var privacyProtocal = attr['physical_router_snmp_credentials']
                                ['v3_privacy_protocol'];
                            privacyProtocal =  privacyProtocal != null ? privacyProtocal.trim() : '';
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_privacy_protocol'] = privacyProtocal;
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_privacy_password'] =
                                attr['physical_router_snmp_credentials']
                                ['v3_privacy_password'];
                        }
                        var snmpv3Context =
                        attr['physical_router_snmp_credentials']['v3_context'];
                        snmpv3Context = snmpv3Context != null ? snmpv3Context.trim() : '';
                        if(snmpv3Context != '') {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_context'] = snmpv3Context;
                        }
                        var snmpv3ContextEngineId =
                        attr['physical_router_snmp_credentials']['v3_context_engine_id'];
                        snmpv3ContextEngineId =
                            snmpv3ContextEngineId != null ? snmpv3ContextEngineId.trim() : '';
                        if(snmpv3ContextEngineId != '') {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_context_engine_id'] =
                                snmpv3ContextEngineId;
                        }
                        var snmpv3EngineId =
                            attr['physical_router_snmp_credentials']['v3_engine_id'];
                        snmpv3EngineId =
                            snmpv3EngineId != null ? snmpv3EngineId.trim() : '';
                        if(snmpv3EngineId != '') {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_id'] = snmpv3EngineId;
                        }
                        var snmpv3EngineBoots =
                            attr['physical_router_snmp_credentials']['v3_engine_boots']
                        snmpv3EngineBoots =
                            snmpv3EngineBoots != null ? snmpv3EngineBoots.toString().trim() : '';
                        if(snmpv3EngineBoots != '') {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_boots'] =
                            parseInt(snmpv3EngineBoots);
                        }
                        var snmpv3EngineTime =
                            attr['physical_router_snmp_credentials']['v3_engine_time']
                        snmpv3EngineTime =
                            snmpv3EngineTime != null ? snmpv3EngineTime.toString().trim() : '';
                        if(snmpv3EngineTime != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_time'] =
                            parseInt(snmpv3EngineTime);
                    }
                } else {
                    postObject["physical-router"]
                        ['physical_router_snmp_credentials'] = null;
                }
                //permissions
                this.updateRBACPermsAttrs(attr);
                postObject["physical-router"]["perms2"] =
                    attr["perms2"];

                ajaxConfig.type = ajaxOpt.type;
                ajaxConfig.data = JSON.stringify(postObject);
                ajaxConfig.url = ajaxOpt.url;//ctwc.URL_PHYSICAL_ROUTER_CREATE;
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
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                        ctwl.PHYSICAL_ROUTER_PREFIX_ID));
                }
            }
        },
        deletePhysicalRouters : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'physical-router',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
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
        getVirtualRouterDetails : function(vRouterName) {
            var vRouterMap =
                getValueByJsonPath(self.physicalRouterData, "globalVRoutersMap", {});
            return (vRouterMap[vRouterName.trim()])? vRouterMap[vRouterName.trim()] : '';
        },
        /*Populates the post obj with the required fields for creating
        the embedded type vrouter*/
        populateEmbeddedVirtualRouterObjectToPostObj :
            function (postObject,mgmtIpAddress,name, editView) {
            postObject["physical-router"]['virtual_router_type'] = "Embedded";
            var virtualRouters = [];
            var virtualRouterRefs = [];
            postObject["physical-router"]["virtual-routers"] = [];
            var currVr = this.getVirtualRouterDetails(name);
            if(currVr != null && (currVr.type == 'embedded' ||
                currVr.type == 'hypervisor')){
                if(currVr.ip != mgmtIpAddress ||
                    currVr.type == 'hypervisor'){
                    /*If the ip is changed we now need to change the ip
                    address for the virtual router as well.
                    add a flag to indicate edit of vrouter is required*/
                    postObject["physical-router"]["isVirtualRouterEdit"] = true;
                    virtualRouters.push({"virtual-router" :
                        {"fq_name":["default-global-system-config", name],
                        "parent_type":"global-system-config",
                        "name": name,
                        "virtual_router_ip_address" : mgmtIpAddress,
                        "virtual_router_type" : 'embedded'}});
                }
                /*ELSE dont add to the vrouters as it is already existing.
                just add a ref to this.*/
            } else {
                virtualRouters.push({"virtual-router" :
                    {"fq_name":["default-global-system-config", name],
                                    "parent_type":"global-system-config",
                                    "name": name,
                                    "virtual_router_ip_address" : mgmtIpAddress,
                                    "virtual_router_type" : 'embedded'}});
            }
            virtualRouterRefs.push({"to":
                ["default-global-system-config",name]});
            postObject["physical-router"]["virtual-routers"] = virtualRouters;
            postObject["physical-router"]["virtual_router_refs"] =
                virtualRouterRefs;
        },
        populateTORAgentVirtualRouterObjectToPostObj : function(postObject,
            selectedVRouters, vRoutersType, editView, attr) {
            var virtualRouters = [];
            var virtualRouterRefs = [];
            postObject["physical-router"]['virtual_router_type'] = vRoutersType;
            postObject["physical-router"]["virtual-routers"] = [];
            var allData = editView.torAgentVrouterDS;
            var tsnAllData = editView.tsnVrouterDS;
            var editData = attr.virtual_router_refs;
            var isTorSelectedFromList = false;
            var isTorAlreadyFromEdit = false;
            var isTsnSelectedFromList = false;
            var isTsnAlreadyFromEdit = false;
            //TOR Agent Prim
            $.each(allData,function(i,d){
                if(d.text === selectedVRouters.user_created_torAgent1){
                    isTorSelectedFromList = true;
                }
            });
            $.each(editData,function(j,vrouter){
               if(vrouter.name.trim() == selectedVRouters.user_created_torAgent1){
                   isTorAlreadyFromEdit = true;
               }
            });
            if(selectedVRouters.user_created_torAgent1 != null &&
                selectedVRouters.user_created_torAgent1 != '') {
                if(!isTorSelectedFromList && !isTorAlreadyFromEdit) {
                    virtualRouters.push({"virtual-router" :
                    {"fq_name":["default-global-system-config",
                          selectedVRouters.user_created_torAgent1],
                          "parent_type":"global-system-config",
                          "name": selectedVRouters.user_created_torAgent1,
                          "virtual_router_type" : "tor-agent"}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",
                    selectedVRouters.user_created_torAgent1]});
            }
            //TOR Agent Sec
            isTorSelectedFromList = false;
            isTorAlreadyFromEdit = false;
            $.each(allData,function(i,d){
                if(d.text === selectedVRouters.user_created_torAgent2){
                    isTorSelectedFromList = true;
                }
            });
            $.each(editData,function(j,vrouter){
                if(vrouter.name.trim() == selectedVRouters.user_created_torAgent2){
                    isTorAlreadyFromEdit = true;
                }
            });
            if(selectedVRouters.user_created_torAgent2 != null &&
                selectedVRouters.user_created_torAgent2 != '') {
                if(!isTorSelectedFromList && !isTorAlreadyFromEdit) {
                    virtualRouters.push({"virtual-router" :
                        {"fq_name":["default-global-system-config",
                        selectedVRouters.user_created_torAgent2],
                        "parent_type":"global-system-config",
                        "name": selectedVRouters.user_created_torAgent2,
                        "virtual_router_type" : "tor-agent"}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",
                    selectedVRouters.user_created_torAgent2]});
            }
            //TSN Prim
            $.each(tsnAllData,function(i,d){
                if(d.text == selectedVRouters.user_created_tsn1){
                    isTsnSelectedFromList = true;
                }
            });
            $.each(editData,function(j,vrouter){
                if(vrouter.name.trim() == selectedVRouters.user_created_tsn1){
                    isTsnAlreadyFromEdit = true;
                }
            });
            if(selectedVRouters.user_created_tsn1 != null && selectedVRouters.user_created_tsn1 != ''){
                if(!isTsnSelectedFromList && !isTsnAlreadyFromEdit) {
                    virtualRouters.push({"virtual-router" :
                        {"fq_name":["default-global-system-config",
                        selectedVRouters.user_created_tsn1],
                        "parent_type":"global-system-config",
                        "name": selectedVRouters.user_created_tsn1,
                        "virtual_router_type" : "tor-service-node"}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",
                    selectedVRouters.user_created_tsn1]});
            }
            //TSN Sec
            isTsnSelectedFromList = false;
            isTsnAlreadyFromEdit = false;
            $.each(tsnAllData,function(i,d){
                if(d.text == selectedVRouters.user_created_tsn2){
                    isTsnSelectedFromList = true;
                }
            });
            $.each(editData,function(j,vrouter){
                if(vrouter.name.trim() == selectedVRouters.user_created_tsn2){
                    isTsnAlreadyFromEdit = true;
                }
            });
            if(selectedVRouters.user_created_tsn2 != null && selectedVRouters.user_created_tsn2 != ''){
                if(!isTsnSelectedFromList && !isTsnAlreadyFromEdit) {
                    virtualRouters.push(
                        {
                            "virtual-router" :
                                {
                                    "fq_name" : ["default-global-system-config",
                                        selectedVRouters.user_created_tsn2],
                                     "parent_type":"global-system-config",
                                     "name": selectedVRouters.user_created_tsn2,
                                     "virtual_router_type" :
                                         "tor-service-node"
                                }
                        }
                    );
                }
                virtualRouterRefs.push({"to":["default-global-system-config",
                    selectedVRouters.user_created_tsn2]});
            }
            postObject["physical-router"]["virtual-routers"] = virtualRouters;
            postObject["physical-router"]["virtual_router_refs"] =
                virtualRouterRefs;
        },
        validations: {
            configureValidation: {
                'name' : {
                    required : true,
                    msg : "Physical Router Name is required"
                },
                'user_created_torAgent1' : function(value, attr, finalObj){
                    if(finalObj.virtualRouterType == 'TOR Agent' && (value === null ||
                        value.trim() === "") && (finalObj.user_created_torAgent2 === null ||
                        finalObj.user_created_torAgent2.trim() === "")){
                        return "Select or Enter atleast one ToR";
                    }
                },
                'user_created_tsn1' : function(value, attr, finalObj){
                    if(finalObj.virtualRouterType == 'TOR Agent' && (value === null ||
                        value.trim() === "") && (finalObj.user_created_tsn2 === null ||
                        finalObj.user_created_tsn2.trim() === "")){
                        return "Select or Enter atleast one TSN";
                    }
                },
                'physical_router_management_ip' : function(value, attr, finalObj){
                    if(value || value === 0){
                         if(!validateIPAddress(value.trim())){
                            return "Enter a valid Management IP address\
                            in xxx.xxx.xxx.xxx format";
                         }
                    }
                },
                'physical_router_dataplane_ip' : function(value, attr, finalObj){
                    if(value || value === 0){
                         if(!validateIPAddress(value.trim())){
                            return "Enter a valid Dataplane IP address\
                            in xxx.xxx.xxx.xxx format";
                         }
                    }
                },
                'physical_router_loopback_ip' : function(value, attr, finalObj){
                    if(value || value === 0){
                         if(!validateIPAddress(value.trim())){
                            return "Enter a valid Loopback IP address\
                            in xxx.xxx.xxx.xxx format";
                         }
                    }
                },
                'physical_router_snmp_credentials.v2_community' : function(value, attr, finalObj){
                    if(finalObj.snmpMntd &&
                        finalObj['user_created_version'] === '2' &&
                        (value === null || value.trim() === "")) {
                        return "Please enter community";
                    }
                },
                'physical_router_snmp_credentials.retries' : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && value != null && value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Retries should be a number";
                     }
                },
                'physical_router_snmp_credentials.timeout' : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && value != null && value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Timeout should be a number";
                     }
                },
                'physical_router_snmp_credentials.v3_engine_boots' : function(value, attr, finalObj){
                     if(finalObj.snmpMntd &&
                         finalObj['user_created_version']=== '3' && value != null &&
                         value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Engine Boots should be a number";
                     }
                },
                'physical_router_snmp_credentials.v3_engine_time' : function(value, attr, finalObj){
                     if(finalObj.snmpMntd &&
                         finalObj['user_created_version'] === '3' && value != null &&
                         value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Engine Time should be a number";
                     }
                },
                'virtualRouterType' : function(value, attr, finalObj){
                     if(value === 'Embedded') {
                         var name = getValueByJsonPath(finalObj, 'name', '');
                         var vRouterMap =
                             getValueByJsonPath(self.physicalRouterData, 'globalVRoutersMap', []);
                         var currentVirtualRouter =
                             vRouterMap[name.trim()] ? vRouterMap[name.trim()] : '';
                         if(currentVirtualRouter &&
                             $.inArray(currentVirtualRouter.type, ['embedded', 'hypervisor']) === -1) {
                             return "Virtual router " + name + " ("
                                 + currentVirtualRouter.type + ") already exists";
                         }
                     }
                },
                "diffrent_names_for_tors_and_tsns" : function(value, attr, finalObj) {
                     //check for duplicates
                     var virtualRouterList = [];
                     var tor1 = finalObj.user_created_torAgent1;
                     var tor2 = finalObj.user_created_torAgent2;
                     var tsn1 = finalObj.user_created_tsn1;
                     var tsn2 = finalObj.user_created_tsn2
                     if(tor1) {
                         virtualRouterList.push(tor1);
                     }
                     if(tor2) {
                         virtualRouterList.push(tor2);
                     }
                     if(tsn1) {
                         virtualRouterList.push(tsn1);
                     }
                     if(tsn2) {
                         virtualRouterList.push(tsn2);
                     }
                     if(checkIfDuplicates(virtualRouterList)) {
                         return "Enter diffrent names for TORs and TSNs";
                     }
                },
                "physical_router_product_name": function(value, attr, finalObj) {
                    if(ctwp.isValidQfx5k(value)){
                        self.roleDataSource(ctwc.PHYSICAL_ROUTER_WITHOUT_SPINE);
                    }else{
                        self.roleDataSource(ctwc.PHYSICAL_ROUTER_ROLE_DATA);
                    }
                }
            }
        }
    });
    return PhysicalRouterModel;
});
