/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var projectOtherSettingsModel = ContrailModel.extend({
        defaultConfig: {
            "vxlan_routing" : false
        },
        validations: {
            projectOtherSettingsValidations: {
                'vxlan_routing': {
                    required: true,
                    msg: 'Select VxLan Routing'
                 }
            }
        },

        formatModelConfig: function(modelConfig) {
            //vxlan_routing
            modelConfig["vxlan_routing"] =
                modelConfig.vxlan_routing === true ?
                        ctwc.CONFIG_VXLAN_ROUTING_ENABLED :
                            ctwc.CONFIG_VXLAN_ROUTING_DISABLED;
            return modelConfig;
        },

        configureProjectOtherSettings: function (projUUID, callbackObj) {
            var ajaxConfig = {}, projData, returnFlag = false;

            if (this.model().isValid(true, "projectOtherSettingsValidations")) {
                var attr = $.extend({}, true, this.model().attributes);
                ajaxConfig = {};
                projData = {};
                projData["project"] = {};
                projData["project"]["fq_name"] =
                    [contrail.getCookie(cowc.COOKIE_DOMAIN),
                     contrail.getCookie(cowc.COOKIE_PROJECT)];
                projData["project"]["uuid"] = projUUID;
                projData["project"]["vxlan_routing"] =
                    attr.vxlan_routing === ctwc.CONFIG_VXLAN_ROUTING_ENABLED ? true : false;

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(projData);
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
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.CONFIG_PROJECT_OTHER_SETTINGS_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return projectOtherSettingsModel;
});

