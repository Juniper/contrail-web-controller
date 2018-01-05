/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var macLearningModel = ContrailModel.extend({
        defaultConfig: {
            'mac_limit_control' : {
                'mac_limit': 0, //unlimited
                'mac_limit_action': 'log'
            },
            'mac_move_control': {
                'mac_move_limit': 0, //unlimited
                'mac_move_time_window': 10,
                'mac_move_limit_action': 'log'
            },
            'mac_aging_time': 300,
        },

        validations: {
            macLearningValidations: {
                'mac_limit_control.mac_limit':
                    function (value, attr, finalObj) {
                    var macLimit = Number(value);
                    if (isNaN(macLimit)) {
                        return "MAC Limit should be a number";
                    }
                },
                'mac_move_control.mac_move_limit':
                    function (value, attr, finalObj) {
                    var macMoveLimit = Number(value);
                    if (isNaN(macMoveLimit)) {
                        return "MAC Move Limit should be a number";
                    }
                },
                'mac_move_control.mac_move_time_window':
                    function (value, attr, finalObj) {
                    var timeWindow = Number(value);
                    if ((isNaN(timeWindow) ||
                        (timeWindow < 1) || (timeWindow > 60))) {
                        return "Enter MAC Move Time Window between 1 - 60";
                    }
                },
                'mac_aging_time':
                    function (value, attr, finalObj) {
                    var agingTime = Number(value);
                    if ((isNaN(agingTime) ||
                        (agingTime < 0) || (agingTime > 86400))) {
                        return "Enter MAC Aging Time between 0 - 86400";
                    }
                }
            }
        },

        formatModelConfig: function(modelConfig) {
            return modelConfig;
        },

        configureMACLearning: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newMACLearningConfig, putData = {}, globalSysConfigData = {},
                macLimit, macMoveLimit, timeWindow, agingTime,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: "macLearningValidations"
                    }
                ];

            if(self.isDeepValid(validations)) {
                newMACLearningConfig =
                    $.extend({}, true, self.model().attributes);
                globalSysConfigData["global-system-config"] = {};

                //mac limit
                globalSysConfigData['global-system-config']
                    ["mac_limit_control"] = newMACLearningConfig["mac_limit_control"];

                macLimit = getValueByJsonPath(newMACLearningConfig,
                        "mac_limit_control;mac_limit", "");
                macLimit = macLimit.toString().trim().length > 0 ?
                        Number(macLimit) : 0;
                globalSysConfigData['global-system-config']
                ["mac_limit_control"]["mac_limit"] = macLimit;

                //mac move limit
                globalSysConfigData['global-system-config']
                ["mac_move_control"] = newMACLearningConfig["mac_move_control"];
                macMoveLimit = getValueByJsonPath(newMACLearningConfig,
                        "mac_move_control;mac_move_limit",
                        "");
                macMoveLimit = macMoveLimit.toString().trim().length > 0 ?
                        Number(macMoveLimit) : 0;
                globalSysConfigData['global-system-config']
                ["mac_move_control"]["mac_move_limit"] =
                    macMoveLimit;
                //mac move time window
                timeWindow = getValueByJsonPath(newMACLearningConfig,
                        "mac_move_control;mac_move_time_window",
                        "");
                timeWindow = timeWindow.toString().trim().length > 0 ?
                        Number(timeWindow) : 10;
                globalSysConfigData['global-system-config']
                ["mac_move_control"]["mac_move_time_window"] =
                    timeWindow;

                //mac aging time
                agingTime = getValueByJsonPath(newMACLearningConfig,
                        'mac_aging_time',"");
                agingTime = agingTime.toString().trim().length > 0 ?
                        Number(agingTime) : 300;
                globalSysConfigData['global-system-config']['mac_aging_time'] =
                    agingTime;

                if (null != newMACLearningConfig['uuid']) {
                    globalSysConfigData['global-system-config']['uuid'] =
                        newMACLearningConfig['uuid'];
                    putData = {"global-system-config":
                        globalSysConfigData["global-system-config"]};
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
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_MAC_LEARNING_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return macLearningModel;
});

