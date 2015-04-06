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
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');

/**
 * @readLIDetails
 * public function
 * 1. It is a logical interface details callback 
 * 2. It is called from admin.api.js --> getApiServerDataByPage()
 */
function readLIDetails(liObj, callback) {
    var lInfDataObjArr = liObj['dataObjArr'];
    var appData = liObj['appData'];
    if(lInfDataObjArr.length > 0) {
        async.map(lInfDataObjArr,
            commonUtils.getServerResponseByRestApi(configApiServer, true),
                function(err,lInfDetails){
                    if (err) {
                       callback(err,null);
                       return;
                    }
                    if(lInfDetails.length > 0) {
                        var vmiList = [];
                        for(var j = 0; j < lInfDetails.length; j++) {
                            var lInterface = lInfDetails[j]['logical-interface'];
                            if('virtual_machine_interface_refs' in lInterface) {
                                var vmiRefs = lInterface['virtual_machine_interface_refs'];
                                for(var k = 0 ; k < vmiRefs.length; k++){
                                    vmiList.push({li_uuid : lInterface.uuid, uuid : vmiRefs[k].uuid});
                                }
                            }
                        }
                        if(vmiList.length > 0) {
                            processVMIDetails(appData, vmiList, function(err, vmiData) {
                                if(err) {
                                    callback(err,null);
                                }
                                if(vmiData != null && vmiData.length > 0) {
                                    var vmiListLen = vmiList.length;
                                    for(var i = 0; i < vmiListLen; i++) {
                                        vmiList[i]['vmi_details'] = vmiData[i];
                                    }
                                    for(var j = 0; j < lInfDetails.length; j++) {
                                        var lInterface = lInfDetails[j]['logical-interface'];
                                        lInterface['vmi_details']  = [];
                                        for(var k = 0; k < vmiList.length; k++) {
                                            if(vmiList[k].li_uuid === lInterface.uuid) {
                                                lInterface['vmi_details'].push(vmiList[k]['vmi_details']);
                                            }
                                        }
                                    }
                                }
                                callback(err,lInfDetails);
                            });
                        } else {
                            callback(err,lInfDetails);
                        }
                    } else {
                        callback(err,null);
                    }
                }
        )
    } else {
        callback(null,[]);
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
     if(!url) {
         var error = new appErrors.RESTServerError('Add id');
         commonUtils.handleJSONResponse(error, response, null);
         return;
     }
     updateVMIDetails(request, appData, postData, function() {
         configApiServer.apiPost(url, postData, appData,
             function(error, data) {
                if(error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;               
                }         
                commonUtils.handleJSONResponse(error, response, data);
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
     if(!url) {
         var error = new appErrors.RESTServerError('Add id');
         commonUtils.handleJSONResponse(error, response, null);
         return;
     }
     var postData     =  request.body;
     updateVMIDetails(request, appData, postData, function() {
         var reqUrl = url + pInterfaceId;
         jsonDiff.getJSONDiffByConfigUrl(reqUrl, appData, postData,
                                         function(err, delta) {
         configApiServer.apiPut(reqUrl, delta, appData,
             function(error, data) {
                if(error) {
                   commonUtils.handleJSONResponse(error, response, null);
                   return;               
                }         
                commonUtils.handleJSONResponse(error, response, data);
             });             
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
     if(!url) {
         var error = new appErrors.RESTServerError('Add id');
         commonUtils.handleJSONResponse(error, response, null);
         return;
     }
     var postData     =  request.body;
     configApiServer.apiDelete(url + pInterfaceId, appData,
         function(error, data) {
            if(error) {
               commonUtils.handleJSONResponse(error, response, null);
               return;               
            }         
            commonUtils.handleJSONResponse(error, response, data);
         });
}

/**
 * @deleteInterfaces
 * public function
 * 1. URL /api/tenants/config/interfaces/delete
 * 2. delete interfaces in config api server
 * 3. delete ports associated to interfaces in config api server
 * 4. delete subnets associated to interfaces in config api server
 * 5. expects selected rows data in request payload
 */
function deleteInterfaces(request, response, appData)
{
    var infDataObjArr = [];
    var rows =  request.body;
    var rowsCnt = rows.length;
    for(var i = 0; i < rowsCnt; i++) {
        var row = rows[i];
        var infUrl = getInterfaceUrl(request, 'delete', row.type) + row.uuid;
        commonUtils.createReqObj(infDataObjArr, infUrl, global.HTTP_REQUEST_DELETE,
                                    row, null, null, appData);
    }
    async.mapLimit(infDataObjArr, global.ASYNC_MAP_LIMIT_COUNT, deleteInterfaceAsync, function(error, data) {
        var dataArrLen = data.length;
        var errorMsg = "";
        for (var i = 0; i < dataArrLen; i++){
            if (data[i].error != null){
                if (data[i].error.custom) {
                    errorMsg += data[i].error.message + "<br>";
                } else {
                    errorMsg += data[i].error + "<br>";
                }
            }
        }
        var newError = null;
        if(errorMsg != "") {
            newError = new appErrors.RESTServerError(errorMsg);
        }
        commonUtils.handleJSONResponse(newError, response, null);
    });
}

function deleteInterfaceAsync(dataObj, callback)
{
    var url = dataObj.reqUrl;
    var data  = dataObj.data;
    var appData = dataObj.appData;
    var request = appData.authObj.req;
    var response = request.res;
    if(data.vmiIdArr != null) {
        var putObj = {
                         "logical-interface": {
                             "uuid" : data.uuid,
                             "virtual_machine_interface_refs":[]
                         }
                     };
        configApiServer.apiPut(url, putObj, appData, function(err, infData){
            var portDataObjArry = [];
            var vmiIdCnt = data.vmiIdArr.length;
            for(var i = 0; i < vmiIdCnt; i++) {
                var vmiId = data.vmiIdArr[i];
                commonUtils.createReqObj(portDataObjArry, null, global.HTTP_REQUEST_DELETE,
                                            vmiId, null, null, appData);
            }
            async.map(portDataObjArry, deletePortAsync, function(error, data){
                //TODO : if port delete fails need to add back vmi_ref to li
                configApiServer.apiDelete(url, appData, function(err, liData){
                        callback(null, {'error' : err, 'data' : liData});
                    }
                );
            });
        });
    } else {
        configApiServer.apiDelete(url, appData, function(err, liData){
                callback(null, {'error' : err, 'data' : liData});
            }
        );
    }
}

function deletePortAsync(dataObj, callback)
{
    var vmiId =  dataObj.data;
    var appData = dataObj.appData;
    var request = appData.authObj.req;
    ports.deletePortsCB({'appData' : appData, 'uuid' : vmiId, 'request' : request},
        function(error, isPortDeleted) {
            callback(error, isPortDeleted);
        }
    );
}

function validateQueryParam (request, key) 
{
    var paramValue = null;
    if (!(paramValue = request.param(key).toString())) {
         var error = new appErrors.RESTServerError('Add id');
         commonUtils.handleJSONResponse(error, request.res, null);
        return;
    }
    return paramValue;
}

function getInterfaceUrl(request, operation, type) {
     var infUrl = '';
     var infType = type != null ? type : request.param('infType').toString();
     if(!infType) {
        return;
     }
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
                 processVMIDetails(appData, data['virtual-network']['virtual_machine_interface_back_refs'], function(err, result){
                    if(err) {
                        commonUtils.handleJSONResponse(err, response, null);
                        return; 
                    }
                    commonUtils.handleJSONResponse(err, response, result);
                 });
             }
         });             
}

function processVMIDetails(appData, result, callback)
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
    async.mapLimit(dataObjArr, global.ASYNC_MAP_LIMIT_COUNT,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
            function(error, data) {
                if ((null != error) || (null == data) || (!data.length)) {
                    callback(error,null);
                    return;
                }
                dataObjArr = [];
                var subnetDataObjArr = [];
                vmiCnt = data.length;
                for(var j = 0; j < vmiCnt; j++) {
                    if ((null == data[j]) || (null == data[j]['virtual-machine-interface'])) {
                        continue;
                    }
                    var vmi =  data[j]['virtual-machine-interface'];
                    var owner = vmi['virtual_machine_interface_device_owner'];
                    var subInf = vmi["virtual_machine_interface_properties"];
                    if((owner == null || owner == "") && (subInf == null || (subInf != null && subInf["sub_interface_vlan_tag"] == null))) {
                        tempVMIResourceObj.push({"mac": vmi
                            ['virtual_machine_interface_mac_addresses']['mac_address'],
                            "instance-ip": vmi['instance_ip_back_refs'], "fq_name": vmi['fq_name'], "vn_refs" : vmi['virtual_network_refs'],
                            "vm_refs" : vmi['virtual_machine_refs'] != null ? vmi['virtual_machine_refs'] : [],
                            "subnet" : vmi['subnet_back_refs'] != null ? vmi['subnet_back_refs'] : [] , "vmi_uuid" : vmi.uuid});
                        var instIPBackRefs = vmi['instance_ip_back_refs'];
                        var subnetBackRefs = vmi['subnet_back_refs'];
                        //Prepare the instance-ip request obj
                        if(instIPBackRefs != null && instIPBackRefs.length > 0) {
                            for (var k = 0; k < instIPBackRefs.length ; k++) {
                               var instIPUrl = '/instance-ip/' + instIPBackRefs[k]['uuid'];
                               commonUtils.createReqObj(dataObjArr, instIPUrl, global.HTTP_REQUEST_GET,
                                                        null, null, null, appData);
                            }
                        }
                        //Prepare the subnet request obj
                        if(subnetBackRefs != null && subnetBackRefs.length > 0) {
                            for (var k = 0; k < subnetBackRefs.length ; k++) {
                               var subnetUrl = '/subnet/' + subnetBackRefs[k]['uuid'];
                               commonUtils.createReqObj(subnetDataObjArr, subnetUrl, global.HTTP_REQUEST_GET,
                                                        null, null, null, appData);
                            }
                        }
                    }
                }
                async.mapLimit(dataObjArr, global.ASYNC_MAP_LIMIT_COUNT,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                    function(error, data) {
                        //No subnets case.. return with the instance_ip details
                        var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                        var total = 0;
                        for (var i = 0; i < tempVMIResourceObjCnt; i++) {
                            if(error == null && data != null && data.length > 0
                                && tempVMIResourceObj[i]['instance-ip'] != null && tempVMIResourceObj[i]['instance-ip'].length > 0) {
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
                        if(subnetDataObjArr.length < 1){
                            //There are no subnets so just return the response from here
                            callback(null,resultJSON);
                        } else {
                            //Get subnet details
                            async.mapLimit(subnetDataObjArr, global.ASYNC_MAP_LIMIT_COUNT,
                                    commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                                    function(error,subnetData){
                                        if ((null != error) || (null == subnetData) || (!subnetData.length)) {
                                            callback(error,null);
                                            return;
                                        }
                                        var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                                        var total = 0;
                                        for (var i = 0; i < tempVMIResourceObjCnt; i++) {
                                            if(tempVMIResourceObj[i]['subnet'] != null && tempVMIResourceObj[i]['subnet'].length > 0) {
                                                var subnetCnt =  tempVMIResourceObj[i]['subnet'].length;
                                                var tempSubnetData = subnetData.slice(total, total + subnetCnt);
                                                total += subnetCnt;
                                                var subnetDtls = [];
                                                for(var j = 0; j < tempSubnetData.length ; j++){
                                                    var subnetIPPrefix = tempSubnetData[j]['subnet']['subnet_ip_prefix'];
                                                    var subnetUUID = tempSubnetData[j]['subnet']['uuid'];
                                                    subnetDtls.push({"subnetUUID" : subnetUUID, "subnetIPPrefix":subnetIPPrefix});
                                                }
                                                resultJSON[i]['subnet'] = subnetDtls;
                                            } else {
                                                resultJSON[i]['subnet'] = [];
                                            }
                                        }
                                        callback(null,resultJSON);
                            });  //Async for subnet ends
                        }
                });//Async for instance_ip ends
            }
    );
}

function updateVMIDetails(request, appData, postData, callback) {
     var infType = validateQueryParam(request, 'infType');
     if(infType === "Logical") {
         var vmiData = postData['logical-interface']['virtual_machine_interface_refs'];
         var liUUID = postData['logical-interface']['uuid'];
         var vmiDataObjArray = [];
         var vmiIds = [];
         for(var i = 0; i < vmiData.length ; i++){
             var vmiReqUrl = '/virtual-machine-interface/' + vmiData[i].uuid;
             vmiIds.push(vmiData[i]['uuid']);
             commonUtils.createReqObj(vmiDataObjArray, vmiReqUrl, global.HTTP_REQUEST_GET,
                 null, null, null, appData);
         }
         
         if(vmiDataObjArray.length > 0) {
             //get virtual machine interface details for post object's virtual machine interface refs 
             async.map(vmiDataObjArray,commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                     function(error,vmiDetails){                 
                             if (error) {
                                commonUtils.handleJSONResponse(error, response, null);
                                return;
                             }
                            var liObjArray = [];
                            var liIds = [];
                            for(var j=0; j < vmiDetails.length; j++){
                                var data = vmiDetails[j];
                                // filter the virtual machine interfaces with logical_interface_back_refs
                                 if(data != null && data['virtual-machine-interface'] != null && data['virtual-machine-interface']['logical_interface_back_refs'] != null) {
                                     
                                     var liReqUrl = '/logical-interface/' + data['virtual-machine-interface']['logical_interface_back_refs'][0].uuid;
                                     liIds.push(data['virtual-machine-interface']['logical_interface_back_refs'][0].uuid);
                                     commonUtils.createReqObj(liObjArray, liReqUrl, global.HTTP_REQUEST_GET,
                                         null, null, null, appData);
                                 }
                             }
                             if(liObjArray.length > 0) {
                                 //get logical interface details
                                 async.map(liObjArray,commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                                         function(error,liDetails){                 
                                                 if (error) {
                                                    commonUtils.handleJSONResponse(error, response, null);
                                                    return;
                                                 }
                                                var liPutObjArray = [];
                                                for(var l = 0; l < liDetails.length; l++){
                                                    //Check if the li is not itself and proceed to remove the vmis for the other li
                                                    if(liUUID !=  liDetails[l]['logical-interface'].uuid){
                                                        var liPutURl= '/logical-interface/' + liDetails[l]['logical-interface'].uuid;
                                                        var currLIVMIs = liDetails[l]['logical-interface']['virtual_machine_interface_refs'];
                                                        for(var i =  currLIVMIs.length - 1; i >= 0 ;i--){
                                                            for(var k=0; k < vmiIds.length; k++){
                                                                if(currLIVMIs[i] != null && currLIVMIs[i]['uuid'] == vmiIds[k]){
                                                                    //remove the vmi_refs from the existing lis whose are part of new li
                                                                    currLIVMIs.splice(i,1);  
                                                                }
                                                            }
                                                        }
                                                        commonUtils.createReqObj(liPutObjArray, liPutURl, global.HTTP_REQUEST_PUT,
                                                                commonUtils.cloneObj(liDetails[l]), null, null, appData);
                                                    }
                                                }
                                                if(liPutObjArray.length >0) {
                                                    async.map(liPutObjArray,commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
                                                        function(err,liPutDetails){
                                                            if(err){
                                                                commonUtils.handleJSONResponse(err, response, null);
                                                                return;  
                                                            }
                                                            callback();
                                                        }
                                                    );
                                                } else {
                                                    callback();
                                                }
                                                
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
exports.createPhysicalInterfaces = createPhysicalInterfaces;
exports.updatePhysicalInterfaces = updatePhysicalInterfaces;
exports.deletePhysicalInterfaces = deletePhysicalInterfaces;
exports.deleteInterfaces = deleteInterfaces;
exports.getVirtualNetworkInternals = getVirtualNetworkInternals;
exports.mapVirtualMachineRefs = mapVirtualMachineRefs;
exports.deleteLIVirtualMachines = deleteLIVirtualMachines;
exports.mapVMIRefsToSubnet = mapVMIRefsToSubnet;
exports.deleteLISubnet = deleteLISubnet;
exports.readLIDetails = readLIDetails;

