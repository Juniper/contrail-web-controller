/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
 /**
 * @physicalroutersconfig.api.js
 *     - Handlers for physical routers
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
 * @listPolicysCb
 * private function
 * 1. Callback for getPhysicalRouters
 * 2. Reads the response from config api server
 *    and sends it back to the client.
 */
function getPhysicalRoutersCb(error, physicalRoutersData, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, physicalRoutersData);
}

/**
 * @getPhysicalRoutersList
 * public function
 * 1. URL /api/tenants/config/physical-routers
 * 2. Gets physical routers from config api server
 */
function getPhysicalRoutersList (request, response, appData)
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
 * @getPhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-routers-details
 * 2. Gets list of physical-routers from config api server
 * 3. Calls getPhysicalRoutersCb that process data from config
 *    api server and sends back the http response.
 */
function getPhysicalRouters (request, response, appData)
{
     configApiServer.apiGet('/physical-routers', appData,
         function(error, data) {
             getPhysicalRoutersDetails(error, data, response, appData);
         });             
}

function getPhysicalRoutersDetails(error, data, response, appData) 
{
    var reqUrl            = null;
    var dataObjArr        = [];
    var i = 0, pRoutersLength  = 0;
    
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    if(data['physical-routers'] != null) {
        pRoutersLength = data['physical-routers'].length;
        for(i = 0; i < pRoutersLength; i++) {
            reqUrl = '/physical-router/' +  data['physical-routers'][i]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);        
        }
        if(dataObjArr.length > 0) {
            async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                function(error, results) {
                    if (error) {
                       commonUtils.handleJSONResponse(error, response, null);
                       return;
                    }
                    getPhysicalInterfaceDetails(error, results, response, appData);
                }
            );
        } else {
            commonUtils.handleJSONResponse(error, response, []);
        }
    } else {
        commonUtils.handleJSONResponse(error, response, []);
    }
}

/**
 * Fetch and attach the interfaces details to the response
 * @param error
 * @param pRouters
 * @param response
 * @param appData
 */
function getPhysicalInterfaceDetails(error, pRouters, response, appData){
    var pInterfacesLength = 0;
    var result = [];
    var dataObjArr        = [];
    
    for(var k = 0; k < pRouters.length; k++){
        var prouter = pRouters[k];
        if(prouter['physical-router'] != null && prouter['physical-router']['physical_interfaces'] != null && prouter['physical-router']['physical_interfaces'].length > 0){
            pInterfacesLength = prouter['physical-router']['physical_interfaces'].length;
            for(i = 0; i < pInterfacesLength; i++) {
                var pInterface = prouter['physical-router']['physical_interfaces'][i];   
                reqUrl = '/physical-interface/' + pInterface['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);        
            }
        }
    }
    if(dataObjArr.length > 0) {
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, pInterfaces) {
                if (error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;
                }
                if(pInterfaces.length > 0){
                    
                    for(var j=0 ;j < pRouters.length; j++){
                        pRouters[j]['physical-router']['physical_interfaces'] = [];
                        for(var l=0 ; l < pInterfaces.length; l++){
                            if(pRouters[j]['physical-router']['uuid'] == pInterfaces[l]['physical-interface']['parent_uuid']){
                                pRouters[j]['physical-router']['physical_interfaces'].push(pInterfaces[l]['physical-interface']);
                            }
                        }
                    }
//                    commonUtils.handleJSONResponse(error, response, pRouters);
                    getVirtualRouterDetails(error, pRouters, response, appData);
                } else {
                    getVirtualRouterDetails(error, pRouters, response, appData);
                }
            }
        );
    } else {
        getVirtualRouterDetails(error, pRouters, response, appData);
    }
}

/**
 * Fetch and attach Virtual Routers details to the response
 * @param error
 * @param pRouters
 * @param response
 * @param appData
 */
function getVirtualRouterDetails(error, pRouters, response, appData){
    var vroutersLength = 0;
    var result = [];
    var dataObjArr        = [];
    console.log('entering getVirtualRouterDetails');
    for(var k = 0; k < pRouters.length; k++){
        var prouter = pRouters[k];
        if(prouter['physical-router'] != null && prouter['physical-router']['virtual_router_refs'] != null && prouter['physical-router']['virtual_router_refs'].length > 0){
            vroutersLength = prouter['physical-router']['virtual_router_refs'].length;
            for(i = 0; i < vroutersLength; i++) {
                var vrouter = prouter['physical-router']['virtual_router_refs'][i];   
                reqUrl = '/virtual-router/' + vrouter['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);        
            }
        }
    }
    if(dataObjArr.length > 0) {
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, vrouters) {
                if (error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;
                }
                console.log(JSON.stringify(vrouters));
                if(vrouters.length > 0){
                    
                    for(var j=0 ;j < pRouters.length; j++){
                        pRouters[j]['physical-router']['virtual-routers'] = [];
                        for(var l=0 ; l < vrouters.length; l++){
                            var prouterBackRefs = vrouters[l]['virtual-router']['physical_router_back_refs'];
                            if(prouterBackRefs != null && prouterBackRefs instanceof Array && prouterBackRefs.length > 0){
                                for(var k=0; k < prouterBackRefs.length; k++){
                                    if(pRouters[j]['physical-router']['uuid'] == prouterBackRefs[k]['uuid']){
                                        console.log('adding vrouter dtails - ' + vrouters[l]['virtual-router']['name']);
                                        pRouters[j]['physical-router']['virtual-routers'].push(vrouters[l]['virtual-router']);
                                    }
                                }
                            }
                        }
                    }
                    commonUtils.handleJSONResponse(error, response, pRouters);
                }
            }
        );
    } else {
        commonUtils.handleJSONResponse(error, response, pRouters);
    }
}

/**
 * @setPRouterRead
 * private function
 * 1. Callback for Fip create / update operations
 * 2. Reads the response of Fip get from config api server
 *    and sends it back to the client.
 */
function setPRouterRead(error, fipConfig, response, appData) 
{
    var fipGetURL = '/floating-ip/';

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    fipGetURL += fipConfig['floating-ip']['uuid'];
    configApiServer.apiGet(fipGetURL, appData,
                         function(error, data) {
                         fipSendResponse(error, data, response)
                         });
}

/**
 * getPhysicalRouter
 * @param request
 * @param response
 * @param appData
 */
function getPhysicalRouter (request, response, appData)
{
    var pRouterID = validatePhysicalRouterId(request); 
    var postData     =  request.body;
    configApiServer.apiGet('/physical-router/' + pRouterID, appData,
            function(error, data) {
                if(error){
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                commonUtils.handleJSONResponse(error, response, data);
    });              
}

/**
 * @createPhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-routers/
 * 2. creats  a physical router in config api server
 */
function createPhysicalRouters (request, response, appData)
{
     var postData     =  request.body;
     //Read the virtual router type to be created
     //if embedded use the details to create a virtual router. If it fails dont create physical router as well.
     if(postData['physical-router']['virtual_router_type'] != null){
         if(postData['physical-router']['virtual_router_type'] == 'Embedded'){
             var vrouterPostData = postData['physical-router']['virtual-routers'][0];
             var isvRouterEdit = postData['physical-router']['isVirtualRouterEdit'];
             if(vrouterPostData){
                 if(isvRouterEdit) {
                   //Get the existing vRouter UUID
                     //For that issue a call get all vrouters and loop through and find the UUID for the current one.
                     configApiServer.apiGet('/virtual-routers', appData,
                             function(error, data) {
                                if(error) {
                                    commonUtils.handleJSONResponse(error, response, null);
                                    return;
                                } else {
                                    var existingvRouters = data['virtual-routers'];
                                    var vRouterUUID = null;
                                    for(var i=0; i < existingvRouters.length; i++){
                                        if(vrouterPostData['virtual-router']['name'] == existingvRouters[i]['fq_name'][1]){
                                            vRouterUUID = existingvRouters[i]['uuid'];
                                        }
                                    }
                                    //Got the UUID now set the vrouter with new data. Mostly it will be the ipaddress and type only
                                    if(vRouterUUID != null){
                                        vrouterPostData['virtual-router']['uuid'] = vRouterUUID;
                                        configApiServer.apiPut('/virtual-router/' + vRouterUUID, vrouterPostData, appData,
                                                function(error, data) {
                                                   if(error) {
                                                       commonUtils.handleJSONResponse(error, response, null);
                                                       return;
                                                   } else {
                                                       delete postData['physical-router']['virtual-routers'];
                                                       delete postData['physical-router']['virtual_router_type'];
                                                       //create physical router
                                                       configApiServer.apiPost('/physical-routers', postData, appData,
                                                               function(error, data) {
                                                                   if(error){
                                                                       commonUtils.handleJSONResponse(error, response, null);
                                                                       return;
                                                                   }
                                                                  getPhysicalRouters(request, response, appData);
                                                               });
                                                   
                                                   }
                                                });
                                    }
                                }
                             });
                 } else {
                     console.log("In else block . tyring to creat the vrouter");
                     configApiServer.apiPost('/virtual-routers', vrouterPostData, appData,
                             function(error, data) {
                                console.log("created the vrouter");
                                if(error) {
                                    commonUtils.handleJSONResponse(error, response, null);
                                    return;
                                } else {
                                    delete postData['physical-router']['virtual-routers'];
                                    delete postData['physical-router']['virtual_router_type'];
                                    console.log("creating the protuer");
                                    //create physical router
                                    configApiServer.apiPost('/physical-routers', postData, appData,
                                            function(error, data) {
                                            console.log("created prtouer");
                                                if(error){
                                                    commonUtils.handleJSONResponse(error, response, null);
                                                    return;
                                                }
                                               getPhysicalRouters(request, response, appData);
                                            });
                                }
                             });
                 }
             } else {
                 delete postData['physical-router']['virtual-routers'];
                 delete postData['physical-router']['virtual_router_type'];
                 //create physical router
                 configApiServer.apiPost('/physical-routers', postData, appData,
                         function(error, data) {
                             if(error){
                                 commonUtils.handleJSONResponse(error, response, null);
                                 return;
                             }
                            getPhysicalRouters(request, response, appData);
                         });
             }
         } 
         //If Tor Agent
         //Try to create the TOR Agent and TSN. Even if they fail go ahead and create physical router
         else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'){
             var vrouterPostData = postData['physical-router']['virtual-routers'];
             if(vrouterPostData.length > 0){
                 var reqUrl = null;
                 var dataObjArr        = [];
                 for(i = 0; i < vrouterPostData.length; i++) {
                     reqUrl = '/virtual-routers';
                     commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             vrouterPostData[i], null, null, appData);        
                 }
                 async.map(dataObjArr,
                     commonUtils.getAPIServerResponse(configApiServer.apiPost, false),
                     function(error, results) {
                         if (error) {
                            commonUtils.handleJSONResponse(error, response, null);
                            return;
                         }
                         delete postData['virtual-routers'];
                         delete postData['virtual_router_type'];
                         //create physical router
                         configApiServer.apiPost('/physical-routers', postData, appData,
                                 function(error, data) {
                                     if(error){
                                         commonUtils.handleJSONResponse(error, response, null);
                                         return;
                                     }
                                    getPhysicalRouters(request, response, appData);
                                 });
                     }
                 );
             } else {
                 delete postData['virtual-routers'];
                 delete postData['virtual_router_type'];
                 //create physical router
                 configApiServer.apiPost('/physical-routers', postData, appData,
                         function(error, data) {
                             if(error){
                                 commonUtils.handleJSONResponse(error, response, null);
                                 return;
                             }
                            getPhysicalRouters(request, response, appData);
                         });
             }
         }  
     } else {
         //create physical router
         configApiServer.apiPost('/physical-routers', postData, appData,
                 function(error, data) {
                     if(error){
                         commonUtils.handleJSONResponse(error, response, null);
                         return;
                     }
                    getPhysicalRouters(request, response, appData);
                 });
     } 
}

/**
 * @updatePhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-router/:id
 * 2. updates a physical router in config api server
 */
function updatePhysicalRouters (request, response, appData)
{
    /* var pRouterId = validatePhysicalRouterId(request); 
     var postData     =  request.body;
     configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
         function(error, data) {
             if(error){
                 commonUtils.handleJSONResponse(error, response, null);
                 return;
             }
            getPhysicalRouters(request, response, appData);
         }); 
         */
    var pRouterId = validatePhysicalRouterId(request);
    var postData     =  request.body;
    //Read the virtual router type to be created
    //if embedded use the details to create a virtual router. If it fails dont create physical router as well.
    if(postData['physical-router']['virtual_router_type'] != null){
        if(postData['physical-router']['virtual_router_type'] == 'Embedded'){
            var vrouterPostData = postData['physical-router']['virtual-routers'][0];
            var isvRouterEdit = postData['physical-router']['isVirtualRouterEdit'];
            if(vrouterPostData){
                if(isvRouterEdit){
                    //Get the existing vRouter UUID
                    //For that issue a call get all vrouters and loop through and find the UUID for the current one.
                    configApiServer.apiGet('/virtual-routers', appData,
                            function(error, data) {
                               if(error) {
                                   commonUtils.handleJSONResponse(error, response, null);
                                   return;
                               } else {
                                   var existingvRouters = data['virtual-routers'];
                                   var vRouterUUID = null;
                                   for(var i=0; i < existingvRouters.length; i++){
                                       if(vrouterPostData['virtual-router']['name'] == existingvRouters[i]['fq_name'][1]){
                                           vRouterUUID = existingvRouters[i]['uuid'];
                                       }
                                   }
                                   //Got the UUID now set the vrouter with new data. Mostly it will be the ipaddress only
                                   if(vRouterUUID != null){
                                       vrouterPostData['virtual-router']['uuid'] = vRouterUUID;
                                       configApiServer.apiPut('/virtual-router/' + vRouterUUID, vrouterPostData, appData,
                                               function(error, data) {
                                                  if(error) {
                                                      commonUtils.handleJSONResponse(error, response, null);
                                                      return;
                                                  } else {
                                                      updatePRouter(request, response, pRouterId, postData, appData);
                                                  }
                                               });
                                   }
                               }
                            });
                } else {
                    configApiServer.apiPost('/virtual-routers', vrouterPostData, appData,
                            function(error, data) {
                               if(error) {
                                   commonUtils.handleJSONResponse(error, response, null);
                                   return;
                               } else {
                                   updatePRouter(request, response, pRouterId, postData, appData);
                               }
                            });
                }
            } else {
                updatePRouter(request, response, pRouterId, postData, appData);
            }
        } 
        //If Tor Agent
        //Try to create the TOR Agent and TSN. Even if they fail go ahead and update physical router
        else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'){
            var vrouterPostData = postData['physical-router']['virtual-routers'];
            if(vrouterPostData.length > 0){
                var reqUrl = null;
                var dataObjArr        = [];
                for(i = 0; i < vrouterPostData.length; i++) {
                    reqUrl = '/virtual-routers';
                    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                            vrouterPostData[i], null, null, appData);        
                }
                async.map(dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiPost, false),
                    function(error, results) {
                        if (error) {
                           commonUtils.handleJSONResponse(error, response, null);
                           return;
                        }
                        updatePRouter(request, response, pRouterId, postData, appData);
                    }
                );
            } else {
                updatePRouter(request, response, pRouterId, postData, appData);
            }
        }  
    } else {
        //update physical router
        updatePRouter(request, response, pRouterId, postData, appData)
    } 

} 

/**
 * Common function to update the pRouter removing the unneccesary fields.
 * @param request
 * @param response
 * @param pRouterId
 * @param postData
 * @param appData
 */
function updatePRouter(request, response, pRouterId, postData, appData){
    delete postData['virtual-routers'];
    delete postData['virtual_router_type'];
    delete postData['physical-router']['isVirtualRouterEdit'];
    //update physical router
    configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
            function(error, data) {
                if(error){
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                commonUtils.handleJSONResponse(error, response, data);
            });
}

/**
 * @deletePhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-router/:id
 * 2. deletes a physical router in config api server
 */
function deletePhysicalRouters (request, response, appData)
{
     var pRouterID = validatePhysicalRouterId(request); 
     var postData     =  request.body;
     configApiServer.apiDelete('/physical-router/' + pRouterID, appData,
         function(error, data) {
             if(error){
                 commonUtils.handleJSONResponse(error, response, null);
                 return;
             }
            getPhysicalRouters(request, response, appData);
         });             
} 


function validatePhysicalRouterId (request) 
{
    var pRouterId = null;
    if (!(pRouterId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Physical Router id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return pRouterId;
}

 /* List all public function here */
 
 exports.getPhysicalRoutersList= getPhysicalRoutersList;
 exports.getPhysicalRouters    = getPhysicalRouters; 
 exports.getPhysicalRouter    = getPhysicalRouter;
 exports.createPhysicalRouters = createPhysicalRouters;
 exports.updatePhysicalRouters = updatePhysicalRouters;
 exports.deletePhysicalRouters = deletePhysicalRouters;
