/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @fwpolicyconfig.api.js
 *     - Handlers for firewall policy and rules
 *     - Interfaces with config api server
 */
var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/messages');
var global      = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/global');
var appErrors   = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/errors/app.errors');
var util        = require('util');
var url         = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var _ = require('underscore');


function createFirewallRules (request, response, appData)
{
    var fwPolicyId = commonUtils.getValueByJsonPath(request,
            'body;fwPolicyId', ''),
        rulesReqArray = commonUtils.getValueByJsonPath(request,
                'body;firewall-rules', []),
        dataObjArray = [], rulesSequenceMap = {};
        _.each(rulesReqArray, function(rule) {
            if('firewall-rule' in rule) {
                var ruleDetails = rule['firewall-rule'];
                rulesSequenceMap[ruleDetails.fq_name.join(":")] =
                    ruleDetails.sequence;
                commonUtils.createReqObj(dataObjArray, '/firewall-rules',
                        global.HTTP_REQUEST_POST,
                        commonUtils.cloneObj(rule), null, null, appData);
            }
        });
        if(dataObjArray.length === 0) {
            commonUtils.handleJSONResponse(null, response, null);
            return;
        }
        async.map(dataObjArray,
            commonUtils.getServerResponseByRestApi(configApiServer, false),
            function (error, fwRules) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            configApiServer.apiGet('/firewall-policy/' + fwPolicyId, appData,
                function(errorPolicy, policyDetails) {
                    if(errorPolicy) {
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                    var fwRuleRefs = commonUtils.getValueByJsonPath(policyDetails,
                            'firewall-policy;firewall_rule_refs', [])
                    var highestSeq = getHighestSequence(fwRuleRefs);
                    updateFirewallRuleRefs(fwPolicyId, fwRules, appData, rulesSequenceMap, highestSeq,
                            function(fwError, fwRulesRes) {
                            commonUtils.handleJSONResponse(fwError, response, fwRulesRes);
                    });
                }
            );
        });
}

function getHighestSequence(fwRuleRefs)
{
    var sequenceStr = '', squenceArry = [];
    _.each(fwRuleRefs, function(rule) {
        var sequence = commonUtils.getValueByJsonPath(rule,
                'attr;sequence', '', false);
        if(sequence){
            squenceArry.push(sequence);
        }
    });
    if(squenceArry) {
        squenceArry = squenceArry.sort(function(a,b) {return (a > b) ? 1 : ((b > a) ? -1 : 0);} );
        sequenceStr = squenceArry[squenceArry.length -1];
    } else {
        sequenceStr = '';
    }
    return sequenceStr;
}

function updateFirewallRuleRefs (fwPolicyId, fwRules, appData, rulesSequenceMap, highestSeq, callback)
{
    var dataObjArr = [];
    _.each(fwRules, function(rule, i) {
        var ruleDetails = commonUtils.getValueByJsonPath(rule, 'firewall-rule', {}, false);
        var order = rulesSequenceMap[ruleDetails['fq_name'].join(":")] ?
                rulesSequenceMap[ruleDetails['fq_name'].join(":")].toString() :
                    (highestSeq ? (highestSeq.toString() + 'aa1000') : i.toString());
        var putData = {
                'type': 'firewall-policy',
                'uuid': fwPolicyId,
                'ref-type': 'firewall-rule',
                'ref-uuid': ruleDetails['uuid'],
                'ref-fq-name': ruleDetails['fq_name'],
                'operation': 'ADD',
                'attr': {'sequence' : order}
            };
            var reqUrl = '/ref-update';
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(putData), null,
                                     null, appData);
    });
    if(dataObjArr.length === 0) {
        callback(null, null);
        return;
    }
    async.map(dataObjArr,
            commonUtils.getServerResponseByRestApi(configApiServer, false),
            function (error, fwRulesRes){
            callback(error, fwRulesRes);
    });
}

function deleteFirewallRulesAsync(dataObject, callback) {
    var appData =  dataObject.appData;
    var ruleId = dataObject.uuid;
    var request = dataObject.request;
    deleteFirewalPolicyRefs(ruleId, appData,
        function(err, ruleData) {
            if(err) {
                callback(null, {'error': err, 'data': ruleData});
                return;
            }
            configApiServer.apiDelete('/firewall-rule/' + ruleId, appData,
                    function (error, deleteRuleSuccess) {
                        callback(null, {'error': error, 'data': deleteRuleSuccess});
                    }
            );
        }
    );
}

function deleteFirewalPolicyRefs (ruleId, appData, callback)
{
    configApiServer.apiGet(/firewall-rule/ + ruleId, appData,
        function (error, ruleDetails) {
            if(error) {
                callback(error, null);
                return;
            }
            var policyBackRefs = commonUtils.getValueByJsonPath(ruleDetails,
                    'firewall-rule;firewall_policy_back_refs', []),
                    dataObjArr = [];

            _.each(policyBackRefs, function(policy) {
                var deleteRefUpDateObj = {
                        'type': 'firewall-policy',
                        'uuid': policy.uuid,
                        'ref-type': 'firewall-rule',
                        'ref-uuid': ruleId,
                        'operation': 'DELETE',
                    };
                 var reqUrl = '/ref-update';
                 commonUtils.createReqObj(dataObjArr, reqUrl,
                         global.HTTP_REQUEST_POST,
                         commonUtils.cloneObj(deleteRefUpDateObj), null,
                         null, appData);
            });
            if(policyBackRefs.length === 0) {
                callback(null, null);
                return;
            }
            async.map(dataObjArr,
                    commonUtils.getServerResponseByRestApi(configApiServer, false),
                    function (error, policyUpdatedData){
                    callback(error, policyUpdatedData);
            });
        }
    );
}

function deleteFirewallPoliciesAsync(dataObject, callback) {
    var appData =  dataObject.appData;
    var policyId = dataObject.uuid;
    var request = dataObject.request;
    configApiServer.apiGet('/firewall-policy/' + policyId, appData,
        function (errPolicy, policyDetails) {
            if(errPolicy) {
                callback(null, {'error': errPolicy, 'data': null});
                return;
            }
            var ruleDataObjArry = [], ruleIds = [],
                ruleRefs = commonUtils.getValueByJsonPath(policyDetails,
                        'firewall-policy;firewall_rule_refs', []);
            _.each(ruleRefs, function(rule) {
                var deleteRuleUrl = '/firewall-rule/' + rule.uuid;
                commonUtils.createReqObj(ruleDataObjArry, deleteRuleUrl,
                        global.HTTP_REQUEST_DEL, null, configApiServer, null, appData);
            });
            configApiServer.apiDelete('/firewall-policy/' + policyId, appData,
                function (error, data) {
                    if(error) {
                        callback(null, {'error': error, 'data': data});
                        return;
                    }
                    deleteAssociatedFirewallRules(ruleDataObjArry, appData,
                        function(rulesErr, rulesData) {
                            callback(null, {'error': rulesErr, 'data': rulesData});
                        }
                    );
                }
            );
        }
    );
}

function deleteAssociatedFirewallRules(ruleDataObjArry, appData, callback)
{
    console.log("deleteAssociatedFirewallRules", ruleDataObjArry);
    async.map(ruleDataObjArry,
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function (error, deleteRulesSuccess){
                callback(error, deleteRulesSuccess);
            }
    );
}

exports.createFirewallRules = createFirewallRules;
exports.deleteFirewallRulesAsync = deleteFirewallRulesAsync;
exports.deleteFirewallPoliciesAsync = deleteFirewallPoliciesAsync;
