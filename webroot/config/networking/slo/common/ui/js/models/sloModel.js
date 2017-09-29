/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/slo/common/ui/js/models/sloRulesModel'
], function (_, ContrailConfigModel, SloRuleModel) {
    var self;
    var sloModel = ContrailConfigModel.extend({

        defaultConfig: {
            "name": '',
            "security_logging_object_rate": 100,
            "rules_entries":{"rules":[]},
            "network_policy_refs": [],
            "security_group_refs": []
        },

        validations: {
            sloValidations: {
                'name': function(value, attr, finalObj){
                    if(value === null || value === "") {
                        return "Please enter the Name.";
                    }
                },
                'security_logging_object_rate': function(value, attr, finalObj){
                    if(value === null || value === "") {
                        return "Please enter the Rate.";
                    }else{
                        var sloRate = Number(value);
                        if (isNaN(sloRate)) {
                            return "Rate should be a number.";
                        }
                    }
                }
            }
        },

        formatModelConfig: function(modelConfig) {
            self = this;
            var ruleModels = [], sloRules = [], newPolicyRefs = [], newSecGrpRefs = [];
            var policyRuleList = [], secGrpRuleList =[], dataSourceList = [];
            var policyRefs = getValueByJsonPath(modelConfig, 'network_policy_refs',[]);
            var secGrpRefs = getValueByJsonPath(modelConfig, 'security_group_refs',[]);
            var policyUuidList = [], secGrpUuidList = [];
            /*Start for dataSourceList List*/
            if(modelConfig.policyModel !== undefined){
                _.each(policyRefs, function(policy) {
                    policyUuidList.push(policy.uuid);
                });

                _.each(modelConfig.policyModel, function(model) {
                    if(policyUuidList.indexOf(model.uuid) !== -1){
                        var ruleList = getValueByJsonPath(model, ctwc.POLICY_RULE, []);
                        _.each(ruleList, function(rule) {
                            var text = rule.rule_uuid +' ('+ model.name + ')';
                            policyRuleList.push({text : text,
                                value : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                id : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                parent : "network_policy" });
                        });
                    }
                });
            }

            if(modelConfig.secGrpModel !== undefined){
               _.each(secGrpRefs, function(secGrp) {
                    secGrpUuidList.push(secGrp.uuid);
                });

                _.each(modelConfig.secGrpModel, function(model) {
                    if(secGrpUuidList.indexOf(model.uuid) !== -1){
                        var ruleList = getValueByJsonPath(model, ctwc.SERVICE_GRP_RULE, []);
                        _.each(ruleList, function(rule) {
                            var text = rule.rule_uuid +' ('+ model.name + ')';
                            secGrpRuleList.push({text : text,
                                value : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "security_group",
                                id : rule.rule_uuid + cowc.DROPDOWN_VALUE_SEPARATOR + "security_group",
                                parent : "security_group" });
                        });
                    }
                });
            }
            if(policyRuleList.length > 0 || secGrpRuleList.length > 0){
                dataSourceList.push({text : 'Policy', value : 'network_policy', id :'network_policy', children : policyRuleList},
                        {text : 'Security Group', value : 'security_group', id : 'security_group', children : secGrpRuleList});
            }
            /*End for dataSourceList*/

            _.each(policyRefs, function(policy) {
                var policyRule = getValueByJsonPath(policy, 'attr;rule',[]);
                _.each(policyRule, function(rule) {
                    rule['rule_uuid'] = rule['rule_uuid'] + ';network_policy';
                    rule['dataSource'] = dataSourceList;
                    sloRules.push(rule);
                });
            });

            _.each(secGrpRefs, function(secGrp) {
                var secGrpRule = getValueByJsonPath(secGrp, 'attr;rule',[]);
                _.each(secGrpRule, function(rule) {
                    rule['rule_uuid'] = rule['rule_uuid'] + ';security_group';
                    rule['dataSource'] = dataSourceList;
                    sloRules.push(rule);
                });
            });

            if (sloRules != null && sloRules.length > 0) {
                _.each(sloRules, function(sloRule) {
                    var ruleModel = new SloRuleModel(sloRule);
                    self.subscribeSloRuleModelChangeEvents(ruleModel);
                    ruleModels.push(ruleModel);
                });
            }
            var rulesCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['sloRuleDetails'] = rulesCollectionModel;
            modelConfig["rules_entries"]["rules"] = rulesCollectionModel;

            _.each(policyRefs, function(policy) {
                var to = policy.to.join(':');
                newPolicyRefs.push(to);
            });
            _.each(secGrpRefs, function(secGrp) {
                var to = secGrp.to.join(':');
                newSecGrpRefs.push(to);
            });

            modelConfig['network_policy_refs'] = newPolicyRefs;
            modelConfig['security_group_refs'] = newSecGrpRefs;
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        addSloRule: function(){
            var rulesList = this.model().attributes['sloRuleDetails'];
            if(this.model().attributes.network_policy_refs !== '' || this.model().attributes.security_group_refs !== ''){
                var newRuleModel = new SloRuleModel({
                    "rule_uuid": "",
                    "rate": '',
                    "dataSource" : this.sloEditView.sloRuleList
                });
                self.subscribeSloRuleModelChangeEvents(newRuleModel);
                rulesList.add([newRuleModel]);
            }else{
                this.sloEditView.model.showErrorAttr(ctwc.SLO_PREFIX_ID + cowc.FORM_SUFFIX_ID,
                        'Please select Network Policy  or Security Group.');
            }
        },

        deleteSloRule: function(data, rules) {
            var rulesCollection = data.model().collection, models,
            delRule = rules.model();
            rulesCollection.remove(delRule);
            models = this.model().attributes['sloRuleDetails'].models;
            if(models.length === 1){
                this.model().attributes['sloRuleDetails'].models[0].attributes.model().attributes.selectedUUID = [];
            }
        },

        subscribeSloRuleModelChangeEvents: function (sloRuleModel) {
            sloRuleModel.__kb.view_model.model().on('change:rule_uuid',
                function(model, text){
                     self.getSelectedRuleUUID(model, text);
                }
            );
        },

        getSelectedRuleUUID: function(model, text){
            var rulesList = self.model().attributes['sloRuleDetails'].models,
            selectedRule = [];
            _.each(rulesList, function(rule) {
                selectedRule.push(rule.attributes.rule_uuid());
            });
            var previousSelected = model._previousAttributes.rule_uuid;
            for(var j = 0; j < selectedRule.length; j++){
                if(selectedRule[j] === previousSelected){
                    selectedRule.splice(j, 1);
                }
            }
            model.attributes['selectedUUID'] = selectedRule;
        },

        addEditSecLoggingObj: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = false, newUUID, mode, fcId,
                dscp, vlan, mpls, postData;
            var self = this,
            validations = [{
                               key : null,
                               type : cowc.OBJECT_TYPE_MODEL,
                               getValidation : "sloValidations"
                           },
                           {
                               key : 'sloRuleDetails',
                               type : cowc.OBJECT_TYPE_COLLECTION,
                               getValidation : 'sloRuleValidation'
                           },
                           //permissions
                           ctwu.getPermissionsValidation()];
            if (self.isDeepValid(validations)) {
                var newSloObj = $.extend(true, {}, self.model().attributes);
                mode = getValueByJsonPath(options, "mode", ctwl.CREATE_ACTION);
                var sloRules = $.extend(true,{},newSloObj.rules_entries.rules).toJSON();
                if(mode === ctwl.CREATE_ACTION) {
                    if(options.isGlobal){
                        newSloObj["fq_name"] = [];
                        newSloObj["fq_name"].push("default-global-system-config");
                        newSloObj["fq_name"].push("default-global-vrouter-config");
                        newSloObj["fq_name"].push(newSloObj.name);
                        newSloObj["parent_type"] = "global-vrouter-config";
                    }else{
                        newSloObj["fq_name"] = [];
                        newSloObj["fq_name"].push(contrail.getCookie(cowc.COOKIE_DOMAIN));
                        newSloObj["fq_name"].push(contrail.getCookie(cowc.COOKIE_PROJECT));
                        newSloObj["fq_name"].push(newSloObj.name);
                        newSloObj["parent_type"] = "project";
                    }
                    newSloObj["display_name"] = newSloObj.name;
                }
                //permissions
                self.updateRBACPermsAttrs(newSloObj);
                ctwu.deleteCGridData(newSloObj);
                if(sloRules.length > 0){
                    var policyRuleList = {}, secGrpRuleList = {};
                    for(var i = 0; i < sloRules.length; i++){
                        var ruleUuid = sloRules[i].rule_uuid().split(';');
                        var objType = ruleUuid[1];
                        var uuid = ruleUuid[0];
                        if(sloRules[i].rate() === '' || sloRules[i].rate() === null){
                            sloRules[i].rate(newSloObj.security_logging_object_rate);
                        }
                        if(objType === 'network_policy'){
                            var objName = self.sloEditView.policyList[uuid];
                            if(policyRuleList.hasOwnProperty(objName)){
                                policyRuleList[objName].push({rule_uuid : uuid, rate : parseInt(sloRules[i].rate())});
                            }else{
                                policyRuleList[objName] = [{rule_uuid : uuid, rate : parseInt(sloRules[i].rate())}];
                            }
                        }
                        if(objType === 'security_group'){
                            var objName = self.sloEditView.secGrpList[uuid];
                            if(secGrpRuleList.hasOwnProperty(objName)){
                                secGrpRuleList[objName].push({rule_uuid : uuid, rate : parseInt(sloRules[i].rate())});
                            }else{
                                secGrpRuleList[objName] = [{rule_uuid : uuid, rate : parseInt(sloRules[i].rate())}];
                            }
                        }
                    }
                    if(Object.keys(policyRuleList).length > 0){
                        var policyList = [];
                        for(var j in policyRuleList){
                            var policyObj = {};
                            policyObj.to = self.sloEditView.policyList[j].split(';');
                            policyObj.attr = {};
                            policyObj.attr.rule = policyRuleList[j];
                            policyList.push(policyObj);
                        }
                       newSloObj['network_policy_refs'] = policyList;
                    }else{
                        newSloObj['network_policy_refs'] = [];
                    }
                    if(Object.keys(secGrpRuleList).length > 0){
                        var secGrpList = [];
                        for(var k in secGrpRuleList){
                            var secGrpObj = {};
                            secGrpObj.to = self.sloEditView.secGrpList[k].split(';');
                            secGrpObj.attr = {};
                            secGrpObj.attr.rule = secGrpRuleList[k];
                            secGrpList.push(secGrpObj);
                        }
                        newSloObj['security_group_refs'] = secGrpList;
                    }else{
                        newSloObj['security_group_refs'] = [];
                    }
                }else{
                    newSloObj['security_group_refs'] = [];
                    newSloObj['network_policy_refs'] = [];
                }
                delete newSloObj.rules_entries;
                delete newSloObj.sloRuleDetails;
                if (mode == ctwl.CREATE_ACTION) {
                    postData = {"data":[{"data":{"security-logging-object":
                                 newSloObj},
                                "reqUrl": "/security-logging-objects"}]};
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    postData = {"data":[{"data":{"security-logging-object":
                                 newSloObj},
                                "reqUrl": "/security-logging-object/" +
                                newSloObj.uuid}]};
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);

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
                    callbackObj.error(this.getFormErrorText(
                                            ctwc.SLO_PREFIX_ID));
                }
            }
            return returnFlag;
        },

        deleteSlo: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'security-logging-object',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        }
    });

    return sloModel;
});