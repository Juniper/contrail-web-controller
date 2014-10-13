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
var config      = require(process.mainModule.exports["corePath"] +
                          '/config/config.global.js');
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
 * @getPhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-routers
 * 2. Gets physical routers from config api server
 */
function getPhysicalRouters (request, response, appData)
{
    configApiServer.apiGet('/physical-routers', appData,
        function(error, data) {
            if (error) {
               commonUtils.handleJSONResponse(error, response, null);
               return;
            }            
            commonUtils.handleJSONResponse(error, response, data);
        }
    );             
}

/**
 * @getPhysicalInterfaces
 * public function
 * 1. URL /api/tenants/config/physical-interfaces/:pRouterId
 * 2. Gets physical interfaces from config api server
 */
function getPhysicalInterfaces (request, response, appData)
{
     var physicalRouterID = validateQueryParam(request, 'pRouterId');
     configApiServer.apiGet('/physical-router/' + physicalRouterID, appData,
         function(error, data) {
             getPhysicalInterfacesDetails(error, data, response, appData);
         });             
}

function getPhysicalInterfacesDetails(error, data, response, appData) 
{   
    var reqUrl            = null;
    var dataObjArr        = [];
    var i = 0, pInterfacesLength  = 0;
    
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    if(data && data['physical-router'] && data['physical-router']['physical_interfaces'] && data['physical-router']['physical_interfaces'].length > 0) {
        pInterfacesLength = data['physical-router']['physical_interfaces'].length;
        for(i = 0; i < pInterfacesLength; i++) {
            var pInterface = data['physical-router']['physical_interfaces'][i];   
            reqUrl = '/physical-interface/' + pInterface['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);        
        }
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
                function(error, results) {
                    if (error) {
                       commonUtils.handleJSONResponse(error, response, null);
                       return;
                    }
                    if(results.length > 0) {
                        var lInfDataObjArr = [];
                        for(var i = 0; i < results.length; i++) {
                            var pInterface = results[i]['physical-interface'];
                            console.log("LI-Details:",JSON.stringify(pInterface));
                            if(pInterface['logical_interfaces'] &&  pInterface['logical_interfaces'].length > 0) {
                                var lInterfaces = pInterface['logical_interfaces']
                                for(var j = 0; j <  lInterfaces.length; j++) {
                                    var lInfReqUrl = null;
                                    var lInterface = lInterfaces[j];
                                    lInfReqUrl = '/logical-interface/' + lInterface['uuid'];
                                    commonUtils.createReqObj(lInfDataObjArr, lInfReqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);
                                }

                            }
                        }
                        async.map(lInfDataObjArr,
                            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
                                function(err,lInfDetails){
                                    if (error) {
                                       commonUtils.handleJSONResponse(error, response, null);
                                       return;
                                    }
                                    //map logical interfaces to corresponding physical interface
                                    if(lInfDetails.length > 0) {
                                        for(var i = 0; i < results.length; i++) {
                                            var pInterface = results[i]['physical-interface'];
                                            pInterface['logical_interfaces'] = [];
                                            for(var j = 0; j < lInfDetails.length; j++) {
                                                var lInterface = lInfDetails[j]['logical-interface'];
                                                if(pInterface['uuid'] === lInterface['parent_uuid']) {
                                                    pInterface['logical_interfaces'].push(lInfDetails[j]);            
                                                }
                                            }                                             
                                        } 
                                    }
                                    commonUtils.handleJSONResponse(error, response, results);
                                }
                        )                        
                    } else {
                        commonUtils.handleJSONResponse(error, response, null);
                    }
                }
        )
    } else {
        commonUtils.handleJSONResponse(error, response, null);
    }
}

/**
 * @createPhysicalInterfaces
 * public function
 * 1. URL /api/tenants/config/physical-interfaces/:pRouterId/:infType
 * 2. creats  a physical interface in config api server
 */
function createPhysicalInterfaces (request, response, appData)
{
     var postData     =  request.body;
     var url = getInterfaceUrl(request, 'create');
     configApiServer.apiPost(url, postData, appData,
         function(error, data) {
            getPhysicalInterfaces(request, response, appData);
         });             
}

/**
 * @updatePhysicalInterfaces
 * public function
 * 1. URL /api/tenants/config/physical-interface/:pRouterId/:infType/:pInterfaceId
 * 2. updates a physical interface in config api server
 */
function updatePhysicalInterfaces (request, response, appData)
{
     var pInterfaceId = validateQueryParam(request,'pInterfaceId');
     var url = getInterfaceUrl(request);     
     var postData     =  request.body;
     configApiServer.apiPut(url + pInterfaceId, postData, appData,
         function(error, data) {
            getPhysicalInterfaces(request, response, appData);
         });             
} 

/**
 * @deletePhysicalInterfaces
 * public function
 * 1. URL /api/tenants/config/physical-interface/:pRouterId/:infType/:pInterfaceId
 * 2. deletes a physical interface in config api server
 */
function deletePhysicalInterfaces (request, response, appData)
{
     var pInterfaceId = validateQueryParam(request,'pInterfaceId'); 
     var url = getInterfaceUrl(request);
     var postData     =  request.body;
     configApiServer.apiDelete(url + pInterfaceId, appData,
         function(error, data) {
            getPhysicalInterfaces(request, response, appData);
         });             
} 

function validateQueryParam (request, key) 
{
    var paramValue = null;
    if (!(paramValue = request.param(key).toString())) {
        error = new appErrors.RESTServerError('Add Virtual Router id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return paramValue;
}

function getInterfaceUrl(request, operation) {
     var infUrl = '';
     var infType = validateQueryParam(request, 'infType');
     if(infType === 'Physical') {
          infUrl =  operation === 'create' ? '/physical-interfaces' : '/physical-interface/';   
     } else if(infType === 'Logical') {
          infUrl =  operation === 'create' ? '/logical-interfaces' : '/logical-interface/';        
     }
     return infUrl;
}

 /* List all public function here */
exports.getPhysicalRouters = getPhysicalRouters; 
exports.getPhysicalInterfaces = getPhysicalInterfaces;
exports.createPhysicalInterfaces = createPhysicalInterfaces;
exports.updatePhysicalInterfaces = updatePhysicalInterfaces;
exports.deletePhysicalInterfaces = deletePhysicalInterfaces; 