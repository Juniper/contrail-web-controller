/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
 /**
 * @quotasconfig.api.js
 *     - Handlers for project quotas
 *     - Interfaces with config api server
 */
var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var quotasconfigapi = module.exports;
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var config      = process.mainModule.exports["config"];
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
var async = require('async'); 
/**
 * @parseProjectQuotas
 * private function
 * 1. prepares the quota object from the project response
 */
function parseProjectQuotas(error, projData, appData, callback)
{
    var quotaData =  projData["project"]["quota"];
    if(quotaData != undefined) {
         callback(error, projData);
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

/**
 * @readProjectQuotas
 * private function
 * 1. Needs project uuid in string format
 */
function readProjectQuotas (projectIdStr, appData, callback)
{
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
                             if(data["project"]["quota"] != undefined) {
                                 getProjectQuotasCb(error, data, appData, callback);
                             } else     {
                                 setProjectQuotas(projectIdStr, appData, data, callback);
                             }    
                         });
}

/**
 * @setProjectQuotas
 * private function
 * 1. Needs project uuid in string format
 */
function setProjectQuotas(projectIdStr, appData, data, callback) {
    var url = "/project/";
    url += projectIdStr ;
    data["project"]["quota"] = {
                                   "subnet": -1,
                                   "virtual_machine_interface": -1,
                                   "bgp_router": null,
                                   "instance_ip": null,
                                   "service_instance": null,
                                   "network_ipam": null,
                                   "virtual_DNS_record": null,
                                   "service_template": null,
                                   "global_vrouter_config": null,
                                   "floating_ip": -1,
                                   "virtual_router": null,
                                   "security_group_rule": -1,
                                   "access_control_list": null,
                                   "defaults": null,
                                   "security_group": -1,
                                   "virtual_network": -1,
                                   "virtual_DNS": null,
                                   "floating_ip_pool": null,
                                   "logical_router": -1
                               };
    configApiServer.apiPut(url, data, appData, function(err, data){
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        readProjectQuotas(projectIdStr, appData, callback);
    });
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
    configApiServer.apiPut(url, updateData, appData, function(err, data){
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }  
        projectQuotasAPIGet(projectId, response, appData);
    });    
}

function projectQuotasAPIGet(projectId, response, appData) {
    readProjectQuotas(projectId, appData,
                   function(err, data) {
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
    var usedResCnt = {};
    var projName = validateProjectName(request);
    var resources = [{key : 'floating-ips', value : 'floating_ip'},
        {key : 'floating-ip-pools', value : 'floating_ip_pool'},
        {key : 'network-ipams', value : 'network_ipam'},
        {key : 'security-groups', value : 'security_group'}, 
        {key : 'service-instances', value : 'service_instance'},
        {key : 'virtual-networks', value : 'virtual_network'},
        {key : 'virtual-machine-interfaces', value : 'virtual_machine_interface'},
        {key : 'access-control-lists', value : 'access_control_list'},
        {key : 'network-policys', value : 'network_policy'},
        {key : 'logical-routers', value : 'logical_router'}
    ];
    var callObj = [];
    for(var featureCnt = 0; featureCnt < resources.length; featureCnt ++) {
        var reqObj = {};
        reqObj.url = '/' + resources[featureCnt].key;
        reqObj.appData = appData;
        callObj.push(reqObj);         
    }
    async.map(callObj, processAsyncReq, function(err, data){
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        var callVNObj = [];
        var callSGObj = [];
        for(var dataCnt = 0; dataCnt < data.length ; dataCnt++) {
            for(var resCnt = 0; resCnt <  resources.length; resCnt++) {
                var resource = resources[resCnt];
                if(resource.key in data[dataCnt]) {
                    var resData =  data[dataCnt][resource.key];
                    var resCntPerProj = 0;
                    if(resData && resData.length > 0) {
                        for(var resDataCnt = 0; resDataCnt < resData.length ; resDataCnt++) {
                            if(resData[resDataCnt].fq_name[1] ===  projName) {
                               resCntPerProj ++; 
                               if(resource.key === 'virtual-networks') {
                                   var vnReqObj = {};
                                   vnReqObj.url =  '/virtual-network/' + resData[resDataCnt].uuid;
                                   vnReqObj.appData = appData; 
                                   callVNObj.push(vnReqObj);
                               }
                               if(resource.key === 'security-groups') {
                                   var sgReqObj = {};
                                   sgReqObj.url =  '/security-group/' + resData[resDataCnt].uuid;
                                   sgReqObj.appData = appData; 
                                   callSGObj.push(sgReqObj);
                               }
                            }   
                        }
                    }
                    usedResCnt[resource.value] = resCntPerProj;                                             
                }
            }
        }
        if(callVNObj.length <= 0) {
            usedResCnt['subnet'] = 0;
            if(callSGObj.length <= 0) { 
                usedResCnt['security_group_rule'] = 0;
                commonUtils.handleJSONResponse(err, response, usedResCnt); 
            } else {
                getSecurityGroupRule(callSGObj, usedResCnt, response, function(error, data) {
                    commonUtils.handleJSONResponse(error, response, usedResCnt); 
                });			
            }
        } else {
            if(callSGObj.length <= 0) { 
                usedResCnt['security_group_rule'] = 0;
                getSubNetsUsedInfo(callVNObj, usedResCnt, response, function(error, data) {
                    commonUtils.handleJSONResponse(error, response, usedResCnt);
                });
            } else {
                getSubNetsUsedInfo(callVNObj, usedResCnt, response, function(error, data) {
                    getSecurityGroupRule(callSGObj, usedResCnt, response, function(error, data) {
                        commonUtils.handleJSONResponse(error, response, usedResCnt); 
                    });	
                });	
            }
        }
    });  
}

function getSubNetsUsedInfo(callVNObj, usedResCnt, response, callback) 
{
    //prepare used info count for subnets
    async.map(callVNObj, processAsyncReq, function(err, resData) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        var resCntPerProj = 0;
        for(var resDataCnt = 0; resDataCnt < resData.length ; resDataCnt++) {
            var ipams = resData[resDataCnt]['virtual-network']['network_ipam_refs'];
            if(ipams && ipams.length > 0) {
                for(var ipamCnt = 0; ipamCnt < ipams.length; ipamCnt++) {
                    var attr = ipams[ipamCnt]['attr'];
                    var subnetsCnt =  attr['ipam_subnets'] ? attr['ipam_subnets'].length : 0;   
                    resCntPerProj = resCntPerProj + subnetsCnt;        
                }  
            }            
        }
        usedResCnt['subnet'] = resCntPerProj;
        callback();       
    });
}

function getSecurityGroupRule(sgReqObj, usedResCnt, response, callback) 
{
    //prepare used info count for subnets
    async.map(sgReqObj, processAsyncReq, function(err, resData) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        var subGrpCnt = 0;
        for(var resDataCnt = 0; resDataCnt < resData.length ; resDataCnt++) {
            var sg = resData[resDataCnt]['security-group']['security_group_entries'];
            subGrpCnt += sg['policy_rule'] ? sg['policy_rule'].length : 0;
        }
        usedResCnt['security_group_rule'] = subGrpCnt;
        callback();            
    });
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
    
 /* List all public function here */
 
 exports.getProjectQuotas = getProjectQuotas;
 exports.updateProjectQuotas = updateProjectQuotas;
 exports.getProjectQuotaUsedInfo = getProjectQuotaUsedInfo;
