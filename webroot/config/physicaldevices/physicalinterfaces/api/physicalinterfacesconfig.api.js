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
var jsonPath    = require('JSONPath').eval;
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var async = require('async'); 

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
    if(data && data['physical-router'] != null) {
        if(data['physical-router']['physical_interfaces'] && data['physical-router']['physical_interfaces'].length > 0) {
            pInterfacesLength = data['physical-router']['physical_interfaces'].length;
            for(i = 0; i < pInterfacesLength; i++) {
                var pInterface = data['physical-router']['physical_interfaces'][i];   
                reqUrl = '/physical-interface/' + pInterface['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);        
            }
        }
        var lRootInterfaces = data['physical-router']['logical_interfaces'];
        if(lRootInterfaces != null && lRootInterfaces.length > 0) {
            for(var i = 0; i < lRootInterfaces.length; i++) {
                var lRootInterface = lRootInterfaces[i];
                reqUrl = '/logical-interface/' + lRootInterface['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);                 
            }
       
        }
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                function(error, results) {
                    if (error) {
                       commonUtils.handleJSONResponse(error, response, null);
                       return;
                    }
                    if(results.length > 0) {
                        var lInfDataObjArr = [];
                        var lInfReqUrl = null;
                        for(var i = 0; i < results.length; i++) {
                            var pInterface = results[i]['physical-interface'];
                            if(pInterface != null && pInterface['logical_interfaces'] &&  pInterface['logical_interfaces'].length > 0) {
                                var lInterfaces = pInterface['logical_interfaces']
                                for(var j = 0; j <  lInterfaces.length; j++) {
                                    var lInterface = lInterfaces[j];
                                    lInfReqUrl = '/logical-interface/' + lInterface['uuid'];
                                    commonUtils.createReqObj(lInfDataObjArr, lInfReqUrl, global.HTTP_REQUEST_GET,
                                        null, null, null, appData);
                                }

                            }
                            var lInf = results[i]['logical-interface'];
                            if(lInf != null) {
                                lInfReqUrl = '/logical-interface/' + lInf['uuid'];
                                commonUtils.createReqObj(lInfDataObjArr, lInfReqUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);                                
                            }
                        }
                        if(lInfDataObjArr.length > 0) {
                            async.map(lInfDataObjArr,
                                commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                                    function(err,lInfDetails){
                                        if (error) {
                                           commonUtils.handleJSONResponse(error, response, null);
                                           return;
                                        }
                                        if(lInfDetails.length > 0) {
                                            var vmiList = []; 
                                            for(var j = 0; j < lInfDetails.length; j++) {
                                                var lInterface = lInfDetails[j]['logical-interface'];
                                                if('virtual_machine_interface_refs' in lInterface) {
                                                    vmiList.push({li_uuid : lInterface.uuid, uuid : lInterface['virtual_machine_interface_refs'][0].uuid});
                                                }
                                            }
                                            if(vmiList.length > 0) {
                                                processVirtualMachineInterfaceDetails(response, appData, vmiList, function(vmiData) {
                                                    if(vmiData != null && vmiData.length > 0) {
                                                        var vmiListLen = vmiList.length;
                                                        for(var i = 0; i < vmiListLen; i++) {
                                                            vmiList[i]['vmi_details'] = vmiData[i];
                                                        }
                                                        for(var j = 0; j < lInfDetails.length; j++) {
                                                            var lInterface = lInfDetails[j]['logical-interface'];
                                                            for(var k = 0; k < vmiList.length; k++) {
                                                                if(vmiList[k].li_uuid === lInterface.uuid) {
                                                                    lInterface['vmi_details'] = vmiList[k]['vmi_details']; 
                                                                } 
                                                            }    
                                                        }
                                                    }
                                                    
                                                    //map logical interfaces to corresponding physical interface
                                                    if(lInfDetails.length > 0) {
                                                        for(var i = 0; i < results.length; i++) {
                                                            var pInterface = results[i]['physical-interface'];
                                                            var lInf = results[i]['logical-interface'];                                                            
                                                            if(pInterface != null) {
                                                                pInterface['logical_interfaces'] = [];
                                                            } 
                                                            for(var j = 0; j < lInfDetails.length; j++) {
                                                                var lInterface = lInfDetails[j]['logical-interface'];
                                                                if(pInterface != null && (pInterface['uuid'] === lInterface['parent_uuid'])) {
                                                                    pInterface['logical_interfaces'].push(lInfDetails[j]);            
                                                                }
                                                                if(lInf != null) {
                                                                    if(lInf['uuid'] == lInterface['uuid']) {
                                                                        results[i]['logical-interface'] = lInterface;
                                                                    }      
                                                                }                                                                    
                                                            }
                                                        }
                                                    }
                                                    commonUtils.handleJSONResponse(error, response, results);
                                                });
                                            } else {
                                                //map logical interfaces to corresponding physical interface
                                                if(lInfDetails.length > 0) {
                                                    for(var i = 0; i < results.length; i++) {
                                                        var pInterface = results[i]['physical-interface'];
                                                        if(pInterface != null) {
                                                            pInterface['logical_interfaces'] = [];
                                                            for(var j = 0; j < lInfDetails.length; j++) {
                                                                var lInterface = lInfDetails[j]['logical-interface'];
                                                                if(pInterface['uuid'] === lInterface['parent_uuid']) {
                                                                    pInterface['logical_interfaces'].push(lInfDetails[j]);            
                                                                }
                                                            } 
                                                        }                                            
                                                    } 
                                                }
                                                commonUtils.handleJSONResponse(error, response, results);                                            
                                            }
                                        }
                                    }
                            )
                        } else {
                            commonUtils.handleJSONResponse(error, response, results);    
                        }                        
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
     updateVMIDetails(request, appData, postData, function() {
         configApiServer.apiPost(url, postData, appData,
             function(error, data) {
                if(error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;               
                }         
                getPhysicalInterfaces(request, response, appData);
             });             
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
     updateVMIDetails(request, appData, postData, function() {
         configApiServer.apiPut(url + pInterfaceId, postData, appData,
             function(error, data) {
                if(error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;               
                }         
                getPhysicalInterfaces(request, response, appData);
             });             
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
            if(error) {
               commonUtils.handleJSONResponse(error, response, null);
               return;               
            }         
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

/**
 * @getVirtualNetworkInternals
 * public function
 * 1. URL /api/tenants/config/virtual-network-internals/:id
 * 2. Gets physical interfaces from config api server
 */
function getVirtualNetworkInternals (request, response, appData)
{
     var vnID = validateQueryParam(request, 'id');
     configApiServer.apiGet('/virtual-network/' + vnID, appData,
         function(error, data) {
             if(error || data == null || data['virtual-network'] == null || data['virtual-network']['virtual_machine_interface_back_refs'] == null) {
                 commonUtils.handleJSONResponse(error, response, null);
             } else {
                 processVirtualMachineInterfaceDetails(response, appData, data['virtual-network']['virtual_machine_interface_back_refs']);
             }
         });             
}

function processVirtualMachineInterfaceDetails(response, appData, result, callback)
{
    var dataObjArr = [];
    var resultJSON = [];
    var tempVMIResourceObj = [];
    var vmiBackRefs = result;
    var vmiCnt = vmiBackRefs.length;
    for(var i = 0; i < vmiCnt; i++) {
        var vmiUrl = '/virtual-machine-interface/' + vmiBackRefs[i].uuid;
        commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData); 
    }
    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
            function(error, data) {
                if ((null != error) || (null == data) || (!data.length)) {
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                dataObjArr = [];
                vmiCnt = data.length;
                for(var j = 0; j < vmiCnt; j++) {
                    if ((null == data[j]) || (null == data[j]['virtual-machine-interface'])) {
                        continue;
                    }
                    var vmi =  data[j]['virtual-machine-interface']; 
                    tempVMIResourceObj.push({"mac": vmi
                        ['virtual_machine_interface_mac_addresses']['mac_address'], "owner" : vmi['virtual_machine_interface_device_owner'],
                        "instance-ip": vmi['instance_ip_back_refs'], "fq_name": vmi['fq_name'], "vn_refs" : vmi['virtual_network_refs']});
                     var instIPBackRefs = vmi['instance_ip_back_refs'];
                     //var instIPBackRefsCnt = instIPBackRefsCntinstIPBackRefs.length;
                     if(instIPBackRefs != null && instIPBackRefs.length > 0) {
                         for (var k = 0; k < instIPBackRefs.length ; k++) {
                            var instIPUrl = '/instance-ip/' + instIPBackRefs[k]['uuid'];
                            commonUtils.createReqObj(dataObjArr, instIPUrl, global.HTTP_REQUEST_GET,
                                                     null, null, null, appData);
                         }
                     }
                 }
                 if(dataObjArr.length > 0) {
                     async.map(dataObjArr,
                         commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                         function(error, data) {
                         if ((null != error) || (null == data) || (!data.length)) {
                             commonUtils.handleJSONResponse(error, response, null);
                             return;
                         }
                         var instIPDataCnt = data.length;
                         var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                         var total = 0;
                         for (var i = 0; i < tempVMIResourceObjCnt; i++) {
                             if(tempVMIResourceObj[i]['instance-ip'] != null && tempVMIResourceObj[i]['instance-ip'].length > 0) {
                                 var instIpCnt =  tempVMIResourceObj[i]['instance-ip'].length;
                                 var tempInstIPData = data.slice(total, total + instIpCnt);
                                 total += instIpCnt;
                                 var ipAddrs = jsonPath(tempInstIPData, "$..instance_ip_address");
                                 if(tempVMIResourceObj[i]['owner'] == null || tempVMIResourceObj[i]['owner'] == "") {
                                     resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": ipAddrs, 
                                                     "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"]});
                                 }
                             } else {
                                 resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": [], 
                                                 "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"]});                             
                             }
                         }
                         if(callback != null) {
                             callback(resultJSON);
                         } else {
                             commonUtils.handleJSONResponse(null, response, resultJSON);
                         }    
                     });
                 } else {
                     if(tempVMIResourceObj[i]['owner'] == null || tempVMIResourceObj[i]['owner'] == "") {
                         resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": [], 
                                         "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"]});
                     } 
                     if(callback != null) {
                         callback(resultJSON);
                     } else {
                         commonUtils.handleJSONResponse(null, response, resultJSON);
                     }                      
                 }
            }
    );       
}

function updateVMIDetails(request, appData, postData, callback) {
     var infType = validateQueryParam(request, 'infType');
     if(infType === "Logical") {
         var vmiData = postData['logical-interface']['virtual_machine_interface_refs'];
         var vmiID = vmiData != null && vmiData.length > 0 ? vmiData[0].to[2] : null;
         if(vmiID != null) {
             configApiServer.apiGet('/virtual-machine-interface/' + vmiID, appData,
                 function(error, data) {
                     if(data != null && data['virtual-machine-interface'] != null && data['virtual-machine-interface']['logical_interface_back_refs'] != null) {
                          var liID = data['virtual-machine-interface']['logical_interface_back_refs'][0].uuid;
                          configApiServer.apiGet('/logical-interface/' + liID, appData, function(err, liData) {
                              liData['logical-interface']['virtual_machine_interface_refs'] =[];
                              configApiServer.apiPut('/logical-interface/' + liID, liData, appData, function(error, result) {
                                  callback();    
                              });
                          });
                     } else {
                        callback();
                     }
                 });
         } else {
             callback();
        }             
    } else {
        callback();
    }         
}

 /* List all public function here */
exports.getPhysicalInterfaces = getPhysicalInterfaces;
exports.createPhysicalInterfaces = createPhysicalInterfaces;
exports.updatePhysicalInterfaces = updatePhysicalInterfaces;
exports.deletePhysicalInterfaces = deletePhysicalInterfaces;
exports.getVirtualNetworkInternals = getVirtualNetworkInternals;
