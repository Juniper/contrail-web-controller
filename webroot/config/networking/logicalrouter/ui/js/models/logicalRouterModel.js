
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/logicalrouter/ui/js/views/logicalRouterFormatters',
    'config/common/ui/js/routeTarget.utils'
], function (_, ContrailConfigModel, logicalRouterFormatters, RouteTargetUtils) {
    var lRFormatters = new logicalRouterFormatters();
    var routeTargetUtils = new RouteTargetUtils();
    var LogicalRouterModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'project',
            'virtual_machine_interface_refs': [],
            'virtual_network_refs' : '',
            'extNetworkUUID':'',
            'id_perms':{'enable':true},
            'connectedNetwork':'',
            'SNAT':'Enabled',
            'vmi_ref': {"virtual_network_refs":[]},
            'templateGeneratorData': 'rawData',
            'configured_route_target_list': {
                'route_target': [], //collection
            },
            'user_created_configured_route_target_list': [], //fake created for rt_list.rt collection
            'physical_router_refs': [],
            'user_created_physical_router': 'none',
            'vxlan_network_identifier': null
        },
        formatModelConfig: function (config) {
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length == 3) {
                modelConfig['name'] = modelConfig['fq_name'][2];
            }
            modelConfig['extNetworkUUID'] = 'None';
            if(modelConfig['virtual_network_refs'].length > 0 &&
               'uuid' in modelConfig['virtual_network_refs'][0]) {
                modelConfig['extNetworkUUID'] =
                        modelConfig['virtual_network_refs'][0]['uuid'];
            }
            if('virtual_machine_interface_refs' in modelConfig &&
               modelConfig['virtual_machine_interface_refs'].length > 0){
                   var vmi = modelConfig['virtual_machine_interface_refs'];
                   var vmiLen =
                       modelConfig['virtual_machine_interface_refs'].length;
                   modelConfig['connectedNetwork'] = [];
                   for(var i=0;i< vmiLen;i++) {
                       if('virtual_network_refs' in vmi[i] &&
                          vmi[i]['virtual_network_refs'].length > 0){
                              var vnfqName =
                                  vmi[i]['virtual_network_refs'][0]["uuid"];
                              modelConfig['connectedNetwork'].push(vnfqName);
                          }
                   }
            }

            //populate user_created_physical_router
            var prRefs = getValueByJsonPath(modelConfig, 'physical_router_refs;0;to', []);
            if(prRefs.length === 2) {
                modelConfig["user_created_physical_router"] = prRefs[0] + ':' + prRefs[1];
            } else {
                modelConfig["user_created_physical_router"] = 'none';
            }
            routeTargetUtils.readRouteTargetList(modelConfig, 'user_created_configured_route_target_list');
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        validations: {
            logicalRouterValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter a valid Router name.'
                }
            }
        },
        configureLogicalRouter: function (mode, allNetworksDS, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var network_subnet = allNetworksDS, idPermsStatus;
            var validation = [{
                  key: null,
                  type: cowc.OBJECT_TYPE_MODEL,
                  getValidation: 'logicalRouterValidations'
                },
                {
                  key: 'user_created_configured_route_target_list',
                  type: cowc.OBJECT_TYPE_COLLECTION,
                  getValidation: 'routeTargetModelConfigValidations'
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if (this.isDeepValid(validation)) {
                var newLRData = $.extend({},this.model().attributes),
                    selectedDomain = ctwu.getGlobalVariable('domain').name,
                    selectedProject = ctwu.getGlobalVariable('project').name;
                ctwu.setNameFromDisplayName(newLRData);
                newLRData.fq_name = [selectedDomain,
                                     selectedProject,
                                     newLRData["name"]];
                if(newLRData.virtual_network_refs.length == 1
                   && newLRData.virtual_network_refs[0].to == ""
                   && newLRData.virtual_network_refs[0].uuid == ""){
                   newLRData.virtual_network_refs = [];
                }
                idPermsStatus = getValueByJsonPath(newLRData, 'id_perms;enable', '');
                if(idPermsStatus) {
                    newLRData["id_perms"]["enable"] = idPermsStatus.toString() === "true" ? true : false;
                }
                //Externel Network
                var extNetworkUUID = newLRData.extNetworkUUID
                newLRData["virtual_network_refs"] = [];
                if(newLRData.elementConfigMap && extNetworkUUID != "" &&
                   extNetworkUUID != "None") {
                    var extNetworkUUIDData =
                        newLRData.elementConfigMap.extNetworkUUID.data;
                    var extNetworkUUIDDataLen = extNetworkUUIDData.length;
                    for(var i = 0; i < extNetworkUUIDDataLen; i++) {
                        if(extNetworkUUIDData[i].value == extNetworkUUID) {
                            newLRData["virtual_network_refs"][0] = {};
                            var obj = {};
                            obj.to = extNetworkUUIDData[i].fqname.split(":");
                            obj.uuid = extNetworkUUIDData[i].value;
                            //Set attr type as ExternalGateway
                            obj.attr = {
                                "logical_router_virtual_network_type" : "ExternalGateway"
                            };
                            newLRData["virtual_network_refs"][0] = obj;
                            break;
                        }
                    }
                }

                //extend to physical router
                newLRData["physical_router_refs"] = [];
                if(newLRData.user_created_physical_router !== 'none') {
                    var toArray = newLRData.user_created_physical_router.split(':');
                    newLRData["physical_router_refs"].push({"to": toArray});
                } else {
                    newLRData["physical_router_refs"] = [];
                }

                //Connected Networks.
                var connectedNetwork = newLRData.connectedNetwork;
                var connectedNetworkSel = connectedNetwork.split(",");
                newLRData["virtual_machine_interface_refs"] = [];

                if(newLRData.elementConfigMap &&
                   connectedNetworkSel.length > 0) {
                    var connectedNetworkLen = connectedNetworkSel.length;
                    var connectedNetworkAllData =
                        newLRData.elementConfigMap.connectedNetwork.data;
                    var connectedNetworkAllDataLen =
                        connectedNetworkAllData.length;
                    for(var i=0; i < connectedNetworkLen; i++) {
                        for(var j = 0; j < connectedNetworkAllDataLen; j++) {
                            if(connectedNetworkAllData[j].value ==
                                                   connectedNetworkSel[i]) {
                                var cn = lRFormatters.buildVMIObj(
                                    connectedNetworkAllData[j],
                                    newLRData["rawData"]
                                             ["virtual_machine_interface_refs"],
                                    selectedDomain,
                                    selectedProject);
                                newLRData["virtual_machine_interface_refs"][i]
                                                                           = cn;
                            }
                        }
                    }
                }
                routeTargetUtils.getRouteTargets(newLRData);
                //permissions
                this.updateRBACPermsAttrs(newLRData);

                delete(newLRData.errors);
                delete(newLRData.cgrid);
                delete(newLRData.templateGeneratorData);
                delete(newLRData.elementConfigMap);
                delete(newLRData.locks);
                delete(newLRData.rawData);
                delete(newLRData.vmi_ref);
                delete newLRData.user_created_configured_route_target_list;
                delete(newLRData.extNetworkUUID);
                delete(newLRData.connectedNetwork);
                delete(newLRData.SNAT);
                if("virtual_machine_interface_refs" in newLRData &&
                   newLRData["virtual_machine_interface_refs"].length == 0) {
                    delete(newLRData.virtual_machine_interface_refs);
                }
                if("route_target_refs" in newLRData) {
                    delete(newLRData.route_target_refs);
                }
                if("parent_href" in newLRData) {
                    delete(newLRData.parent_href);
                }
                if("parent_uuid" in newLRData) {
                    delete(newLRData.parent_uuid);
                }
                if("href" in newLRData) {
                    delete(newLRData.href);
                }

                var type = "POST";
                var url = "";
                if(mode == "add") {
                //create//
                    newLRData.display_name = newLRData["name"];
                    delete(newLRData["uuid"]);
                    url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                lRouter = {};
                lRouter["logical-router"] = {};
                lRouter["logical-router"] = newLRData;

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
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                                     (ctwl.LOGICAL_ROUTER_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        addRouteTarget: function(type) {
            routeTargetUtils.addRouteTarget(type, this.model());
        },
        addRouteTargetByIndex: function(type, data, kbRouteTarget) {
           routeTargetUtils.addRouteTargetByIndex(type, this.model(), data, kbRouteTarget);
        },
        deleteRouteTarget: function(data, kbRouteTarget) {
            routeTargetUtils.deleteRouteTarget(data, kbRouteTarget);
        },
        deleteLogicalRouter: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var delDataID = [];
            for(var i=0;i<selectedGridData.length;i++) {
                delDataID.push(selectedGridData[i]["uuid"]);
            }
            var sentData = [{"type": "logical-router", "deleteIDs": delDataID}];
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
        }
    });
    return LogicalRouterModel;
});
