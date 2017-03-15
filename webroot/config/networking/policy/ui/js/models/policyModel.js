/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/policy/ui/js/models/ruleModel',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, ContrailConfigModel, RuleModel, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var SIDataSource;
    var self;
    var policyModel = ContrailConfigModel.extend({
        defaultConfig: {
            'fq_name':null,
            'display_name': '',
            'parent_type': 'project',
            'network_policy_entries':{'policy_rule':[]},
            'templateGeneratorData': 'rawData',
            'PolicyUUID':'',
            'policyName':''
        },
        formatModelConfig: function (config) {
            self = this;
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            var ruleModels = [];
            var rulesList = modelConfig["network_policy_entries"]["policy_rule"];
            var policyName = getValueByJsonPath(modelConfig, "fq_name;2", "");
            if (policyName != "") {
                modelConfig["policyName"] = policyName;
            }
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
            //permissions
            self.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        validations: {
            policyValidations: {
                'policyName': {
                    required: true,
                    msg: 'Enter a valid Policy Name.'
                }
            }
        },
        setServiceTemplateDataSource: function(SIDataSource) {
            self.SIDataSource = SIDataSource;
            var policeyRule = (self.model().attributes.PolicyRules).toJSON(),
                policeyRuleLen = policeyRule.length;
            for (var i = 0; i < policeyRuleLen; i++){
                var SI = policeyRule[i].service_instance();
                if (SI != null) {
                    var SIArr = SI.split(",");
                    SIArr = this.getApplyService(SIArr, SIDataSource);
                    policeyRule[i].service_instance(SIArr);
                }
            }
        },
        getApplyService: function(applyService, SIDataSource) {
            var applyServiceLen = applyService.length;
            for (var j = 0; j < applyServiceLen; j++) {
                applyService[j] = SIDataSource[applyService[j]];
            }
            return applyService;
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
            var ajaxConfig = {}, returnFlag = true;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'policyValidations'
                },
                {
                    key : 'PolicyRules',
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : 'ruleValidation'
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if (this.isDeepValid(validations)) {
                var newPolicyData = $.extend(true,{},this.model().attributes),
                    selectedProjectUUID = ctwu.getGlobalVariable('project').uuid,
                    selectedDomain = ctwu.getGlobalVariable('domain').name,
                    selectedProject = ctwu.getGlobalVariable('project').name;
                newPolicyData["fq_name"] =
                    [selectedDomain,selectedProject,newPolicyData.policyName];
                newPolicyData["parent_uuid"] = selectedProjectUUID;
                newPolicyData["parent_type"] = "project";
                var policeyRuleJSON =
                  newPolicyData["network_policy_entries"]["policy_rule"],
                    policeyRuleVal = $.extend(true,{},policeyRuleJSON),
                    policeyRule = policeyRuleVal.toJSON(),
                    newPoliceyRule = [];
                policeyRuleLen = policeyRule.length;
                for (var i = 0; i < policeyRuleLen; i++){
                    newPoliceyRule[i] = {};
                    var ruleUuid = policeyRule[i].rule_uuid();
                    if (ruleUuid != '') {
                        newPoliceyRule[i].rule_uuid = ruleUuid;
                    }
                    newPoliceyRule[i].action_list =
                                      policeyRule[i].action_list();
                    newPoliceyRule[i].action_list.simple_action =
                      (policeyRule[i].simple_action()).toLowerCase();
                    newPoliceyRule[i].action_list.log =
                            (policeyRule[i].log_checked());
                    newPoliceyRule[i].application =
                                      policeyRule[i].application();
                    newPoliceyRule[i].rule_sequence = {};
                    newPoliceyRule[i].rule_sequence.major = -1;
                    newPoliceyRule[i].rule_sequence.minor = -1;
                    newPoliceyRule[i].direction = policeyRule[i].direction();
                    newPoliceyRule[i].protocol =
                                     (policeyRule[i].protocol()).toLowerCase();

                    newPoliceyRule[i].dst_addresses = [];
                    newPoliceyRule[i].dst_addresses[0] = {};
                    newPoliceyRule[i].dst_addresses[0]["security_group"] = null;
                    newPoliceyRule[i].dst_addresses[0]["virtual_network"] = null;
                    newPoliceyRule[i].dst_addresses[0]["subnet"] = null;
                    newPoliceyRule[i].dst_addresses[0]["network_policy"] = null;
                    var desArr = policeyRule[i].dst_address().split("~");
                    //var desArr = policeyRule[i].dst_customValue().value.split("~");
                    if (desArr.length == 2 && desArr[1] !== 'subnet') {
                        newPoliceyRule[i].dst_addresses[0][desArr[1]] = 
                            self.getPostAddressFormat(desArr[0], selectedDomain,
                                                 selectedProject);
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
                    var srcArr = policeyRule[i].src_address().split("~");
                    //var srcArr = policeyRule[i].src_customValue().value.split("~");
                    if (srcArr.length == 2 && srcArr[1] != 'subnet') {
                        newPoliceyRule[i].src_addresses[0][srcArr[1]] = 
                            self.getPostAddressFormat(srcArr[0], selectedDomain,
                                                 selectedProject);
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
                    if (policeyRule[i].mirror_to_check() != true) {
                        newPoliceyRule[i].action_list.mirror_to = null;
                    } else {
                        if (policeyRule[i].mirror() == "") {
                            newPoliceyRule[i].action_list.mirror_to = null;
                        } else {
                            newPoliceyRule[i].action_list.mirror_to = {};
                            var mirrorVal = policeyRule[i].mirror();
                            newPoliceyRule[i].action_list.mirror_to.analyzer_name =
                                 mirrorVal;
                        }
                    }
                    if (policeyRule[i].apply_service_check() != true) {
                        newPoliceyRule[i].action_list.apply_service = null;
                    } else {
                        if (policeyRule[i].service_instance() == "" ||
                           policeyRule[i].service_instance() == null) {
                            newPoliceyRule[i].action_list.apply_service = null;
                        } else {
                            newPoliceyRule[i].action_list.apply_service = [];
                            var SIVal = policeyRule[i].service_instance().split(",");
                            var SIValLen = SIVal.length;
                            for (var m = 0; m < SIValLen; m++) {
                                SIVal[m] = SIVal[m].split(" ")[0];
                            }
                            newPoliceyRule[i].action_list.apply_service = SIVal;
                        }
                    }
                    delete(policeyRule[i])
                }
                if (policeyRuleLen > 0) {
                    newPolicyData["network_policy_entries"]["policy_rule"] =
                                                           newPoliceyRule;
                    delete(newPolicyData.PolicyRules);
                } else {
                    delete newPolicyData.network_policy_entries;
                }
                if (mode == "add") {
                    newPolicyData["display_name"] = newPolicyData.policyName;
                    delete(newPolicyData.PolicyUUID);
                } else {
                    delete(newPolicyData.parent_uuid);
                }

                //permissions
                this.updateRBACPermsAttrs(newPolicyData);

                delete(newPolicyData.errors);
                delete(newPolicyData.locks);
                delete(newPolicyData.PolicyRules);
                delete(newPolicyData.rawData);
                delete(newPolicyData.policyName);
                delete(newPolicyData.templateGeneratorData);
                delete(newPolicyData.elementConfigMap);
                if ('cgrid' in newPolicyData)
                    delete(newPolicyData.cgrid);
                if ('parent_href' in newPolicyData)
                    delete(newPolicyData.parent_href);
                if ('PolicyUUID' in newPolicyData)
                    delete(newPolicyData.PolicyUUID);

                console.log(newPolicyData);
                var postData = {};
                postData["network-policy"] = {};
                postData["network-policy"] = newPolicyData;
                var type = "";
                var url = "";
                if (mode == "add") {
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
                                     (ctwl.POLICY_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        getPostAddressFormat: function(arr, selectedDomain, selectedProject) {
            var array = arr.split(":");
            var returnval = null;
            if (array.length == 1) {
                if (String(array[0]).toLowerCase() != "any" &&
                    String(array[0]).toLowerCase() != "local") {
                    returnval = selectedDomain + ":" +
                                selectedProject + ":" +
                                array[0];
                } else {
                    returnval = array[0].toLowerCase();
                }
            } else if(array.length == 3) {
                returnval = arr;
            }
            return returnval;
        },
        deletePolicy: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false,
                delDataID = [];
            for (var i = 0; i < selectedGridData.length; i++) {
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
