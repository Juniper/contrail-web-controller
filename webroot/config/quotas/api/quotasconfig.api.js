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
var config      = require(process.mainModule.exports["corePath"] + '/config/config.global.js');
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
                         getProjectQuotasCb(error, data, appData, callback);
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
        {key : 'access-control-lists', value : 'access_control_list'}                
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
                            }   
                        }
                    }
                    usedResCnt[resource.value] = resCntPerProj;                                             
                }
            }
        }
        if(callVNObj.length > 0) {
            getSubNetsUsedInfo(callVNObj, usedResCnt, response, function() {
                commonUtils.handleJSONResponse(err, response, usedResCnt); 
            });
        } else {
             usedResCnt['subnet'] = 0;
             commonUtils.handleJSONResponse(err, response, usedResCnt);
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
                    resCntPerProj = resCntPerProj + 1;        
                }  
            }            
        }
        usedResCnt['subnet'] = resCntPerProj;
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
