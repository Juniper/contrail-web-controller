/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'config/alarm/common/ui/js/models/AlarmRuleOrModel'
], function (_, Backbone, Knockout, ContrailModel, AlarmRuleOrModel) {
    var AlarmModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            alarm_severity: 4, //Default minor severity
            uve_keys: '',
            orRules: '',
            enable: true, //Default enable
            description: '',
            alarm_rules: {
                or_list: []
            },
            id_perms: {
                enable: true,
                description: ''
            }
        },

        formatModelConfig: function (config) {
            var modelConfig = $.extend({}, true, config);
            var ruleModels = [];
            var orList = getValueByJsonPath(modelConfig, "alarm_rules;or_list", []);
            modelConfig['enable'] = getValueByJsonPath(modelConfig, 'id_perms;enable', true);
            modelConfig['description'] = modelConfig['id_perms']['description'];
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
            modelConfig["alarm_rules"]["or_list"] = orRuleCollection;
            return modelConfig;
        },

        configRule: function (options, callbackObj) {
            var ajaxConfig = {}, returnFlag = true,
            validations = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'configAlarmValidations'
            }];
            if (this.isDeepValid(validations)) {
                var newRuleData = $.extend(true, {}, this.model().attributes);
                var url = ctwc.URL_CREATE_CONFIG_OBJECT, reqUrl = "/alarms";
                var orRules = newRuleData['orRules'].models, orRuleList = [];
                for (var i = 0; i < orRules.length; i++) {
                    var orRuleObj = orRules[i],
                        andRuleList = orRuleObj['attributes']['andRules'](),
                        andRulePostObjArr = [];
                    for (var j = 0; j < andRuleList.length; j++) {
                        var andRuleObj = andRuleList[j];
                        andRulePostObjArr.push({
                            operand1: andRuleObj.operand1()(),
                            operand2: andRuleObj.operand2()(),
                            operation: andRuleObj.operation()(),
                            vars: (andRuleObj.vars()() != null && typeof andRuleObj.vars()() == 'string')
                                ? andRuleObj.vars()().split('\n') : andRuleObj.vars()().join('\n')
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
                newRuleData['uve_keys'] = newRuleData['uve_keys'] != null ?
                        newRuleData['uve_keys'].split(',') : [];
                if (options['mode'] === ctwl.CREATE_ACTION) {
                    var parent = 'global-system-config'
                        fqName = ['default-global-system-config', newRuleData['name']];
                    if (options.isProject) {
                        parent = 'project',
                        fqName = [contrail.getCookie(cowc.COOKIE_DOMAIN),
                                  contrail.getCookie(cowc.COOKIE_PROJECT),
                                  newRuleData['name']];
                    }
                    newRuleData['display_name'] = newRuleData['name'];
                    newRuleData['fq_name'] = fqName;
                    newRuleData['parent_type'] = parent;
                    newRuleData['id_perms'] = {
                        enable: newRuleData['enable'],
                        description: newRuleData['description']
                    };
                } else if (options['mode'] === ctwl.EDIT_ACTION) {
                    if (newRuleData['id_perms'] != null) {
                        newRuleData['id_perms']['enable'] = newRuleData['enable'];
                        newRuleData['id_perms']['description'] = newRuleData['description'];
                    }
                    url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                    reqUrl = '/alarm/'+newRuleData['uuid'];
                }
                delete newRuleData['orRules'];
                delete newRuleData['enable'];
                delete newRuleData['description'];
                ctwu.deleteCGridData(newRuleData);
                var postData = {"data":[{"data": {
                    alarm: newRuleData,
                },"reqUrl": reqUrl}]},
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
                    (ctwc.ALARM_PREFIX_ID));
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
                'name': {
                    required: true,
                    msg: 'Enter Name'
                }, 'uve_keys': {
                    required: true,
                    msg: "Select UVE's"
                }, 'description': {
                    required: true,
                    msg: 'Enter Description'
                }
            }
        }
    });


    return AlarmModel;
});
