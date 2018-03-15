/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @quotasconfig.api.js
 *     - Handlers for project quotas
 *     - Interfaces with config api server
 */
var _           = require('lodash');
var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var quotasconfigapi = module.exports;
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
var configUtilApi = require('../../../common/api/configUtil.api');

/**
 * @parseProjectQuotas
 * private function
 * 1. prepares the quota object from the project response
 */
function parseProjectQuotas(error, projData, appData, callback)
{
    var quotaData =  projData["project"]["quota"];
    if(quotaData != undefined) {
         var resQuota = {};
         resQuota.quota = quotaData;
         callback(error, resQuota);
    }
    else {
        callback(error, null);
    }
}

/**
 * @getProjectQuotasCb
 * private function
 * 1. Callback for getProjectQuotas
 * 2. Reads the response of a particular project from config api server
 */
function getProjectQuotasCb (error, projectGetData, appData, callback)
{
    if (error) {
       callback(error, null);
       return;
    }
    parseProjectQuotas(error, projectGetData, appData, callback);
}

function getDefaultProjectQuotas (projectData, appData, callback)
{
    var projUUID =
        commonUtils.getValueByJsonPath(projectData,
                                        'project;uuid', null);
    var projFqn =
        commonUtils.getValueByJsonPath(projectData,
                                        'project;fq_name', null);
    var defProjectFqn = ['default-domain', 'default-project'];
    var postData = {
        'appData': appData,
        'fqnReq' : {
            'fq_name': defProjectFqn,
            'type': 'project'
        }
    };
    configUtilApi.getUUIDByFQN(postData, function(error, data) {
        if ((null != error) || (null == data)) {
            getDefaultQuotas(appData, data, callback);
            return;
        }
        var uuid = data.uuid;
        var defProjGetUrl = '/project/' + uuid;
        configApiServer.apiGet(defProjGetUrl, appData, function(error, data) {
            if ((null != error) || (null == data)) {
                getDefaultQuotas(appData, data, callback);
                return;
            }
            var quotas =
                commonUtils.getValueByJsonPath(data, 'project;quota', null);
            if (null != quotas) {
                getProjectQuotasCb(null, data, appData, callback);
            } else {
                getDefaultQuotas(appData, data, callback);
            }
        });
    });
}

/**
 * @readProjectQuotas
 * private function
 * 1. Needs project uuid in string format
 */
function readProjectQuotas (userData, callback)
{
    var projectIdStr = userData['id'];
    var appData = userData['appData'];
    var quotasGetURL = '/project/';
    if (projectIdStr.length) {
        quotasGetURL += projectIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Project id');
        callback(error, null);
        return;
    }
    configApiServer.apiGet(quotasGetURL, appData,
                         function(error, data) {
                             if (error) {
                                 callback(error, null);
                                 return;
                             }
                             if(data["project"]["quota"] != undefined) {
                                 getProjectQuotasCb(error, data, appData, callback);
                             } else {
                                 getDefaultProjectQuotas(data, appData, callback);
                             }
                         }
    );
}

/**
 * @getDefaultQuotas
 * private function
 * 1. Get default quotas
 */
function getDefaultQuotas (appData, data, callback) {
    if(data === null || data === undefined || data.trim() === "") {
        data = {};
        data["project"] = {};
    }
    data["project"]["quota"] = { defaults: -1 };
    getProjectQuotasCb(null, data, appData, callback);
}

/**
 * @getProjectQuotas
 * public function
 * 1. URL /api/tenants/config/project-quotas/:id
 * 2. Gets project quotas from config api server
 * 3. Needs project id
 */
function getProjectQuotas (request, response, appData)
{
    var projectId = validateProjectId(request);
    projectQuotasAPIGet(projectId, response, appData);
}

/**
 * @updateProjectQuotas
 * public function
 * 1. URL /api/tenants/config/update-quotas/:id
 * 2. Updates project quotas in config api server
 * 3. Needs project id
 */
function updateProjectQuotas(request, response, appData)
{
    var projectId = validateProjectId(request);
    var updateData = request.body;
    var url = "/project/";
    url += projectId ;
    var putObj = {};
    putObj.project = {uuid : projectId, quota : updateData.quota};
    configApiServer.apiPut(url, putObj, appData, function(err, data){
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        commonUtils.handleJSONResponse(err, response, data);
    });
}

function projectQuotasAPIGet(projectId, response, appData) {
    var userData = {'id': projectId, 'appData': appData};
    readProjectQuotas(userData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
}

function processAsyncReq(req, callback) {
    configApiServer.apiGet(req.url, req.appData, function(err, data){
        callback(err, data);
    });
}

/**
 * @getProjectQuotaUsedInfo
 * public function
 * 1. URL /api/tenants/config/quota-used/:name
 * 2. Gets all project resources from config api server to get the count
 * 3. Needs project name
 */
function getProjectQuotaUsedInfo(request, response, appData)
{
    getProjectQuotaUsed({'request': request, appData: appData},
                        function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
}

function getProjectQuotaUsed (userObj, callback)
{
    var request = userObj['request'];
    var appData = userObj['appData'];
    var usedResCnt = {};
    var projId = validateProjectId(request);
    var resources = [{key : 'floating-ips', value : 'floating_ip'},
        {key : 'network-ipams', value : 'network_ipam'},
        {key : 'security-groups', value : 'security_group'},
        {key : 'service-instances', value : 'service_instance'},
        {key : 'virtual-networks', value : 'virtual_network'},
        {key : 'virtual-machine-interfaces', value : 'virtual_machine_interface'},
        {key : 'network-policys', value : 'network_policy'},
        {key : 'logical-routers', value : 'logical_router'},
        {key : 'loadbalancers', value : 'loadbalancer'},
        {key : 'loadbalancer-listeners', value : 'loadbalancer_listener'},
        {key : 'loadbalancer-pools', value : 'loadbalancer_pool'},
        {key : 'loadbalancer-members', value : 'loadbalancer_member'},
        {key : 'loadbalancer-healthmonitors', value : 'loadbalancer_healthmonitor'},
        {key : 'virtual-ips', value : 'virtual_ip'}
    ];
    var callObj = [];
    for(var featureCnt = 0; featureCnt < resources.length; featureCnt ++) {
        var reqObj = {};
        var filterStr = 'parent_id';
        if(resources[featureCnt].key === 'floating-ips') {
            filterStr = 'back_ref_id';
        }
        reqObj.url = '/' + resources[featureCnt].key + '?' + filterStr + '=' + projId + '&count=true';
        reqObj.appData = appData;
        callObj.push(reqObj);
    }
    async.map(callObj, processAsyncReq, function(err, data){
        if (err || data == null) {
            callback(err, null);
            return;
        }
        var dataLength = data.length;
        var resLength = resources.length;
        for(var dataCnt = 0; dataCnt < dataLength ; dataCnt++) {
            for(var i = 0; i <  resLength; i++) {
                var resource = resources[i];
                if(resource.key in data[dataCnt]) {
                    var resCnt =  data[dataCnt][resource.key].count;
                    usedResCnt[resource.value] = resCnt;
                }
            }
        }
        getSubNetsUsedInfo(projId, usedResCnt, appData, function(err, usedInfoSubnetCnt) {
            if(err) {
                callback(err, null);
                return;
            }
            getSecurityGroupRule(projId, usedInfoSubnetCnt, appData, function(err, finalUsedInfo) {
                if(err) {
                    callback(err, null);
                    return;
                }
                callback(err, finalUsedInfo);
            });
        });
    });
}

function getSubNetsUsedInfo(projId, usedResCnt, appData, callback)
{
    //prepare used info count for subnets
    var vnDetailsURL = '/virtual-networks?parent_id=' + projId
        + '&detail=true&fields=network_ipam_refs,floating_ip_pools';
    configApiServer.apiGet(vnDetailsURL, appData,
        function(err, resData) {
            var subnetCnt = 0;
            var fipPoolCnt = 0;
            if (!err) {
                resData = resData['virtual-networks'];
                if(resData != null) {
                    var resLength = resData.length;
                    for(var resDataCnt = 0; resDataCnt < resLength; resDataCnt++) {
                        var vn = resData[resDataCnt]['virtual-network'];
                        var ipams = vn['network_ipam_refs'];
                        var fipPools = vn['floating_ip_pools']
                        if(ipams) {
                            var ipamsLength = ipams.length;
                            for(var ipamCnt = 0; ipamCnt < ipamsLength; ipamCnt++) {
                                var attr = ipams[ipamCnt]['attr'];
                                var subnetsCnt =  attr['ipam_subnets'] ? attr['ipam_subnets'].length : 0;
                                subnetCnt = subnetCnt + subnetsCnt;
                            }
                        }
                        if(fipPools && fipPools.length > 0) {
                            fipPoolCnt = fipPoolCnt +  fipPools.length;
                        }
                    }
                }
            }
            usedResCnt['subnet'] = subnetCnt;
            usedResCnt['floating_ip_pool'] = fipPoolCnt;
            callback(err, usedResCnt);
        }
    );
}

function getSecurityGroupRule(projId, usedResCnt, appData, callback)
{
    //prepare used info count for security group rules
    var sgDetailsURL = '/security-groups?parent_id=' + projId + '&detail=true&fields=security_group_entries';
    configApiServer.apiGet(sgDetailsURL, appData,
        function(err, resData) {
            if (!err) {
                var subGrpCnt = 0;
                resData = resData['security-groups'];
                if(resData != null) {
                    var resLength = resData.length;
                    for(var resDataCnt = 0; resDataCnt < resLength; resDataCnt++) {
                        var sgPolRules =
                            _.result(resData, resDataCnt +
                                     ".security-group.security_group_entries.policy_rule",
                                     []);
                        subGrpCnt += sgPolRules.length;
                    }
                }
                usedResCnt['security_group_rule'] = subGrpCnt;
            }
            callback(err, usedResCnt);
        }
    );
}

function validateProjectId (request)
{
    var projectId = null;
    if (!(projectId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Project id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return projectId;
}

function validateProjectName (request)
{
    var projectName = null;
    if (!(projectName = request.param('name').toString())) {
        error = new appErrors.RESTServerError('Add Project Name');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return projectName;
}

function getProjectQuotasInfoAsync (userObj, callback)
{
    if ('get-quotas' == userObj['type']) {
        readProjectQuotas(userObj, callback);
    } else {
        getProjectQuotaUsed(userObj, callback);
    }
}

function getProjectQuotasInfo (req, res, appData)
{
    var resultJSON = [];
    var projId = req.param('id');
    console.log("getting projId aS:", projId);
    var userObj = [];
    userObj[0] = {};
    userObj[1] = {};

    userObj[0]['id'] = projId;
    userObj[0]['appData'] = appData;
    userObj[0]['type'] = 'get-quotas';
    userObj[1]['appData'] = appData;
    userObj[1]['request'] = req;
    userObj[1]['type'] = 'get-quotas-used';
    async.map(userObj, getProjectQuotasInfoAsync, function(err, data) {
        resultJSON[0] = {};
        resultJSON[1] = {};
        if ((null == err) && (null != data)) {
            resultJSON[0] = data[0];
            resultJSON[1] = {};
            resultJSON[1]['used'] = data[1];
        }
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

 /* List all public function here */

 exports.getProjectQuotas = getProjectQuotas;
 exports.updateProjectQuotas = updateProjectQuotas;
 exports.getProjectQuotaUsedInfo = getProjectQuotaUsedInfo;
 exports.getProjectQuotasInfo = getProjectQuotasInfo;

