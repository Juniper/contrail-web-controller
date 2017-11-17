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
var _ = require('lodash');
/**
 * @getVirtualRoutersList
 * public function
 * 1. URL /api/tenants/config/virtual-routers-list
 * 2. Gets virtual routers from config api server
 */
function getVirtualRoutersList (request, response, appData)
{
    configApiServer.apiGet('/virtual-routers', appData,
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
 * @getVirtualRouters
 * public function
 * 1. URL /api/tenants/config/virtual-routers-detail/
 * 2. Gets virtual routers from config api server using the detail=true field to fetch the details of each vrouter
 */
function getVirtualRoutersWithDetail (request, response, appData)
{
     configApiServer.apiGet('/virtual-routers?detail=true&fields=physical_router_back_refs', appData,
         function(error, data) {
             if(error){
                 commonUtils.handleJSONResponse(error, response, null);
                 return;
             }
             commonUtils.handleJSONResponse(error, response, data);
         });             
}

/**
 * @getVirtualRouters
 * public function
 * 1. URL /api/tenants/config/virtual-routers/
 * 2. Gets virtual routers from config api server
 */
function getVirtualRouters (request, response, appData)
{
     configApiServer.apiGet('/virtual-routers', appData,
         function(error, data) {
             getVirtualRoutersDetails(error, data, response, appData);
         });             
}

function getVirtualRoutersDetails(error, data, response, appData) 
{
    var reqUrl            = null;
    var dataObjArr        = [];
    var i = 0, vRoutersLength  = 0;
    
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    vRoutersLength = data['virtual-routers'].length;
    for(i = 0; i < vRoutersLength; i++) {
        reqUrl = '/virtual-router/' +  data['virtual-routers'][i]['uuid'];
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
                 commonUtils.handleJSONResponse(error, response, results);
            }
    )
}

/**
 * @createVirtualRouters
 * public function
 * 1. URL /api/tenants/config/virtual-routers/
 * 2. creats  a virtual router in config api server
 */
function createVirtualRouters (request, response, appData)
{
     var postData     =  request.body;
     updateIPAMs(postData,appData, response, function(){
         configApiServer.apiPost('/virtual-routers', postData, appData,
                 function(error, data) {
                    if(error) {
                        commonUtils.handleJSONResponse(error, response, null);
                        return;
                    }
                    getVirtualRouters(request, response, appData);
                 });
     });
}
function updateIPAMs(postData,appData,response,callback)
{
  var ipamRefs = _.get(postData, 'virtual-router.network_ipam_refs', []);
  var ipamAllocPoolMap = {}, allocPools = [];
  var createAlloc = false;
  if(ipamRefs.length === 0){
      callback();
      return;
  }
  _.each(ipamRefs, function(ipamRef) {
      ipamAllocPoolMap[ipamRef.uuid] = [];
      ipamAllocPoolMap[ipamRef.uuid].push(ipamRef.attr.allocation_pools);
  });
  var dataObjArry = [];
  var flagtoCheckIp;
  var isAllocPoolCreate=false;
  var isAllocPoolAdd=false;
  var isAllocPoolSame=false;
  var subnetLen;
  _.each(ipamRefs, function (ipamRef){
      commonUtils.createReqObj(dataObjArry, '/network-ipam/' + ipamRef.uuid,
              global.HTTP_REQUEST_GET,
              null, null, null, appData);
  });
  if(dataObjArry.length) {
      async.map(dataObjArry,
      commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
      function(error, networkIPAMs) {
          if(error != null || networkIPAMs == null) {
              callback();
              return;
          }
          _.each(networkIPAMs, function(networkIPAM) {
              var ipam = _.get(networkIPAM, 'network-ipam', {}),
                  subnets = _.get(ipam, 'ipam_subnets.subnets', []);
                  subnetLen = subnets.length;
                    flagtoCheckIp = true;
                  _.each(subnets, function(subnet) {
                        var currIpamAllocPools= ipamAllocPoolMap[ipam.uuid];
                      _.each(currIpamAllocPools, function(allocPool) {
                          var subnetPrefix = subnet.subnet.ip_prefix +"/"+ subnet.subnet.ip_prefix_len;
                          _.each(allocPool, function(allocPoolItems){
                              var checkAllocStart = commonUtils.isIPBoundToRange(subnetPrefix, allocPoolItems.start);
                              var checkAllocEnd = commonUtils.isIPBoundToRange(subnetPrefix, allocPoolItems.end);
                              if(checkAllocStart === true && checkAllocEnd === true){
                                 if(!subnet.allocation_pools &&
                                         allocPoolItems.start && allocPoolItems.end){
                                      var allocation_pools = [];
                                      allocation_pools.push({
                                            vrouter_specific_pool: true,
                                            start:allocPoolItems.start,
                                            end:allocPoolItems.end
                                    })
                                    subnet['allocation_pools'] = allocation_pools;
                                    isAllocPoolCreate=true;
                                }
                                if(subnet.allocation_pools[0].start !== allocPoolItems.start &&
                                          subnet.allocation_pools[0].end !== allocPoolItems.end){
                                      subnet.allocation_pools.push({
                                            vrouter_specific_pool: true,
                                            start:allocPoolItems.start,
                                            end:allocPoolItems.end
                                    })
                                    isAllocPoolAdd=true;
                                }
                                if(subnet.allocation_pools[0].start === allocPoolItems.start &&
                                        subnet.allocation_pools[0].end === allocPoolItems.end){
                                    isAllocPoolSame = true;
                                }
                            }
                            else{
                                flagtoCheckIp = false;
                            }
                          })
                      });
                  });
                  //check
          });
          //Completed the updation.
          if(subnetLen === 1 && flagtoCheckIp === false){
              callback();
          }
          else if(isAllocPoolCreate==false && isAllocPoolAdd === false && isAllocPoolSame === true){
              callback();
          }
          else{
            //Send the put request
              async.map(networkIPAMs, function (itemName, callbackIPams){
                var ipam = _.get(itemName, 'network-ipam', {});
                jsonDiff.getJSONDiffByConfigUrl('/network-ipam/' + ipam.uuid, appData, ipam,
                        function(err, ipamDataDelta){
                            configApiServer.apiPut('/network-ipam/' + ipam.uuid, ipamDataDelta, appData,
                                function(error, data) {
                                   if(error) {
                                       commonUtils.handleJSONResponse(error, response, null, null);
                                       return;
                                   }
                                   callbackIPams();
                                }
                            );
                        }
                    );

              }, function(error, results){
                  if(error) {
                      commonUtils.handleJSONResponse(error, response, null, null);
                      return;
                  }
                  callback();
              });
         }
         //Send the complete stuff here
      });
  }
}

/**
 * @updateVirtualRouters
 * public function
 * 1. URL /api/tenants/config/virtual-router/:id
 * 2. updates a virtual router in config api server
 */
function updateVirtualRouters (request, response, appData)
{
     var vRouterID = validateVirtualRouterId(request),
         vrURL = '/virtual-router/' + vRouterID,
         postData     =  request.body;
         updateIPAMs(postData, appData,response, function(){
             jsonDiff.getJSONDiffByConfigUrl(vrURL, appData, postData,
                     function(err, vrDataDelta){
                         configApiServer.apiPut(vrURL, vrDataDelta, appData,
                             function(error, data) {
                                if(error) {
                                    commonUtils.handleJSONResponse(error, response, null);
                                    return;
                                }
                                getVirtualRouters(request, response, appData);
                             }
                         );
                     }
                 );
         });
} 

/**
 * @deleteVirtualRouters
 * public function
 * 1. URL /api/tenants/config/virtual-router/:id
 * 2. deletes a virtual router in config api server
 */
function deleteVirtualRouters (request, response, appData)
{
     var vRouterID = validateVirtualRouterId(request); 
     var postData     =  request.body;
     configApiServer.apiDelete('/virtual-router/' + vRouterID, appData,
         function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            getVirtualRouters(request, response, appData);
         });             
} 

function validateVirtualRouterId (request) 
{
    var vRouterId = null;
    if (!(vRouterId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual Router id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    return vRouterId;
}

 /* List all public function here */

exports.getVirtualRoutersList= getVirtualRoutersList;
exports.getVirtualRouters    = getVirtualRouters;
exports.getVirtualRoutersWithDetail = getVirtualRoutersWithDetail;
exports.createVirtualRouters = createVirtualRouters;
exports.updateVirtualRouters = updateVirtualRouters;
exports.deleteVirtualRouters = deleteVirtualRouters;  
 
