/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermModel'
], function (_, ContrailConfigModel, RoutingPolicyFormatter, RoutingPolicyTermModel) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyModel = ContrailConfigModel.extend({
        defaultConfig: {
            'display_name': null,
            'routing_policy_entries': {
                'term': []
            },
            'routingPolicyname': '',
            'termCollection': ''
        },
        formatModelConfig: function (config) {
            var modelConfig = $.extend({}, true, config);
            modelConfig['rawData'] = config;
            var ruleModels = [];
            if (modelConfig['fq_name'] != null &&
                modelConfig['fq_name'].length >= 3) {
                modelConfig["routingPolicyname"] = modelConfig['fq_name'][2];
            }
            var termList = modelConfig["routing_policy_entries"]["term"];
            if (termList != null && termList.length > 0) {
                for (var i = 0; i < termList.length; i++) {
                    var rule_obj = termList[i];
                    //Check if "community" present convert it to list
                    if(rule_obj['term_match_condition']['community']){
                        if(rule_obj['term_match_condition']['community_list'] == null) {
                            rule_obj['term_match_condition']['community_list'] = [];
                        }
                        rule_obj['term_match_condition']['community_list'].push
                            (rule_obj['term_match_condition']['community']);
                        rule_obj['term_match_condition']['community'] = null;
                    }
                    var routingPolicyTermModel = new
                        RoutingPolicyTermModel(this, termList[i]);
                    ruleModels.push(routingPolicyTermModel)
                }
            } else {
                ruleModels.push(new
                    RoutingPolicyTermModel(this, termList));
            }


            var termCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['termCollection'] = termCollectionModel;
            modelConfig["routing_policy_entries"]["term"] =
                termCollectionModel;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        addRule: function () {
            var termList = this.model().attributes['termCollection'],
                newRoutingPolicyModel = new RoutingPolicyTermModel();
            termList.add([newRoutingPolicyModel]);
        },
        addRuleByIndex: function (data, rules) {
            var selectedRuleIndex = data.model().collection.indexOf(rules.model());
            var termList = this.model().attributes['termCollection'],
                newRoutingPolicyModel = new RoutingPolicyTermModel();
            termList.add([newRoutingPolicyModel],{at: selectedRuleIndex+1});
        },
        deleteRules: function (data, rules) {
            var termsCollection = data.model().collection,
                delTerm = rules.model();
            termsCollection.remove(delTerm);
        },
        configureRoutingPolicy: function (mode, allData, callbackObj) {
            var ajaxConfig = {}, returnFlag = true,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: 'routingPolicyValidations'
                    },
                    {
                        key: 'termCollection',
                        type: cowc.OBJECT_TYPE_COLLECTION,
                        getValidation: 'termValidation'
                    },
                    {
                        key : ["termCollection", "from_terms"],
                        type : cowc.OBJECT_TYPE_COLLECTION_OF_COLLECTION,
                        getValidation : "fromTermValidation"
                    },
                    {
                        key : ["termCollection", "then_terms"],
                        type : cowc.OBJECT_TYPE_COLLECTION_OF_COLLECTION,
                        getValidation : "thenTermValidation"
                    },
                    //permissions
                    ctwu.getPermissionsValidation()
                ];
            if (this.isDeepValid(validations)) {
                var newRoutingPolicyData = $.extend(true, {}, this.model().attributes),
                    selectedDomain = ctwu.getGlobalVariable('domain').name,
                    selectedProject = ctwu.getGlobalVariable('project').name;

                newRoutingPolicyData["fq_name"] = [selectedDomain, selectedProject, newRoutingPolicyData.routingPolicyname];
                newRoutingPolicyData["parent_type"] = "project";

                var routingPolicyTermJSON = newRoutingPolicyData["routing_policy_entries"]["term"],
                    routinPolicyTermVal = $.extend(true, {}, routingPolicyTermJSON),
                    routingPolicyTerm = routinPolicyTermVal.toJSON(),
                    newPolicyRule = [], routingPoliceyTermLen = routingPolicyTerm.length;

                for (var i = 0; i < routingPoliceyTermLen; i++) {
                    newPolicyRule[i] = {};
                    var fromObj = routingPolicyFormatter.buildPostObjectTermFrom(routingPolicyTerm[i].from_terms());
                    var thenObj = routingPolicyFormatter.buildPostObjectTermThen(routingPolicyTerm[i].then_terms());
                    newPolicyRule[i].term_match_condition = {};
                    newPolicyRule[i].term_match_condition = fromObj;
                    newPolicyRule[i].term_action_list = {};
                    newPolicyRule[i].term_action_list = thenObj;
                    delete(routingPolicyTerm[i])
                }
                newRoutingPolicyData["routing_policy_entries"]["term"] = newPolicyRule;
                delete(newRoutingPolicyData.termCollection);

                if (mode == "add") {
                    newRoutingPolicyData["display_name"] = newRoutingPolicyData.routingPolicyname;
                } else {
                    delete(newRoutingPolicyData.parent_uuid);
                }

                //permissions
                this.updateRBACPermsAttrs(newRoutingPolicyData);

                delete(newRoutingPolicyData.errors);
                delete(newRoutingPolicyData.locks);
                delete(newRoutingPolicyData.termCollection);
                delete(newRoutingPolicyData.rawData);
                delete(newRoutingPolicyData.routingPolicyname);
                delete(newRoutingPolicyData.templateGeneratorData);
                delete(newRoutingPolicyData.elementConfigMap);
                delete(newRoutingPolicyData.cgrid);
                if ("id_perms" in newRoutingPolicyData) {
                    delete newRoutingPolicyData.id_perms;
                }
                if ("href" in newRoutingPolicyData) {
                    delete newRoutingPolicyData.href;
                }
                if ("parent_href" in newRoutingPolicyData) {
                    delete newRoutingPolicyData.parent_href;
                }
                var postData = {};
                postData["routing-policy"] = {};
                postData["routing-policy"] = newRoutingPolicyData;
                var type = "";
                var url = "";
                if (mode == "add") {
                    //create//
                    type = "POST";
                    url = "/api/tenants/config/routingpolicy";
                } else {
                    type = "PUT";
                    url = ctwc.get("/api/tenants/config/routingpolicy/{0}",
                        newRoutingPolicyData["uuid"]);
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
                    (ctwl.ROUTING_POLICY_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteRoutingPolicy: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = selectedGridData[0]["uuid"];
            var delDataID = [];
            for (var i = 0; i < selectedGridData.length; i++) {
                delDataID.push(selectedGridData[i]["uuid"]);
            }
            var sentData = [{"type": "routing-policy", "deleteIDs": delDataID}];
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
            routingPolicyValidations: {
                'routingPolicyname': {
                    required: true,
                    msg: 'Enter a valid name for Routing Policy.'
                }
            }
        }
    });
    return RoutingPolicyModel;
});
