/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @securitypolicyconfig.api.js - Handlers for secuitry policy changes -
 *                              Interfaces with config api server
 */
var rest = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/errors/app.errors');
var global = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/common/global');

var util = require('util');
var url = require('url');
var configApiServer = require(process.mainModule.exports["corePath"]
        + '/src/serverroot/common/configServer.api');
var _ = require('underscore');

var jsonPath = require('JSONPath').eval;
var path = require('path');

var configUtils = require('../../../../common/api/configUtil.api');

var jsdiffpatch = require('diff');

var DRAFT_STATE_CREATED = 'created';
var DRAFT_STATE_UPDATED = 'updated';
var DRAFT_STATE_DELETED = 'deleted';


function modifySecurityPolicyDraft(request, response, appData) {
    logutils.logger.debug('modifySecurityPolicyDraft');
    var postData = request.body;

    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }
    var modifyPolicyDraftURL = '/security-policy-draft';
    if ((!('scope_uuid' in postData))) {
        error = new appErrors.RESTServerError(
                'Policy draft scope UUID is missing');
        callback(error, null);
        return;
    }
    if ((!('action' in postData))) {
        error = new appErrors.RESTServerError('Policy draft action missing ');
        callback(error, null);
        return;
    }
    logutils.logger.debug('modifySecurityPolicyDraft');
    configApiServer.apiPost(modifyPolicyDraftURL, postData,
            appData, function(error, results) {
                logutils.logger.debug('error:' + JSON.stringify(error));
                if (error) {
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
               // logutils.logger.debug('response:' + JSON.stringify(results));
                commonUtils.handleJSONResponse(error, response, results);
            });
}

function getDraftsReviewInJSONDiff(request, response, appData) {
    var reviewDiff = {};
    reviewDiff.aps_reviews = [];
    reviewDiff.fwp_reviews = [];
    reviewDiff.fwr_reviews = [];
    reviewDiff.sg_reviews = [];
    reviewDiff.ag_reviews = [];

    if (!(parent_fq_name_str = request.param('parent_fq_name_str').toString())) {
        error = new appErrors.RESTServerError('parent_fq_name_str is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    reviewDiff.parent_fq_name_str = request.param('parent_fq_name_str');
    reviewDiff.scope = request.param('scope');
    reviewDiff.domain = request.param('domain');
    reviewDiff.project = request.param('project');
    getConfigDraftsReviewsCB(reviewDiff, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        //logutils.logger.debug('getDraftsReviewInJSONDiff' + JSON.stringify(results));
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function getConfigDraftsReviewsCB(reviewDiff, appData, callback) {
    var parent_fq_name = commonUtils.getValueByJsonPath(reviewDiff, 'parent_fq_name_str', '', false);
    var postData = {
        data : [ {
            type : 'application-policy-sets',
            parent_type : "policy-management",
            parent_fq_name_str : parent_fq_name
        }, {
            type : 'firewall-policys',
            fields : [ 'application_policy_set_back_refs' ],
            parent_type : "policy-management",
            parent_fq_name_str : parent_fq_name
        }, {
            type : 'firewall-rules',
            fields : "firewall_policy_back_refs",
            parent_type : "policy-management",
            parent_fq_name_str : parent_fq_name
        }, {
            type : 'service-groups',
            parent_type : "policy-management",
            parent_fq_name_str : parent_fq_name
        }, {
            type : 'address-groups',
            parent_type : "policy-management",
            parent_fq_name_str : parent_fq_name
        } ]
    };
    configUtils.getConfigAsync(postData, true, appData,
            function(error, results) {
                if (error) {
                    callback(error, null);
                    return;
                }
                var application_policy_sets = commonUtils.getValueByJsonPath(
                        results, '0;application-policy-sets', [], false);
                var firewall_policys = commonUtils.getValueByJsonPath(results,
                        '1;firewall-policys', [], false);
                var firewall_rules = commonUtils.getValueByJsonPath(results,
                        '2;firewall-rules', [], false);
                var service_groups = commonUtils.getValueByJsonPath(results,
                        '3;service-groups', [], false);
                var address_groups = commonUtils.getValueByJsonPath(results,
                        '4;address-groups', [], false);
                async.waterfall([
                        async.apply(getApplicationPolicySetsDiff,
                                application_policy_sets, appData, reviewDiff),
                        async.apply(getFirewallPoliciesDiff, firewall_policys,
                                appData),
                        async.apply(getFirewallRulesDiff, firewall_rules, appData),
                        async.apply(getServiceGroupsDiff, service_groups, appData),
                        async.apply(getAddressGroupDiff, address_groups, appData)
                                ],
                 function(error, reviewDiff) {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    callback(null, reviewDiff);
                });
            });
}

function getApplicationPolicySetsDiff(draftAps, appData, reviewDiff, callback) {
    if (draftAps.length < 1) {
        callback(null, reviewDiff);
        return
    }
    var updateAps=[];
    var data=[];
    _.each(draftAps, function(aps) {
        var draftAps = JSON.stringify(aps, null, 2); //draft
        var policyName = commonUtils.getValueByJsonPath( aps, 'application-policy-set;name', '', false);
        var uuid = commonUtils.getValueByJsonPath( aps, 'application-policy-set;uuid', '', false);
        //console.log(draftAps);
        var commitAps = {}; //committed
        var draft_mode_state = commonUtils.getValueByJsonPath( aps, 'application-policy-set;draft_mode_state', '', false);
        if (draft_mode_state === DRAFT_STATE_UPDATED || draft_mode_state === DRAFT_STATE_DELETED){
            updateAps.push(aps);
            var scope = commonUtils.getValueByJsonPath( reviewDiff, 'scope', '', false);
            if(scope === "global"){
                var fqName=[];
                fqName.push('default-policy-management');
                fqName.push(policyName);
                data.push(fqName);
            }else{
                var fqName=[];
                fqName.push(reviewDiff.domain);
                fqName.push(reviewDiff.project);
                fqName.push(policyName);
                data.push(fqName);
            }
        }else{
            var deltaAps = jsdiffpatch.diffJson(commitAps, draftAps);
            var review = {};
            review.name = policyName;
            review.uuid = uuid;
            review.draft_state = draft_mode_state;
            review.delta = deltaAps;
            reviewDiff.aps_reviews.push(review);
        }
    });
    var postData = {
            type : 'application-policy-sets',
            fq_names:data};
    getConfigCommitedReviewsCB(postData, appData, function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var application_policy_sets = commonUtils.getValueByJsonPath(
                results, '0;application-policy-sets', [], false);
        _.each(application_policy_sets, function(aps) {
            var policyName = commonUtils.getValueByJsonPath( aps, 'application-policy-set;name', '', false);
            var uuid = commonUtils.getValueByJsonPath( aps, 'application-policy-set;uuid', '', false);
            var commitAps = JSON.stringify(aps, null, 2);;
            _.each(updateAps, function(uAps) {
                var uPolicyName = commonUtils.getValueByJsonPath( uAps, 'application-policy-set;name', '', false);
                var draft_mode_state = commonUtils.getValueByJsonPath( uAps, 'application-policy-set;draft_mode_state', '', false);
                var deltaAps;
                if(policyName === uPolicyName){
                    draftAps=JSON.stringify(uAps, null, 2);
                    if (draft_mode_state === DRAFT_STATE_DELETED){
                        draftAps={};
                        deltaAps = jsdiffpatch.diffJson(commitAps, draftAps);
                    }else if (draft_mode_state === DRAFT_STATE_UPDATED){
                        deltaAps = jsdiffpatch.diffJson(commitAps, draftAps);
                    }
                    var review = {};
                    review.name = policyName;
                    review.uuid = uuid;
                    review.draft_state = draft_mode_state;
                    review.delta = deltaAps;
                    reviewDiff.aps_reviews.push(review);
                }
            });
        });
      logutils.logger.debug('getDraftsReviewInJSONDiff');
        callback(null, reviewDiff);
        return
    });
}
function getFirewallPoliciesDiff(draftFps, appData, reviewDiff, callback) {
    if (draftFps.length < 1) {
        callback(null, reviewDiff);
        return;
    }
    var updateFps=[];
    var data=[];
    _.each(draftFps, function(fps) {
        var draftFps = JSON.stringify(fps, null, 2); //draft
        var policyName = commonUtils.getValueByJsonPath( fps, 'firewall-policy;name', '', false);
        var uuid = commonUtils.getValueByJsonPath( fps, 'firewall-policy;uuid', '', false);
        var commitFps = {}; //committed
        var draft_mode_state = commonUtils.getValueByJsonPath( fps, 'firewall-policy;draft_mode_state', '', false);
        if (draft_mode_state === DRAFT_STATE_UPDATED || draft_mode_state === DRAFT_STATE_DELETED){
            updateFps.push(fps);
            var scope = commonUtils.getValueByJsonPath( reviewDiff, 'scope', '', false);
            if(scope === "global"){
                var fqName=[];
                fqName.push('default-policy-management');
                fqName.push(policyName);
                data.push(fqName);
            }else{
                var fqName=[];
                fqName.push(reviewDiff.domain);
                fqName.push(reviewDiff.project);
                fqName.push(policyName);
                data.push(fqName);
            }
        }else{
            var deltaFps = jsdiffpatch.diffJson(commitFps, draftFps);
            var review = {};
            review.name = policyName;
            review.uuid = uuid;
            review.draft_state = draft_mode_state;
            review.delta = deltaFps;
            reviewDiff.fwp_reviews.push(review);
        }
    });
    var postData = {
            type : 'firewall-policys',
            fq_names:data};
    getConfigCommitedReviewsCB(postData, appData, function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var firewall_policys = commonUtils.getValueByJsonPath(
                results, '0;firewall-policys', [], false);
        _.each(firewall_policys, function(fps) {
            var policyName = commonUtils.getValueByJsonPath( fps, 'firewall-policy;name', '', false);
            var uuid = commonUtils.getValueByJsonPath( fps, 'firewall-policy;uuid', '', false);
            var commitFps = JSON.stringify(fps, null, 2);;
            _.each(updateFps, function(uFps) {
                var uPolicyName = commonUtils.getValueByJsonPath( uFps, 'firewall-policy;name', '', false);
                var draft_mode_state = commonUtils.getValueByJsonPath( uFps, 'firewall-policy;draft_mode_state', '', false);
                var deltaFps;
                if(policyName === uPolicyName){
                    draftFps=JSON.stringify(uFps, null, 2);
                    if (draft_mode_state === DRAFT_STATE_DELETED){
                        draftFps={};
                        deltaFps = jsdiffpatch.diffJson(commitFps, draftFps);
                    }else if (draft_mode_state === DRAFT_STATE_UPDATED){
                        deltaFps = jsdiffpatch.diffJson(commitFps, draftFps);
                    }
                    var review = {};
                    review.name = policyName;
                    review.uuid = uuid;
                    review.draft_state = draft_mode_state;
                    review.delta = deltaFps;
                    reviewDiff.fwp_reviews.push(review);
                }
            });
        });
      // logutils.logger.debug('getDraftsReviewInJSONDiff' + JSON.stringify(results));
        callback(null, reviewDiff);
        return
    });
}
function getFirewallRulesDiff(draftFrs, appData, reviewDiff, callback) {
    if (draftFrs.length < 1) {
        callback(null, reviewDiff);
        return;
    }
        var updateFrs=[];
        var data=[];
        _.each(draftFrs, function(frs) {
            var draftFrs = JSON.stringify(frs, null, 2); //draft
            var policyName = commonUtils.getValueByJsonPath( frs, 'firewall-rule;name', '', false);
            var uuid = commonUtils.getValueByJsonPath( frs, 'firewall-rule;uuid', '', false);
            var commitFrs = {}; //committed
            var draft_mode_state = commonUtils.getValueByJsonPath( frs, 'firewall-rule;draft_mode_state', '', false);
            if (draft_mode_state === DRAFT_STATE_UPDATED || draft_mode_state === DRAFT_STATE_DELETED){
                updateFrs.push(frs);
                var scope = commonUtils.getValueByJsonPath( reviewDiff, 'scope', '', false);
                if(scope === "global"){
                    var fqName=[];
                    fqName.push('default-policy-management');
                    fqName.push(policyName);
                    data.push(fqName);
                }else{
                    var fqName=[];
                    fqName.push(reviewDiff.domain);
                    fqName.push(reviewDiff.project);
                    fqName.push(policyName);
                    data.push(fqName);
                }

            }else{
                var deltaFrs = jsdiffpatch.diffJson(commitFrs, draftFrs);
                var review = {};
                review.name = policyName;
                review.uuid = uuid;
                review.draft_state = draft_mode_state;
                review.delta = deltaFrs;
                reviewDiff.fwr_reviews.push(review);
            }
        });
        var postData = {
                type : 'firewall-rules',
                fq_names:data};
        getConfigCommitedReviewsCB(postData, appData, function(error, results) {
            if (error) {
                callback(error, null);
                return;
            }
            var firewall_rules = commonUtils.getValueByJsonPath(
                    results, '0;firewall-rules', [], false);
            _.each(firewall_rules, function(fwr) {
                var policyName = commonUtils.getValueByJsonPath( fwr, 'firewall-rule;name', '', false);
                var uuid = commonUtils.getValueByJsonPath( fwr, 'firewall-rule;uuid', '', false);
                var commitFrs = JSON.stringify(fwr, null, 2);
                _.each(updateFrs, function(uFrs) {
                    var uPolicyName = commonUtils.getValueByJsonPath( uFrs, 'firewall-rule;name', '', false);
                    var draft_mode_state = commonUtils.getValueByJsonPath( uFrs, 'firewall-rule;draft_mode_state', '', false);
                    var deltaFrs;
                    if(policyName === uPolicyName){
                       draftAps=JSON.stringify(uFrs, null, 2);;
                        if (draft_mode_state === DRAFT_STATE_DELETED){
                            draftFrs={};
                            deltaFrs = jsdiffpatch.diffJson(commitFrs, draftFrs);
                        }else if (draft_mode_state === DRAFT_STATE_UPDATED){
                            deltaFrs = jsdiffpatch.diffJson(commitFrs, draftFrs);
                        }
                        var review = {};
                        review.name = policyName;
                        review.uuid = uuid;
                        review.draft_state = draft_mode_state;
                        review.delta = deltaFrs;
                        reviewDiff.fwr_reviews.push(review);
                    }
                });
            });
          // logutils.logger.debug('getDraftsReviewInJSONDiff' + JSON.stringify(results));
            callback(null, reviewDiff);
            return
        });
}
function getServiceGroupsDiff(draftSgs, appData, reviewDiff, callback) {
    if (draftSgs.length < 1) {
        callback(null, reviewDiff);
        return;
    }
    var updateSgs=[];
    var data=[];
    _.each(draftSgs, function(sgs) {
        var draftSgs = JSON.stringify(sgs, null, 2); //draft
        var policyName = commonUtils.getValueByJsonPath(sgs, 'service-group;name', '', false);
        var uuid = commonUtils.getValueByJsonPath(sgs, 'service-group;uuid', '', false);
        var commitSgs = {}; //committed
        var draft_mode_state = commonUtils.getValueByJsonPath( sgs, 'service-group;draft_mode_state', '', false);
        if (draft_mode_state === DRAFT_STATE_UPDATED || draft_mode_state === DRAFT_STATE_DELETED){
            updateSgs.push(sgs);
            var scope = commonUtils.getValueByJsonPath( reviewDiff, 'scope', '', false);
            if(scope === "global"){
                var fqName=[];
                fqName.push('default-policy-management');
                fqName.push(policyName);
                data.push(fqName);
            }else{
                var fqName=[];
                fqName.push(reviewDiff.domain);
                fqName.push(reviewDiff.project);
                fqName.push(policyName);
                data.push(fqName);
            }
        }else {
            var deltaSg = jsdiffpatch.diffJson(commitSgs, draftSgs);
            var review = {};
            review.name = policyName;
            review.uuid = uuid;
            review.draft_state = draft_mode_state;
            review.delta = deltaSg;
            reviewDiff.sg_reviews.push(review);
        }
    });
    var postData = {
            type : 'service-groups',
            fq_names:data};
    getConfigCommitedReviewsCB(postData, appData, function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var service_groups = commonUtils.getValueByJsonPath(
                results, '0;service-groups', [], false);
        _.each(service_groups, function(sg) {
            var policyName = commonUtils.getValueByJsonPath( sg, 'service-group;name', '', false);
            var uuid = commonUtils.getValueByJsonPath( sg, 'service-group;uuid', '', false);
            var commitSg = JSON.stringify(sg, null, 2);;
            _.each(updateSgs, function(uSg) {
                var uPolicyName = commonUtils.getValueByJsonPath( uSg, 'service-group;name', '', false);
                var draft_mode_state = commonUtils.getValueByJsonPath( uSg, 'service-group;draft_mode_state', '', false);
                var deltaSg;
                if(policyName === uPolicyName){
                    draftSg=JSON.stringify(uSg, null, 2);;
                    if (draft_mode_state === DRAFT_STATE_DELETED){
                        draftSg={};
                        deltaSg = jsdiffpatch.diffJson(commitSg, draftSg);
                    }else if (draft_mode_state === DRAFT_STATE_UPDATED){
                        deltaSg = jsdiffpatch.diffJson(commitSg, draftSg);
                    }
                    var review = {};
                    review.name = policyName;
                    review.uuid = uuid;
                    review.draft_state = draft_mode_state;
                    review.delta = deltaSg;
                    reviewDiff.sg_reviews.push(review);
                }
            });
        });
      // logutils.logger.debug('getDraftsReviewInJSONDiff' + JSON.stringify(results));
        callback(null, reviewDiff);
        return
    });
}
function getAddressGroupDiff(draftAgs, appData, reviewDiff, callback) {
    logutils.logger.debug("getAddressGroupDiff");
    if (draftAgs.length < 1) {
        callback(null, reviewDiff);
        return
    }
        var updateAgs=[];
        var data=[];
        _.each(draftAgs, function(ags) {
            var draftAgs = JSON.stringify(ags, null, 2); //draft
            var policyName = commonUtils.getValueByJsonPath(ags, 'address-group;name', '', false);
            var uuid = commonUtils.getValueByJsonPath(ags, 'address-group;uuid', '', false);
            var commitAgs = {}; //committed
            var draft_mode_state = commonUtils.getValueByJsonPath( ags, 'address-group;draft_mode_state', '', false);
            if (draft_mode_state === DRAFT_STATE_UPDATED || draft_mode_state === DRAFT_STATE_DELETED){
                updateAgs.push(ags);
                var scope = commonUtils.getValueByJsonPath( reviewDiff, 'scope', '', false);
                if(scope === "global"){
                    var fqName=[];
                    fqName.push('default-policy-management');
                    fqName.push(policyName);
                    data.push(fqName);
                }else{
                    var fqName=[];
                    fqName.push(reviewDiff.domain);
                    fqName.push(reviewDiff.project);
                    fqName.push(policyName);
                    data.push(fqName);
                }
            }else {
              var deltaAg = jsdiffpatch.diffJson(commitAgs, draftAgs);
              var review = {};
              review.name = policyName;
              review.uuid = uuid;
              review.draft_state = draft_mode_state;
              review.delta = deltaAg;
              reviewDiff.ag_reviews.push(review);
            }
        });
        var postData = {
                type : 'address-groups',
                fq_names:data};
        getConfigCommitedReviewsCB(postData, appData, function(error, results) {
            if (error) {
                callback(error, null);
                return;
            }
            var application_policy_sets = commonUtils.getValueByJsonPath(
                    results, '0;address-groups', [], false);
            _.each(application_policy_sets, function(ag) {
                var policyName = commonUtils.getValueByJsonPath( ag, 'address-group;name', '', false);
                var uuid = commonUtils.getValueByJsonPath( ag, 'address-group;uuid', '', false);
                var commitAg = JSON.stringify(ag, null, 2);;
                _.each(updateAgs, function(uAg) {
                    var uPolicyName = commonUtils.getValueByJsonPath( uAg, 'address-group;name', '', false);
                    var draft_mode_state = commonUtils.getValueByJsonPath( uAg, 'address-group;draft_mode_state', '', false);
                    var deltaAg;
                    if(policyName === uPolicyName){
                        draftAg=JSON.stringify(uAg, null, 2);;
                        if (draft_mode_state === DRAFT_STATE_DELETED){
                            draftAg={};
                            deltaAg = jsdiffpatch.diffJson(commitAg, draftAg);
                        }else if (draft_mode_state === DRAFT_STATE_UPDATED){
                            deltaAg = jsdiffpatch.diffJson(commitAg, draftAg);
                        }
                        var review = {};
                        review.name = policyName;
                        review.uuid = uuid;
                        review.draft_state = draft_mode_state;
                        review.delta = deltaAg;
                        reviewDiff.ag_reviews.push(review);
                    }
                });
            });
          // logutils.logger.debug('getDraftsReviewInJSONDiff' + JSON.stringify(results));
            callback(null, reviewDiff);
            return
        });
}

function getConfigCommitedReviewsCB(fq_names, appData, callback) {
    var postData = {
        data : [fq_names]
    };
    configUtils.getConfigAsync(postData, true, appData,
            function(error, results) {
                if (error) {
                    callback(error, null);
                    return;
                }
                logutils.logger.debug('getConfigCommitedReviewsCB');
                callback(null, results);
    });
}

exports.modifySecurityPolicyDraft = modifySecurityPolicyDraft;
exports.getDraftsReviewInJSONDiff = getDraftsReviewInJSONDiff;
