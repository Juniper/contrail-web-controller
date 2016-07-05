/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var forwardingClassModel = ContrailModel.extend({

        defaultConfig: {
            'name': null,
            'display_name': null,
            'uuid': null,
            'fq_name': null,
            'parent_type': 'global-qos-config',
            'forwarding_class_id': null,
            'forwarding_class_dscp': null,
            'forwarding_class_vlan_priority': null,
            'forwarding_class_mpls_exp': null
        },

        validations: {
            fwdClassConfigValidations: {
                'forwarding_class_id': function(value, attr, finalObj){
                    if(!value || isNaN(Number(value))) {
                        return "Forwarding Class ID should be a number";
                    }
                }
            }
        },

        formatModelConfig: function(modelConfig) {
            //dscp
            var dscp = getValueByJsonPath(modelConfig,
                    "forwarding_class_dscp", "");
            if(dscp.toString().trim() !== "") {
                modelConfig["forwarding_class_dscp"] =
                    gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, dscp);
            }

            //vlan
            var vlan = getValueByJsonPath(modelConfig,
                    "forwarding_class_vlan_priority", "");
            if(vlan.toString().trim() !== "") {
                modelConfig["forwarding_class_vlan_priority"] =
                    gcUtils.getTextByValue(ctwc.QOS_VLAN_PRIORITY_VALUES,
                            vlan);
            }

            //mpls
            var mpls = getValueByJsonPath(modelConfig,
                    "forwarding_class_mpls_exp", "");
            if(mpls.toString().trim() !== "") {
                modelConfig["forwarding_class_mpls_exp"] =
                    gcUtils.getTextByValue(ctwc.QOS_MPLS_EXP_VALUES, mpls);
            }

            return modelConfig;
        },

        addEditForwardingClass: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = false, newUUID, mode, fcId,
                dscp, vlan, mpls, postData;

            var self = this,
            validations = [{
                               key : null,
                               type : cowc.OBJECT_TYPE_MODEL,
                               getValidation : "fwdClassConfigValidations"
                           }];
            if (self.isDeepValid(validations)) {
                var newForwardingClass = $.extend(true,
                                                {}, self.model().attributes);
                mode = getValueByJsonPath(options, "mode", ctwl.CREATE_ACTION);

                fcId = getValueByJsonPath(newForwardingClass,
                        "forwarding_class_id", "").toString();
                if(mode === ctwl.CREATE_ACTION) {
                    newForwardingClass["fq_name"] = [];
                    newForwardingClass["fq_name"].push(
                            "default-global-system-config");
                    newForwardingClass["fq_name"].push(
                    "default-global-qos-config");
                    newForwardingClass["fq_name"].push(fcId);
                    newForwardingClass["display_name"] = fcId;
                    newForwardingClass["name"] = fcId;
                }

                dscp = getValueByJsonPath(newForwardingClass,
                                'forwarding_class_dscp', '').toString();
                dscp = gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES, dscp);
                vlan = getValueByJsonPath(newForwardingClass,
                               'forwarding_class_vlan_priority', '').toString();
                vlan= gcUtils.getValueByText(ctwc.QOS_VLAN_PRIORITY_VALUES,
                        vlan);
                mpls = getValueByJsonPath(newForwardingClass,
                                'forwarding_class_mpls_exp', '').toString();
                mpls = gcUtils.getValueByText(ctwc.QOS_MPLS_EXP_VALUES, mpls);
                fcId = fcId.trim().length != 0 ? Number(fcId) : null;
                newForwardingClass['forwarding_class_id'] = fcId;

                dscp = dscp.trim().length != 0 ? Number(dscp) : null;
                newForwardingClass['forwarding_class_dscp'] = dscp;

                vlan = vlan.trim().length != 0 ? Number(vlan) : null;
                newForwardingClass['forwarding_class_vlan_priority'] = vlan;

                mpls = mpls.trim().length != 0 ? Number(mpls) : null;
                newForwardingClass['forwarding_class_mpls_exp'] = mpls;

                ctwu.deleteCGridData(newForwardingClass);
                delete newForwardingClass.id_perms;
                delete newForwardingClass.href;
                delete newForwardingClass.parent_href;
                delete newForwardingClass.parent_uuid;


                if (mode == ctwl.CREATE_ACTION) {
                    postData = {"data":[{"data":{"forwarding-class":
                                newForwardingClass},
                                "reqUrl": "/forwarding-classs"}]};
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    postData = {"data":[{"data":{"forwarding-class":
                                newForwardingClass},
                                "reqUrl": "/forwarding-class/" +
                                newForwardingClass.uuid}]};
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);

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
                    callbackObj.error(this.getFormErrorText(
                                            ctwc.FORWARDING_CLASS_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        deleteForwardingClass: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'forwarding-class',
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

    });

    return forwardingClassModel;
});
