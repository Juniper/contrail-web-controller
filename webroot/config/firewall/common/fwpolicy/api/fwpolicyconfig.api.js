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
var jsonDiff    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/jsondiff');

var util        = require('util');
var url         = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var _ = require('underscore');
var CREATE = 'add';
var INSERT_ABOVE = 'insert_above';
var INSERT_BELOW = 'insert_below';
var INSERT_AT_TOP = 'insert_at_top';
var INSERT_AT_END = 'insert_at_end';
var DEFAULT_SEQUENCE_TXT = '1.0';
var DEFAULT_INS_ABOVE_TXT = '0';
var DEFAULT_INS_BELOW_TXT = '1.1';
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
                            'firewall-policy;firewall_rule_refs', []);
                    var highestSeq = getHighestLeastSequence(fwRuleRefs);
                    updateFirewallRuleRefs(fwPolicyId, fwRules, appData, rulesSequenceMap, highestSeq,
                            function(fwError, fwRulesRes) {
                            commonUtils.handleJSONResponse(fwError, response, fwRulesRes);
                    });
                }
            );
        });
}


function createFirewallRule (request, response, appData)
{
    var fwPolicyId = commonUtils.getValueByJsonPath(request,
            'body;fwPolicyId', '', false),
        rulesReqObj = commonUtils.getValueByJsonPath(request,
                'body;firewall-rule', [], false),
        mode = commonUtils.getValueByJsonPath(request, 'body;mode', '', false),
        ruleSeq = commonUtils.getValueByJsonPath(rulesReqObj,
                'sequenceData', '', true);
        delete rulesReqObj.sequenceData;
        configApiServer.apiPost('/firewall-rules', {'firewall-rule':rulesReqObj},
            appData,
            function(error, fwRule) {
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
                                'firewall-policy;firewall_rule_refs', []);
                        var sequence = '';
                        if(mode === INSERT_ABOVE) {
                            if(!ruleSeq.prev) {
                                try{
                                     ruleSeq.prev = Number(ruleSeq.current) - 1.0
                                } catch(e){
                                    ruleSeq.prev = DEFAULT_INS_ABOVE_TXT;
                                }
                            }
                            sequence = getComputedSequence(mode, ruleSeq.prev, ruleSeq.current, null);
                        } else if(mode === INSERT_BELOW){
                            if(!ruleSeq.next) {
                                try{
                                     ruleSeq.next = Number(ruleSeq.current) + 1.0
                                } catch(e){
                                    ruleSeq.next = DEFAULT_INS_BELOW_TXT;
                                }
                            }
                            sequence = getComputedSequence(mode, null, ruleSeq.current, ruleSeq.next);
                        } else if(mode === INSERT_AT_TOP) {
                            var leastSeq = getHighestLeastSequence(fwRuleRefs, 'least');
                            var prevSeq;
                            try{
                                prevSeq = Number(leastSeq) - 1.0
                            } catch(e){
                                prevSeq = DEFAULT_INS_ABOVE_TXT;
                            }
                            sequence = getComputedSequence(mode, prevSeq, leastSeq, null);
                        } else if(mode === INSERT_AT_END) {
                            var highestSeq = getHighestLeastSequence(fwRuleRefs, 'highest');
                            var nextSeq;
                            try{
                                nextSeq = Number(highestSeq) + 1.0
                            } catch(e){
                                nextSeq = DEFAULT_INS_BELOW_TXT;
                            }
                            sequence = getComputedSequence(mode, null, highestSeq, nextSeq);
                        } else {
                            var highestSeq = getHighestLeastSequence(fwRuleRefs, 'highest');
                            var nextSeq;
                            try{
                                nextSeq = Number(highestSeq) + 1.0
                            } catch(e){
                                nextSeq = DEFAULT_INS_BELOW_TXT;
                            }
                            sequence = getComputedSequence(mode, null, highestSeq, nextSeq);
                        }
                        if(sequence == '') {
                            sequence = DEFAULT_SEQUENCE_TXT;
                        }
                        var fwRules = [fwRule]
                        updateFirewallRuleRefs(fwPolicyId, fwRules, appData, null, sequence,
                                function(fwError, fwRulesRes) {
                                commonUtils.handleJSONResponse(fwError, response, fwRulesRes);
                        });
                    }
                );
            }
        );
}

function getComputedSequence(mode, prev, current, next)
{
   var actSequence = '';
   if(mode === INSERT_ABOVE || mode === INSERT_AT_TOP) {
       prev = Number(prev);
       current = Number(current);
       if(isNaN(prev) || isNaN(current)) {
           return actSequence;
       }
       actSequence = (Math.random() * (current - prev) + prev);
   } else if(mode === INSERT_BELOW || mode === INSERT_AT_END || mode === CREATE) {
       if(current == '') {
           return actSequence;
       }
       current = Number(current);
       next = Number(next);
       if(isNaN(current) || isNaN(next)) {
           return actSequence;
       }
       actSequence = (Math.random() * (next - current) + current);
   }
   return actSequence;
}

function getHighestLeastSequence(fwRuleRefs, type)
{
    var sequenceStr = '', sequenceArry = [];
    _.each(fwRuleRefs, function(rule) {
        var sequence = commonUtils.getValueByJsonPath(rule,
                'attr;sequence', '', false);
        if(sequence){
            sequenceArry.push(sequence);
        }
    });
    if(sequenceArry.length > 0) {
        sequenceArry = sequenceArry.sort(
                function(a,b) {return (a > b) ? 1 : ((b > a) ? -1 : 0);} );
        if(type === 'highest') {
            sequenceStr = sequenceArry[sequenceArry.length -1];
        } else {
            sequenceStr = sequenceArry[0];
        }
    } else {
        sequenceStr = '';
    }
    return sequenceStr;
}

function updateFirewallRuleRefs (fwPolicyId, fwRules, appData, rulesSequenceMap, ruleSeq, callback)
{
    var dataObjArr = [];
    _.each(fwRules, function(rule, i) {
        var ruleDetails = commonUtils.getValueByJsonPath(rule, 'firewall-rule', {}, false);
        var order = (rulesSequenceMap && rulesSequenceMap[ruleDetails['fq_name'].join(":")]) ?
                rulesSequenceMap[ruleDetails['fq_name'].join(":")].toString() :
                    (ruleSeq ? (ruleSeq.toString()) : i.toString());
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
                        'operation': 'DELETE'
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

function updateFirewallPoliciesAsync(dataObject, callback) {
    var appData =  dataObject.appData;
    var body = dataObject.data;
    var resType = _.keys(body)[0];
    var resUUID = body['firewall-rule']['uuid'];
    var firewallPutURL ='/firewall-rule/'+ resUUID;

    jsonDiff.getConfigDiffAndMakeCall(firewallPutURL, appData, body,
            function(error, data) {
        callback(error, data);
    });
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
    async.map(ruleDataObjArry,
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function (error, deleteRulesSuccess){
                callback(error, deleteRulesSuccess);
            }
    );
}

exports.createFirewallRules = createFirewallRules;
exports.createFirewallRule = createFirewallRule;
exports.deleteFirewallRulesAsync = deleteFirewallRulesAsync;
exports.deleteFirewallPoliciesAsync = deleteFirewallPoliciesAsync;
exports.updateFirewallPoliciesAsync = updateFirewallPoliciesAsync;
