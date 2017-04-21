/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/gohanUi/networkpolicy/ui/js/models/gcRuleModel'
], function (_, ContrailConfigModel, RuleModel) {
    var SIDataSource;
    var self;
    var policyModel = ContrailConfigModel.extend({
        defaultConfig: {
            "description": "",
            "network_policy_entries":{"policy_rule":[]},
            "entries": [],
            "id": "",
            "name": "",
            "tenant_id": ""
        },
        formatModelConfig: function (config) {
            self = this;
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            var ruleModels = [];
            var rulesList = modelConfig["entries"];
            if (rulesList != null && rulesList.length > 0) {
                for (var i = 0; i < rulesList.length; i++) {
                    var rule_obj = rulesList[i];
                    rule_obj['direction'] = cowu.deSanitize(rule_obj['direction']);
                    var ruleModel = new RuleModel(rule_obj);
                    this.showHideServiceInstance(ruleModel);
                    ruleModels.push(ruleModel)
                }
            }
            var rulesCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['PolicyRules'] = rulesCollectionModel;
            modelConfig["network_policy_entries"]["policy_rule"] =
                                                     rulesCollectionModel;
            return modelConfig;
        },
        addRule: function() {
            var rulesList = this.model().attributes['PolicyRules'],
                newRuleModel = new RuleModel();
                this.showHideServiceInstance(newRuleModel);

            rulesList.add([newRuleModel]);
        },
        deleteRules: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        showHideServiceInstance: function(ruleModels) {
            ruleModels.showService = ko.computed((function() {
                if (this.apply_service_check() == true) {
                        this.direction("<>");
                        this.simple_action("PASS");
                        return true;
                } else {
                 $('#PolicyRules > table > tbody > tr:last-child > .error-cell > span').text('');
                 return false;
                }
            }), ruleModels);
            ruleModels.showMirror = ko.computed((function(){
                if (this.mirror_to_check() == true) {
                    this.protocol("ANY");
                    this.src_ports_text("ANY");
                    this.dst_ports_text("ANY");
                    return (this.mirror_to_check);
                } else {
                    return false;
                }
            }), ruleModels);
        },
        configurePolicy: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = true, serviceCheck = true;
            var newPolicyData = $.extend(true,{},this.model().attributes),
                 policeyRuleJSON = newPolicyData["network_policy_entries"]["policy_rule"],
                    policeyRuleVal = $.extend(true,{},policeyRuleJSON),
                    policeyRule = policeyRuleVal.toJSON(),
                    newPoliceyRule = [];
                policeyRuleLen = policeyRule.length;
                for (var i = 0; i < policeyRuleLen; i++){
                    if(policeyRule[i].apply_service_check() && (policeyRule[i].service_instance() === null || policeyRule[i].service_instance() === '')){
                        serviceCheck = false;
                    }else if(policeyRule[i].apply_service_check() && (policeyRule[i].service_instance() !== null || policeyRule[i].service_instance() !== '')){
                        var instance = policeyRule[i].service_instance().split(';');
                        var applyService = instance;
                    }else if(!policeyRule[i].apply_service_check() && policeyRule[i].service_instance() === null){
                        var applyService = [];
                    }
                    newPoliceyRule[i] = {};
                    newPoliceyRule[i].direction = policeyRule[i].direction();
                    newPoliceyRule[i].protocol = policeyRule[i].protocol().toLowerCase();
                    newPoliceyRule[i].action_list = { apply_service : applyService, simple_action: policeyRule[i].simple_action().toLowerCase()};
                    var srcAddress = policeyRule[i].src_address().split(';');
                    var dstAddress = policeyRule[i].dst_address().split(';');
                    newPoliceyRule[i].dst_addresses = [{virtual_network: dstAddress[0]}];
                    newPoliceyRule[i].src_addresses = [{virtual_network: srcAddress[0]}];
                    if(policeyRule[i].src_ports_text() === 'ANY'){
                      newPoliceyRule[i].src_ports = [{end_port: -1, start_port: -1}];
                    }else{
                        var ports = policeyRule[i].src_ports_text().split('-');
                        newPoliceyRule[i].src_ports = [{end_port: parseInt(ports[ports.length-1]), start_port: parseInt(ports[0])}];
                    }
                    if(policeyRule[i].dst_ports_text() === 'ANY'){
                        newPoliceyRule[i].dst_ports = [{end_port: -1, start_port: -1}];
                    }else{
                        var ports = policeyRule[i].dst_ports_text().split('-');
                        newPoliceyRule[i].dst_ports = [{end_port: parseInt(ports[ports.length-1]), start_port: parseInt(ports[0])}];
                    }
                }
                newPolicyData["entries"] = newPoliceyRule;
                if(mode === 'edit'){
                    delete(newPolicyData.name);
                    delete(newPolicyData.cgrid);
                }
                delete(newPolicyData.errors);
                delete(newPolicyData.locks);
                delete(newPolicyData.PolicyRules);
                delete(newPolicyData.rawData);
                delete(newPolicyData.policyName);
                delete(newPolicyData.tenant_id);
                delete(newPolicyData.elementConfigMap);
                delete(newPolicyData.owner_visible);
                delete(newPolicyData.network_policy_entries);
                delete(newPolicyData.perms2);
                delete(newPolicyData.share_list);
                var postData = {};
                var type = "";
                var url = "";
                if(mode === 'add'){
                    type = "POST";
                    url = ctwc.GOHAN_NETWORK_POLICY;
                }else{
                    type = "PUT";
                    url = ctwc.GOHAN_NETWORK_POLICY + '/' + newPolicyData.id;
                }
                delete(newPolicyData.id);
                postData["network_policy"] = {};
                postData["network_policy"] = newPolicyData;
                ajaxConfig = {};
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(postData);
                ajaxConfig.url = url;
                if(serviceCheck){
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
                }else{
                     var error = {};
                     error.responseText = 'Please select atleast one service to apply.';
                     if (contrail.checkIfFunction(callbackObj.error)) {
                         callbackObj.error(error);
                     }
                     returnFlag = false;
                }
            return returnFlag;
        },
        deletePolicy: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var type = "DELETE";
            var url = ctwc.GOHAN_NETWORK_POLICY + '/' + selectedGridData.id;
            var postData = {};
            postData["network_policy"] = {};
            ajaxConfig.type = type;
            ajaxConfig.data = JSON.stringify(postData);
            ajaxConfig.url = url;
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
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return policyModel;
});
