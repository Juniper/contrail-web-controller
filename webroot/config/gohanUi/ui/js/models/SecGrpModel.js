/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/gohanUi/ui/js/models/secRulesModel'
], function (_, ContrailModel, SecRulesModel) {
    var SecGrpModel = ContrailModel.extend({
        defaultConfig: {
            'contrail_id': 0,
            'description': '',
            'id': '',
            'name': '',
            'tenant_id': '',
            'sgRules':[],
            'rules_entries':{"rules":[]}
        },
        formatModelConfig: function(modelConfig) {
            var ruleModels = [];
            var rulesList = modelConfig["sgRules"];
            if (rulesList != null && rulesList.length > 0) {
                for (var i = 0; i < rulesList.length; i++) {
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
                rulesCollection.remove(delRule);
        },
        gohanSecurityGroupUpdate: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var secGroupData = $.extend(true,{},this.model().attributes);
                var model = {};
                model['security_group'] = {};
                model['security_group']['description'] = secGroupData['description'];
                var type = "PUT";
                var url = './gohan_contrail/v1.0/tenant/security_groups/'+ secGroupData['id'];
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
            ajaxConfig.url = './gohan_contrail/v1.0/tenant/security_groups/'+ selectedGridData['id'];
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
        setRulesCall: function(response, callbackObj, secGrpRules){
            var id = response[Object.keys(response)[0]].id;
            var getAjaxs = [],returnFlag = false;
            for(var i = 0; i < secGrpRules.length; i++){
                var model = {};
                     model['security_group_rule'] = {};
                     var ports = secGrpRules[0].port_range().split('-');
                     var data = {direction: secGrpRules[i].direction().toLowerCase(),
                                 ethertype : secGrpRules[i].ethertype(),
                                 port_range_max : parseInt(ports[1].trim()),
                                 port_range_min : parseInt(ports[0].trim()),
                                 protocol :secGrpRules[i].protocol().toLowerCase(),
                                 remote_group_id : secGrpRules[i].remote_group_id(),
                                 remote_ip_prefix : secGrpRules[i].remote_ip_prefix()};
                     model['security_group_rule'] = data;
                     getAjaxs[i] = $.ajax({
                         url:'./gohan_contrail/v1.0/tenant/security_groups/'+id+'/security_group_rules',
                         type:'POST',
                         data: JSON.stringify(model)
                     });
               }
            $.when.apply($, getAjaxs).then(function () {
                if(arguments[1].constructor === Array){
                    var response = arguments[1][1];
                }else{
                    var response = arguments[1];
                }
                if(response === 'success'){
                     if (contrail.checkIfFunction(callbackObj.success)) {
                         callbackObj.success();
                     }
                     returnFlag = true;
                 }else{
                     if(response === undefined){
                         var error = {};
                         error.responseText = '';
                     }else{
                         var error = {};
                         error.responseText = response;
                     }
                     if (contrail.checkIfFunction(callbackObj.error)) {
                         callbackObj.error(error);
                     }
                     returnFlag = false;
                 }
            });
            //if (contrail.checkIfFunction(callbackObj.success)) {
              //  callbackObj.success();
            //}
            //return returnFlag;
        },
        addSecurityGroupCfg: function (callbackObj) {
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
                        if(secGrpRules[i].remote_group_id() == '' && secGrpRules[0].remote_ip_prefix() == ''){
                            hasPrefix = false;
                        }
                        if(secGrpRules[i].port_range() == ''){
                            hasPort = false;
                        }
                    }
                    if(hasPrefix && hasPort){
                        delete newSecGrpData.contrail_id;
                        delete newSecGrpData.GohanSecRuleDetails;
                        delete newSecGrpData.id;
                        delete newSecGrpData.tenant_id;
                        delete newSecGrpData.errors;
                        delete newSecGrpData.locks;
                        delete newSecGrpData.elementConfigMap;
                        delete newSecGrpData.rules_entries;
                        delete newSecGrpData.sgRules;
                        postData['security_group'] = newSecGrpData;
                        var model = {};
                        model['security_group_rule'] = {};
                        var ports = secGrpRules[0].port_range().split('-');
                        var data = {direction: 'egress',
                                    ethertype : 'IPv4',
                                    port_range_max : 0,
                                    port_range_min : 0,
                                    protocol :'any',
                                    remote_group_id : '',
                                    remote_ip_prefix : '2.2.2.2/24'};
                        model['security_group_rule'] = data;
                        //ajaxConfig.async = false;
                        ajaxConfig.type  = 'POST';
                        ajaxConfig.data  = JSON.stringify(model);
                        ajaxConfig.url   = './gohan_contrail/v1.0/tenant/security_groups/44c086c4-995b-4bdc-b619-acc9dc4e9ac9/security_group_rules';

                        /*ajaxConfig.async = false;
                        ajaxConfig.type  = 'POST';
                        ajaxConfig.data  = JSON.stringify(postData);
                        ajaxConfig.url   = './gohan_contrail/v1.0/tenant/security_groups';*/

                        contrail.ajaxHandler(ajaxConfig, function () {
                            if (contrail.checkIfFunction(callbackObj.init)) {
                                callbackObj.init();
                            }
                        }, function (response) {
                            if (contrail.checkIfFunction(callbackObj.success)) {
                                callbackObj.success();
                            }
                            returnFlag = true;
                            //returnFlag =  self.setRulesCall(response, callbackObj, secGrpRules);
                        }, function (error) {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(error);
                            }
                            returnFlag = false;
                        });
                    }else{
                        var error = {};
                        if(!hasPrefix && !hasPort){
                            error.responseText = 'Both of remote ip prefix and remote group id are unspecified and port range is empty.';
                        }else if(!hasPort){
                            error.responseText = 'Please enter the port range.';
                        }else if(!hasPrefix){
                            error.responseText = 'Both of remote ip prefix and remote group id are unspecified.';
                        }
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                        returnFlag = false; 
                    }
                }else{
                    delete newSecGrpData.contrail_id;
                    delete newSecGrpData.GohanSecRuleDetails;
                    delete newSecGrpData.id;
                    delete newSecGrpData.tenant_id;
                    delete newSecGrpData.errors;
                    delete newSecGrpData.locks;
                    delete newSecGrpData.elementConfigMap;
                    delete newSecGrpData.rules_entries;
                    delete newSecGrpData.sgRules;
                    postData['security_group'] = newSecGrpData;

                    ajaxConfig.async = false;
                    ajaxConfig.type  = 'POST';
                    ajaxConfig.data  = JSON.stringify(postData);
                    ajaxConfig.url   = './gohan_contrail/v1.0/tenant/security_groups';

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
    return SecGrpModel;
});


