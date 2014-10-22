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
    pRoutersLength = data['physical-routers'].length;
    for(i = 0; i < pRoutersLength; i++) {
        reqUrl = '/physical-router/' +  data['physical-routers'][i]['uuid'];
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
            getPhysicalInterfaceDetails(error, results, response, appData);
        }
    );
}

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
                commonUtils.handleJSONResponse(error, response, pRouters);
            }
        }
    );
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
 * @createPhysicalRouter
 * public function
 * 1. URL /api/tenants/config/physical-routers - Post
 */
/**
 * @createPhysicalRouters
 * public function
 * 1. URL /api/tenants/config/physical-routers/
 * 2. creats  a physical router in config api server
 */
function createPhysicalRouters (request, response, appData)
{
     var postData     =  request.body;
     console.log('postData : ' + JSON.stringify(postData));
     console.log('type' + postData['physical-router']['virtual_router_type']);
     console.log('virtualrouters' + JSON.stringify(postData['physical-router']['virtual-routers']));
     //Read the virtual router type to be created
     //if embedded use the details to create a virtual router. If it fails dont create physical router as well.
     if(postData['physical-router']['virtual_router_type'] != null){
         if(postData['physical-router']['virtual_router_type'] == 'Embedded'){
             var vrouterPostData = postData['physical-router']['virtual-routers'][0];
             console.log("vrouter post data :"+ JSON.stringify(vrouterPostData));
             if(vrouterPostData){
                 configApiServer.apiPost('/virtual-routers', vrouterPostData, appData,
                         function(error, data) {
                            console.log('response for vrouters create');
                            if(error) {
                                console.log('error creating vrouter');
                                commonUtils.handleJSONResponse(error, response, null);
                                return;
                            } else {
                                delete postData['physical-router']['virtual-routers'];
                                delete postData['physical-router']['virtual_router_type'];
                                //create physical router
                                console.log('creating prouter');
                                configApiServer.apiPost('/physical-routers', postData, appData,
                                        function(error, data) {
                                            if(error){
                                                console.log('error creating prtouer');
                                                commonUtils.handleJSONResponse(error, response, null);
                                                return;
                                            }
                                            console.log('created prouter');
                                           getPhysicalRouters(request, response, appData);
                                        });
                            }
                         });
             } else {
                 delete postData['physical-router']['virtual-routers'];
                 delete postData['physical-router']['virtual_router_type'];
                 //create physical router
                 console.log('creating prouter');
                 configApiServer.apiPost('/physical-routers', postData, appData,
                         function(error, data) {
                             if(error){
                                 console.log('error creating prtouer');
                                 commonUtils.handleJSONResponse(error, response, null);
                                 return;
                             }
                             console.log('created prouter');
                            getPhysicalRouters(request, response, appData);
                         });
             }
         } 
         //If Tor Agent
         //Try to create the TOR Agent and TSN. Even if they fail go ahead and create physical router
         else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'){
             var vrouterPostData = postData['physical-router']['virtual-routers'];
             if(vrouterPostData.length > 0){
                 console.log('trying to create tor agent');
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
                            console.log('error creating vrouters');
                            commonUtils.handleJSONResponse(error, response, null);
                            return;
                         }
                         console.log('creating prouter');
                         delete postData['virtual-routers'];
                         delete postData['virtual_router_type'];
                         //create physical router
                         configApiServer.apiPost('/physical-routers', postData, appData,
                                 function(error, data) {
                                     if(error){
                                         console.log('error creating prouter');
                                         console.log(error);
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
                                 console.log('error creating prouter');
                                 console.log(error);
                                 commonUtils.handleJSONResponse(error, response, null);
                                 return;
                             }
                            getPhysicalRouters(request, response, appData);
                         });
             }
         }  
     } else {
         //create physical router
         console.log('no vrouters just creating the prouter');
         configApiServer.apiPost('/physical-routers', postData, appData,
                 function(error, data) {
                     if(error){
                         console.log('error creating prouter');
                         console.log(error);
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
    console.log('postData : ' + JSON.stringify(postData));
    console.log('type' + postData['physical-router']['virtual_router_type']);
    console.log('virtualrouters' + JSON.stringify(postData['physical-router']['virtual-routers']));
    //Read the virtual router type to be created
    //if embedded use the details to create a virtual router. If it fails dont create physical router as well.
    if(postData['physical-router']['virtual_router_type'] != null){
        if(postData['physical-router']['virtual_router_type'] == 'Embedded'){
            var vrouterPostData = postData['physical-router']['virtual-routers'][0];
            console.log("vrouter post data :"+ JSON.stringify(vrouterPostData));
            if(vrouterPostData){
                configApiServer.apiPost('/virtual-routers', vrouterPostData, appData,
                        function(error, data) {
                           console.log('response for vrouters create');
                           if(error) {
                               console.log('error creating vrouter');
                               commonUtils.handleJSONResponse(error, response, null);
                               return;
                           } else {
                               delete postData['physical-router']['virtual-routers'];
                               delete postData['physical-router']['virtual_router_type'];
                               //create physical router
                               console.log('creating prouter');
                               configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
                                       function(error, data) {
                                           if(error){
                                               console.log('error creating prtouer');
                                               commonUtils.handleJSONResponse(error, response, null);
                                               return;
                                           }
                                           console.log('created prouter');
                                          getPhysicalRouters(request, response, appData);
                                       });
                           }
                        });
            } else {
                delete postData['physical-router']['virtual-routers'];
                delete postData['physical-router']['virtual_router_type'];
                //create physical router
                console.log('creating prouter');
                configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
                        function(error, data) {
                            if(error){
                                console.log('error updating prtouer');
                                commonUtils.handleJSONResponse(error, response, null);
                                return;
                            }
                            console.log('created prouter');
                           getPhysicalRouters(request, response, appData);
                        });
            }
        } 
        //If Tor Agent
        //Try to create the TOR Agent and TSN. Even if they fail go ahead and create physical router
        else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'){
            var vrouterPostData = postData['physical-router']['virtual-routers'];
            if(vrouterPostData.length > 0){
                console.log('trying to create tor agent');
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
                           console.log('error creating vrouters');
                           commonUtils.handleJSONResponse(error, response, null);
                           return;
                        }
                        console.log('creating prouter');
                        delete postData['virtual-routers'];
                        delete postData['virtual_router_type'];
                        //create physical router
                        configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
                                function(error, data) {
                                    if(error){
                                        console.log('error updating prouter');
                                        console.log(error);
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
                configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
                        function(error, data) {
                            if(error){
                                console.log('error updating prouter');
                                console.log(error);
                                commonUtils.handleJSONResponse(error, response, null);
                                return;
                            }
                           getPhysicalRouters(request, response, appData);
                        });
            }
        }  
    } else {
        //create physical router
        console.log('no vrouters just creating the prouter');
        configApiServer.apiPut('/physical-router/' + pRouterId, postData, appData,
                function(error, data) {
                    if(error){
                        console.log('error updating prouter');
                        console.log(error);
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                   getPhysicalRouters(request, response, appData);
                });
    } 

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
 exports.createPhysicalRouters = createPhysicalRouters;
 exports.updatePhysicalRouters = updatePhysicalRouters;
 exports.deletePhysicalRouters = deletePhysicalRouters;