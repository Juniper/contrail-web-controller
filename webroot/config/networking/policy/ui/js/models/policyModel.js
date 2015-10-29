/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/models/ruleModel',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, ContrailModel, RuleModel, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var popupData = [];
    var policyModel = ContrailModel.extend({
        defaultConfig: {
            'fq_name':null,
            'display_name': '',
            'parent_type': 'project',
            'network_policy_entries':{'policy_rule':[]},
            'templateGeneratorData': 'rawData',
            'PolicyUUID':'',
            'name':''
        },
        formatModelConfig: function (config) {
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            var ruleModels = [];
            var rulesList = modelConfig["network_policy_entries"]["policy_rule"];
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length >= 3) {
                modelConfig["name"] = modelConfig['fq_name'][2];
            }
            if(rulesList != null && rulesList.length > 0) {
                for(var i = 0; i < rulesList.length; i++) {
                    var rule_obj = rulesList[i];
                    var ruleModel = new RuleModel(rule_obj);
                    this.showHideServiceInstance(ruleModel);
                    ruleModels.push(ruleModel)
                }
            }
            var rulesCollectionModel =
                                     new Backbone.Collection(ruleModels);
            modelConfig['policyRules'] = rulesCollectionModel;
            modelConfig["network_policy_entries"]["policy_rule"] =
                                                     rulesCollectionModel;
            return modelConfig;
        },
        validations: {
            policyValidations: {
                'name': {
                    required: true,
                    msg: 'Enter a valid Policy Name.'
                }
            }
        },
        addRule: function() {
            var rulesList = this.model().attributes['policyRules'],
                newRuleModel = new RuleModel();
            /*newRuleModel.__kb.model.on('change:apply_service_check',
                        function(updatedModel) {
                            console.info('name changed',updatedModel);
                        });*/
            this.showHideServiceInstance(newRuleModel);

            rulesList.add([newRuleModel]);
            //to wrap
            //policyFormatters.formAddedRule();
        },
        deleteRules: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        showHideServiceInstance: function(ruleModels) {
            ruleModels.showService = ko.computed((function() {
                if(this.apply_service_check() == true) {
                        this.direction("<>");
                        this.simple_action("PASS");
                        return true;
                } else {
                    return false;
                }
            }), ruleModels);
            ruleModels.showMirror = ko.computed((function(){
                return (this.mirror_to_check)
            }), ruleModels);
        },
        configurePolicy: function (mode, allData, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            popupData = allData;
            if (this.model().isValid(true, "policyValidations")) {
                var newPolicyData = $.extend({},this.model().attributes);
                var selectedProjectUUID = ctwu.getGlobalVariable('project').uuid;
                var selectedDomain = ctwu.getGlobalVariable('domain').name;
                var selectedProject = ctwu.getGlobalVariable('project').name;

                newPolicyData["fq_name"] =
                          [selectedDomain,selectedProject,newPolicyData.name];
                newPolicyData["parent_uuid"] = selectedProjectUUID;

                var policeyRuleJSON =
                  newPolicyData["network_policy_entries"]["policy_rule"];
                var policeyRule = $.extend({},policeyRuleJSON);
                policeyRule = policeyRule.toJSON();
                var newPoliceyRule = [];
                policeyRuleLen = policeyRule.length;
                for (var i=0;i<policeyRuleLen;i++){
                    newPoliceyRule[i] = {};
                    newPoliceyRule[i].action_list =
                                      policeyRule[i].action_list();
                    newPoliceyRule[i].action_list.simple_action =
                      (policeyRule[i].simple_action()).toLowerCase();
                    newPoliceyRule[i].application =
                                      policeyRule[i].application();
                    newPoliceyRule[i].rule_sequence =
                                      policeyRule[i].rule_sequence();
                    newPoliceyRule[i].direction = policeyRule[i].direction();
                    newPoliceyRule[i].protocol =
                                     (policeyRule[i].protocol()).toLowerCase();

                    newPoliceyRule[i].dst_addresses = [];
                    newPoliceyRule[i].dst_addresses[0] = {};
                    newPoliceyRule[i].dst_addresses[0]["security_group"] = null;
                    newPoliceyRule[i].dst_addresses[0]["virtual_network"] = null;
                    newPoliceyRule[i].dst_addresses[0]["subnet"] = null;
                    newPoliceyRule[i].dst_addresses[0]["network_policy"] = null;
                    var desArr = policeyRule[i].dst_addresses().split("~");
                    //var desArr = policeyRule[i].dst_customValue().value.split("~");
                    if(desArr.length == 2) {
                        var remoteAddrArr = desArr[0].split(':');
                        newPoliceyRule[i].dst_addresses[0][desArr[1]] = desArr[0];
                    /*var groupName = policeyRule[i].dst_customValue().groupName;
                    if(groupName == "Networks") {
                        newPoliceyRule[i].dst_addresses[0]["virtual_network"] =
                                         policeyRule[i].dst_addresses();
                    } else if(groupName == "Policies"){
                        newPoliceyRule[i].dst_addresses[0]["network_policy"] =
                                         policeyRule[i].dst_addresses();*/
                    } else {
                        newPoliceyRule[i].dst_addresses[0]["subnet"] = {};
                        var subnet = desArr[0].split("/");
                        newPoliceyRule[i].dst_addresses[0]["subnet"]["ip_prefix"]
                                                       = subnet[0];
                        newPoliceyRule[i].dst_addresses[0]["subnet"]["ip_prefix_len"]
                                                       = parseInt(subnet[1]);
                    }
                    newPoliceyRule[i].src_addresses = [];
                    newPoliceyRule[i].src_addresses[0] = {};
                    newPoliceyRule[i].src_addresses[0]["security_group"] = null;
                    newPoliceyRule[i].src_addresses[0]["virtual_network"] = null;
                    newPoliceyRule[i].src_addresses[0]["subnet"] = null;
                    newPoliceyRule[i].src_addresses[0]["network_policy"] = null;
                    var srcArr = policeyRule[i].src_addresses().split("~");
                    //var srcArr = policeyRule[i].src_customValue().value.split("~");
                    if(srcArr.length == 2) {
                        newPoliceyRule[i].src_addresses[0][srcArr[1]] = srcArr[0];
                    /*var groupName = policeyRule[i].src_customValue().groupName;
                    if(groupName == "Networks") {
                        newPoliceyRule[i].src_addresses[0]["virtual_network"] =
                                         policeyRule[i].src_addresses();
                    } else if(groupName == "Policies"){
                        newPoliceyRule[i].src_addresses[0]["network_policy"] =
                                         policeyRule[i].src_addresses();*/
                    } else {
                        newPoliceyRule[i].src_addresses[0]["subnet"] = {};
                        var subnet = srcArr[0].split("/");
                        newPoliceyRule[i].src_addresses[0]["subnet"]["ip_prefix"]
                                                        = subnet[0];
                        newPoliceyRule[i].src_addresses[0]["subnet"]["ip_prefix_len"]
                                                        = parseInt(subnet[1]);
                    }
                    newPoliceyRule[i].src_ports =
                            policyFormatters.formatPort
                                            (policeyRule[i].src_ports_text());
                    newPoliceyRule[i].dst_ports =
                            policyFormatters.formatPort
                                            (policeyRule[i].dst_ports_text());
                    if(policeyRule[i].mirror_to_check() != true) {
                        newPoliceyRule[i].action_list.mirror_to = null;
                    } else {
                        if(policeyRule[i].mirror() == "") {
                            newPoliceyRule[i].action_list.mirror_to = null;
                        } else {
                            newPoliceyRule[i].action_list.mirror_to = {};
                            var mirrorVal = policeyRule[i].mirror();
                            var mirrorValSplit = policeyRule[i].mirror().split(",");
                            if(mirrorValSplit.length > 0) {
                                mirrorVal = mirrorValSplit[0];
                            }
                            newPoliceyRule[i].action_list.mirror_to.analyzer_name =
                                 mirrorVal;
                        }
                    }
                    if(policeyRule[i].apply_service_check() != true) {
                        newPoliceyRule[i].action_list.apply_service = null;
                    } else {
                        if(policeyRule[i].service_instance() == "" ||
                           policeyRule[i].service_instance() == null) {
                            newPoliceyRule[i].action_list.apply_service = null;
                        } else {
                            newPoliceyRule[i].action_list.apply_service = [];
                            newPoliceyRule[i].action_list.apply_service =
                                policeyRule[i].service_instance().split(",");
                        }
                    }
                    delete(policeyRule[i])
                }
                if(policeyRuleLen > 0) {
                    newPolicyData["network_policy_entries"]["policy_rule"] =
                                                           newPoliceyRule;
                    delete(newPolicyData.policyRules);
                } else {
                    delete newPolicyData.network_policy_entries;
                }
                if (mode=="add") {
                    newPolicyData["display_name"] = newPolicyData.name;
                    delete(newPolicyData.PolicyUUID);
                } else {
                    delete(newPolicyData.parent_uuid);
                }
                delete(newPolicyData.errors);
                delete(newPolicyData.locks);
                delete(newPolicyData.policyRules);
                delete(newPolicyData.rawData);
                delete(newPolicyData.name);
                delete(newPolicyData.templateGeneratorData);
                delete(newPolicyData.elementConfigMap);
                if('cgrid' in newPolicyData)
                    delete(newPolicyData.cgrid);
                if('parent_href' in newPolicyData)
                    delete(newPolicyData.parent_href);
                if('PolicyUUID' in newPolicyData)
                    delete(newPolicyData.PolicyUUID);

                console.log(newPolicyData);
                var postData = {};
                postData["network-policy"] = {};
                postData["network-policy"] = newPolicyData;
                var type = "";
                var url = "";
                if(mode == "add") {
                //create//
                    type = "POST";
                    url = "/api/tenants/config/policys";
                } else {
                    type = "PUT";
                    url = ctwc.get("/api/tenants/config/policy/{0}",
                                   newPolicyData["uuid"]);
                }
                ajaxConfig = {};
                ajaxConfig.async = false;
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
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });

                returnFlag=true;
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                                     (ctwl.LOGICAL_ROUTER_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deletePolicy: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = selectedGridData[0]["uuid"];
            var delDataID = [];
            for(var i=0;i<selectedGridData.length;i++) {
                delDataID.push(selectedGridData[i]["uuid"]);
            }
            var sentData = [{"type": "network-policy", "deleteIDs": delDataID}];
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
        }
    });
    return policyModel;
});
