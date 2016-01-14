/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/bgpasaservice/ui/js/models/bgpAsAServiceFamilyAttrModel'
], function (_, ContrailModel, BGPAsAServiceFamilyAttrModel) {
    var self;
    var bgpAsAServiceModel = ContrailModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": null,
            "parent_type": 'project',
            "bgpaas_ip_address": null,
            "bgpaas_session_attributes": {
                "admin_down": false,
                "passive": false,
                "auth_data": null,
                "hold_time": null,
                "loop_count": null,
                "address_families": {
                    "family": ["inet"]
                },
                "family_attributes": []
            },
            "virtual_machine_interface_refs": [],
            "user_created_virtual_machine_interface": null,
            "user_created_auth_key_type": "none",
            "user_created_auth_key": null,
            "user_created_address_family" : "inet",
            "user_created_admin_state" : true
        },
        formatModelConfig : function(modelConfig) {
            //prepare family attributes collection
            var familyAttrArray = [];
            var bgpaasSessionAttrs = getValueByJsonPath(modelConfig,
                "bgpaas_session_attributes", null);
            var vmiRefs = [], editVMIRefs = [];
            if(bgpaasSessionAttrs) {
                var familyAttrs = getValueByJsonPath(bgpaasSessionAttrs,
                    "family_attributes", []);
                if(familyAttrs.length > 0) {
                    for(var i = 0; i < familyAttrs.length; i++) {
                        var familyAttr =  new BGPAsAServiceFamilyAttrModel({
                                               address_family: familyAttrs[i].address_family,
                                               loop_count: familyAttrs[i].loop_count,
                                               prefix_limit: getValueByJsonPath(familyAttrs[i], "prefix_limit;maximum", null)
                                           });
                        familyAttrArray.push(familyAttr);
                    }
                }
                if(bgpaasSessionAttrs['auth_data'] != null) {
                    var authData = bgpaasSessionAttrs['auth_data'];
                    modelConfig['user_created_auth_key_type'] =
                        authData.key_type != null ? authData.key_type : 'none';
                    modelConfig['user_created_auth_key'] =
                        authData.key_items != null &&
                        authData.key_items.length > 0 ?
                        authData.key_items[0].key : '';
                }
                if(bgpaasSessionAttrs['address_families']['family'].length > 0) {
                    modelConfig['user_created_address_family'] =
                        bgpaasSessionAttrs['address_families']['family'];
                }
                if(bgpaasSessionAttrs["admin_down"]) {
                    modelConfig['user_created_admin_state'] =
                        !bgpaasSessionAttrs["admin_down"];
                }
            }
            // virtual machine interface refs
            vmiRefs = getValueByJsonPath(modelConfig,
                "virtual_machine_interface_refs", []);
            if(vmiRefs.length > 0) {
                _.each(vmiRefs, function(vmiRef){
                    var vmi = vmiRef["virtual-machine-interface"];
                    var fqName = vmi.fq_name;
                    editVMIRefs.push(vmi.uuid + " " + fqName[0] +
                        " " + fqName[1] + " " + fqName[2]);
                });
                modelConfig["user_created_virtual_machine_interface"] =
                    editVMIRefs;
            }
            modelConfig["familyAttrs"] = new Backbone.Collection(familyAttrArray);
            return modelConfig;
        },
        addFamilyAttr: function() {
            var familyAttrs = this.model().attributes["familyAttrs"]
            if(familyAttrs.length === 1){
                return;
            }
            var newFamilyAttr = new BGPAsAServiceFamilyAttrModel({address_family: "inet",
                loop_count: null, prefix_limit: null});
            familyAttrs.add([newFamilyAttr]);
        },
        deleteFamilyAttr: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },
        getFamilyAttrs: function(attr) {
            var familyAttrs = attr.familyAttrs.toJSON();
            var actFamilyAttrs = [];
            if(familyAttrs instanceof Array) {
                for(var i = 0; i < familyAttrs.length; i++) {
                    var familyAttr = familyAttrs[i];
                    actFamilyAttrs.push({
                        address_family: familyAttr.address_family(),
                        loop_count: Number(familyAttr.loop_count()),
                        prefix_limit: {maximum : Number(familyAttr.prefix_limit())}
                    });
                }
            }
            return actFamilyAttrs;
        },
        prepareVMIRefs: function(attr) {
            var vmiStr = attr.user_created_virtual_machine_interface;
            var vmiRefs = [];
            if(vmiStr) {
                var vmiArr = vmiStr.split(",");
                for(var i = 0; i < vmiArr.length; i++) {
                    var vmiDetailsArr  = vmiArr[i].split(" ");
                    vmiRefs.push({
                        to: [vmiDetailsArr[1], vmiDetailsArr[2], vmiDetailsArr[3]],
                        uuid: vmiDetailsArr[0]
                    });
                }
            }
            return vmiRefs;
        },
        configBGPAsAService: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postBGPAsAServiceData = {};
            var self  = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "configureValidation"
                },
                {
                    key : "familyAttrs",
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : "familyAttrValidation"
                }
            ];

            if (this.isDeepValid(validations)) {
                var attr = this.model().attributes;
                var newBGPAsAServiceData = $.extend(true, {}, attr);

                newBGPAsAServiceData["display_name"] =
                    newBGPAsAServiceData["name"];
                newBGPAsAServiceData["fq_name"] =
                    [
                        getCookie("domain"),
                        getCookie("project"),
                        newBGPAsAServiceData["name"]
                    ];
                var sessionAttrs =
                    newBGPAsAServiceData["bgpaas_session_attributes"];

                //family attrs
                newBGPAsAServiceData["bgpaas_session_attributes"]
                    ["family_attributes"] = self.getFamilyAttrs(attr);

                //hold time
                newBGPAsAServiceData["bgpaas_session_attributes"]["hold_time"] =
                    sessionAttrs.hold_time ? Number(sessionAttrs.hold_time) : 0;

                //loop count
                newBGPAsAServiceData["bgpaas_session_attributes"]["loop_count"] =
                    sessionAttrs.loop_count ? Number(sessionAttrs.loop_count) : 0;

                //auth key
                if(newBGPAsAServiceData.user_created_auth_key_type != 'none') {
                    newBGPAsAServiceData["bgpaas_session_attributes"]["auth_data"] = {
                        key_type : newBGPAsAServiceData.user_created_auth_key_type,
                        key_items : [{
                            key_id : 0,
                            key : newBGPAsAServiceData.user_created_auth_key
                        }]
                    };
                } else {
                   newBGPAsAServiceData["bgpaas_session_attributes"]["auth_data"] = null;
                }

                //virtual_machine_interface refs
                 newBGPAsAServiceData["virtual_machine_interface_refs"] =
                     self.prepareVMIRefs(attr);

                delete newBGPAsAServiceData.errors;
                delete newBGPAsAServiceData.locks;
                delete newBGPAsAServiceData.cgrid;
                delete newBGPAsAServiceData.id_perms;
                delete newBGPAsAServiceData.elementConfigMap;
                delete newBGPAsAServiceData.user_created_virtual_machine_interface;
                delete newBGPAsAServiceData.user_created_auth_key_type;
                delete newBGPAsAServiceData.user_created_auth_key;
                delete newBGPAsAServiceData.familyAttrs;

                postBGPAsAServiceData['bgp-as-a-service'] = newBGPAsAServiceData;

                ajaxConfig.type  = ajaxMethod;
                ajaxConfig.data  = JSON.stringify(postBGPAsAServiceData);
                ajaxConfig.url   = ajaxMethod == 'PUT' ?
                                   ctwc.URL_UPDATE_BGP_AS_A_SERVICE +
                                   newBGPAsAServiceData['uuid'] :
                                   ctwc.URL_CREATE_BGP_AS_A_SERVICE;


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
                    callbackObj.error(this.getFormErrorText(ctwl.BGP_PREFIX_ID));
                }
            }

            return returnFlag;
        },
        deleteBGPAsAServices : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'bgp-as-a-service',
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
        validations: {
            configureValidation: {
                'name': {
                    required: true,
                    msg: 'Enter BGP as a Service Name'
                },
                'bgpaas_ip_address' : function(value, attr, finalObj){
                    if (!isValidIP(value) || value.trim().indexOf("/") != -1) {
                        return "Enter an IP Address in the format xxx.xxx.xxx.xxx";
                    }
                },
                'bgpaas_session_attributes.hold_time' :  function(value, attr, finalObj){
                    if(value) {
                        var holdTime = Number(value);
                        if (isNaN(holdTime) || holdTime < 1 || holdTime > 65535) {
                            return "Enter hold time between 1-65535" ;
                        }
                    }
                },
                 "bgpaas_session_attributes.loop_count" : function(value, attr, finalObj) {
                    if(value) {
                        if(isNaN(value) || Number(value) < 0 || Number(value) > 16) {
                            return "Enter Loop count between 0-16"
                        }
                    }
                },
                'user_created_auth_key' : function(value, attr, finalObj){
                    if (finalObj['user_created_auth_key_type'] != 'none'
                        && (value == null || value.trim() == '')) {
                        return "Enter a valid Authentication key";
                    }
                }
            }
        },
    });
    return bgpAsAServiceModel;
});
