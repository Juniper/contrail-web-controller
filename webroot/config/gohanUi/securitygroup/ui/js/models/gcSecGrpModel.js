/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/gohanUi/securitygroup/ui/js/models/gcSecRulesModel'
], function (_, ContrailModel, SecRulesModel) {
    var deletedRule = [];
    var secGrpModel = ContrailModel.extend({
        defaultConfig: {
            'contrail_id': 0,
            'description': '',
            'id': '',
            'name': '',
            'tenant_id': '',
            'sgRules':[],
            'rules_entries':{"rules":[]},
            'hideField': false
        },
        formatModelConfig: function(modelConfig) {
            var ruleModels = [];
            deletedRule = [];
            var rulesList = modelConfig["sgRules"];
            if (rulesList != null && rulesList.length > 0) {
                for (var i = 0; i < rulesList.length; i++) {
                    var ruleId = rulesList[i].id;
                    delete rulesList[i].id;
                    rulesList[i]['ruleId'] = ruleId;
                    var rule_obj = rulesList[i];
                    var ruleModel = new SecRulesModel(rule_obj);
                    ruleModels.push(ruleModel)
                }
            }
            var rulesCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['GohanSecRuleDetails'] = rulesCollectionModel;
            modelConfig["rules_entries"]["rules"] = rulesCollectionModel;
            return modelConfig;
        },
        addRule: function(){
            var rulesList = this.model().attributes['GohanSecRuleDetails'],
            newRuleModel = new SecRulesModel();
            rulesList.add([newRuleModel]);
        },
        deleteRules: function(data, rules) {
            var rulesCollection = data.model().collection,
            delRule = rules.model();
            var model = $.extend(true,{},delRule.attributes);
            if(model.ruleId() != ''){
                deletedRule.push({ruleId : model.ruleId()});
            }
            rulesCollection.remove(delRule);
        },
        makeNonEditableField: function(ruleModels, type) {
            ruleModels.showField = ko.computed((function() {
                if (type === 'edit') {
                    return true;
                } else {
                    return false;
                }
            }), ruleModels);
        },
        gohanSecurityGroupUpdate: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var secGroupData = $.extend(true,{},this.model().attributes);
                var model = {};
                model['security_group'] = {};
                model['security_group']['description'] = secGroupData['description'];
                var type = "PUT";
                var url = ctwc.GOHAN_SEC_GROUP + '/' + secGroupData['id'];
                ajaxConfig = {};
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(model);
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
            return returnFlag;
        },
        deleteGohanSecurityGroup : function(selectedGridData, callbackObj){
            var ajaxConfig = {}, returnFlag = false;
            var model = {};
            model['security_group'] = {};
            ajaxConfig.type = "DELETE";
            ajaxConfig.data = JSON.stringify(model);
            ajaxConfig.url = ctwc.GOHAN_SEC_GROUP + '/' + selectedGridData['id'];
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
        },
        addSecurityGroupCfg: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'security_group':{}};
            var self = this;
            var newSecGrpData = $.extend(true, {}, self.model().attributes);
            var secRules = $.extend(true,{},newSecGrpData.rules_entries.rules);
            var secGrpRules = secRules.toJSON();
            var hasPrefix = true,hasPort = true;
            if(newSecGrpData.name !== ''){
                if(secGrpRules.length !== 0){
                    for(var i=0; i < secGrpRules.length; i++){
                        if(secGrpRules[i].remote_ip_prefix() == '' || secGrpRules[i].remote_ip_prefix() == ';subnet'){
                            hasPrefix = false;
                        }
                        if(secGrpRules[i].port_range() == ''){
                            hasPort = false;
                        }
                    }
                    if(hasPrefix && hasPort){
                        delete newSecGrpData.contrail_id;
                        delete newSecGrpData.GohanSecRuleDetails;
                        delete newSecGrpData.tenant_id;
                        delete newSecGrpData.errors;
                        delete newSecGrpData.locks;
                        delete newSecGrpData.elementConfigMap;
                        delete newSecGrpData.rules_entries;
                        delete newSecGrpData.sgRules;
                        delete newSecGrpData.hideField;
                        postData['security_group'] = newSecGrpData;
                        if(mode === 'add'){
                            delete newSecGrpData.id;
                            ajaxConfig.type  = 'POST';
                            postData['security_group'] = newSecGrpData;
                            ajaxConfig.data  = JSON.stringify(postData);
                            ajaxConfig.url   = ctwc.GOHAN_SEC_GROUP;
                        }else{
                            ajaxConfig.url   = ctwc.GOHAN_SEC_GROUP + '/' + newSecGrpData.id;
                            ajaxConfig.type  = 'PUT';
                            delete newSecGrpData.id;
                            delete newSecGrpData.cgrid;
                            delete newSecGrpData.name;
                            postData['security_group'] = newSecGrpData;
                            ajaxConfig.data  = JSON.stringify(postData);
                        }
                        contrail.ajaxHandler(ajaxConfig, function () {
                            if (contrail.checkIfFunction(callbackObj.init)) {
                                callbackObj.init();
                            }
                        }, function (response) {
                            if (contrail.checkIfFunction(callbackObj.success)) {
                               callbackObj.success(response, secGrpRules, deletedRule);
                            }
                            returnFlag = true;
                        }, function (error) {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(error);
                            }
                            returnFlag = false;
                        });
                    }else{
                        var error = {};
                        if(!hasPrefix && !hasPort){
                            error.responseText = 'Both of address and port range is empty.';
                        }else if(!hasPort){
                            error.responseText = 'Please enter the port range.';
                        }else if(!hasPrefix){
                            error.responseText = 'Please enter the address.';
                        }
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                        returnFlag = false; 
                    }
                }else{
                    delete newSecGrpData.contrail_id;
                    delete newSecGrpData.GohanSecRuleDetails;
                    delete newSecGrpData.tenant_id;
                    delete newSecGrpData.errors;
                    delete newSecGrpData.locks;
                    delete newSecGrpData.elementConfigMap;
                    delete newSecGrpData.rules_entries;
                    delete newSecGrpData.sgRules;
                    delete newSecGrpData.hideField;
                    if(mode === 'add'){
                        delete newSecGrpData.id;
                        ajaxConfig.type  = 'POST';
                        postData['security_group'] = newSecGrpData;
                        ajaxConfig.data  = JSON.stringify(postData);
                        ajaxConfig.url   = ctwc.GOHAN_SEC_GROUP;
                    }else{
                        ajaxConfig.url   = ctwc.GOHAN_SEC_GROUP + '/' + newSecGrpData.id;
                        ajaxConfig.type  = 'PUT';
                        delete newSecGrpData.id;
                        delete newSecGrpData.name;
                        delete newSecGrpData.cgrid;
                        postData['security_group'] = newSecGrpData;
                        ajaxConfig.data  = JSON.stringify(postData);
                    }
                    contrail.ajaxHandler(ajaxConfig, function () {
                        if (contrail.checkIfFunction(callbackObj.init)) {
                            callbackObj.init();
                        }
                    }, function (response) {
                        if (contrail.checkIfFunction(callbackObj.success)) {
                            callbackObj.success(response, [], deletedRule);
                        }
                        returnFlag = true;
                    }, function (error) {
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                        returnFlag = false;
                    });
                }
            }else{
                var error = {};
                error.responseText = 'Please enter the name';
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            }
            return returnFlag;
        }
    });
    return secGrpModel;
});


