/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model',
    'config/physicaldevices/physicalrouters/ui/js/models/ServicePortsModel'
], function (_, ContrailModel, ServicePortModel) {
    var PhysicalRouterModel = ContrailModel.extend({
        defaultConfig: {
            'uuid' : '',
            'pRouterName' : '',
            'snmpMntd' : false,
            'vendor' : '',
            'pmodel' : '',
            'mgmtIP' : '',
            'dataIP' : '',
            'torAgent1': '',
            'torAgent2' : '',
            'tsn1' : '',
            'tsn2' : '',
            'snmpV2Community' : 'public',
            'snmpRetries' : '',
            'snmpTimeout' : '',
            'snmpLocalPort' : '',
            'snmpVersion' : 'v2',
            'snmpV3SecurityName' : '',
            'snmpV3SecurityLevel' : 'none',
            'snmpv3AuthProtocol' : '',
            'snmpv3AuthPasswd' : '',
            'snmpv3PrivProtocol' : '',
            'snmpv3PrivPasswd' : '',
            'snmpV3SecurityEngineId' : '',
            'snmpv3Context' : '',
            'snmpv3ContextEngineId' : '',
            'snmpv3EngineId' : '',
            'snmpv3EngineBoots' : '',
            'snmpv3EngineTime' : '',
            'netConfUserName' : '',
            'netConfPasswd' : '',
            'isJunosPortEnabled' : false,
            'junosServicePorts' : [],
            'bgpGateWay' : 'None',
            'virtualRouterType' : 'None',
            'netConfManaged' : false,
            'vns' : ''
        },
        formatModelConfig: function (modelConfig) {
            /*
                Populating ServicePortModel from junosServicePorts
             */
            var ports = (modelConfig['junosServicePorts'] != null) ?
                (modelConfig['junosServicePorts']) : [],
                portModels = [], portModel,
                portCollectionModel;
            if(ports.length > 0) {
                modelConfig['isJunosPortEnabled'] = true;
                for(var i = 0; i < ports.length; i++) {
                    portModel = new ServicePortModel({portName : ports[i]});
                    portModels.push(portModel)
                }
            }
            portCollectionModel = new Backbone.Collection(portModels);
            modelConfig['servicePorts'] = portCollectionModel;
            if(modelConfig['junosServicePorts'] != null) {
                delete modelConfig['junosServicePorts'];
            }
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
        deletePort: function(data, kbInterface) {
            var portCollection = data.model().collection,
                port = kbInterface.model();
            portCollection.remove(port);
        },
        configPhysicalRouter: function (callbackObj, ajaxOpt, type, editView) {
            if (this.model().isValid(true, "configureValidation")) {
                var ajaxConfig = {},
                    returnFlag = false;
                var attr = this.model().attributes,
                    postObject = {};
                postObject["physical-router"] = {};
                postObject["physical-router"]["fq_name"] =
                    ["default-global-system-config", attr.pRouterName];
                postObject["physical-router"]["parent_type"] =
                    "global-system-config";
                postObject["physical-router"]["name"] = attr.pRouterName;
                postObject["physical-router"]['physical_router_vendor_name'] =
                    attr.vendor;
                postObject["physical-router"]["physical_router_product_name"] =
                    attr.pmodel;
                postObject["physical-router"]["physical_router_management_ip"] =
                    attr.mgmtIP;
                postObject["physical-router"]["physical_router_dataplane_ip"] =
                    attr.dataIP;
                //Decide the creation vrouter based on the type
                if(type === ctwl.OVSDB_TYPE) {
                    //Given the tor and tsn name create them without ips
                    populateTORAgentVirtualRouterObjectToPostObj(postObject,
                        {torAgent1 : attr.torAgent1, torAgent2 : attr.torAgent2,
                        tsn1 : attr.tsn1, tsn2 : attr.tsn2},'TOR Agent');
                } else if(type === ctwl.CPE_ROUTER_TYPE) {
                    //Create Embedded type vrouter implicitely
                    this.populateEmbeddedVirtualRouterObjectToPostObj(postObject
                        , attr.mgmtIP, attr.pRouterName, editView);
                }
                if(type === ctwl.NET_CONF_TYPE ||
                    type === ctwl.PHYSICAL_ROUTER_TYPE){
                    postObject["physical-router"]
                        ['physical_router_user_credentials'] = {};
                    postObject["physical-router"]
                        ['physical_router_user_credentials']["username"] =
                        attr.netConfUserName.trim();
                    postObject["physical-router"]
                        ['physical_router_user_credentials']["password"] =
                        attr.netConfPasswd;
                    postObject["physical-router"]
                        ["physical_router_junos_service_ports"] = {};
                    postObject["physical-router"]
                        ["physical_router_junos_service_ports"]["service_port"]
                        = this.getPortNameList(attr);
                }
                if(type === ctwl.PHYSICAL_ROUTER_TYPE) {
                    if(attr.bgpGateWay != null && attr.bgpGateWay != "None") {
                        var bgpRouterRefs = [{"to":["default-domain",
                            "default-project" , "ip-fabric", "__default__",
                            attr.bgpGateWay]}];
                        postObject["physical-router"]["bgp_router_refs"] =
                            bgpRouterRefs;
                    } else if(attr.bgpGateWay == 'None') {
                        postObject["physical-router"]["bgp_router_refs"] = [];
                    }
                    postObject["physical-router"]
                        ["physical_router_vnc_managed"] = attr.netConfManaged;
                    if(attr.vns != null && attr.vns != ''){
                        var arr = attr.vns.split(',');
                        var vnRefs = [];
                        for(var i = 0; i < arr.length; i++) {
                            var fqName = arr[i].split(' ');
                            vnRefs.push({"to":fqName});
                        }
                        postObject["physical-router"]["virtual_network_refs"] =
                            vnRefs;
                    }
                    // This PROUTER type add. Create based on the info inputted.
                    if(attr.virtualRouterType != null &&
                        attr.virtualRouterType != 'None'){
                        var virtualRouterRefs = [];
                        if(attr.virtualRouterType == 'Embedded'){
                            this.populateEmbeddedVirtualRouterObjectToPostObj(
                                postObject, attr.mgmtIP, attr.pRouterName,
                                editView);
                        } else {//ToR Agent case
                            populateTORAgentVirtualRouterObjectToPostObj(
                                postObject,{torAgent1 : attr.torAgent1,
                                torAgent2 : attr.torAgent2, tsn1 : attr.tsn1,
                                tsn2 : attr.tsn2}, attr.virtualRouterType);
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
                    var snmpVersion = attr.snmpVersion === 'v2' ? 2 : 3;
                    var snmpLocalPort =
                        (attr.snmpLocalPort.toString().trim() != '')?
                        parseInt(attr.snmpLocalPort.toString().trim()) : '';
                    var snmpRetries =
                    (attr.snmpRetries.toString().trim() != '')?
                    parseInt(attr.snmpRetries.toString().trim()) : '';
                    var snmpTimeOut = (attr.snmpTimeout.toString().trim() != '')
                    ? parseInt(attr.snmpTimeout.toString().trim()) : '';
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
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']['v2_community']
                            = attr.snmpV2Community.trim();
                    } else { //version is 3
                        var securityLevel = attr.snmpV3SecurityLevel.trim();
                        if(attr.snmpV3SecurityName.trim() != '') {
                            postObject["physical-router"]
                               ['physical_router_snmp_credentials']
                               ['v3_security_name'] =
                               attr.snmpV3SecurityName.trim();
                        }
                        postObject["physical-router"]
                            ['physical_router_snmp_credentials']
                            ['v3_security_level'] = securityLevel;
                        if(attr.snmpV3SecurityEngineId.trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_security_engine_id'] =
                                attr.snmpV3SecurityEngineId.trim();
                        if (securityLevel == ctwl.SNMP_AUTH ||
                            securityLevel == ctwl.SNMP_AUTHPRIV) {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_authentication_protocol'] =
                                attr.snmpv3AuthProtocol.trim();
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_authentication_password'] =
                                attr.snmpv3AuthPasswd.trim();
                        }
                        if (securityLevel == ctwl.SNMP_AUTHPRIV) {
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_privacy_protocol'] =
                                attr.snmpv3PrivProtocol.trim();
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_privacy_password'] =
                                attr.snmpv3PrivPasswd.trim();
                        }
                        if(attr.snmpv3Context.trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_context'] = attr.snmpv3Context.trim();
                        if(attr.snmpv3ContextEngineId.trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_context_engine_id'] =
                                attr.snmpv3ContextEngineId.trim();
                        if(attr.snmpv3EngineId.trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_id'] = attr.snmpv3EngineId.trim();
                        if(attr.snmpv3EngineBoots.toString().trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_boots'] =
                            parseInt(attr.snmpv3EngineBoots.toString().trim());
                        if(attr.snmpv3EngineTime.toString().trim() != '')
                            postObject["physical-router"]
                                ['physical_router_snmp_credentials']
                                ['v3_engine_time'] =
                            parseInt(attr.snmpv3EngineTime.toString().trim());
                    }
                } else {
                    postObject["physical-router"]
                        ['physical_router_snmp_credentials'] = {};
                }
                ajaxConfig.async = true;
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
        deletePhysicalRouter : function(checkedRow, callbackObj) {
            var ajaxConfig = {}, that = this,
                pRouterId = checkedRow['uuid'];
            ajaxConfig.type = "DELETE";
            ajaxConfig.url = '/api/tenants/config/physical-router/' + pRouterId;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        /*Populates the post obj with the required fields for creating
        the embedded type vrouter*/
        populateEmbeddedVirtualRouterObjectToPostObj :
            function (postObject,mgmtIpAddress,name, editView) {
            postObject["physical-router"]['virtual_router_type'] = "Embedded";
            var virtualRouters = [];
            var virtualRouterRefs = [];
            postObject["physical-router"]["virtual-routers"] = [];
            var currVr = editView.getVirtualRouterDetails(name);
            if(currVr != null && (currVr.type == 'embedded' ||
                currVr.type == 'hypervisor')){
                if(currVr.ip != mgmtIpAddress || currVr.type == 'hypervisor'){
                    /*If the ip is changed we now need to change the ip
                    address for the virtual router as well.
                    add a flag to indicate edit of vrouter is required*/
                    postObject["physical-router"]["isVirtualRouterEdit"] = true;
                    virtualRouters.push({"virtual-router" :
                        {"fq_name":["default-global-system-config", name],
                        "parent_type":"global-system-config",
                        "name": name,
                        "virtual_router_ip_address" : mgmtIpAddress,
                        "virtual_router_type" : ['embedded']}});
                }
                /*ELSE dont add to the vrouters as it is already existing.
                just add a ref to this.*/
            } else {
                virtualRouters.push({"virtual-router" :
                    {"fq_name":["default-global-system-config", name],
                                    "parent_type":"global-system-config",
                                    "name": name,
                                    "virtual_router_ip_address" : mgmtIpAddress,
                                    "virtual_router_type" : ['embedded']}});
            }
            virtualRouterRefs.push({"to":
                ["default-global-system-config",name]});
            postObject["physical-router"]["virtual-routers"] = virtualRouters;
            postObject["physical-router"]["virtual_router_refs"] =
                virtualRouterRefs;
        },
        validations: {
            configureValidation: {
                pRouterName : {
                    required : true,
                    msg : "Name is required"
                },
                torAgent1 : function(value, attr, finalObj){
                    if(finalObj.virtualRouterType == 'TOR Agent' &&
                    value.trim() === "" && finalObj.torAgent2.trim() === ""){
                         return "Select or Enter atleast one ToR";
                    }
                },
                tsn1 : function(value, attr, finalObj){
                    if(finalObj.virtualRouterType == 'TOR Agent' &&
                        value.trim() === "" && finalObj.tsn2.trim() === ""){
                         return "Select or Enter atleast one TSN";
                    }
                },
                mgmtIP : function(value, attr, finalObj){
                    if(value != ''){
                         if(!validateIPAddress(value.trim())){
                            return "Enter a valid Management IP address\
                            in xxx.xxx.xxx.xxx format";
                         }
                    }
                },
                dataIP : function(value, attr, finalObj){
                    if(value != ''){
                         if(!validateIPAddress(value.trim())){
                            return "Enter a valid Dataplane IP address\
                            in xxx.xxx.xxx.xxx format";
                         }
                    }
                },
                snmpV2Community : function(value, attr, finalObj){
                    if(finalObj.snmpMntd && finalObj.snmpVersion === 'v2' &&
                        value == '') {
                        return "Please enter community";
                    }
                },
                snmpRetries : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Retries should be a number";
                     }
                },
                snmpTimeout : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Timeout should be a number";
                     }
                },
                snmpv3EngineBoots : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && finalObj.snmpVersion === 'v3' &&
                         value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Engine Boots should be a number";
                     }
                },
                snmpv3EngineTime : function(value, attr, finalObj){
                     if(finalObj.snmpMntd && finalObj.snmpVersion === 'v3' &&
                         value.toString().trim() != '' &&
                         !$.isNumeric(value.toString().trim())) {
                         return "Engine Time should be a number";
                     }
                }
                /*TODO: Need to add virtualRouterType of type embedded and
                different names for ToRs and TSNs validations*/
            }
        }
    });
    function populateTORAgentVirtualRouterObjectToPostObj(postObject,
        selectedVRouters,vRoutersType) {
        var virtualRouters = [];
        var virtualRouterRefs = [];
        postObject["physical-router"]['virtual_router_type'] = vRoutersType;
        postObject["physical-router"]["virtual-routers"] = [];
        //TOR Agent Prim
        if(selectedVRouters.torAgent1 != null &&
            selectedVRouters.torAgent1 != ''){
            /*virtualRouters.push({"virtual-router" :
            {"fq_name":["default-global-system-config",
                  selectedVRouters.torAgent1],
                  "parent_type":"global-system-config",
                  "name": selectedVRouters.torAgent1,
                  "virtual_router_type" : ['tor-agent']}});*/
            virtualRouterRefs.push({"to":["default-global-system-config",
                selectedVRouters.torAgent1]});
        }
        //TOR Agent Sec
        if(selectedVRouters.torAgent2 != null &&
            selectedVRouters.torAgent2 != ''){
            /*virtualRouters.push({"virtual-router" :
                {"fq_name":["default-global-system-config",
                selectedVRouters.torAgent2],
                "parent_type":"global-system-config",
                "name": selectedVRouters.torAgent2,
                "virtual_router_type" : ['tor-agent']}});*/
            virtualRouterRefs.push({"to":["default-global-system-config",
                selectedVRouters.torAgent2]});
        }
        //TSN Prim
        if(selectedVRouters.tsn1 != null && selectedVRouters.tsn1 != ''){
            /*virtualRouters.push({"virtual-router" :
                {"fq_name":["default-global-system-config",
                selectedVRouters.tsn1],
                "parent_type":"global-system-config",
                "name": selectedVRouters.tsn1,
                "virtual_router_type" : ['tor-service-node']}});*/
            virtualRouterRefs.push({"to":["default-global-system-config",
                selectedVRouters.tsn1]});
        }
        //TSN Sec
        if(selectedVRouters.tsn2 != null && selectedVRouters.tsn2 != ''){
            /*virtualRouters.push({"virtual-router" :
            {"fq_name":["default-global-system-config", selectedVRouters.tsn2],
                             "parent_type":"global-system-config",
                             "name": selectedVRouters.tsn2,
                             "virtual_router_type" : ['tor-service-node']}});*/
            virtualRouterRefs.push({"to":["default-global-system-config",
                selectedVRouters.tsn2]});
        }
        postObject["physical-router"]["virtual-routers"] = virtualRouters;
        postObject["physical-router"]["virtual_router_refs"] =
            virtualRouterRefs;
    };
    return PhysicalRouterModel;
});

