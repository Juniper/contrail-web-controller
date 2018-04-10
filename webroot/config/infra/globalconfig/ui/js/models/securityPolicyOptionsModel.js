/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var secPolicyOptionsModel = ContrailModel.extend({
        defaultConfig: {
            "enable_security_policy_draft": false,
        },

        configureSecPolicyOptions: function (callbackObj, isGlobal) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newSecPolicyOptionsConfig, putData = {}, policyMgmtConfigData = {},
                ipFabricSubnets, grTime, llgrTime, endOfRIBRecTime,

            //if(self.isDeepValid(validations)) {
                newSecPolicyOptionsConfig =
                    $.extend({}, true, self.model().attributes);
                var configObjType = isGlobal ? "global-system-config" : "project";
                policyMgmtConfigData[configObjType] = {};
                if (null != newSecPolicyOptionsConfig['uuid']) {
                    policyMgmtConfigData[configObjType]['uuid'] =
                        newSecPolicyOptionsConfig['uuid'];
                    policyMgmtConfigData[configObjType]['fq_name'] =
                        newSecPolicyOptionsConfig['fq_name'];
                    policyMgmtConfigData[configObjType]['name'] =
                        newSecPolicyOptionsConfig['name'];
                    policyMgmtConfigData[configObjType]
                    ["enable_security_policy_draft"] =
                        newSecPolicyOptionsConfig["enable_security_policy_draft"];
                }
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(policyMgmtConfigData);
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
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
            /*} else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID));
                }
            }*/
            return returnFlag;
        }
    });
    return secPolicyOptionsModel;
});
