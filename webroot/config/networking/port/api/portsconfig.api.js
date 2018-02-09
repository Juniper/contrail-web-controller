/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @portsconfig.api.js
 *     - Handlers for Port Configuration
 *     - Interfaces with config api server
 */

//var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors');
var computeApi = require(process.mainModule.exports["corePath"] +
                         '/src/serverroot/common/computemanager.api');
var util = require('util');
var url = require('url');
var UUID = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var configUtil = require('../../../common/api/configUtil.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');
var _ = require('lodash');

/**
 * Bail out if called directly as "nodejs portsconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @readPorts
 * Pubilc function
 * URL :/api/admin/config/get-data?type=ports&count=
 * 1. Pagination function to read each port
 * 2. Read the list of ports
 */

function readPorts (portsObj, callback)
{
    var dataObjArr = portsObj['reqDataArr'];
    if (!dataObjArr.length) {
        var error = new appErrors.RESTServerError('Invalid virtual machine interface Data');
        callback(error,null);
        return;
    }
    async.map(dataObjArr, getPortsAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @getPortsAsync
 * private function
 * 1. Callback for readPorts
 * 2. Reads the response of per vmi's list from config api server
 *    and sends it back to the client.
 */
function getPortsAsync (portsObj, callback)
{
    var portId = portsObj['uuid'];
    var appData = portsObj['appData'];
    var reqUrl = '/virtual-machine-interface/' + portId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        if (err) {
            callback(null, null);
            return; 
        }
        getVirtualMachineInterfaceCb(err, data, appData, callback);
    });
}
 
/**
 * @getVirtualMachineInterfaceCb
 * private function
 * 1. Called from getPortsAsync
 * 2. Create the data object for all reference link
 *    like Floating object, Instance Ip, Rout table and
 *    the mergeVMIResponse is called for formating the result object.
 * 3. The result is sent back to getPortsAsync.
 */
function getVirtualMachineInterfaceCb (err, vmiData, appData, callback)
{
    var dataObjArr            = [];
    var floatingipPoolRefsLen = 0;
    var fixedipPoolRefsLen    = 0;
    var floatingipPoolRef     = null;
    var fixedipPoolRef        = null;
    var floatingipObj         = null;
    var fixedipObj            = null;

    if(!('virtual-machine-interface' in vmiData)){
        var error = new appErrors.RESTServerError('Invalid virtual machine interface Data');
        callback(error, null);
        return; 
    }
    if ('floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        floatingipPoolRef = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefsLen = floatingipPoolRef.length;
    }
    for (i = 0; i < floatingipPoolRefsLen; i++) {
        floatingipObj = floatingipPoolRef[i];
        reqUrl = '/floating-ip/' + floatingipObj['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }
    if ('instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefsLen = fixedipPoolRef.length;
    }
    for (i = 0; i < fixedipPoolRefsLen; i++) {
        fixedipObj = fixedipPoolRef[i];
        reqUrl = '/instance-ip/' + fixedipObj['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    if (!dataObjArr.length) {
        callback(err,vmiData);
        return;
    }

    async.map(dataObjArr,
    commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
    function(error, results) {
        if (error) {
            callback(error, vmiData);
            return;
        }
        mergeVMIResponse(results, vmiData,
                     floatingipPoolRefsLen,
                     appData, function(vmiData){
                         callback(error, vmiData);
                    });
    });
}

/**
 * @mergeVMIResponse
 * private function
 * 1. called from getVirtualMachineInterfaceCb
 * 2. Result object will be merged with the VMI object
 * 3. The result is sent back to getVirtualMachineInterfaceCb.
 */
function mergeVMIResponse (results, vmiData, floatingipPoolRefsLen, appData, callback)
{
    var i = 0;
    var ipPoolsLen = results.length;
    var instanceIPLen = ipPoolsLen;

    for (i = 0; i < floatingipPoolRefsLen; i++) {
        if (results[i] != null) {
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'] = {};
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'].ip =
                     results[i]['floating-ip']['floating_ip_address'];
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'].subnet_uuid =
                     results[i]['floating-ip']['subnet_uuid'];
        }
    }

    for (i = floatingipPoolRefsLen; i < instanceIPLen; i++) {
        if (results[i]) {
            vmiData['virtual-machine-interface']['instance_ip_back_refs'][i - floatingipPoolRefsLen]['fixedip'] = {};
            vmiData['virtual-machine-interface']['instance_ip_back_refs'][i - floatingipPoolRefsLen]['fixedip'].ip =
                     results[i]['instance-ip']['instance_ip_address'];
            if ("subnet_uuid" in results[i]['instance-ip']) {
                vmiData['virtual-machine-interface']['instance_ip_back_refs'][i - floatingipPoolRefsLen]['fixedip'].subnet_uuid =
                     results[i]['instance-ip']['subnet_uuid'];
            }
        }
    }
    callback(vmiData);
}

 /**
 * @createPortCB
 * public function
 * 1. Creating port VMI
 * 2. Sets Post Data and sends back to the called function
 */
function createPortCB (dataObj, callback)
{
    var req = dataObj.request;
    var response = dataObj.response;
    var appData = dataObj.appData;
    var data = dataObj.data;

    createPortValidate(req, data, appData, function(error, results) {
        callback(error, results);
    }) ;
}

/**
 * @createPort
 * public function
 * 1. URL /api/tenants/config/ports Post
 * 2. Set Post Data and sends back the port Detail(VMI) to client
 */
function createPort (request, response, appData)
{
    createPortValidate(request, request.body, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    }) ;
}

/**
 * @createPortValidate
 * private function
 * 1. Basic validation before creating the port(VMI)
 */
function createPortValidate (request, data, appData, callback)
{
    var portsCreateURL = '/virtual-machine-interfaces';
    var portPostData = data;
    var orginalPortData = commonUtils.cloneObj(data);

    if (typeof(portPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }

    if ((!('virtual-machine-interface' in portPostData)) ||
        (!('fq_name' in portPostData['virtual-machine-interface']))) {
        error = new appErrors.RESTServerError('Enter Port Name ');
        callback(error, null);
        return;
    }

    if (portPostData['virtual-machine-interface']['fq_name'].length == 2) {
        var uuid = UUID.create();
        portPostData["virtual-machine-interface"]["uuid"] = uuid['hex'];
        portPostData["virtual-machine-interface"]["fq_name"][2] = uuid['hex'];
        portPostData["virtual-machine-interface"]["display_name"] = uuid['hex'];
        portPostData["virtual-machine-interface"]["name"] = uuid['hex'];
    }

    if ('instance_ip_back_refs' in portPostData['virtual-machine-interface']) {
        delete portPostData['virtual-machine-interface']['instance_ip_back_refs'];
    }

    if ('virtual_machine_refs' in portPostData['virtual-machine-interface']){
        delete portPostData['virtual-machine-interface']['virtual_machine_refs'];
    }
    
/*    if ('virtual_machine_interface_refs' in portPostData['virtual-machine-interface']){
        delete portPostData['virtual-machine-interface']['virtual_machine_interface_refs'];
    }*/
    
    var lrUUID = "";
    if ('logical_router_back_refs' in portPostData['virtual-machine-interface']) {
        if (portPostData['virtual-machine-interface']['logical_router_back_refs'].length === 1) {
            lrUUID = portPostData['virtual-machine-interface']['logical_router_back_refs'][0]['uuid'];
        }
        delete portPostData['virtual-machine-interface']['logical_router_back_refs'];
    }
    if (('virtual_machine_interface_device_owner' in portPostData['virtual-machine-interface']) && 
        (portPostData['virtual-machine-interface']["virtual_machine_interface_device_owner"]).substring(0,7) == "compute"){
        //portPostData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
        delete portPostData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
    }
    configApiServer.apiPost(portsCreateURL, portPostData, appData,
                            function(error, vmisData) {
        if (error) {
            callback(error, null);
            return;
        }
        var portId = vmisData['virtual-machine-interface']['uuid'];
        readVMIwithUUID(portId, appData, function(err, vmiData){
            if (err) {
                callback(err, vmiData);
                return;
            }
            portSendResponse(error, request, vmiData, orginalPortData, appData, function (err, results) {
                    callback(err, results);
                    return;
            });
        });
    });
}

/**
 * @createFixedIPDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Set the VMI reference in fixed IP object
      and return back to create the seperate Instance Ip.
 */
function createFixedIPDataObject (response,portConfig, fixedip)
{
    if (fixedip != null && fixedip != "") {
        var fixedIpObj = {};
        fixedIpObj["instance-ip"] = {};
        uuid = UUID.create();
        fixedIpObj["instance-ip"]["fq_name"] = [];
        fixedIpObj["instance-ip"]["fq_name"][0] = uuid['hex'];
        fixedIpObj["instance-ip"]["display_name"] = uuid['hex'];
        fixedIpObj["instance-ip"]["name"] = uuid['hex'];
        fixedIpObj["instance-ip"]["uuid"] = uuid['hex'];
        if ('fixedIp' in fixedip['instance_ip_address'][0]) {
            fixedIpObj["instance-ip"]["instance_ip_address"] = fixedip['instance_ip_address'][0]["fixedIp"];
        }
        fixedIpObj["instance-ip"]["subnet_uuid"] = fixedip["subnet_uuid"];
        if("instance_ip_family" in fixedip) {
            fixedIpObj["instance-ip"]["instance_ip_family"] = fixedip["instance_ip_family"];
        }
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"] = [];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0] = {};
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
        if ('virtual_network_refs' in portConfig['virtual-machine-interface']) {
        fixedIpObj["instance-ip"]["virtual_network_refs"] = [];
        fixedIpObj["instance-ip"]["virtual_network_refs"] = portConfig['virtual-machine-interface']['virtual_network_refs'];
        }
        response = fixedIpObj;
    }
    return response;
}

/**
 * @portSendResponse
 * private function
 * 1. Callback for Ports create operations
 * 2. Create/Read the seperate data object for
 *    Floating IP, Logical Router, Fixed IP.
 */
function portSendResponse (error, req, portConfig, orginalPortData, appData, callback)
{
    var instIpPostDataObjArr = [];
    if (error) {
        callback(error, null);
        return;
    }

    var fixedIpPoolRef = null;
    var fixedIpPoolRefLen = 0;
    var DataObjectArr = [];
    if (('instance_ip_back_refs' in orginalPortData['virtual-machine-interface']) &&
       (orginalPortData['virtual-machine-interface']['instance_ip_back_refs'].length > 0)) {
        fixedIpPoolRef = orginalPortData['virtual-machine-interface']['instance_ip_back_refs'];
        if (fixedIpPoolRef != null && fixedIpPoolRef != "") {
            fixedIpPoolRefLen = fixedIpPoolRef.length;
        }
    }

    if (fixedIpPoolRefLen > 0) {
        var instanceCreateURL = '/instance-ips';
        for (var i = 0; i < fixedIpPoolRefLen; i++) {
            var responceData = {};
            responceData = createFixedIPDataObject(responceData,portConfig,fixedIpPoolRef[i]);
            commonUtils.createReqObj(instIpPostDataObjArr, instanceCreateURL,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(responceData), null, null,
                                     appData);
        }
    }

    var currentVMIRef = {
        'to': portConfig["virtual-machine-interface"]['fq_name'],
        'uuid': portConfig["virtual-machine-interface"]['uuid']
    };
    //For Logical router
    var key = "logical_router_back_refs",
        urlRef = "logical-router";

    if (('logical_router_back_refs' in orginalPortData['virtual-machine-interface']) &&
       (orginalPortData['virtual-machine-interface']['logical_router_back_refs'].length > 0)) {
        var logicalRouter = orginalPortData['virtual-machine-interface']['logical_router_back_refs'];
        if (logicalRouter != null && logicalRouter != "") {
            updateDataObjArrWithRefObj (DataObjectArr, logicalRouter, currentVMIRef,
                 urlRef, "ADD", appData);
        }
    }
    //For Floating IP
    key = "floating_ip_back_refs";
    urlRef = "floating-ip";
    if ('floating_ip_back_refs' in orginalPortData['virtual-machine-interface']) {
        var floatingipPoolRef = orginalPortData['virtual-machine-interface']['floating_ip_back_refs'];
        updateDataObjArrWithRefObj (DataObjectArr, floatingipPoolRef, currentVMIRef,
                 urlRef, "ADD", appData);
    }

    updateAvailableDataforCreate(DataObjectArr, instIpPostDataObjArr, portConfig, function(error, result) {
        if (error) {
            callback(error, null);
            return;
        }
        if ("virtual_machine_interface_device_owner" in orginalPortData["virtual-machine-interface"] &&
           (orginalPortData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
            body = {};
            body.portID = portConfig["virtual-machine-interface"]["uuid"];
            body.vmUUID = orginalPortData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
            attachVMICompute(req, body, function (novaError, results){
                callback(novaError, results);
                return;
            });
        } else {
            callback(error, result);
            return;
        }
    });
}

/**
 * @updateAvailableDataforCreate
 * public callback function
 * 1. Execute the processed dataObject Array
 * 2. Return back the result to the called function.
 */
function updateAvailableDataforCreate(DataObjectArr, instIpPostDataObjArr, portConfig, callback)
{
    async.map(instIpPostDataObjArr, createInstIP, function(err, result) {
        if ((null != err) || (null == result)) {
            callback(err, result);
            return;
        }
        if (0 === DataObjectArr.length) {
            var href = _.result(result, "0.instance-ip.href", null);
            var to = _.result(result, "0.instance-ip.fq_name", null);
            var uuid = _.result(result, "0.instance-ip.uuid", null);
            portConfig['virtual-machine-interface']['instance_ip_back_refs']= [];
            portConfig['virtual-machine-interface']['instance_ip_back_refs'].push({
                href: href, to: to, uuid: uuid
            })
            callback(null, portConfig)
            return;
        }
        async.map(DataObjectArr,
            commonUtils.getServerResponseByRestApi(configApiServer, true),
            function(error, results) {
                callback(error, portConfig);
        });
    });
}

/**
 * @updatePortsCB
 * public callback function
 * 1. Update the ports from config api server
 * 2. Return back the result to the called function.
 */
function updatePortsCB (dataObject, callback)
{
    var portId = "";
    var portPutData = dataObject.data;
    var appData = dataObject.appData;
    var request = dataObject.request;
    portId = _.get(portPutData, 'virtual-machine-interface.uuid', null);
    readVMIwithUUID(portId, appData, function(err , vmiData){
        updateVMIFlow(err, request, portPutData, vmiData, appData, function(error, protUpdateConfig) {
            if (error) {
                callback(error, null);
            } else {
                callback(error, vmiData);
            }
            return;
        });
    });
}

/**
 * @updatePorts
 * public function
 * 1. URL /api/tenants/config/ports/:id
 * 2. Update the ports from config api server
 * 3. Return back the result to http.
 */
function updatePorts (request, response, appData)
{
    var portId = "";
    portId = request.param('uuid');
    var portPutData = request.body;
    readVMIwithUUID(portId, appData, function(err , vmiData){
        updateVMIFlow(err, request, portPutData, vmiData, appData, function(error, protUpdateConfig) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                commonUtils.handleJSONResponse(error, response, protUpdateConfig);
            }
            return;
        });
    });
}

/**
 * @updateVMIFlow
 * private function
 * 1. update port main flow starts hear.
 * 2. Using water flow to process each step of function
 */

function updateVMIFlow (err, request, portPutData, vmiData, appData, callback) {
    if (!('virtual-machine-interface' in vmiData) ||
        !('uuid' in vmiData['virtual-machine-interface'])) {
        var error = new appErrors.RESTServerError('Invalid virtual machine interface Data');
        callback(error, results);
    }
    if (!('virtual-machine-interface' in portPutData) ||
        !('uuid' in portPutData['virtual-machine-interface'])) {
        var error = new appErrors.RESTServerError('Invalid virtual machine interface Data');
        callback(error, results);
    }
    var dataObject =
    {
        "err": err,
        "request": request,
        "portPutData": portPutData,
        "vmiData" : vmiData,
        "appData": appData
    }
    async.waterfall([
        async.apply(compareCreateRefObject, dataObject),
        processDataObjects,
        deviceOwnerChange,
        deleteAllReference,
        updateVMI
    ],
    function (err, results){
        callback(err, results);
    });
}


/**
 * @attachVMICompute
 * private function
 * 1. Callback for Ports create or update operations
 * 2. call the api to attach the VN object to VMI
 */
function attachVMICompute (req, body, callback)
{
    computeApi.portAttach(req, body, function(err, data) {
        callback(err, data);
        return;
    });
}

/**
 * @detachVMICompute
 * private function
 * 1. Callback for Ports create or update operations
 * 2. call the api to detach the VN object to VMI
 */
function detachVMICompute (req, body, callback)
{
    computeApi.portDetach(req,  body.portID, body.vmUUID, function(err, data) {
        callback(err, data);
        return;
    });
}

/**
 * @compareCreateRefObject
 * private function
 * 1. Callback for Ports update operations
 * 2. Compare the data from UI and data from server is compared and
 *    corresponding read/create/update data object is created.
 */

function compareCreateRefObject (dataObject, callback)
{
//error, request, portPutData, vmiData, appData,
    if (dataObject.error) {
        callback(dataObject.error, null);
        return;
    }
    var vmiData = dataObject.vmiData,
        portPutData = dataObject.portPutData,
        request = dataObject.request,
        appData = dataObject.appData,
        error = dataObject.error;

    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    var DataObjectLenDetail = [],
        DataObjectArr = [],
        DataObjectDelArr = [],
        tempVmiData = vmiData['virtual-machine-interface'],
        tempPutData = portPutData['virtual-machine-interface'];
    var currentVMIRef = {
        'to': portPutData["virtual-machine-interface"]['fq_name'],
        'uuid': portPutData["virtual-machine-interface"]['uuid']
    };
    //For Floating IP
    var key = "floating_ip_back_refs",
        urlRef = "floating-ip";
    DataObjectArr = getDiffDataRefObjPerKey (key, urlRef, tempVmiData, tempPutData,
                             DataObjectArr, currentVMIRef, appData);
    //fixed ip
    key = "instance_ip_back_refs";
    if (!portPutData.simple_edit && (key in tempPutData || key in tempVmiData)) {
        filterUpdateFixedIP(error, portPutData, vmiData, appData, function(createFixedIp,deleteFixedip){
            if (createFixedIp != null && createFixedIp != "") {
                if (createFixedIp.length > 0) {
                    for (var i = 0; i < createFixedIp.length; i++) {
                        var fixedIPURL = '/instance-ips';
                        responceData = {};
                        responceData = createFixedIPDataObject(responceData,portPutData,createFixedIp[i]);
                        commonUtils.createReqObj(DataObjectArr, fixedIPURL,
                                     global.HTTP_REQUEST_POST, commonUtils.cloneObj(responceData), configApiServer, null,
                                     appData);
                    }
                }
            }

            if (deleteFixedip != null && deleteFixedip != "") {
                if (deleteFixedip.length > 0) {
                    for (var i = 0; i < deleteFixedip.length; i++) {
                        var fixedIPURL = '/instance-ip/'+deleteFixedip[i]["uuid"];
                        commonUtils.createReqObj(DataObjectDelArr, fixedIPURL,
                                     global.HTTP_REQUEST_DEL, null, configApiServer, null,
                                     appData);
                    }
                }
            }
        });
    }

    //bridge domains
    key = "bridge_domain_refs";
    urlRef = "bridge-domain";
    DataObjectArr = getDiffDataRefObjPerKeyOnVMI (key, urlRef, tempVmiData, tempPutData,
            DataObjectArr, currentVMIRef, appData);

    //call to processDataObjects
    callback(null, error, DataObjectArr, DataObjectDelArr, vmiData, portPutData,
             request, appData)
}

/**
 * @getDiffDataRefObjPerKey
 * private function
 * 1. Utility function to find the diff of the object as per the key.
 * 2. Find the diff for the key passed through.
 * 3. Create the ref update object in an array and return back the called function
 */
function getDiffDataRefObjPerKey (key, urlRef, tempVmiData, tempPutData, DataObjectArr, currentVMIRef, appData) {
    if (key in tempVmiData || key in tempPutData) {
        if (key in tempVmiData) {
            tempVmiData[key] = deleteAttrHrefinKeyObject(tempVmiData[key]);
        }
        var result = jsonDiff.getConfigArrayDelta(key, tempVmiData[key], tempPutData[key]);
        if (result != null) {
            //Add Ref for specified Key();
            if (result.addedList.length > 0) {
                updateDataObjArrWithRefObj (DataObjectArr, result.addedList, currentVMIRef,
                             urlRef, "ADD", appData);
            }
            //Delete Ref for specified Key();
            if (result.deletedList.length > 0) {
                updateDataObjArrWithRefObj (DataObjectArr, result.deletedList, currentVMIRef,
                        urlRef, "DELETE", appData);
            }
        }
    }
    return DataObjectArr;
}

/**
 * @getDiffDataRefObjPerKeyOnVMI
 * private function
 * 1. Utility function to find the diff of the object as per the key.
 * 2. Find the diff for the key passed through.
 * 3. Create the ref update object in an array and return back the called function
 */
function getDiffDataRefObjPerKeyOnVMI (key, urlRef, tempVmiData, tempPutData, DataObjectArr, currentVMIRef, appData) {
    if (key in tempVmiData || key in tempPutData) {
        if (key in tempVmiData) {
            tempVmiData[key] = deleteAttrHrefinKeyObject(tempVmiData[key]);
        }
        var result = jsonDiff.getConfigArrayDelta(key, tempVmiData[key], tempPutData[key]);
        if (result != null) {
            //Add Ref for specified Key();
            if (result.addedList.length > 0) {
                updateDataObjArrWithRefObjOnVMI (DataObjectArr, result.addedList, currentVMIRef,
                             urlRef, "ADD", appData);
            }
            //Delete Ref for specified Key();
            if (result.deletedList.length > 0) {
                updateDataObjArrWithRefObjOnVMI (DataObjectArr, result.deletedList, currentVMIRef,
                        urlRef, "DELETE", appData);
            }
        }
    }
    return DataObjectArr;
}

/**
 * @deleteAttrHrefinKeyObject
 * private function
 * 1. Utility function to remove href and attr.
 * 2. Before Doing a getConfigArrayDelta we must remove the href and attr attribute
 */
function deleteAttrHrefinKeyObject(tempVmiKeyData) {
    if (tempVmiKeyData.length > 0) {
        var tempVmiKeyDataLength = tempVmiKeyData.length;
        for (var i = 0; i < tempVmiKeyDataLength; i++) {
            if ("attr" in tempVmiKeyData[i]) {
                delete tempVmiKeyData[i]["attr"];
            }
            if ("href" in tempVmiKeyData[i]) {
                delete tempVmiKeyData[i]["href"];
            }
        }
    }
    return tempVmiKeyData;
}

/**
 * @updateDataObjArrWithRefObj
 * private function
 * 1. Utility function to create refUpdate object array
 */
function updateDataObjArrWithRefObj(dataObjArr, refsData, currentPortRefs,
                                 type, op, appData)
{
    var parentType = 'project';
    var refsCnt = refsData.length;
    for (var i = 0; i < refsCnt; i++) {
        var putData = {
            'type': type,
            'uuid': refsData[i]['uuid'],
            'ref-type': 'virtual-machine-interface',
            'ref-uuid': currentPortRefs['uuid'],
            'ref-fq-name': currentPortRefs['to'],
            'operation': op,
            'attr': refsData[i]['attr']
        };
        var reqUrl = '/ref-update';
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(putData), null,
                                 null, appData);
    }
}

/**
 * @updateDataObjArrWithRefObj
 * private function
 * 1. Utility function to create refUpdate object array on VMI
 */
function updateDataObjArrWithRefObjOnVMI(dataObjArr, refsData, currentPortRef,
                                 type, op, appData)
{
    var parentType = 'project';
    var refsCnt = refsData.length;
    for (var i = 0; i < refsCnt; i++) {
        var putData = {
            'type': 'virtual-machine-interface',
            'uuid': currentPortRef['uuid'],
            'ref-type': type,
            'ref-fq-name': refsData[i]['to'],
            'operation': op,
            'attr': refsData[i]['attr']
        };
        var reqUrl = '/ref-update';
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(putData), null,
                                 null, appData);
    }
}


/**
 * @createInstIP
 * private function
 * 1. To Create the instance IP(Fixed-ip).
 * 2. Used at the time of creating the VMI(port)
 */
function createInstIP (dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var data = dataObj['data'];
    var appData = dataObj['appData'];
    configApiServer.apiPost(reqUrl, data, appData, function(err, result) {
        if (null != err) {
            if ((null == data['instance-ip']['subnet_uuid']) &&
                ('v6' != data['instance-ip']['instance_ip_family'])) {
                data['instance-ip']['instance_ip_family'] = 'v6';
                configApiServer.apiPost(reqUrl, data, appData,
                                        function(err, result) {
                    callback(err, result);
                    return;
                });
            } else {
                callback(err, result);
                return;
            }
        } else {
            callback(err, result);
        }
    });
}


/**
 * @processDataObjects
 * private function
 * 1. Part of Updateing VMI object through waterfall
 * 2. Created ref update(Not the delete of fixed ip) object is executed in this function
 */
function processDataObjects (error, DataObjectArr, DataObjectDelArr, vmiData,
                             portPutData, request, appData, callback)
{
    var portPutURL = '/virtual-machine-interface/';
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    portPutURL += vmiUUID;
    if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, false),
        function(locError, result) {
            error = appendErrorMessage(locError, error);
            //Call to deviceOwnerChange
            callback(null, error, result, DataObjectDelArr, portPutData, vmiData, request, appData);
            return;
        });
    } else {
        //Call to deviceOwnerChange
        callback(null, error, [], DataObjectDelArr, portPutData, vmiData, request, appData);
        return;
    }
}

/**
 * @appendErrorMessage
 * private function
 * 1. Utility function to append the error message to the error object
 */
function appendErrorMessage(newError, existingError) {
    if (newError) {
        if (existingError != null) {
            existingError.message += "<br>" + newError.message;
        } else {
            existingError = newError;
        }
    }
    return existingError;
}


/**
 * @deleteAllReference
 * private function
 * 1. Callback for Ports update operations Part of waterfall model
 * 2. Send a call to delete fixed IP refence in DataObjectDelArr.
 * 3. If no DataObjectDelArr available then pass back to the waterfall model
 */
function deleteAllReference (error, DataObjectDelArr, portPutData, appData, callback)
{
    if (0 == DataObjectDelArr.length) {
        //callback to updateVMI
        callback(null, error, portPutData, appData);
        return;
    } else {
        async.map(DataObjectDelArr,
        commonUtils.getAPIServerResponse(configApiServer.apiDelete, true),
        function(locError, results) {
            error = appendErrorMessage(locError, error);
            //callback to updateVMI
            callback(null, error, portPutData, appData);
            return;
        });
    }
}

/**
 * @updateVMI
 * private function
 * 1. Callback for Ports update operations part of waterfall model 
 * 2. Send a call to Update the VMI diff logic is impliemented.
 */
function updateVMI (error, portPutData, appData, callback)
{
    var portPutURL = '/virtual-machine-interface/';
    var vmiUUID = portPutData['virtual-machine-interface']['uuid'];
    portPutURL += vmiUUID;
    portPutData = removeRefs(portPutData);
    portPutData = removeBackRef(portPutData);
    delete portPutData.simple_edit;
    jsonDiff.getConfigDiffAndMakeCall(portPutURL, appData, portPutData,
                                          function(locError, data) {
        error = appendErrorMessage(locError, error);
        callback(error, data);
    });
}

/**
 * @removeBackRef
 * private function
 * 1. Callback for Ports update operations
 * 2. If any back refence is available in the object from UI
 *    remove it from the object
 */
function removeBackRef (portPutData)
{
    if ("instance_ip_back_refs" in portPutData["virtual-machine-interface"]) {
        delete portPutData["virtual-machine-interface"]["instance_ip_back_refs"];
    }
    if ("logical_router_back_refs" in portPutData["virtual-machine-interface"]) {
        delete portPutData["virtual-machine-interface"]["logical_router_back_refs"];
    }
    if ("floating_ip_back_refs" in portPutData["virtual-machine-interface"]) {
        delete portPutData["virtual-machine-interface"]["floating_ip_back_refs"];
    }
    return portPutData;
}

/**
 * @removeRef
 * private function
 * 1. Callback for Ports update operations
 * 2. If any reference is available in the object from UI
 *    remove it from the object
 */
function removeRefs (portPutData)
{
    if ("bridge_domain_refs" in portPutData["virtual-machine-interface"]) {
        delete portPutData["virtual-machine-interface"]["bridge_domain_refs"];
    }
    return portPutData;
}

/**
 * @deviceOwnerChange
 * private function
 * 1. Callback for Ports update operations Part of waterfall model
 * 2. Update the device owner with corresponding
 *    router or compute function
 * 3. If any compute or router has to be detached
 *    even that is taken care.
 */

function deviceOwnerChange(error, result, DataObjectDelArr, portPutData, vmiData, request, appData, callback){
    if("virtual_machine_interface_device_owner" in vmiData["virtual-machine-interface"] && 
        (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute"){
        if("virtual_machine_refs" in vmiData["virtual-machine-interface"]){
            vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "compute";
        } else if("logical_router_back_refs" in vmiData["virtual-machine-interface"]){
            vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "network:router_interface";
        } else {
            vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
        }
    }
    if (!("virtual_machine_interface_device_owner" in vmiData["virtual-machine-interface"])) {
        vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
    }

    var isDeviceOwnerChangeRequiredBool = isDeviceOwnerChangeRequired(portPutData, vmiData);
    if (isDeviceOwnerChangeRequiredBool == true) {
        detachDeviceOwner (portPutData, vmiData, request, appData,
                           function(locError, results) {
            if (locError) {
                error = appendErrorMessage(locError, error);
                //call to deleteAllReference
                callback(null, error, DataObjectDelArr, portPutData, appData);
            }
            attachDeviceOwner(portPutData, vmiData, request, appData,
                              function(locError, results){
                error = appendErrorMessage(locError, error);
                //call to deleteAllReference
                callback(null, error, DataObjectDelArr, portPutData, appData);
            });
        });
    } else {
        //call to deleteAllReference
        callback(null, error, DataObjectDelArr, portPutData, appData);
    }
}

/**
 * @isDeviceOwnerChangeRequired
 * private function
 * 1. Find if the must be any change in device owner
 * 2. Return either true or false
 */
function isDeviceOwnerChangeRequired(portPutData, vmiData) {
    var putDeviceOwner = "";
    var vmiDeviceOwner = "";
    var tempVmiData = vmiData["virtual-machine-interface"];
    var tempPutData = portPutData["virtual-machine-interface"];
    if ("virtual_machine_interface_device_owner" in tempPutData) {
        putDeviceOwner = tempPutData["virtual_machine_interface_device_owner"];
        putDeviceOwner = cropIfCompute(putDeviceOwner);
    }
    if ("virtual_machine_interface_device_owner" in tempVmiData) {
        vmiDeviceOwner = tempVmiData["virtual_machine_interface_device_owner"];
        vmiDeviceOwner = cropIfCompute(vmiDeviceOwner);
    }
    if (putDeviceOwner != vmiDeviceOwner) {
        return true; //Device Owner Changed
    } else {
        //if both are same
        var key = "";
        if (putDeviceOwner == "compute" && vmiDeviceOwner == "compute") {
            key = "virtual_machine_refs";
        } else if (putDeviceOwner == "network:router_interface" && vmiDeviceOwner == "network:router_interface") {
            key = "logical_router_back_refs";
        }
        if (key in tempVmiData) {
            tempVmiData[key] = deleteAttrHrefinKeyObject(tempVmiData[key]);
        }
        var result = jsonDiff.getConfigArrayDelta(key, tempVmiData[key], tempPutData[key]);
        if (result == null || (result.addedList.length == 0 && result.deletedList.length == 0)) {
            return false; //no Change in data
        } else {
            //Same (like router to router) but data/value changed
            return true; 
        }
    }
    return false;
}

/**
 * @cropIfCompute
 * private function
 * 1. Utility function to convert compute:xxx to compute
 * 2. Return compute if the device owner is compute or else the same value
      obtained is returned back.
 */
function cropIfCompute(type) {
    var returnVal = type;
    if (returnVal.substring(0,7) == "compute") {
        returnVal = "compute";
    }
    return returnVal;
}

/**
 * @attachDetachLogicalInterface
 * private function
 * 1. Function called from Device Owner change
 * 2. If the logical router change is required add/remove This take care.
 * 3. Find the diff and create refUpdate Data object and execute it.
 */
function attachDetachLogicalInterface (vmiDataObject, type, appData, callback) {
    var DataObjectArr = [];
    var currentVMIRef = {
        'to': vmiDataObject["virtual-machine-interface"]['fq_name'],
        'uuid': vmiDataObject["virtual-machine-interface"]['uuid']
    };
    var logicalRouterObj = vmiDataObject["virtual-machine-interface"]["logical_router_back_refs"];
    updateDataObjArrWithRefObj (DataObjectArr, logicalRouterObj, currentVMIRef,
                         'logical-router', type, appData);
    async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(error, results) {
            callback(error, results);
            return;
        }
    );
}

/**
 * @detachDeviceOwner
 * private function
 * 1. Function called from Device Owner change
 * 2. If change is deducted the detach of the compute or logical router is done
      through this function
 * 3. By the time this is returning back the detach must be done.
 */
function detachDeviceOwner(portPutData, vmiData, request, appData, callback) {
    var type = vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
    type = cropIfCompute(type);
    switch (type) {
        case "compute":
        {
            var body = {};
            body.portID = vmiData["virtual-machine-interface"]["uuid"];
            //body.netID = vmiData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
            body.vmUUID = vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
            detachVMICompute(request, body, function(error, results){
                callback(error, results);
                return;
            });
            return;
        }
        case "network:router_interface":
        {
            attachDetachLogicalInterface (vmiData, "DELETE", appData,
            function(error, results){
                callback(error, results);
                return;
            });
            break;
        }
        case "":
        {
            callback(null, null);
            return;
            break;
        }
        default:
            callback(null, null);
            break;
    }
}

/**
 * @attachDeviceOwner
 * private function
 * 1. Function called from Device Owner change
 * 2. If change is deducted the attach of the compute or logical router is done
      through this function after the detach happened
 * 3. By the time this is returning back the Attach must be done.
 */
function attachDeviceOwner(portPutData, vmiData, request, appData, callback) {
    var type = portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
    type = cropIfCompute(type);
    switch (type) {
        case "compute":
        {
            var body = {};
            body.portID = portPutData["virtual-machine-interface"]["uuid"];
            //body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
            body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
            attachVMICompute(request, body, function (error, result) {
                if ('virtual_machine_refs' in portPutData['virtual-machine-interface']){
                    delete portPutData['virtual-machine-interface']['virtual_machine_refs'];
                }
                if ('virtual_machine_interface_device_owner' in portPutData['virtual-machine-interface']) {
                    delete portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
                }
                callback(error, result);
                return;
            });
            break;
        }
        case "network:router_interface":
        {
            attachDetachLogicalInterface (portPutData, "ADD", appData,
            function(error, result){
                callback(error, result);
                return;
            });
            break;
        }
        case "":
        {
            callback(null, null);
            break;
        }
        default:
            callback(null, null);
            break;
    }
}

/**
 * @filterUpdateFixedIP
 * private function
 * 1. Callback for Ports update operations
 * 2. filtering the fixed IP values either to create or delete.
 */
function filterUpdateFixedIP (error, portPutData, vmiData, appData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createFixedArray = [];
    var deleteFixedArray = [];
    var fixedipPoolRef_server = [];
    var fixedipPoolRefs_serverLen = 0;
    var fixedipPoolRef_put = [];
    var fixedipPoolRefs_putLen = 0;
    if ('virtual-machine-interface' in vmiData &&
        'instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef_server = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefs_serverLen = fixedipPoolRef_server.length;
    }
    if ('virtual-machine-interface' in portPutData &&
        'instance_ip_back_refs' in portPutData['virtual-machine-interface']) {
        fixedipPoolRef_put = portPutData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefs_putLen = fixedipPoolRef_put.length;
    }
    if (fixedipPoolRefs_serverLen == 0) {
        for (i = 0; i < fixedipPoolRefs_putLen; i++) {
            createFixedArray.push(fixedipPoolRef_put[i]);
        }
        callback(createFixedArray,deleteFixedArray);
        return;
    }
    if (fixedipPoolRefs_putLen == 0) {
        for (i = 0; i < fixedipPoolRefs_serverLen; i++) {
            deleteFixedArray.push(fixedipPoolRef_server[i]);
        }
        callback(createFixedArray,deleteFixedArray);
        return;
    }
    var j = 0;
    var create = true;
    for (i = 0; i < fixedipPoolRefs_putLen && i >= 0; i++) {
        create = true;
        for (j = 0; j < fixedipPoolRefs_serverLen && j >= 0 && i >= 0; j++) {
            var portFixedip_uuid = JSON.stringify(fixedipPoolRef_put[i]["uuid"]);
            var vmiFixedip_uuid = JSON.stringify(fixedipPoolRef_server[j]["uuid"]);
            if ( portFixedip_uuid == vmiFixedip_uuid) {
                fixedipPoolRef_put.splice(i,1);
                fixedipPoolRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                fixedipPoolRefs_putLen--;
                fixedipPoolRefs_serverLen--;
            }
        }
        if (create == true) {
            createFixedArray.push(fixedipPoolRef_put[i]);
            fixedipPoolRef_put.splice(i,1);
            i--;
            fixedipPoolRefs_putLen--;
        }
    }
    for (j = 0; j < fixedipPoolRefs_serverLen; j++) {
        deleteFixedArray.push(fixedipPoolRef_server[j]);
    }
    callback(createFixedArray,deleteFixedArray);
}

/**
 * @deletePortsCB
 * public function
 * 1. Call from other API call
 * 2. Deletes the ports from config api server
 * 3. Return back to the called API
 */
function deletePortsCB (dataObject, callback)
{
    if ("uuid" in dataObject && dataObject.uuid == null) {
        var error = new appErrors.RESTServerError('Invalid virtual machine interface Data');
        callback(null, {'error': error, 'data': null})
    }
    async.waterfall([
        async.apply(removeDependentInterface, dataObject),
        removeNonDependentInterface
    ],
    function (err, results){
        callback(err, results);
    });
}

/**
 * @removeDependentInterface
 * private function
 * If any dependent port's are there It will be getting passed in User data.
 * So Remove the dependent port's first and then passed to the
 * removeNonDependentInterface delete.
 */
function removeDependentInterface(dataObject, callback) {
    if (dataObject != null) {
        var appData =  dataObject.appData,
            portId = dataObject.uuid,
            request = dataObject.request,
            userData = commonUtils.getValueByJsonPath(dataObject,
                    "userData", [], false),
            dataObjArr = [],
            userDataLen = userData.length;
        for (var i = 0; i < userDataLen; i++) {
            dataObjArr.push({"portId" : userData[i],
                             "appData" : appData,
                             "request" :request});
        }
        async.mapLimit(dataObjArr, 100, deletePortPerUUID, function(error, data) {
            callback(null, error, data, dataObject);
            return;
        });
    } else {
        callback(null, null, null, dataObject);
    }
}
/**
 * @removeNonDependentInterface
 * private function
 * After the dependent port's are removed the control is passed to this function
 * Hear the non dependent port are getting removed
 */
function removeNonDependentInterface(error, data, dataObject, callback) {
    if (error) {
        callback(null, {'error': error, 'data': data});
        return;
    }
    var dataObj = {"portId" : dataObject.uuid,
                   "appData" : dataObject.appData,
                   "request" : dataObject.request};
    deletePortPerUUID (dataObj, function(error, data) {
        callback(null, {'error': error, 'data': data});
        return;
    })
}

function deletePortPerUUID (dataObj, callback) {
    var portId = dataObj.portId;
    var appData = dataObj.appData;
    var request = dataObj.request;
    readVMIwithUUID(portId, appData, function(err, vmiData){
        if(err){
            callback(null, {'error': err, 'data': vmiData});
            return;
        }
        getReadDelVMICb(err, vmiData, request, appData, function(error, data){
            callback(null, {'error': error, 'data': data});
            return;
        });
    });
}

/**
 * @deletePorts
 * public function
 * 1. URL /api/tenants/config/ports/:id
 * 2. Deletes the ports from config api server
 */
function deletePorts (request, response, appData)
{
    var portId = request.param('uuid');
    readVMIwithUUID(portId, appData, function(err, vmiData){
        getReadDelVMICb(err, vmiData, request, appData, function(error, data){
            commonUtils.handleJSONResponse(error, response, data);
            return;
        });
    });
}

/**
 * @readVMIwithUUID
 * private function
 * 1. Common function
 * 2. Read the VMI from server with the UUID
 */
function readVMIwithUUID (uuid, appData, callback)
{
    var vmiURL = '/virtual-machine-interface/';
    if (uuid != null && uuid != "") {
        vmiURL += uuid;
    } else {
        var error = new appErrors.RESTServerError('Port UUID is required.');
        callback(error, null);
        return;
    }
    configApiServer.apiGet(vmiURL, appData, function(err, data) {
        callback(err, data);
    });
}

/**
 * @readLogicalRouter
 * private function
 * 1. Callback for port create
 * 2. Read the Logical router and send back the result.
 */
function readLogicalRouter (uuid, appData, callback)
{
    var lrURL = '/logical-router/';
    if (uuid != null && uuid != "") {
        lrURL += uuid;
    configApiServer.apiGet(lrURL, appData, function(err, data) {
        callback(err, data);
    });
    } else {
        callback(null, null);
    }
}

/**
 * @deletePortAsync
 * private function
 * 1. Callback for delete create
 * 2. Execute One delete function at a time.
 */
function deletePortAsync (dataObj, callback)
{
    if (dataObj['type'] == 'vmi') {
        var vmiData = dataObj['vmiData'];
        var request = dataObj['request'];
        if (('virtual_machine_interface_device_owner' in vmiData['virtual-machine-interface'])
           && (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
            //detach compute nova
            var body = {};
            body.portID = vmiData["virtual-machine-interface"]["uuid"];
            //body.netID = vmiData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
            body.vmUUID = vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
            detachVMICompute(request, body, function(error, results){
                if (error) {
                    callback(error, results)
                    return;
                } else {
                    async.map(dataObj['dataObjArr'],
                    function(item,callback) {
                        commonUtils.getAPIServerResponse(configApiServer.apiDelete, false,item,callback)
                    },
                        function(error, results) {
                            callback(error, results);
                            return;
                        });
                }
            });
        } else {
            async.map(dataObj['dataObjArr'],
                function(item,callback) {
                    commonUtils.getAPIServerResponse(configApiServer.apiDelete, false,item,callback)
                },
                function(error, results) {
                    callback(error, results);
                    return;
                });
        }
        return;
    } else if (dataObj['type'] == 'vm') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                delVm(error, results, dataObj['appData'],
                    function(err, data){
                        callback(err, results);
                        //return;
                });
        });
        return;
    } else {
        callback(null, dataObj);
        return;
    }
}

/**
 * @getReadDelVMICb
 * private function
 * 1. Callback for delete create
 * 2. Read all the date to delete and create allDataObj.
 * 3. deletePortAsync is called in the same order of allDataObj.
 */
function getReadDelVMICb (err, vmiData, request, appData, callback)
{
    var vnObjArr            = [];
    var vmiObjArr            = [];
    var allDataObj            = [];
    var fixedipPoolRefsLen    = 0;
    var vmRefLen    = 0;
    var fixedipPoolRef        = null;
    var vmRef        = null;
    var reqUrl                = "";
    var DataObjectArr = [];
    var uuid = vmiData['virtual-machine-interface']['uuid'];
    var currentVMIRef = {
        'to': vmiData["virtual-machine-interface"]['fq_name'],
        'uuid': vmiData["virtual-machine-interface"]['uuid']
    };
    var urlRef = "";
    //Floating ip Reference
    if ('virtual-machine-interface' in vmiData &&
        'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        var floatingipPoolRef = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        urlRef = "floating-ip"
        updateDataObjArrWithRefObj (DataObjectArr, floatingipPoolRef, currentVMIRef,
                             urlRef, "DELETE", appData);
    }
    //Logical Interface  Reference
    if ('virtual-machine-interface' in vmiData &&
        'logical_interface_back_refs' in vmiData['virtual-machine-interface']) {
        var logicalInterfaceRef = vmiData['virtual-machine-interface']['logical_interface_back_refs'];
        urlRef = "logical-interface"
        updateDataObjArrWithRefObj (DataObjectArr, logicalInterfaceRef, currentVMIRef,
                             urlRef, "DELETE", appData);
    }
    //LogicalRouter Reference
    if ('virtual-machine-interface' in vmiData &&
        'logical_router_back_refs' in vmiData['virtual-machine-interface']) {
        var logicalRouterRef = vmiData['virtual-machine-interface']['logical_router_back_refs'];
        urlRef = "logical-router"
        updateDataObjArrWithRefObj (DataObjectArr, logicalRouterRef, currentVMIRef,
                             urlRef, "DELETE", appData);
    }
    //Subnet
    if ('virtual-machine-interface' in vmiData &&
        'subnet_back_refs' in vmiData['virtual-machine-interface']) {
        var subnetRef = vmiData['virtual-machine-interface']['subnet_back_refs'];
        urlRef = "subnet"
        updateDataObjArrWithRefObj (DataObjectArr, subnetRef, currentVMIRef,
                             urlRef, "DELETE", appData);
    }
    //Instance IP
    if ('instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefsLen = fixedipPoolRef.length;
    }
    for (var i = 0; i < fixedipPoolRefsLen; i++) {
        reqUrl = '/instance-ip/' + fixedipPoolRef[i]['uuid'];
        commonUtils.createReqObj(DataObjectArr, reqUrl,
                                 global.HTTP_REQUEST_DEL, null, null, null,
                                 appData);
    }
    //VMI - Also take care of VM Detach
    reqUrl = '/virtual-machine-interface/' + uuid;
    commonUtils.createReqObj(vmiObjArr, reqUrl,
                             global.HTTP_REQUEST_DEL, null, null, null,
                             appData);
    var vmiObj = {};
    if (vmiObjArr.length > 0) {
        vmiObj['type'] = "vmi";
        vmiObj['dataObjArr'] = vmiObjArr;
        vmiObj['vmiData'] = vmiData;
        vmiObj['request'] = request;
        allDataObj.push(vmiObj);
    }
    //virtual machine
    if ('virtual-machine-interface' in vmiData &&
        'virtual_machine_refs' in vmiData['virtual-machine-interface']) {
        vmRef = vmiData['virtual-machine-interface']['virtual_machine_refs'];
        vmRefLen = vmRef.length;
    }
    if (vmRefLen == 1) {
        reqUrl = '/virtual-machine/' + vmRef[0]['uuid'];
        commonUtils.createReqObj(vnObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }
    if (vnObjArr.length > 0) {
        var vmObj = {};
        vmObj['type'] = "vm";
        vmObj['dataObjArr'] = vnObjArr;
        vmObj['appData'] = appData;
        allDataObj.push(vmObj);
    }
    //Execute the ref update and delete of Fixed ip.
    async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(error, results) {
            // call to Execute the sequential flow [VMI, VM].
            async.mapSeries(allDataObj, deletePortAsync, function(err, data) {
                callback(err, null);
            });
    });
}

/**
 * @delVm
 * private function
 * 1. Callback for delete create
 * 2. call back for deletePortAsync.
 * 3. Delete Virtual machine.
 */
function delVm (error, results, appData, callback)
{
    if (error) {
        callback(error, results);
        return;
    }
    var linkedvmi2vmLength = 0;
    if ('virtual-machine' in results[0] && 'virtual_machine_interface_back_refs' in results[0]['virtual-machine']) {
        linkedvmi2vmLength = results[0]['virtual-machine']['virtual_machine_interface_back_refs'].length;
    }
    if (linkedvmi2vmLength <= 0) {
        var vmDelURL = "/virtual-machine/"+results[0]['virtual-machine']["uuid"];
        configApiServer.apiDelete(vmDelURL, appData,
        function(error, data) {
            callback(error, data);
        });
    } else {
        callback(error, results);
    }
}

/**
 * @listVirtualMachines
 * public function
 * 1. URL /api/tenants/config/virtual-machines
 * 2. Gets list of virtual machines from config api server
 */
function listVirtualMachines (request, response, appData)
{
    var vmListURL  = '/virtual-machines';
    configApiServer.apiGet(vmListURL, appData,
        function(error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
}

function getVMIAndInstIPDetails (req, res, appData)
{
    var tmpVMIObjs = {};
    var dataObjArr = [];
    var projUUID = req.param('uuid');
    var vmiURL = '/virtual-machine-interfaces?detail=true&parent_id=' +
        projUUID;
    var resultJSON = {};
    var getInstIpsFlag = req.param('getInstIps');
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;

    if ((null != getInstIpsFlag) && ('true' == getInstIpsFlag)) {
        vmiURL += '&fields=instance_ip_back_refs';
    }
    configApiServer.apiGet(vmiURL, appData, function(err, data) {
        if ((null != err) || (null == data) ||
            (null == data['virtual-machine-interfaces'])) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var vmiData = data['virtual-machine-interfaces'];
        var vmiCnt = vmiData.length;
        var instCnt = 0;
        for (var i = 0; i < vmiCnt; i++) {
            var instIpBackRefs = vmiData[i]['virtual-machine-interface']
                                        ['instance_ip_back_refs'];
            if (null != instIpBackRefs) {
                var instIpBackRefsCnt = instIpBackRefs.length;
                tmpVMIObjs[vmiData[i]['virtual-machine-interface']['uuid']]
                    = {'startIndex': instCnt, 'endIndex': instCnt +
                        instIpBackRefsCnt};
                instCnt = instCnt + instIpBackRefsCnt;
                for (var j = 0; j < instIpBackRefsCnt; j++) {
                    var reqUrl = '/instance-ip/' + instIpBackRefs[j]['uuid'];
                    commonUtils.createReqObj(dataObjArr, reqUrl,
                                             global.HTTP_REQUEST_GET, null,
                                             null, null, appData);
                }
            }
        }
        if (!dataObjArr.length) {
            resultJSON['data'] = vmiData;
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        async.mapLimit(dataObjArr, 200, //global.ASYNC_MAP_LIMIT_COUNT,
                       commonUtils.getServerResponseByRestApi(configApiServer,
                                                              true),
                       function(err, results) {
            var resCnt = results.length;
            for (i = 0; i < vmiCnt; i++) {
                var vmiUUID = vmiData[i]['virtual-machine-interface']['uuid'];
                var indexObj = tmpVMIObjs[vmiUUID];
                if (null != indexObj) {
                    delete
                        vmiData[i]['virtual-machine-interface']['instance_ip_back_refs'];
                    vmiData[i]['virtual-machine-interface']['instance_ip_back_refs']
                        = [];
                    for (var j = indexObj['startIndex']; j <
                         indexObj['endIndex']; j++) {
                        if (null == results[j]) {
                            continue;
                        }
                        vmiData[i]['virtual-machine-interface']
                            ['instance_ip_back_refs'].push({'fixedip': {'ip':
                                                           results[j]['instance-ip']
                                                           ['instance_ip_address']}});
                    }
                }
            }
            resultJSON['data'] = vmiData;
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    });
}

function getVMIDetailsCB (vmiURL, filterSvcInstIP, appData, res, err)
{
    var vmiToIpMap = {};
    var dataObjArr = [];
    var vmiUUIDList = [];
    configApiServer.apiGet(vmiURL, appData, function(err, vmiData) {
        if ((null != err) || (null == vmiData) ||
            (null == vmiData['virtual-machine-interfaces']) ||
            (!vmiData['virtual-machine-interfaces'].length)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var vmiData = vmiData['virtual-machine-interfaces'];
        var vmiCnt = vmiData.length;
        for (var i = 0; i < vmiCnt; i++) {
            vmiUUIDList.push(vmiData[i]['virtual-machine-interface']['uuid']);
        }
        if (!vmiUUIDList.length) {
            commonUtils.handleJSONResponse(null, res, vmiData);
            return;
        }
        var chunk = 200;
        var uuidStrLists = [];
        for (i = 0, j = vmiCnt; i < j; i += chunk) {
            tempArray = vmiUUIDList.slice(i, i + chunk);
            var instIPUrl = '/instance-ips?detail=true&back_ref_id=' +
                tempArray.join(',');
            commonUtils.createReqObj(dataObjArr, instIPUrl, null, null, null,
                                     null, appData);
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   true),
                  function(err, results) {
            if ((null != err) || (null == results)) {
                commonUtils.handleJSONResponse(null, res, vmiData);
                return;
            }
            var instIpData = [];
            var dataObjArrLen = dataObjArr.length;
            for (i = 0; i < dataObjArrLen; i++) {
                if (null != dataObjArr[i]) {
                    instIpData = instIpData.concat(results[i]['instance-ips']);
                }
            }
            var instIpCnt = instIpData.length;
            for (i = 0; i < instIpCnt; i++) {
                if ((null == instIpData[i]['instance-ip']) ||
                    (null ==
                        instIpData[i]['instance-ip']['virtual_machine_interface_refs'])) {
                    continue;
                }
                var vmiRef =
                    instIpData[i]['instance-ip']['virtual_machine_interface_refs'];
                if (null == vmiToIpMap[vmiRef[0]['uuid']]) {
                    vmiToIpMap[vmiRef[0]['uuid']] = [];
                }
                var isSvcInstIP =
                    commonUtils.getValueByJsonPath(instIpData[i],
                                                   'instance-ip;service_instance_ip',
                                                   false);
                if ((false == filterSvcInstIP) ||
                    ((true == filterSvcInstIP) && (false == isSvcInstIP))) {
                    vmiToIpMap[vmiRef[0]['uuid']].push(
                        instIpData[i]['instance-ip']['instance_ip_address']);
                }
            }
            for (i = 0; i < vmiCnt; i++) {
                if (null !=
                    vmiToIpMap[vmiData[i]['virtual-machine-interface']['uuid']]) {
                    if (null ==
                        vmiData[i]['virtual-machine-interface']['instance_ip_address']) {
                        vmiData[i]['virtual-machine-interface']['instance_ip_address'] =
                            [];
                    }
                    vmiData[i]['virtual-machine-interface']['instance_ip_address']
                        =
                        vmiToIpMap[vmiData[i]['virtual-machine-interface']['uuid']];
                }
            }
            commonUtils.handleJSONResponse(null, res, vmiData);
        });
    });
}

function getUUIDByFQNAsync (dataObj, callback)
{
    configUtil.getUUIDByFQN({'appData': dataObj.appData,
                             'fqnReq' : {'fq_name': dataObj.fq_name,
                                         'type': dataObj.type}
                            }, function(error, data) {
        callback(error, data);
    });
}

function getVMIDetails  (req, res, appData)
{
    var backRefID = req.param('vn_uuid');
    var parentID = req.param('proj_uuid');
    var projFQN   = req.param('proj_fqn');
    var vnFqn = req.param('vn_fqn');
    var vnFqns = req.param('vn_fqns');
    var filterSvcInstIP = req.param('filter_svc_inst_ip');
    switch (filterSvcInstIP) {
    case 'true':
    case true:
        filterSvcInstIP = true;
        break;
    case 'false':
    case false:
    default:
        filterSvcInstIP = false;
    }
    var dataObjArr = [];
    var vmiURL =
        '/virtual-machine-interfaces?detail=true&fields=' +
        'virtual_machine_refs,instance_ip_back_refs';
    if (null != backRefID) {
        vmiURL += '&back_ref_id=' + backRefID;
    } else if (null != parentID) {
        vmiURL += '&parent_id=' + parentID;
    } else if ((null != projFQN) || (null != vnFqn) ||
               (null != vnFqns)) {
        var fqns = [projFQN];
        var type = 'project';
        var urlId = 'parent_id';
        if (null != vnFqn) {
            fqns = [vnFqn];
            type = 'virtual-network';
            urlId = 'back_ref_id';
        } else if (null != vnFqns) {
            fqns = vnFqns.split('::');
            type = 'virtual-network';
            urlId = 'back_ref_id';
        }
        var len = fqns.length;
        for (var i = 0; i < len; i++) {
            dataObjArr.push({'appData': appData, 'type': type, 'fq_name':
                             fqns[i].split(':')});
        }
        async.map(dataObjArr, getUUIDByFQNAsync, function(error, results) {
                if (error != null || results == null) {
                    var error = new appErrors.RESTServerError(
                        'Invalid Project FQName');
                    commonUtils.handleJSONResponse(error, res, results);
                    return;
                }
                
                var uuidList = [];
                var len = results.length;
                for (var i = 0; i < len; i++) {
                    uuidList.push(results[i]['uuid']);
                }
                vmiURL += '&' + urlId + '=' + uuidList.join(',');
                getVMIDetailsCB(vmiURL, filterSvcInstIP, appData, res);
            }
        );
        return;
    }
    getVMIDetailsCB(vmiURL, filterSvcInstIP, appData, res);
}

function deleteAllPorts (req, res, appData)
{
    var projUUID = req.param('uuid');
    var reqUrl = '/virtual-machine-interfaces?parent_id=' + projUUID + "&detail=true";
    var dataObjArr = [];

    configApiServer.apiGet(reqUrl, appData, function(err, vmiData) {
        if ((null != err) || (null == vmiData) ||
            (!vmiData['virtual-machine-interfaces'].length)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var vmiCnt = vmiData['virtual-machine-interfaces'].length;
        /*dataObjArr[0] = {};
        dataObjArr[0]['deleteIDs'] = [];
        dataObjArr[0]['type'] = 'virtual-machine-interface';*/
        var primaryVMIs = {};
        for (var i = 0; i < vmiCnt; i++) {
            var vmi = vmiData['virtual-machine-interfaces'][i]["virtual-machine-interface"];
            if(vmi.hasOwnProperty('virtual_machine_interface_refs') &&
                vmi['virtual_machine_interface_refs'].length > 0) {
                //either sub interface or primary interface
                if(vmi.hasOwnProperty('virtual_machine_interface_properties') &&
                    vmi['virtual_machine_interface_properties'].hasOwnProperty('sub_interface_vlan_tag') &&
                    !isNaN(vmi['virtual_machine_interface_properties']['sub_interface_vlan_tag']) &&
                    vmi['virtual_machine_interface_refs'].length == 1) {
                    //sub interface
                    var primaryVMIRef = vmi['virtual_machine_interface_refs'][0].uuid;
                    if(null == primaryVMIs[primaryVMIRef] ||
                        typeof primaryVMIs[primaryVMIRef] == "undefined") {
                        primaryVMIs[primaryVMIRef] = [];
                    }
                    primaryVMIs[primaryVMIRef].push(vmi.uuid);
                } else {
                    //primary interface
                    if(null == primaryVMIs[vmi.uuid] ||
                        typeof primaryVMIs[vmi.uuid] == "undefined") {
                        primaryVMIs[vmi.uuid] = [];
                        continue;
                    }
                }
            } else {
                //independent VMIs
                if(null == dataObjArr[0] ||
                    typeof dataObjArr[0] === "undefined") {
                    dataObjArr[0] = {};
                    dataObjArr[0]['deleteIDs'] = [];
                    dataObjArr[0]['type'] = 'virtual-machine-interface';
                    dataObjArr[0]['userData'] = null;
                }
                dataObjArr[0]['deleteIDs'].push(vmi.uuid);
            }
            //dataObjArr[0]['deleteIDs'].push(vmiData['virtual-machine-interfaces'][i]['uuid']);
        }

        for (var pVMI_UUID in primaryVMIs) {
            if(!(primaryVMIs.hasOwnProperty(pVMI_UUID)))
                continue;
            var dataObjArrLen = dataObjArr.length;
            dataObjArr[dataObjArrLen] = {};
            dataObjArr[dataObjArrLen]['deleteIDs'] = [];
            dataObjArr[dataObjArrLen]['deleteIDs'].push(pVMI_UUID);
            dataObjArr[dataObjArrLen]["type"] = "virtual-machine-interface";
            var subVMIs = primaryVMIs[pVMI_UUID];
            for(var sVMI_UUID in subVMIs) {
                if(!(subVMIs.hasOwnProperty(sVMI_UUID)))
                    continue;
                if(!(dataObjArr[dataObjArrLen].hasOwnProperty('userData'))) {
                    dataObjArr[dataObjArrLen]['userData'] = [];
                }
                dataObjArr[dataObjArrLen]['userData'].push(subVMIs[sVMI_UUID]);
            }
        }
        configUtil.deleteMultiObjectCB(dataObjArr, req, appData,
                                       function(err, data) {
            commonUtils.handleJSONResponse(err, res, data);
        });
    });
}
function buildVMIData (vmiData, dataObj)
{
    var fip = dataObj['fip'];
    var instIps = dataObj['instIp'];
    var fipObjs = {};
    var instIpsObjs = {};
    var intfRtTabObjs = {};

    var fipCnt = 0;
    if ((null != fip) && (fip.length > 0)) {
        fipCnt = fip.length;
    }
    var instIpsCnt = 0;
    if ((null != instIps) && (instIps.length > 0)) {
        instIpsCnt = instIps.length;
    }
    for (var i = 0; i < fipCnt; i++) {
        fipObjs[fip[i]['floating-ip']['uuid']] =
            fip[i]['floating-ip'];
    }
    for (i = 0; i < instIpsCnt; i++) {
        instIpsObjs[instIps[i]['instance-ip']['uuid']] =
            instIps[i]['instance-ip'];
    }
    var vmiCnt = vmiData.length;
    var vmiObjs = {};
    for (var i = 0; i < vmiCnt; i++) {
        var vmiFip =
            vmiData[i]['virtual-machine-interface']['floating_ip_back_refs'];
        var vmiFipCnt = 0;
        if (null != vmiFip) {
            vmiFipCnt = vmiFip.length;
        }
        for (var j = 0; j < vmiFipCnt; j++) {
            if (null == fipObjs[vmiFip[j]['uuid']]) {
                continue;
            }
            vmiData[i]['virtual-machine-interface']['floating_ip_back_refs']
                      [j]['floatingip'] = {};
            vmiData[i]['virtual-machine-interface']['floating_ip_back_refs']
                      [j]['floatingip']['ip'] =
                fipObjs[vmiFip[j]['uuid']]['floating_ip_address'];
            vmiData[i]['virtual-machine-interface']['floating_ip_back_refs']
                      [j]['floatingip']['subnet_uuid'] =
                fipObjs[vmiFip[j]['uuid']]['subnet_uuid'];

        }
        var vmiInstIps =
            vmiData[i]['virtual-machine-interface']['instance_ip_back_refs'];
        var vmiInstIpsCnt = 0;
        if (null != vmiInstIps) {
            vmiInstIpsCnt = vmiInstIps.length;
        }
        for (var j = 0; j < vmiInstIpsCnt; j++) {
            if (null == instIpsObjs[vmiInstIps[j]['uuid']]) {
                continue;
            }
            vmiData[i]['virtual-machine-interface']['instance_ip_back_refs']
                   [j]['fixedip'] = {};
            vmiData[i]['virtual-machine-interface']['instance_ip_back_refs']
                   [j]['fixedip']['ip'] =
               instIpsObjs[vmiInstIps[j]['uuid']]['instance_ip_address'];
            if (null != instIpsObjs[vmiInstIps[j]['uuid']]['subnet_uuid']) {
                vmiData[i]['virtual-machine-interface']['instance_ip_back_refs']
                       [j]['fixedip']['subnet_uuid'] =
                    instIpsObjs[vmiInstIps[j]['uuid']]['subnet_uuid'];
            }
        }
    }
    return vmiData;
}

function getVMIDetailsPaged (req, res, appData)
{
    var body = req.body;
    var uuidList = body.uuidList;
    var fields = body.fields;
    var chunk = 200;
    var uuidCnt = uuidList.length;
    var dataObjGetArr = [];
    var j = 0;
    var tmpArray = [];
    var vmiObjs = {};

    var count = 0;
    for (var i = 0, j = uuidCnt; i < j; i += chunk) {
        tmpArray = uuidList.slice(i, i + chunk);
        var reqUrl = '/virtual-machine-interfaces?detail=true&obj_uuids=' +
            tmpArray.join(',') +
            '&fields=floating_ip_back_refs,instance_ip_back_refs,' +
            'interface_route_table_refs,logical_router_back_refs';
        if ((null != fields) && (fields.length > 0)) {
            reqUrl += ',' + fields.join(',');
        }
        commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null, null,
                                 appData);
        reqUrl = '/floating-ips?detail=true&back_ref_id=' + tmpArray.join(',');
        commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null, null,
                                 appData);
        reqUrl = '/instance-ips?detail=true&back_ref_id=' + tmpArray.join(',');
        commonUtils.createReqObj(dataObjGetArr, reqUrl, null, null, null, null,
                                 appData);

    }
    var vmiResultJSON = [];
    var fipResultJSON = [];
    var instIpsResultJSON = [];
    async.map(dataObjGetArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
              function(error, results) {
        var resCnt = results.length;
        var index;
        for (var i = 0; i < resCnt; i++) {
            index = 0 + i * 3;
            if ((null != results[index]) &&
                (null != results[index]['virtual-machine-interfaces']) &&
                (results[index]['virtual-machine-interfaces'].length > 0)) {
                vmiResultJSON =
                    vmiResultJSON.concat(results[index]['virtual-machine-interfaces']);
            }
            index = 1 + i * 3;
            if ((null != results[index]) &&
                (null != results[index]['floating-ips']) &&
                (results[index]['floating-ips'].length > 0)) {
                fipResultJSON =
                    fipResultJSON.concat(results[index]['floating-ips']);
            }
            index = 2 + i * 3;
            if ((null != results[index]) &&
                (null != results[index]['instance-ips']) &&
                (results[index]['instance-ips'].length > 0)) {
                instIpsResultJSON =
                    instIpsResultJSON.concat(results[index]['instance-ips']);
            }
        }
        var dataObj = {'fip': fipResultJSON, 'instIp': instIpsResultJSON};
        var vmiData = buildVMIData(vmiResultJSON, dataObj);
        commonUtils.handleJSONResponse(null, res, vmiData);
        return;
    });
}

exports.listVirtualMachines = listVirtualMachines;
exports.readPorts = readPorts;
exports.createPort = createPort;
exports.createPortCB = createPortCB;
exports.updatePorts = updatePorts;
exports.updatePortsCB = updatePortsCB;
exports.deletePorts = deletePorts;
exports.deletePortsCB = deletePortsCB;
exports.getVMIAndInstIPDetails = getVMIAndInstIPDetails;
exports.getVMIDetails = getVMIDetails;
exports.deleteAllPorts = deleteAllPorts;
exports.getVMIDetailsPaged = getVMIDetailsPaged;
