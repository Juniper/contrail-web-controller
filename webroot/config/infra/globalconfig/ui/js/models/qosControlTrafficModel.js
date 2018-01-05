/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var qosControlTrafficModel = ContrailModel.extend({
        defaultConfig: {
            'control_traffic_dscp': {
                'control': 0,
                'analytics': 0,
                'dns': 0
            }
        },

        formatModelConfig: function(modelConfig) {
            var controlDSCP = getValueByJsonPath(modelConfig,
                    'control_traffic_dscp;control', 0, null),
                analyticsDSCP = getValueByJsonPath(modelConfig,
                    'control_traffic_dscp;analytics', 0, null),
                dnsDSCP = getValueByJsonPath(modelConfig,
                    'control_traffic_dscp;dns', 0, null);

            modelConfig['control_traffic_dscp']['control'] =
                gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, controlDSCP);
            modelConfig['control_traffic_dscp']['analytics'] =
                gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, analyticsDSCP);
            modelConfig['control_traffic_dscp']['dns'] =
                gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, dnsDSCP);
            return modelConfig;
        },

        validations: {
            qosControlTrafficValidations: {
                'control_traffic_dscp.control':
                    function (value, attr, finalObj) {
                    if(!gcUtils.isValidBits(ctwc.QOS_DSCP_VALUES, value)) {
                        return "Enter valid Control DSCP bits";
                    }
                },
                'control_traffic_dscp.analytics':
                    function (value, attr, finalObj) {
                    if(!gcUtils.isValidBits(ctwc.QOS_DSCP_VALUES, value)) {
                        return "Enter valid Analytics DSCP bits";
                    }
                },
                'control_traffic_dscp.dns':
                    function (value, attr, finalObj) {
                    if(!gcUtils.isValidBits(ctwc.QOS_DSCP_VALUES, value)) {
                        return "Enter valid DNS DSCP bits";
                    }
                },
            }
        },

        configureQoSControlTraffic: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newControlTrafficConfig, putData = {}, globalSysConfigData = {},
                controlDSCP, analyticsDSCP, dnsDSCP,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: "qosControlTrafficValidations"
                    }
                ];

            if(self.isDeepValid(validations)) {
                newControlTrafficConfig =
                    $.extend({}, true, self.model().attributes);
                globalSysConfigData["global-qos-config"] = {};

                //control dscp
                globalSysConfigData['global-qos-config']
                    ["control_traffic_dscp"] = newControlTrafficConfig["control_traffic_dscp"];

                controlDSCP = getValueByJsonPath(newControlTrafficConfig,
                        "control_traffic_dscp;control", "");
                globalSysConfigData['global-qos-config']
                    ["control_traffic_dscp"]["control"] =
                        Number(gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES,
                                controlDSCP));

                //analytics dscp
                analyticsDSCP = getValueByJsonPath(newControlTrafficConfig,
                        "control_traffic_dscp;analytics",
                        "");
                globalSysConfigData['global-qos-config']
                    ["control_traffic_dscp"]["analytics"] =
                        Number(gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES,
                                analyticsDSCP));
                //dns dscp
                dnsDSCP = getValueByJsonPath(newControlTrafficConfig,
                        "control_traffic_dscp;dns",
                        "");
                globalSysConfigData['global-qos-config']
                    ["control_traffic_dscp"]["dns"] =
                        Number(gcUtils.getValueByText(ctwc.QOS_DSCP_VALUES,
                                dnsDSCP));;

                if (null != newControlTrafficConfig['uuid']) {
                    globalSysConfigData['global-qos-config']['uuid'] =
                        newControlTrafficConfig['uuid'];
                    putData = {"global-qos-config":
                        globalSysConfigData["global-qos-config"]};
                }

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
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
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_CONTROL_TRAFFIC_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return qosControlTrafficModel;
});

