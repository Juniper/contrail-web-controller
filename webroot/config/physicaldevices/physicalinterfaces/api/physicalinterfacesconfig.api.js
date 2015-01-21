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
var jsonPath    = require('JSONPath').eval;
var UUID        = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var async = require('async');
var ports  = require('../../../ports/api/portsconfig.api');

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
        error = new appErrors.RESTServerError('Add id');
        commonUtils.handleJSONResponse(error, request.res, null);
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
                    if(vmi['virtual_machine_interface_device_owner'] == null || vmi['virtual_machine_interface_device_owner'] == "") {
                        tempVMIResourceObj.push({"mac": vmi
                            ['virtual_machine_interface_mac_addresses']['mac_address'],
                            "instance-ip": vmi['instance_ip_back_refs'], "fq_name": vmi['fq_name'], "vn_refs" : vmi['virtual_network_refs'],
                            "vm_refs" : vmi['virtual_machine_refs'] != null ? vmi['virtual_machine_refs'] : [],
                            "subnet" : vmi['subnet_back_refs'] != null ? vmi['subnet_back_refs'][0].to[0] : '', "vmi_uuid" : vmi.uuid});
                    }
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
                         var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                         var total = 0;
                         for (var i = 0; i < tempVMIResourceObjCnt; i++) {
                             if(tempVMIResourceObj[i]['instance-ip'] != null && tempVMIResourceObj[i]['instance-ip'].length > 0) {
                                 var instIpCnt =  tempVMIResourceObj[i]['instance-ip'].length;
                                 var tempInstIPData = data.slice(total, total + instIpCnt);
                                 total += instIpCnt;
                                 var ipAddrs = jsonPath(tempInstIPData, "$..instance_ip_address");
                                 resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": ipAddrs,
                                                 "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"],
                                                 "vm_refs" : tempVMIResourceObj[i]["vm_refs"], "subnet" : tempVMIResourceObj[i]['subnet'],"vmi_uuid" : tempVMIResourceObj[i]['vmi_uuid']});
                             } else {
                                 resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": [],
                                                 "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"],
                                                 "vm_refs" : tempVMIResourceObj[i]["vm_refs"], "subnet" : tempVMIResourceObj[i]['subnet'],"vmi_uuid" : tempVMIResourceObj[i]['vmi_uuid']});
                             }
                         }
                         if(callback != null) {
                             callback(resultJSON);
                         } else {
                             commonUtils.handleJSONResponse(null, response, resultJSON);
                         }    
                     });
                 } else {
                     var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                     for(var i = 0; i < tempVMIResourceObjCnt; i++) {
                         resultJSON.push({"mac": tempVMIResourceObj[i]['mac'], "ip": [],
                                         "vmi_fq_name": tempVMIResourceObj[i]['fq_name'], "vn_refs" : tempVMIResourceObj[i]["vn_refs"],
                                         "vm_refs" : tempVMIResourceObj[i]["vm_refs"], "subnet" : tempVMIResourceObj[i]['subnet'],"vmi_uuid" : tempVMIResourceObj[i]['vmi_uuid']});                         
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

/**
 * @setVirtualMachineRefs
 * public function
 * 1. URL /api/tenants/config/map-virtual-machine-refs/:vmiId
 * 2. Creates Virtual machine and Sets this ref to Virtual Machine Interface object in config api server
 */
function mapVirtualMachineRefs(request, response, appData)
{
    var vmiId = validateQueryParam(request, 'vmiId');
    var serverId = request.param('serverId');
    var vmId  = UUID.create().hex.toString();
    var name = vmId;
    if(serverId != 'null') {
        name = serverId;
    }
    var vmPostData = {"virtual-machine" : {"fq_name" : [name], "name" : name, "uuid" : vmId}};
    configApiServer.apiPost('/virtual-machines', vmPostData, appData,
         function(error, vmData) {
             if(error) {
                 if(error.responseCode === 409){
                     var vmIdIndex = error.message.indexOf(':') + 1;
                     var oldVmId = error.message.substr(vmIdIndex).trim();
                     configApiServer.apiGet('/virtual-machine/' + oldVmId, appData,
                         function(err, oldVmData) {
                             if(err || oldVmData['virtual-machine'] == null
                                 || (oldVmData['virtual-machine'] && oldVmData['virtual-machine']['virtual_machine_interface_back_refs'] == null)) {
                                commonUtils.handleJSONResponse(err, response, null);
                                return;
                             }
                             var oldVmiId = oldVmData['virtual-machine']['virtual_machine_interface_back_refs'][0]['uuid'];
                             ports.deletePortsCB({'appData' : appData, 'uuid' : oldVmiId, 'request' : request}, function(mapError, deleteData) {
                                 configApiServer.apiPost('/virtual-machines', vmPostData, appData, function(newVmErr, newVmData) {
                                     setVMRefToVMI(vmiId, name, appData, response);
                                 });
                            });
                         });
                 } else {
                     commonUtils.handleJSONResponse(error, response, null);
                     return;
                 }
             } else {
                 setVMRefToVMI(vmiId, name, appData, response);
             }
         }
    );
}

function setVMRefToVMI(vmiId, name, appData, response)
{
    configApiServer.apiGet('/virtual-machine-interface/' + vmiId, appData,
        function(err, vmiData) {
            if(err || vmiData['virtual-machine-interface'] == null) {
                commonUtils.handleJSONResponse(err, response, null);
                return;
            }
            vmiData['virtual-machine-interface']['virtual_machine_refs'] = [{"to" : [name]}];
            configApiServer.apiPut('/virtual-machine-interface/' + vmiId, vmiData, appData,
                function(er, updatedVMIData) {
                    if(er) {
                       commonUtils.handleJSONResponse(er, response, null);
                       return;
                    }
                    commonUtils.handleJSONResponse(null, response, updatedVMIData);
                }
            );
        }
    );
}

/**
 * @deleteLIVirtualMachines
 * public function
 * 1. URL /api/tenants/config/li-virtual-machine/:id
 * 2. deletes a virtual machine which has ref to li in config api server
 */
function deleteLIVirtualMachines (request, response, appData)
{
     var vmId = validateQueryParam(request,'id');
     configApiServer.apiDelete(/virtual-machine/ + vmId, appData,
         function(error, data) {
            if(error) {
               commonUtils.handleJSONResponse(error, response, null);
               return;
            }
            commonUtils.handleJSONResponse(error, response, data);
         });
}

/**
 * @mapVMIRefsToSubnet
 * public function
 * 1. URL /api/tenants/config/set-subnet-refs/:vmiId
 * 2. Creates subnet and Sets this ref to Virtual Machine Interface object in config api server
 */
function mapVMIRefsToSubnet(request, response, appData)
{
    var vmiId        = validateQueryParam(request, 'vmiId');
    var subnetPostData     = request.body;
    var subnetId = UUID.create().hex.toString();
    subnetPostData['subnet']['fq_name'] = [subnetId];
    subnetPostData['subnet']['name'] = subnetId;
    subnetPostData['subnet']['uuid'] = subnetId;
    configApiServer.apiPost('/subnets', subnetPostData, appData,
        function(error, subnetDetails) {
             if(error || subnetDetails['subnet'] == null) {
                 commonUtils.handleJSONResponse(error, response, null);
                 return;
             }
             configApiServer.apiGet('/virtual-machine-interface/' + vmiId, appData,
                 function(err, vmiData) {
                      if(err || vmiData['virtual-machine-interface'] == null) {
                         commonUtils.handleJSONResponse(err, response, null);
                         return;
                     }
                     var subnet = subnetDetails['subnet'];
                     subnet['virtual_machine_interface_refs'] = [{"to" : vmiData['virtual-machine-interface'].fq_name}];
                     configApiServer.apiPut('/subnet/' + subnet.uuid, subnetDetails, appData,
                         function(er, updatedSubnetData) {
                             if(er) {
                                commonUtils.handleJSONResponse(er, response, null);
                                return;
                             }
                             commonUtils.handleJSONResponse(null, response, updatedSubnetData);
                         }
                     );
                 }
             );
        }
    );
}

/**
 * @deleteLISubnets
 * public function
 * 1. URL /api/tenants/config/li-subnet/:id
 * 2. deletes a subnet which has ref to li in config api server
 */
function deleteLISubnet (request, response, appData)
{
     var subnetId = validateQueryParam(request,'id');
     configApiServer.apiDelete(/subnet/ + subnetId, appData,
         function(error, data) {
            if(error) {
               commonUtils.handleJSONResponse(error, response, null);
               return;
            }
            commonUtils.handleJSONResponse(error, response, data);
         });
}

 /* List all public function here */
exports.getPhysicalInterfaces = getPhysicalInterfaces;
exports.createPhysicalInterfaces = createPhysicalInterfaces;
exports.updatePhysicalInterfaces = updatePhysicalInterfaces;
exports.deletePhysicalInterfaces = deletePhysicalInterfaces;
exports.getVirtualNetworkInternals = getVirtualNetworkInternals;
exports.mapVirtualMachineRefs = mapVirtualMachineRefs;
exports.deleteLIVirtualMachines = deleteLIVirtualMachines;
exports.mapVMIRefsToSubnet = mapVMIRefsToSubnet;
exports.deleteLISubnet = deleteLISubnet;

