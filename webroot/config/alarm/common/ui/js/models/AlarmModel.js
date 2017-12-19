/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-config-model',
    'config/alarm/common/ui/js/models/AlarmRuleOrModel'
], function (_, Backbone, Knockout, ContrailConfigModel, AlarmRuleOrModel) {
    var AlarmModel = ContrailConfigModel.extend({

        defaultConfig: {
            name: null,
            display_name: null,
            alarm_severity: 2, //Default minor severity
            uve_keys: {
                uve_key: []
            },
            orRules: null,
            alarm_rules: {
                or_list: []
            },
            id_perms: {
                enable: true,
                description: null
            }
        },

        formatModelConfig: function (config) {
            var modelConfig = $.extend({}, true, config);
            var ruleModels = [];
            var orList = getValueByJsonPath(modelConfig, "alarm_rules;or_list", []);
            if (orList != null && orList.length > 0) {
                for (var i = 0; i < orList.length; i++) {
                    var orRuleObj = orList[i];
                    var orRuleModel = new AlarmRuleOrModel(this, orRuleObj);
                    ruleModels.push(orRuleModel)
                }
            } else {
                ruleModels.push(new AlarmRuleOrModel(this, {}));
            }

            var orRuleCollection = new Backbone.Collection(ruleModels);
            modelConfig['orRules'] = orRuleCollection;
            modelConfig['display_name'] =
                ctwu.getDisplayNameOrName(modelConfig);
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        configRule: function (options, callbackObj) {
            var ajaxConfig = {}, returnFlag = true,
            validations = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'configAlarmValidations'
            }, {
                key: ['orRules', 'andRules'],
                type: cowc.OBJECT_TYPE_COLLECTION_OF_COLLECTION,
                getValidation: 'alarmRuleValidations'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            if (this.isDeepValid(validations)) {
                var newRuleData = $.extend(true, {}, this.model().attributes);
                var url = ctwc.URL_CREATE_CONFIG_OBJECT;
                var orRules = newRuleData['orRules'].models, orRuleList = [];
                ctwu.setNameFromDisplayName(newRuleData);
                for (var i = 0; i < orRules.length; i++) {
                    var orRuleObj = orRules[i],
                        andRuleList = orRuleObj['attributes']['andRules'](),
                        andRulePostObjArr = [];
                    for (var j = 0; j < andRuleList.length; j++) {
                        var andRuleObj = andRuleList[j];
                        var vars = andRuleObj.variables()();
                        if (vars != null && vars != "" && typeof vars == 'string') {
                            vars = vars.split(',')
                            vars = $.map(vars, $.trim);
                        } else if (vars == "") {
                            vars = [];
                        }
                        var operation = andRuleObj.operation()();
                            operationArr = operation.split(cowc.DROPDOWN_VALUE_SEPARATOR),
                            operand2 = andRuleObj.operand2()(),
                            operand1 = andRuleObj.operand1()(),
                            operand2Obj = {};
                            operand2 = operand2.toString().trim();
                        if (operationArr[1] == 'uve_attribute') {
                            operand2Obj = {
                                uve_attribute: operand2
                            }
                        } else if (operationArr[1] == 'json_value') {
                            operand2Obj = {
                                json_value: operand2
                            }
                        }
                        andRulePostObjArr.push({
                            operand1: operand1.toString().trim(),
                            operand2: operand2Obj,
                            operation: operationArr[0],
                            variables: vars
                        });
                    }
                    orRuleList.push({
                        and_list: andRulePostObjArr
                    });
                }
                newRuleData['alarm_rules'] = {
                    or_list: orRuleList
                };
                newRuleData['alarm_severity'] = parseInt(newRuleData['alarm_severity']);
                var uve_keys = getValueByJsonPath(newRuleData, 'uve_keys;uve_key', []);
                if (typeof uve_keys == 'string') {
                    uve_keys = uve_keys.split(',');
                }
                if (newRuleData['uve_keys'] != null) {
                    newRuleData['uve_keys']['uve_key'] = uve_keys;
                }
                if (options['mode'] === ctwl.CREATE_ACTION) {
                    var parent = 'global-system-config'
                        fqName = ['default-global-system-config', newRuleData['name']];
                    if (options.isProject) {
                        parent = 'project',
                        fqName = [contrail.getCookie(cowc.COOKIE_DOMAIN),
                                  contrail.getCookie(cowc.COOKIE_PROJECT),
                                  newRuleData['name']];
                    }
                    newRuleData['fq_name'] = fqName;
                    newRuleData['parent_type'] = parent;
                    /*newRuleData['id_perms'] = {
                        enable: newRuleData['enable'],
                        description: newRuleData['description']
                    };*/
                } else if (options['mode'] === ctwl.EDIT_ACTION) {
                    /*if (newRuleData['id_perms'] != null) {
                        newRuleData['id_perms']['enable'] = newRuleData['enable'];
                        newRuleData['id_perms']['description'] = newRuleData['description'];
                    }*/
                    url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                //permissions
                this.updateRBACPermsAttrs(newRuleData);
                delete newRuleData['orRules'];
                delete newRuleData['enable'];
                delete newRuleData['description'];
                ctwu.deleteCGridData(newRuleData);
                var postData = {alarm: newRuleData};
                ajaxConfig = {};
                ajaxConfig.url = url;
                ajaxConfig.type = 'POST';
                ajaxConfig.data = JSON.stringify(postData);
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
                returnFlag = true;
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                    ('Alarm'));
                }
            }
            return returnFlag;
        },

        deleteRule: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = selectedGridData[0]["uuid"];
            var delDataID = [];
            for (var i = 0; i < selectedGridData.length; i++) {
                delDataID.push(selectedGridData[i]["uuid"]);
            }
            var sentData = [{"type": "alarm", "deleteIDs": delDataID}];
            ajaxConfig.async = false;
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(sentData);
            ajaxConfig.url = "/api/tenants/config/delete";
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        },
        validations: {
            configAlarmValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter Name'
                }, 'uve_keys.uve_key': {
                    required: true,
                    msg: "Select UVE"
                },'id_perms.description': {
                    required: true,
                    msg: 'Enter Description'
                }
            }
        }
    });


    return AlarmModel;
});
