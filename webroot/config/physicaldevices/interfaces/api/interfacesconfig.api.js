/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @interfacesconfig.api.js
 *     - Handlers for interfaces
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
var jsonPath    = require('JSONPath').eval;
var UUID        = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var async = require('async');
var ports  = require('../../../networking/port/api/portsconfig.api');
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
                                    var lInfDetailsCnt = lInfDetails.length;
                                    for(var i = 0; i < lInfDetailsCnt; i++) {
                                        var lInterface = lInfDetails[i]['logical-interface'];
                                        var vmiRefs = lInterface['virtual_machine_interface_refs'];
                                        if(vmiRefs != null && vmiRefs.length > 0) {
                                            var vmiRefsCnt =  vmiRefs.length;
                                            for(var j = 0; j < vmiRefsCnt; j++) {
                                                var uuid = vmiRefs[j].uuid;
                                                var vmiDataCnt = vmiData.length;
                                                for(var k = 0; k < vmiDataCnt; k++) {
                                                    if(vmiData[k]['virtual-machine-interface'].uuid === uuid) {
                                                        vmiRefs[j] = vmiData[k];
                                                        break;
                                                    }
                                                }
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
    var dataObj = {request: request, appData: appData, data: request.body};
    createPhysicalInterfacesCB(dataObj, function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
}

function createPhysicalInterfacesCB (dataObj, callback)
{
    var request = dataObj.request;
    var appData = dataObj.appData;
    var postData = dataObj.data;

     var key = _.keys(postData)[0];
     if ("physical-interface" == key) {
         request.params["infType"] = "physical";
     } else if ("logical-interface" == key) {
         request.params["infType"] = "logical";
     }
     var postData     =  request.body;
     var url = getInterfaceUrl(request, 'create');
     if(!url) {
         var error = new appErrors.RESTServerError('Add id');
         callback(error, null);
         return;
     }
     setDeviceOwnerForLIPorts(request, appData, postData, function() {
         configApiServer.apiPost(url, postData, appData,
             function(error, data) {
                callback(error, data);
             });
     });
}

/*
 * It is used to set device owner as physical_router for li ports
 */

function setDeviceOwnerForLIPorts (request, appData, postData, callback)
{
    var infType = validateQueryParam(request, 'infType');
    if(infType === "logical") {
        var vmiRefsData = commonUtils.getValueByJsonPath(postData,
                'logical-interface;virtual_machine_interface_refs', [], false);
        var vmiDataObjArray = [];
        var i, vmiRefsDataCnt = vmiRefsData.length;
        for(i = 0; i < vmiRefsDataCnt ; i++) {
            var vmiRefData = vmiRefsData[i],
                vmiReqUrl = '/virtual-machine-interface/' + vmiRefData.uuid,
                putData = {};
            putData["virtual-machine-interface"] = {};
            putData["virtual-machine-interface"]["fq_name"] = vmiRefData.to;
            putData["virtual-machine-interface"]["uuid"] = vmiRefData.uuid;
            putData["virtual-machine-interface"]["parent_type"] = "project";
            putData["virtual-machine-interface"]
                ["virtual_machine_interface_device_owner"] = "physical-router";
            commonUtils.createReqObj(vmiDataObjArray, vmiReqUrl,
                    global.HTTP_REQUEST_PUT, putData, null, null, appData);
        }
        if(vmiDataObjArray.length) {
            async.map(vmiDataObjArray,
                commonUtils.getServerResponseByRestApi(configApiServer, false),
                function(vmiUpdateError, vmiUpdateData) {
                     callback();
                });
        } else {
            callback();
        }
    } else {
        callback();
    }
}

/**
 * @updatePhysicalInterfaces
 * public function
 * 1. URL /api/tenants/config/physical-interface/:pRouterId/:infType/:pInterfaceId
 * 2. updates a physical interface in config api server
 */
function updatePhysicalInterfaces (request, response, appData)
{
    var dataObj = {request: request, appData: appData, data: request.body};
    updatePhysicalInterfacesCB(dataObj, function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
}


function updatePhysicalInterfacesCB (dataObj, callback) {
     var request = dataObj.request;
     var appData = dataObj.appData;
     var postData = dataObj.data;

     var key = _.keys(postData)[0];
     if ("physical-interface" == key) {
         request.params["infType"] = "physical";
     } else if ("logical-interface" == key) {
         request.params["infType"] = "logical";
     }
     if (postData[key].uuid) {
         request.params["pInterfaceId"] = postData[key].uuid;
     }
     var pInterfaceId = validateQueryParam(request,'pInterfaceId');
     var url = getInterfaceUrl(request);
     if(!url) {
         var error = new appErrors.RESTServerError('Add id');
         callback(error, null);
         return;
     }
     setDeviceOwnerForLIPorts(request, appData, postData, function() {
         var reqUrl = url + pInterfaceId;
         jsonDiff.getJSONDiffByConfigUrl(reqUrl, appData, postData,
                                         function(err, delta) {
         configApiServer.apiPut(reqUrl, delta, appData,
             function(error, data) {
                callback(error, data);
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
    var rows =  request.body;
    deleteInterfacesByUUIDList(rows, request, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
}

function deleteInterfacesByUUIDList (rows, request, appData, callback)
{
    var infDataObjArr = [];
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
        callback(newError, data);
    });
}

function deleteInterfaceAsync(dataObj, callback)
{
    var url = dataObj.reqUrl;
    var data  = dataObj.data;
    var appData = dataObj.appData;
    var request = appData.authObj.req;
    var response = request.res;
    /*if ((data.vmiIdArr != null) && (data.vmiIdArr.length > 0)) {
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
    }*/
    configApiServer.apiDelete(url, appData, function(err, liData){
        callback(null, {'error' : err, 'data' : liData});
    });
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
     if(infType === 'physical') {
          infUrl =  operation === 'create' ? '/physical-interfaces' : '/physical-interface/';
     } else if(infType === 'logical') {
          infUrl =  operation === 'create' ? '/logical-interfaces' : '/logical-interface/';
     }
     return infUrl;
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
                        /*tempVMIResourceObj.push({"mac": vmi
                            ['virtual_machine_interface_mac_addresses']['mac_address'],
                            "instance-ip": vmi['instance_ip_back_refs'], "fq_name": vmi['fq_name'], "vn_refs" : vmi['virtual_network_refs'],
                            "vm_refs" : vmi['virtual_machine_refs'] != null ? vmi['virtual_machine_refs'] : [],
                            "subnet" : vmi['subnet_back_refs'] != null ? vmi['subnet_back_refs'] : [] , "vmi_uuid" : vmi.uuid});*/
                        tempVMIResourceObj.push(data[j]);
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
                    function(error, instanceIPsData) {
                        if ((null != error) || (null == instanceIPsData) || (!instanceIPsData.length)) {
                            callback(error,null);
                            return;
                        }
                        //No subnets case.. return with the instance_ip details
                        var tempVMIResourceObjCnt = tempVMIResourceObj.length;
                        for(var i = 0; i < tempVMIResourceObjCnt; i++) {
                            var vmi = tempVMIResourceObj[i]['virtual-machine-interface'];
                            var instIPBackRefs = vmi['instance_ip_back_refs'];
                            var instIPBackRefsCnt = instIPBackRefs.length;
                            if(instIPBackRefs != null && instIPBackRefsCnt > 0) {
                                for(var j = 0; j < instIPBackRefsCnt; j++) {
                                    var uuid = instIPBackRefs[j]['uuid'];
                                    var instanceIPsdataLength = instanceIPsData.length;
                                    for(var k = 0; k < instanceIPsdataLength; k++) {
                                        if(instanceIPsData[k]['instance-ip']['uuid'] === uuid) {
                                            instIPBackRefs[j] = instanceIPsData[k];
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if(subnetDataObjArr.length < 1){
                            //There are no subnets so just return the response from here
                            callback(null, tempVMIResourceObj);
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
                                        for (var i = 0; i < tempVMIResourceObjCnt; i++) {
                                            var vmi = tempVMIResourceObj[i]['virtual-machine-interface'];
                                            var subnetBackRefs = vmi['subnet_back_refs'];
                                            var subnetBackRefsCnt = subnetBackRefs.length;
                                            for(var j = 0; j < subnetBackRefsCnt; j++) {
                                                var uuid = subnetBackRefs[j]['uuid'];
                                                var subnetDataCnt = subnetData.length;
                                                for(var k = 0; k < subnetDataCnt; k++){
                                                    if(subnetData[k]['subnet']['uuid'] === uuid) {
                                                        subnetBackRefs[j] = subnetData[k];
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        callback(null, tempVMIResourceObj);
                            });  //Async for subnet ends
                        }
                });//Async for instance_ip ends
            }
    );
}

function updateVMIDetails(request, appData, postData, callback) {
     var infType = validateQueryParam(request, 'infType');
     if(infType === "logical") {
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

function updatePhysicalRouterWithoutInterfaces (prUUID, appData, callback)
{
    var prUrl = '/physical-router/' + prUUID;
    configApiServer.apiGet(prUrl, appData, function(err, data) {
        if ((null != err) || (null == data) ||
            (null == data['physical-router'])) {
            callback(err, data);
            return;
        }
        if (null != data['physical-router']['physical_interfaces']) {
            data['physical-router']['physical_interfaces'] = [];
        }
        if (null != data['physical-router']['logical_interfaces']) {
            data['physical-router']['logical_interfaces'] = [];
        }
        configApiServer.apiPut(prUrl, data, appData, function(err, data) {
            callback(err, data);
        });
    });
}

function deleteAllInterfaces (req, res, appData)
{
    var dataObjDelArr = [];
    var dataObjGetArr = [];
    var dataObjPhyDelArr = [];
    var entries = [];
    var logUUIDs = [];
    var i = 0, j = 0;
    var pRouterID = req.param('prUUID');
    var prUrl = '/physical-router/' + pRouterID +
        '?fields=physical_interfaces,logical_interfaces';
    configApiServer.apiGet(prUrl, appData, function(err, prConfig) {
        if ((null != err) || (null == prConfig)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var phyInterfaces = prConfig['physical-router']['physical_interfaces'];
        var logInterfaces = prConfig['physical-router']['logical_interfaces'];
        if (null != logInterfaces) {
            var logInterfacesCnt = logInterfaces.length;
            for (var i = 0; i < logInterfacesCnt; i++) {
                logUUIDs.push(logInterfaces[i]['uuid']);
            }
        }
        var chunk = 200;
        var phyInterfacesCnt = 0;
        var phyInterfacesUUIDList = [];
        if (null != phyInterfaces) {
            phyInterfacesCnt = phyInterfaces.length;
            for (var i = 0; i < phyInterfacesCnt; i++) {
                dataObjPhyDelArr.push({'type': 'physical',
                                      'uuid': phyInterfaces[i]['uuid'],
                                      'vmiIdArr': null});
                phyInterfacesUUIDList.push(phyInterfaces[i]['uuid']);
            }
        }
        for (i = 0, j = phyInterfacesCnt; i < j; i += chunk) {
            var tempArray = phyInterfacesUUIDList.slice(i, i + chunk);
            var logUrl = '/logical-interfaces?parent_id=' + tempArray.join(',');
            commonUtils.createReqObj(dataObjGetArr, logUrl, null, null, null,
                                     null, appData);
        }
        async.mapLimit(dataObjGetArr, 100,
                       commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                        true),
                       function(err, logConfigData) {
            var logConfigDataCnt = logConfigData.length;
            for (var i = 0; i < logConfigDataCnt; i++) {
                var logIntfCnt = 0;
                try {
                    var logIntf = logConfigData[i]['logical-interfaces'];
                    logIntfCnt = logIntf.length;
                } catch(e) {
                    logIntfCnt = 0;
                }
                for (var j = 0; j < logIntfCnt; j++) {
                    logUUIDs.push(logIntf[j]['uuid']);
                }
            }
            dataObjGetArr = [];
            var logUUIDsCnt = logUUIDs.length;
            for (i = 0, j = logUUIDsCnt; i < j; i += chunk) {
                var tempArray = logUUIDs.slice(i, i + chunk);
                var logUrl =
                    '/logical-interfaces?detail=true&fields=' +
                    'virtual_machine_interface_refs' +
                    '&obj_uuids=' + tempArray.join(',');
                commonUtils.createReqObj(dataObjGetArr, logUrl, null, null,
                                         null, null, appData);
            }
            async.map(dataObjGetArr,
                           commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                            true),
                           function(error, data) {
                var chunkCnt = data.length;
                for (var i = 0; i < chunkCnt; i++) {
                    if (null != data[i]['logical-interfaces']) {
                        var logIntf = data[i]['logical-interfaces'];
                        var logIntfCnt = logIntf.length;
                        for (j = 0; j < logIntfCnt; j++) {
                            var vmiRefs =
                                logIntf[j]['logical-interface']['virtual_machine_interface_refs'];
                                var vmiIdArr = [];
                            if (null != vmiRefs) {
                                var vmiRefsCnt = vmiRefs.length;
                                for (var k = 0; k < vmiRefsCnt; k++) {
                                    vmiIdArr.push(vmiRefs[k]['uuid']);
                                }
                            }
                            entries.push({'type': 'logical', 'uuid':
                                         logIntf[j]['logical-interface']['uuid'],
                                         'vmiIdArr': vmiIdArr});
                        }
                    }
                }
                deleteInterfacesByUUIDList(entries, req, appData,
                                           function(err, data) {
                    if(err) {
                        commonUtils.handleJSONResponse(err, res, data);
                        return;
                    }
                    if (dataObjPhyDelArr.length > 0) {
                        deleteInterfacesByUUIDList(dataObjPhyDelArr, req,
                                                   appData,
                                                   function(err, data) {
                            if(err) {
                                commonUtils.handleJSONResponse(err, res, data);
                            }
                            updatePhysicalRouterWithoutInterfaces(pRouterID,
                                                                  appData,
                                                                  function(err,
                                                                           data) {
                                commonUtils.handleJSONResponse(err, res, data);
                            });
                        });
                        return;
                    }
                    updatePhysicalRouterWithoutInterfaces(pRouterID, appData,
                                                          function(err, data) {
                        commonUtils.handleJSONResponse(error, res, data);
                    });
                });
            });
        });
    });
}

function buildLIDataObjArr (reqObj, appData)
{
    var type            = reqObj.type;
    var tmpArray        = [];
    var parentType      = reqObj.parentType;
    var parentIDList    = reqObj.parentIDList;
    var dataObjGetArr   = [];

    var chunk = 200;
    var parentIDListCnt = parentIDList.length;
    var reqUrl = '/' + type + 's?detail=true';
    switch (parentType) {
    case 'physical-router':
        if ('physical-interface' == type) {
            reqUrl = reqUrl + '&fields=logical_interfaces';
        } else if ('logical-interface' == type) {
            reqUrl = reqUrl + '&fields=virtual_machine_interface_refs';
        }
        break;
    case 'physical-interface':
        reqUrl = reqUrl + '&fields=virtual_machine_interface_refs'
        break;
    default:
        break;
    }
    var chunk = 200;
    for (var i = 0, j = parentIDListCnt; i < j; i += chunk) {
        tmpArray = parentIDList.slice(i, i + chunk);
        var piUrl = reqUrl + '&parent_id=' + tmpArray.join(',');
        commonUtils.createReqObj(dataObjGetArr, piUrl, null, null, null, null,
                                 appData);
    }
    return dataObjGetArr;
}

function getInterfaceDetails (req, res, appData)
{
    var body = req.body;
    var type = body.type;
    var fqnUUID = body.fqnUUID;
    var parentType = body.parentType;
    var liUUIDList = body.liUUIDList;
    var dataObjGetArr = buildLIDataObjArr(body, appData);
    var liData = [];
    var tmpLiVmiObjs = {};
    var uuidList = [];
    var chunk = 200;
    var vmiObjs = {};
    var instIpObjs = {};
    var error = null;
    if ((null == dataObjGetArr) || (!dataObjGetArr.length)) {
        error = new appErrors.RESTServerError("All params are not set");
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    async.map(dataObjGetArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        var resCnt = results.length;
        for (var i = 0; i < resCnt; i++) {
            if (null != results[i]) {
                liData = liData.concat(results[i][type + 's']);
            }
        }
        if (type == 'physical-interface') {
            commonUtils.handleJSONResponse(null, res, liData);
            return;
        }
        var liCnt = liData.length;
        for (var i = 0; i < liCnt; i++) {
            var vmiRef = liData[i]['logical-interface']
                                  ['virtual_machine_interface_refs'];
            if (null != vmiRef) {
                var vmiCnt = vmiRef.length;
                for (var j = 0; j < vmiCnt; j++) {
                    var vmiId = vmiRef[j]['uuid'];
                    if (null == tmpLiVmiObjs[vmiId]) {
                        tmpLiVmiObjs[vmiId] = [];
                    }
                    tmpLiVmiObjs[vmiId].push(i);
                    uuidList.push(vmiId);
                }
            }
        }
        uuidsCnt = uuidList.length;
        dataObjGetArr = [];
        for (i = 0, j = uuidsCnt; i < j; i += chunk) {
            tmpArray = uuidList.slice(i, i + chunk);
            var reqUrl = '/virtual-machine-interfaces?detail=true&fields=subnet_back_refs,instance_ip_back_refs&obj_uuids=' +
                tmpArray.join(',');
            commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null,
                                     null, appData);
            reqUrl = '/instance-ips?detail=true&back_ref_id=' +
                tmpArray.join(',');
            commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null,
                                     null, appData);
        }
        if (!dataObjGetArr.length) {
            commonUtils.handleJSONResponse(null, res, liData);
            return;
        }
        async.map(dataObjGetArr,
                  commonUtils.getServerResponseByRestApi(configApiServer, true),
                  function(err, results) {
            var vmiResp = [];
            var instIpsResp = [];
            var resCnt = results.length;
            for (var i = 0; i < resCnt; i++) {
                var index = 0 + i * 2;
                if ((null != results[index]) &&
                    (null != results[index]['virtual-machine-interfaces']) &&
                    (results[index]['virtual-machine-interfaces'].length > 0)) {
                    vmiResp =
                        vmiResp.concat(results[index]['virtual-machine-interfaces']);
                }
                index = 1 + i * 2;
                if ((null != results[index]) &&
                    (null != results[index]['instance-ips']) &&
                    (results[index]['instance-ips'].length > 0)) {
                    instIpsResp =
                        instIpsResp.concat(results[index]['instance-ips']);
                }
            }
            var vmiIdList = [];
            var vmiCnt = vmiResp.length;
            for (i = 0; i < vmiCnt; i++) {
                vmiId = vmiResp[i]['virtual-machine-interface']['uuid'];
                vmiObjs[vmiId] = vmiResp[i];
                vmiIdList.push(vmiId);
            }
            var instIpsRespCnt = instIpsResp.length;
            for (var i = 0; i < instIpsRespCnt; i++) {
                var vmiRef =
                    instIpsResp[i]['instance-ip']['virtual_machine_interface_refs'];
                if ((null == vmiRef) || (null == vmiRef[0])) {
                    continue;
                }
                vmiRef = vmiRef[0];
                var vmiId = vmiRef['uuid'];
                if ((null == vmiObjs[vmiId]) ||
                    (null == tmpLiVmiObjs[vmiId])) {
                    continue;
                }
                if (null == instIpObjs[vmiId]) {
                    instIpObjs[vmiId] = [];
                }
                instIpObjs[vmiId].push(instIpsResp[i]);
            }
            dataObjGetArr = [];
            var vmiCnt = vmiIdList.length;
            for (i = 0, j = vmiCnt; i < j; i += chunk) {
                tmpArray = vmiIdList.slice(i, i + chunk);
                reqUrl = '/subnets?detail=true&back_ref_id=' +
                    tmpArray.join(',');
                commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null,
                                         null, null, appData);
            }
            if (!dataObjGetArr.length) {
                var newLiData =
                    buildLIData(liData, vmiResp, tmpLiVmiObjs, vmiObjs, instIpsResp,
                                null, null);
                commonUtils.handleJSONResponse(null, res, newLiData);
                return;
            }
            var subnetData = [];
            async.map(dataObjGetArr,
                      commonUtils.getServerResponseByRestApi(configApiServer, true),
                      function(err, results) {
                var resCnt = results.length;
                for (var i = 0; i < resCnt; i++) {
                    subnetData = subnetData.concat(results[i]['subnets']);
                }
                var subnetObjs = {};
                var subnetCnt = subnetData.length;
                for (i = 0; i < subnetCnt; i++) {
                    var vmiRefs =
                        subnetData[i]['subnet']['virtual_machine_interface_refs'];
                    var vmiRefsCnt = vmiRefs.length;
                    for (j = 0; j < vmiRefsCnt; j++) {
                        vmiId = vmiRefs[j]['uuid'];
                        if (null == subnetObjs[vmiId]) {
                            subnetObjs[vmiId] = [];
                        }
                        subnetObjs[vmiId].push(i);
                    }
                }
                var newLiData =
                    buildLIData(liData, vmiResp, tmpLiVmiObjs, vmiObjs, instIpsResp,
                                subnetObjs, subnetData);
                commonUtils.handleJSONResponse(null, res, newLiData);
                return;
            });
        });
    });
}

function buildLIData (liData, vmiResp, tmpLiVmiObjs, vmiObjs, instIpsResp, subnetObjs,
                      subnetData)
{
    var vmiRespCnt = vmiResp.length;
    for(var i = 0; i < vmiRespCnt; i++) {
        var vmi = vmiResp[i]['virtual-machine-interface'];
        var instIPBackRefs = vmi['instance_ip_back_refs'];
        var subnetBackRefs = vmi['subnet_back_refs'];
        if(instIPBackRefs != null && instIPBackRefs.length > 0) {
            var instIPBackRefsCnt = instIPBackRefs.length;
            for(var j = 0; j < instIPBackRefsCnt; j++) {
                var uuid = instIPBackRefs[j]['uuid'];
                var instIpsRespCnt = instIpsResp.length;
                for(var k = 0; k < instIpsRespCnt; k++) {
                    if(instIpsResp[k]['instance-ip']['uuid'] === uuid) {
                        instIPBackRefs[j] = instIpsResp[k];
                        break;
                    }
                }
            }
        }
        if(subnetData != null && subnetBackRefs != null
            && subnetBackRefs.length > 0) {
            var subnetBackRefsCnt = subnetBackRefs.length;
            for(var j = 0; j < subnetBackRefsCnt; j++) {
                var uuid = subnetBackRefs[j]['uuid'];
                var subnetDataCnt = subnetData.length;
                for(var k = 0; k < subnetDataCnt; k++){
                    if(subnetData[k]['subnet']['uuid'] === uuid) {
                        subnetBackRefs[j] = subnetData[k];
                        break;
                    }
                }
            }
        }
    }

    if(vmiResp != null && vmiResp.length > 0) {
        var liDataCnt = liData.length;
        for(var i = 0; i < liDataCnt; i++) {
            var lInterface = liData[i]['logical-interface'];
            var vmiRefs = lInterface['virtual_machine_interface_refs'];
            if(vmiRefs != null && vmiRefs.length > 0) {
                var vmiRefsCnt =  vmiRefs.length;
                for(var j = 0; j < vmiRefsCnt; j++) {
                    var uuid = vmiRefs[j].uuid;
                    var vmiRespCnt = vmiResp.length;
                    for(var k = 0; k < vmiRespCnt; k++) {
                        if(vmiResp[k]['virtual-machine-interface'].uuid === uuid) {
                            vmiRefs[j] = vmiResp[k];
                            break;
                        }
                    }
                }
            }
        }
    }
    return liData;
}

function listPhysicalInterfaces (req, res, appData)
{
    var url = '/physical-interfaces';
    configApiServer.apiGet(url, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

 /* List all public function here */
exports.createPhysicalInterfaces = createPhysicalInterfaces;
exports.createPhysicalInterfacesCB = createPhysicalInterfacesCB;
exports.updatePhysicalInterfaces = updatePhysicalInterfaces;
exports.updatePhysicalInterfacesCB = updatePhysicalInterfacesCB;
exports.deletePhysicalInterfaces = deletePhysicalInterfaces;
exports.deleteInterfaces = deleteInterfaces;
exports.mapVirtualMachineRefs = mapVirtualMachineRefs;
exports.deleteLIVirtualMachines = deleteLIVirtualMachines;
exports.mapVMIRefsToSubnet = mapVMIRefsToSubnet;
exports.deleteLISubnet = deleteLISubnet;
exports.readLIDetails = readLIDetails;
exports.deleteAllInterfaces = deleteAllInterfaces;
exports.getInterfaceDetails = getInterfaceDetails;
exports.listPhysicalInterfaces = listPhysicalInterfaces;

