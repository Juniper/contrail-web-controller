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
var jsonDiff      = require(process.mainModule.exports["corePath"] +
'/src/serverroot/common/jsondiff');


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
                if(vrouters.length > 0){

                    for(var j=0 ;j < pRouters.length; j++){
                        pRouters[j]['physical-router']['virtual-routers'] = [];
                        for(var l=0 ; l < vrouters.length; l++){
                            var prouterBackRefs = vrouters[l]['virtual-router']['physical_router_back_refs'];
                            if(prouterBackRefs != null && prouterBackRefs instanceof Array && prouterBackRefs.length > 0){
                                for(var k=0; k < prouterBackRefs.length; k++){
                                    if(pRouters[j]['physical-router']['uuid'] == prouterBackRefs[k]['uuid']){
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

function getPhysicalRoutersWithIntfCount (request, response, appData)
{
     configApiServer.apiGet('/physical-routers?detail=true&fields=logical_interfaces,physical_interfaces', appData,
         function(error, data) {
             if ((null != error) || (null == data) || (null ==
                 data['physical-routers'])) {
                 commonUtils.handleJSONResponse(error, response, null);
                 return;
             }
             getPhysicalInterfacesLogicalInterfaceCount(error,
                 data['physical-routers'], response, appData);
         });
}

function getPostDataForLogicalIntfCount(parentUUIDs){
    var postData = {"type":"logical-interface","count":true};
    postData["parent_id"] = parentUUIDs.toString();
    return postData;
}

function getChunkedUrl (uuidList,appData)
{
	var tempArray = [];
	var dataObjArr = [];
	var chunk = 200;
    var j = 0;
    var reqUrl = '/list-bulk-collection ';
    for (var i = 0, j = uuidList.length; i < j; i += chunk) {
        tempArray = uuidList.slice(i, i + chunk);
        var postData = {"type":"logical-interface","count":true};
        postData.parent_id = tempArray.join(',');
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 postData, null, null, appData);
    }
	return dataObjArr;
}

function getPhysicalInterfacesLogicalInterfaceCount(error, pRouters, response, appData){
    var pInterfacesLength = 0;
    var result = [];
    var dataObjArr        = [];
    var dataObjPostArr     = [];
    var virtualRouterUUIDs = [];
    var prouterMap = [];//Keep the map of prouter uuid and array of arrays of pinterfaces
    var pRoutersCnt = pRouters.length;
    var totalCnt = 0;
    for(var k = 0; k < pRoutersCnt; k++){
        var prouter = pRouters[k];
        var pIntfUUIDs = [];
        if(prouter['physical-router'] != null && prouter['physical-router']['physical_interfaces'] != null && prouter['physical-router']['physical_interfaces'].length > 0){
            pInterfacesLength =
                prouter['physical-router']['physical_interfaces'].length;
            for(i = 0; i < pInterfacesLength; i++) {
                pIntfUUIDs.push(prouter['physical-router']['physical_interfaces'][i]['uuid']);
            }
            var dataObjArr = getChunkedUrl(pIntfUUIDs,appData);
            prouterMap[k] = [totalCnt, totalCnt + dataObjArr.length - 1];
            totalCnt = totalCnt + dataObjArr.length;
            dataObjPostArr = dataObjPostArr.concat(dataObjArr);
        } else {
            prouterMap[k] = [-1, -1];
        }
        //get virtual router uuids
        var virtualRouterRefs = prouter['physical-router'].virtual_router_refs;
        if(virtualRouterRefs != null && virtualRouterRefs.length > 0) {
            var virtualRouterRefsCnt = virtualRouterRefs.length
            for(var i = 0; i < virtualRouterRefsCnt; i++) {
                virtualRouterUUIDs.push(virtualRouterRefs[i].uuid)
            }
        }
    }
    if(virtualRouterUUIDs.length > 0) {
        configApiServer.apiGet('/virtual-routers?detail=true&obj_uuids='+ virtualRouterUUIDs.join(','), appData,
                function(error, virtualRouterdata) {
                    if(error){
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                    //map virtual router details to physical router
                    var virtualRouters = virtualRouterdata['virtual-routers'];
                    if(virtualRouters != null && virtualRouters.length > 0) {
                        for(var i = 0; i < pRoutersCnt; i++){
                            var prouter = pRouters[i];
                            var virtualRouterRefs = prouter['physical-router'].virtual_router_refs;
                            if(virtualRouterRefs != null && virtualRouterRefs.length > 0) {
                                var virtualRouterRefsCnt = virtualRouterRefs.length;
                                for(var j = 0; j < virtualRouterRefsCnt; j++) {
                                    var uuid = virtualRouterRefs[j].uuid;
                                    var virtualRouterdataCnt = virtualRouters.length;
                                    for(var k = 0; k < virtualRouterdataCnt; k++) {
                                        var virtualRouter = virtualRouters[k]['virtual-router'];
                                        if(virtualRouter.uuid === uuid) {
                                           virtualRouterRefs[j] = virtualRouter;
                                           break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(dataObjArr.length > 0) {
                        getLogicalInterfaceDetails(dataObjPostArr, pRouters, prouterMap,
                        function(error, pRoutersData) {
                            if (error) {
                               commonUtils.handleJSONResponse(error, response, null);
                               return;
                            }
                            commonUtils.handleJSONResponse(error, response, pRoutersData);
                        });
                    } else {
                        commonUtils.handleJSONResponse(error, response, pRouters);
                    }

        });
    } else {
        if(dataObjArr.length > 0) {
            getLogicalInterfaceDetails(dataObjPostArr, pRouters, prouterMap, function(error, pRoutersData) {
                if (error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;
                }
                commonUtils.handleJSONResponse(error, response, pRoutersData);
            });
        } else {
            commonUtils.handleJSONResponse(error, response, pRouters);
        }
    }
}

/**
 * @getLogicalInterfaceDetails
 * private function
 * get logical interafce details
 */
function getLogicalInterfaceDetails(dataObjPostArr, pRouters, prouterMap, callback)
{
    async.mapLimit(dataObjPostArr, 50,
        commonUtils.getAPIServerResponse(configApiServer.apiPost, true),
        function(error, results) {
            if (error) {
               callback(error, null);
            }
            var pRoutersCnt = pRouters.length;
            for (var i = 0; i < pRoutersCnt; i++) {
                pRouters[i]['physical-router']['totalIntfCount'] = 0;
                if(pRouters[i]['physical-router']['physical_interfaces'] != null)
                    pRouters[i]['physical-router']['totalIntfCount']  +=
                        pRouters[i]['physical-router']['physical_interfaces'].length;
                if(pRouters[i]['physical-router']['logical_interfaces'] != null)
                    pRouters[i]['physical-router']['totalIntfCount']  +=
                        pRouters[i]['physical-router']['logical_interfaces'].length;
                var prStartIndex = prouterMap[i][0];
                var prEndIndex = prouterMap[i][1];
                if(-1 == prStartIndex){
                    continue;
                }
                for (var j = prStartIndex; j <= prEndIndex; j++) {
                    pRouters[i]['physical-router']['totalIntfCount'] +=
                                results[j]['logical-interfaces']['count'];
                }
                delete pRouters[i]['physical-router']['physical_interfaces'];
                delete pRouters[i]['physical-router']['logical_interfaces'];
            }
            callback(error, pRouters);
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

function updateBGPRouter(appData, postData, callback, pRouterId)
{
    var physicalRouterUUID, refUpdateData;
    var bgpRef = commonUtils.getValueByJsonPath(postData,
        "physical-router;bgp_router_refs;0", null);
    var bgpUUID = commonUtils.getValueByJsonPath(bgpRef,
        "uuid", null);
    var bgpRefObj = commonUtils.getValueByJsonPath(bgpRef,
        "to", null);
    if(bgpUUID) {
        configApiServer.apiGet('/bgp-router/' + bgpUUID, appData,
                function(error, bgpData) {
                    if(error || !bgpData["bgp-router"]){
                        callback(error, null);
                        return;
                    }
                    physicalRouterUUID = commonUtils.getValueByJsonPath(bgpData,
                        "bgp-router;physical_router_back_refs;0;uuid", null);
                    if(physicalRouterUUID && physicalRouterUUID != pRouterId) {
                        refUpdateData = {
                            "type": "physical-router",
                            "uuid": physicalRouterUUID,
                            "ref-type": "bgp-router",
                            "ref-uuid": bgpUUID,
                            "ref-fq-name": bgpRefObj,
                            "operation": "DELETE",
                            "attr": null
                        };
                        configApiServer.apiPost("/ref-update", refUpdateData,
                            appData, function(er, prData){
                            callback(er, prData);
                        });
                    } else {
                        callback(null, postData);
                    }
        });
    } else {
        callback(null, postData);
    }
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
                                                       //create physical router
                                                       createPRouter(request, response, postData, appData);
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
                                    //create physical router
                                    createPRouter(request, response, postData, appData);
                                }
                             });
                 }
             } else {
                 //create physical router
                 createPRouter(request, response, postData, appData);
             }
         }
         //If Tor Agent
         //Try to create the TOR Agent and TSN. Even if they fail go ahead and create physical router
         else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'
             || postData['physical-router']['virtual_router_type'] == 'TSN'){
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
                         //create physical router
                         createPRouter(request, response, postData, appData);
                     }
                 );
             } else {
                 //create physical router
                 createPRouter(request, response, postData, appData);
             }
         }
     } else {
         //create physical router
         createPRouter(request, response, postData, appData);
     }
}


function createPRouter(request, response, postData, appData) {

    delete postData['physical-router']['virtual-routers'];
    delete postData['physical-router']['virtual_router_type'];
    updateBGPRouter(appData, postData, function(err, prData) {
        if(err) {
           commonUtils.handleJSONResponse(err, response, null);
           return;
        }
        //create physical router
        configApiServer.apiPost('/physical-routers', postData, appData,
                function(error, data) {
                    if(error){
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                    getPhysicalRoutersWithIntfCount(request, response, appData);
                });
    });
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
        else if(postData['physical-router']['virtual_router_type'] == 'TOR Agent'
             || postData['physical-router']['virtual_router_type'] == 'TSN'){
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
    updateBGPRouter(appData, postData, function(err, prData) {
        var prUrl = '/physical-router/' + pRouterId;
        if(err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        jsonDiff.getJSONDiffByConfigUrl(prUrl, appData, postData,
            function(err, prDataDelta){
                configApiServer.apiPut(prUrl, prDataDelta, appData,
                    function(error, data) {
                        if(error){
                            commonUtils.handleJSONResponse(error,
                                response, null);
                            return;
                        }
                        commonUtils.handleJSONResponse(error, response, data);
                    }
                );
            }
        );
    }, pRouterId);
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
             getPhysicalRoutersWithIntfCount(request, response, appData);
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
 exports.getPhysicalRoutersWithIntfCount = getPhysicalRoutersWithIntfCount;
 exports.getPhysicalRouter    = getPhysicalRouter;
 exports.createPhysicalRouters = createPhysicalRouters;
 exports.updatePhysicalRouters = updatePhysicalRouters;
 exports.deletePhysicalRouters = deletePhysicalRouters;
