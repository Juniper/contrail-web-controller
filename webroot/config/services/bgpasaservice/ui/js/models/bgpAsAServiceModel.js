/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/services/bgpasaservice/ui/js/models/bgpAsAServiceFamilyAttrModel'
], function (_, ContrailConfigModel, BGPAsAServiceFamilyAttrModel) {
    var bgpAsAServiceModel = ContrailConfigModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": null,
            "parent_type": 'project',
            "bgpaas_ip_address": null,
            "autonomous_system": null,
            "bgpaas_session_attributes": {
                "admin_down": false,
                "route_origin_override": {
                    "origin": "IGP",
                    "origin_override": false
                },
                "as_override": false,
                "hold_time": null,
                "loop_count": null,
                "local_autonomous_system":null,
                "address_families": {
                    "family": []
                },
                "family_attributes": []
            },
            "service_health_check_refs": [],
            "virtual_machine_interface_refs": [],
            "user_created_virtual_machine_interface": null,
            /*"user_created_auth_key_type": "none",
            "user_created_auth_key": null*/
            "bgpaas_ipv4_mapped_ipv6_nexthop": false,
            "bgpaas_suppress_route_advertisement": false,
            "bgpaas_shared": false
        },

        formatModelConfig : function(modelConfig) {
            modelConfig['display_name'] = ctwu.getDisplayNameOrName(modelConfig);
            //prepare family attributes collection
            var familyAttrArray = [];
            var bgpaasSessionAttrs = getValueByJsonPath(modelConfig,
                "bgpaas_session_attributes", null);
            var vmiRefs = [], editVMIRefs = [];
            if(bgpaasSessionAttrs) {
                var familyAttrs = getValueByJsonPath(bgpaasSessionAttrs,
                    "family_attributes", []);
                if(!modelConfig.uuid) {
                    familyAttrArray.push(new BGPAsAServiceFamilyAttrModel({
                                           bgpaas_address_family: "inet",
                                           //bgpaas_loop_count: 0,
                                           bgpaas_idle_timeout: '',
                                           bgpaas_prefix_limit: 0
                                       }));
                    familyAttrArray.push(new BGPAsAServiceFamilyAttrModel({
                                           bgpaas_address_family: "inet6",
                                           //bgpaas_loop_count: 0,
                                           bgpaas_idle_timeout:'',
                                           bgpaas_prefix_limit: 0
                                       }));
                } else {
                    for(var i = 0; i < familyAttrs.length; i++) {
                        var familyAttr =  new BGPAsAServiceFamilyAttrModel({
                                               bgpaas_address_family: familyAttrs[i].address_family,
                                               bgpaas_idle_timeout : getValueByJsonPath(familyAttrs[i], "prefix_limit;idle_timeout", null),
                                               //bgpaas_loop_count: familyAttrs[i].loop_count,
                                               bgpaas_prefix_limit: getValueByJsonPath(familyAttrs[i], "prefix_limit;maximum", null)
                                           });
                        familyAttrArray.push(familyAttr);
                    }
                }

                if(!modelConfig.uuid) {
                    modelConfig["bgpaas_session_attributes"]["address_families"]["family"] =
                        ["inet", "inet6"];
                }
                /*if(bgpaasSessionAttrs['auth_data'] != null) {
                    var authData = bgpaasSessionAttrs['auth_data'];
                    modelConfig['user_created_auth_key_type'] =
                        authData.key_type != null ? authData.key_type : 'none';
                    modelConfig['user_created_auth_key'] =
                        authData.key_items != null &&
                        authData.key_items.length > 0 ?
                        authData.key_items[0].key : '';
                }*/
                if(bgpaasSessionAttrs["admin_down"] != null) {
                    modelConfig["bgpaas_session_attributes"]['admin_down'] =
                        !bgpaasSessionAttrs["admin_down"];
                }
            }
            // virtual machine interface refs
            vmiRefs = getValueByJsonPath(modelConfig,
                "virtual_machine_interface_refs", []);
            if(vmiRefs.length > 0) {
                _.each(vmiRefs, function(vmiRef){
                    var fqName = vmiRef.to;
                    editVMIRefs.push(vmiRef.uuid +
                        cowc.DROPDOWN_VALUE_SEPARATOR + fqName[0] +
                        ":" + fqName[1] +
                        ":" + fqName[2]);
                });
                modelConfig["user_created_virtual_machine_interface"] =
                    editVMIRefs;
            }
            //service health check refs
            var shcRefsTo = getValueByJsonPath(modelConfig,
                    "service_health_check_refs;0;to", []);
            if(shcRefsTo) {
                modelConfig["service_health_check_refs"] = shcRefsTo.join(":");
            } else {
                modelConfig["service_health_check_refs"] = "";
            }
            modelConfig["familyAttrs"] = new Backbone.Collection(familyAttrArray);

            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        addFamilyAttr: function() {
            var familyAttrs = this.model().attributes["familyAttrs"],
                familyAttrsArry = familyAttrs.toJSON();
            var selectedAddrFamilies = cowu.getValueByJsonPath(this.model(),
                    "attributes;bgpaas_session_attributes;address_families;family", "").split(",");
            var addressFamily = "";
            var inetFamily = "inet";
            var familyAttrsArryLength = familyAttrsArry.length;
            var selectedAddrFamiliesLength = selectedAddrFamilies.length;
            if (familyAttrsArryLength == selectedAddrFamilies.length ||
                    selectedAddrFamilies[0] == "") {
                return
            } else if (familyAttrsArryLength == 0 && selectedAddrFamiliesLength > 0) {
                addressFamily = selectedAddrFamilies[0];
            } else if (familyAttrsArryLength < selectedAddrFamiliesLength) {
                addressFamily =
                    familyAttrsArry[0].bgpaas_address_family() === inetFamily ?
                        "inet6" : inetFamily;
            }
            var newFamilyAttr = new BGPAsAServiceFamilyAttrModel({bgpaas_address_family: addressFamily,
                /*bgpaas_loop_count: 0*/bgpaas_idle_timeout:'', bgpaas_prefix_limit: 0});
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
                        address_family: familyAttr.bgpaas_address_family(),
                        //loop_count: Number(familyAttr.bgpaas_loop_count()),
                        prefix_limit: {maximum : Number(familyAttr.bgpaas_prefix_limit()), idle_timeout : Number(familyAttr.bgpaas_idle_timeout())}
                    });
                }
            }
            return actFamilyAttrs;
        },
        prepareVMIRefs: function(attr) {
            var vmiStr = attr.user_created_virtual_machine_interface;
            var vmiRefs = [];
            if(vmiStr) {
                var vmiArr = vmiStr.split(ctwc.MULTISELECT_VALUE_SEPARATOR);
                for(var i = 0; i < vmiArr.length; i++) {
                    var vmiDetailsArr  = vmiArr[i].split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    if(vmiDetailsArr.length === 2) {
                        vmiRefs.push({
                            to: vmiDetailsArr[1].split(":"),
                            uuid: vmiDetailsArr[0]
                        });
                    }
                }
            }
            return vmiRefs;
        },

        configBGPAsAService: function (callbackObj, ajaxMethod) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                postBGPAsAServiceData = {}, sessionAttrs,
                validations = [
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
                ,
                //permissions
                ctwu.getPermissionsValidation()
            ];

            if (self.isDeepValid(validations)) {
                var attr = self.model().attributes;
                var newBGPAsAServiceData = $.extend(true, {}, attr);

                ctwu.setNameFromDisplayName(newBGPAsAServiceData);
                if(newBGPAsAServiceData["fq_name"] == null ||
                    !newBGPAsAServiceData["fq_name"].length) {
                    newBGPAsAServiceData["fq_name"] =
                        [
                            contrail.getCookie(cowc.COOKIE_DOMAIN),
                            contrail.getCookie(cowc.COOKIE_PROJECT),
                            newBGPAsAServiceData["name"]
                        ];
                }
                sessionAttrs =
                    newBGPAsAServiceData["bgpaas_session_attributes"];

                //ip address
                if(!newBGPAsAServiceData["bgpaas_ip_address"]){
                    newBGPAsAServiceData["bgpaas_ip_address"] = null;
                }

                //autonomous system
                newBGPAsAServiceData["autonomous_system"] =
                    newBGPAsAServiceData["autonomous_system"] ?
                    Number(newBGPAsAServiceData["autonomous_system"]) : null;

                //address families
                newBGPAsAServiceData["bgpaas_session_attributes"]["address_families"]["family"] =
                     sessionAttrs.address_families.family.split(",");

                //family attrs
                newBGPAsAServiceData["bgpaas_session_attributes"]
                    ["family_attributes"] = self.getFamilyAttrs(attr);

                //admin down
                newBGPAsAServiceData["bgpaas_session_attributes"]["admin_down"] =
                    !sessionAttrs.admin_down;

                //hold time
                newBGPAsAServiceData["bgpaas_session_attributes"]["hold_time"] =
                    sessionAttrs.hold_time ? Number(sessionAttrs.hold_time) : 0;

                //loop count
                newBGPAsAServiceData["bgpaas_session_attributes"]["loop_count"] =
                    sessionAttrs.loop_count ? Number(sessionAttrs.loop_count) : 0;

                //loop count
                newBGPAsAServiceData["bgpaas_session_attributes"]["local_autonomous_system"] =
                    sessionAttrs.local_autonomous_system ? Number(sessionAttrs.local_autonomous_system) : null;

                /*//auth key
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
                }*/

                //virtual_machine_interface refs
                 newBGPAsAServiceData["virtual_machine_interface_refs"] =
                     self.prepareVMIRefs(attr);

                 //service health check refs
                 var shcRefs = getValueByJsonPath(newBGPAsAServiceData,
                         "service_health_check_refs", null);
                 if(shcRefs) {
                     newBGPAsAServiceData["service_health_check_refs"] = [{ 'to': shcRefs.split(":") }]
                 } else {
                     newBGPAsAServiceData["service_health_check_refs"] = [];
                 }

                //permissions
                this.updateRBACPermsAttrs(newBGPAsAServiceData);

                ctwu.deleteCGridData(newBGPAsAServiceData);
                delete newBGPAsAServiceData.id_perms;
                delete newBGPAsAServiceData.user_created_virtual_machine_interface;
                /*delete newBGPAsAServiceData.user_created_auth_key_type;
                delete newBGPAsAServiceData.user_created_auth_key;*/
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
                    callbackObj.error(self.getFormErrorText(
                            ctwc.BGP_AS_A_SERVICE_PREFIX_ID));
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
                'display_name': {
                    required: true,
                    msg: 'Enter BGP as a Service Name'
                },
                'bgpaas_ip_address' : function(value, attr, finalObj){
                    if(finalObj.bgpaas_shared){
                        if(value == null){
                            return "Enter an IP Address";
                        }else if (value && (!isValidIP(value) || value.trim().indexOf("/") != -1)){
                            return "Enter an IP Address in the format xxx.xxx.xxx.xxx";
                        }
                    }else if (value && (!isValidIP(value) || value.trim().indexOf("/") != -1)){
                        return "Enter an IP Address in the format xxx.xxx.xxx.xxx";
                    }
                },
                'autonomous_system' : function(value, attr, finalObj){
                     var asn = Number(value);
                     if (isNaN(asn) || asn < 1 || asn > 65534) {
                         return "Enter ASN number between 1-65534";
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
                'bgpaas_session_attributes.local_autonomous_system' : function(value, attr, finalObj){
                    if (value) {
                        var asn = Number(value);
                        if (isNaN(asn) || asn < 1 || asn > 65534) {
                            return "Enter Local ASN number between 1-65534";
                        }
                    }
                },
                /*
                'user_created_auth_key' : function(value, attr, finalObj){
                    if (finalObj['user_created_auth_key_type'] != 'none'
                        && (value == null || value.trim() == '')) {
                        return "Enter a valid Authentication key";
                    }
                },*/
                "bgpaas_session_attributes.address_families.family" : function(value, attr, finalObj) {
                    if(!value) {
                        return "At least one Address Family is required";
                    }
                    var addFamilyAttrs = finalObj['familyAttrs'].models;
                    var familyAttrs = $.map (addFamilyAttrs, function(d,i){
                        var attrs = d.attributes;
                        return attrs.bgpaas_address_family();
                    });
                    var addFamilies = value.split(',');
                    var isError = false;
                    $.each(familyAttrs, function(i,d){
                        if (!_.contains(addFamilies,d)) {
                            isError = true;
                        }
                    });
                    if (isError) {
                        return "Please add Address Family Attributes corresponding to the Address Families selected";
                    }
                }
            }
        }
    });
    return bgpAsAServiceModel;
});
