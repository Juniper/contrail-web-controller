/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermModel'
], function (_, ContrailModel, RoutingPolicyFormatter, RoutingPolicyTermModel) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyModel = ContrailModel.extend({
        defaultConfig: {
            'display_name': null,
            'routing_policy_entries': {
                'term': []
            },
            'routingPolicyname':''
        },
        formatModelConfig: function (config) {
            var modelConfig = $.extend({},true,config);
            modelConfig['rawData'] = config;
            var ruleModels = [];
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length >= 3) {
                modelConfig["routingPolicyname"] = modelConfig['fq_name'][2];
            }
            var termList = modelConfig["routing_policy_entries"]["term"];
            if(termList != null && termList.length > 0) {
                for(var i = 0; i < termList.length; i++) {
                    var rule_obj = termList[i];
                    termList[i].fromValue = "";
                    termList[i].thenValue = "";
                    var routingPolicyTermModel = new
                                        RoutingPolicyTermModel(rule_obj);
                    ruleModels.push(routingPolicyTermModel)
                }
            }
            var termCollectionModel =
                                     new Backbone.Collection(ruleModels);
            modelConfig['termCollection'] = termCollectionModel;
            modelConfig["routing_policy_entries"]["term"] =
                                                     termCollectionModel;
            return modelConfig;
        },
        validations: {
            routingPolicyValidations: {
                'routingPolicyname': {
                    required: true,
                    msg: 'Enter a valid Routing Policy Name.'
                }
            }
        },
        addRule: function() {
            var termList = this.model().attributes['termCollection'],
                newRoutingPolicyModel = new RoutingPolicyTermModel();
            termList.add([newRoutingPolicyModel]);
        },
        deleteRules: function(data, rules) {
            var termsCollection = data.model().collection,
                delTerm = rules.model();
            termsCollection.remove(delTerm);
        },
        configureRoutingPolicy: function (mode, allData, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            popupData = allData;
            if (this.model().isValid(true, "routingPolicyValidations")) {
                var newRoutingPolicyData =
                                $.extend(true,{},this.model().attributes);
                var selectedProjectUUID =
                                ctwu.getGlobalVariable('project').uuid;
                var selectedDomain = ctwu.getGlobalVariable('domain').name;
                var selectedProject = ctwu.getGlobalVariable('project').name;

                newRoutingPolicyData["fq_name"] =
                        [selectedDomain,selectedProject,
                        newRoutingPolicyData.routingPolicyname];
                newRoutingPolicyData["parent_uuid"] = selectedProjectUUID;
                newRoutingPolicyData["parent_type"] = "project";
                var routingPoliceyTermJSON =
                    newRoutingPolicyData["routing_policy_entries"]["term"];
                var routinPoliceyTermVal =
                            $.extend(true,{},routingPoliceyTermJSON);
                var routingPoliceyTerm = routinPoliceyTermVal.toJSON();
                var newPoliceyRule = [];
                routingPoliceyTermLen = routingPoliceyTerm.length;
                for (var i = 0; i < routingPoliceyTermLen; i++){
                    newPoliceyRule[i] = {};
                    var from = routingPoliceyTerm[i].fromValue();
                    if(from != "" && from.trim != "") {
                        var fromStructured =
                                routingPolicyFormatter.buildFromStructure(from);
                        if(fromStructured.error.available == false) {
                            newPoliceyRule[i].from = {};
                            delete fromStructured.error;
                            newPoliceyRule[i].from = fromStructured;
                        } else {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(this.getFormErrorText
                                     (ctwl.ROUTING_POLICY_PREFIX_ID));
                            }
                        }
                    }
                    var then = routingPoliceyTerm[i].thenValue();
                    if(then != "" && then.trim != "") {
                        var thenStructured =
                                routingPolicyFormatter.buildThenStructure(then);
                        if(thenStructured.error.available == false) {
                            newPoliceyRule[i].then = {};
                            newPoliceyRule[i].then.update = {};
                            delete thenStructured.error;
                            newPoliceyRule[i].then.update = thenStructured;
                        } else {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(this.getFormErrorText
                                     (ctwl.ROUTING_POLICY_PREFIX_ID));
                            }
                        }
                    }
                    if(routingPoliceyTerm[i].action().trim() != "" &&
                       routingPoliceyTerm[i].action().trim() != "Default") {
                        if(newPoliceyRule[i].then == undefined) {
                            newPoliceyRule[i].then = {};
                        }
                        newPoliceyRule[i].then.action =
                                routingPoliceyTerm[i].action().toLowerCase();
                    }
                    delete(routingPoliceyTerm[i])
                }
                if(routingPoliceyTermLen > 0) {
                    newRoutingPolicyData["routing_policy_entries"]["term"] =
                                                           newPoliceyRule;
                    delete(newRoutingPolicyData.termCollection);
                } else {
                    delete newRoutingPolicyData.routing_policy_entries;
                }
                if (mode=="add") {
                    newRoutingPolicyData["display_name"] =
                        newRoutingPolicyData.routingPolicyname;
                    //delete(newRoutingPolicyData.PolicyUUID);
                } else {
                    delete(newRoutingPolicyData.parent_uuid);
                }
                delete(newRoutingPolicyData.errors);
                delete(newRoutingPolicyData.locks);
                delete(newRoutingPolicyData.termCollection);
                delete(newRoutingPolicyData.rawData);
                delete(newRoutingPolicyData.routingPolicyname);
                delete(newRoutingPolicyData.templateGeneratorData);
                delete(newRoutingPolicyData.elementConfigMap);

                console.log(newRoutingPolicyData);
                var postData = {};
                postData["routing-policy"] = {};
                postData["routing-policy"] = newRoutingPolicyData;
                var type = "";
                var url = "";
                if(mode == "add") {
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
                                     (ctwl.ROUTING_POLICY_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteRoutingPolicy: function(selectedGridData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var uuid = selectedGridData[0]["uuid"];
            var delDataID = [];
            for(var i=0;i<selectedGridData.length;i++) {
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
        }
    });
    return RoutingPolicyModel;
});