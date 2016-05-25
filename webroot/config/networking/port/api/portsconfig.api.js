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
    var data = dataObj.vmidata;

    createPortValidate(req, data, response, appData, function(error, results) {
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
    createPortValidate(request, request.body, response, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    }) ;
}

/**
 * @createPortValidate
 * private function
 * 1. Basic validation before creating the port(VMI)
 */
function createPortValidate (request, data, response, appData, callback)
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
	        readLogicalRouter(lrUUID, appData, function(err, apiLogicalRouterData){
	            if(err) {
	                callback(err, apiLogicalRouterData);
	                return;
	            }
                portSendResponse(error, request, vmiData, orginalPortData, apiLogicalRouterData, appData, function (err, results) {
                    //if(err){
                        callback(err, results);
                        return;
                    //}
                    //putVMISubInterface(orginalPortData, vmiData, results, appData, function(err, results){
                    //    callback(err, results);
                    //});
	            });
	        });
        });
    });
}
/*
function putVMISubInterface (orginalPortData, currentVMIDetail, results, appData, callback) 
{
    if ('virtual_machine_interface_properties' in orginalPortData['virtual-machine-interface'] &&
        'virtual_machine_interface_refs' in orginalPortData['virtual-machine-interface'] &&
        (orginalPortData['virtual-machine-interface']
                        ['virtual_machine_interface_refs'].length > 0) &&
        'fq_name' in currentVMIDetail['virtual-machine-interface']) {
        var subInterfaceUUID = orginalPortData['virtual-machine-interface']['virtual_machine_interface_refs'][0]['uuid'];
        readVMIwithUUID(subInterfaceUUID, appData, function(err, vmiData){
            var vmiSubInterfaceDetail = vmiData['virtual-machine-interface'];
            var vmiSubInterfaceJSON = VMIJSONStructureSubInterface(vmiSubInterfaceDetail, currentVMIDetail);
            var subInterfacePutURL = "/virtual-machine-interface/"+subInterfaceUUID;
            var vmiPutData = {};
            vmiPutData['virtual-machine-interface'] = {
                'fq_name':
                    vmiSubInterfaceJSON['virtual-machine-interface']['fq_name'],
                'uuid':
                    vmiSubInterfaceJSON['virtual-machine-interface']['uuid'],
                'virtual_machine_interface_refs':
                    vmiSubInterfaceJSON['virtual-machine-interface']['virtual_machine_interface_refs']
            };
            configApiServer.apiPut(subInterfacePutURL, vmiSubInterfaceJSON, appData,
                function (error, data) {
                    callback(error, data);
                });
        });
    } else {
        callback(null, results);
    }
}*/

function VMIJSONStructureSubInterface(vmiSubInterfaceDetail, currentVMIDetail){
    var primaryInterfaceObject = {};
    primaryInterfaceObject['virtual-machine-interface'] = {};
    //primaryInterfaceObject['virtual-machine-interface'] = vmiSubInterfaceDetail;
    primaryInterfaceObject['virtual-machine-interface'].fq_name = vmiSubInterfaceDetail.fq_name;
    primaryInterfaceObject['virtual-machine-interface'].uuid = vmiSubInterfaceDetail.uuid;
    primaryInterfaceObject['virtual-machine-interface'].parent_type = vmiSubInterfaceDetail.parent_type;
    var vmirefIndex = 0;
    if(vmiSubInterfaceDetail['virtual_machine_interface_refs'] != null &&
       vmiSubInterfaceDetail['virtual_machine_interface_refs'] != undefined){
        vmirefIndex = vmiSubInterfaceDetail['virtual_machine_interface_refs'].length;
        primaryInterfaceObject['virtual-machine-interface']['virtual_machine_interface_refs']
            = vmiSubInterfaceDetail['virtual_machine_interface_refs'];
    } else {
        primaryInterfaceObject['virtual-machine-interface']['virtual_machine_interface_refs'] = [];
    }
    primaryInterfaceObject['virtual-machine-interface']['virtual_machine_interface_refs'][vmirefIndex] = {};
    primaryInterfaceObject['virtual-machine-interface']['virtual_machine_interface_refs'][vmirefIndex]["uuid"] = currentVMIDetail['virtual-machine-interface']["uuid"];
    primaryInterfaceObject['virtual-machine-interface']['virtual_machine_interface_refs'][vmirefIndex]["to"] = currentVMIDetail['virtual-machine-interface']["fq_name"];
    return primaryInterfaceObject;
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
 * @createlogicalRouterDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Set the VMI reference in Logical router object
      and return back to create the seperate Logigal router.
 */
function createlogicalRouterDataObject (response,portConfig,apiLogicalRouterObj)
{
    var logicalrouter = {};
    if ('virtual_machine_interface_refs' in apiLogicalRouterObj['logical-router']) {
        if (apiLogicalRouterObj['logical-router']['virtual_machine_interface_refs'].length > 0) {
            var vmiref_len = apiLogicalRouterObj['logical-router']['virtual_machine_interface_refs'].length;
            var vmiExists = false;
            for (var i = 0; i < vmiref_len; i++) {
                if (portConfig['virtual-machine-interface']['uuid'] ===
                    apiLogicalRouterObj['logical-router']['virtual_machine_interface_refs']['uuid']) {
                    vmiExists = true;
                    break;
                }
            }
            if (vmiExists === false) {
                var vmi = {};
                vmi.to = portConfig['virtual-machine-interface']["fq_name"];
                vmi.uuid = portConfig['virtual-machine-interface']["uuid"];
                vmi.attr = null;
                apiLogicalRouterObj['logical-router']['virtual_machine_interface_refs'][vmiref_len] = vmi;
                logicalrouter["logical-router"] = {};
                logicalrouter["logical-router"]["fq_name"] = apiLogicalRouterObj["logical-router"]['fq_name'];
                logicalrouter["logical-router"]['uuid'] = apiLogicalRouterObj["logical-router"]['uuid'];
                logicalrouter['logical-router']['virtual_machine_interface_refs']=apiLogicalRouterObj['logical-router']['virtual_machine_interface_refs'];
            }
        } else {
            logicalrouter["logical-router"] = {};
            logicalrouter["logical-router"]["virtual_machine_interface_refs"] = [];
            logicalrouter["logical-router"]["virtual_machine_interface_refs"][0] = {};
            logicalrouter["logical-router"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
            logicalrouter["logical-router"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
        }
    } else {
        logicalrouter["logical-router"] = {};
        logicalrouter["logical-router"]["virtual_machine_interface_refs"] = [];
        logicalrouter["logical-router"]["virtual_machine_interface_refs"][0] = {};
        logicalrouter["logical-router"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
        logicalrouter["logical-router"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
    }
    response = logicalrouter;
    return response;
}

/**
 * @createFloatingIPDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Set the VMI reference in Floating IP object
 *    and return back to update the Floating IP.
 */
function createFloatingIPDataObject (response,portConfig, fqname)
{
    if (fqname != null && fqname != "") {
        var floatingIp = {};
        floatingIp["floating-ip"] = {};
        floatingIp["floating-ip"]["fq_name"] = [];
        floatingIp["floating-ip"]["fq_name"][0] = fqname['to'];
        floatingIp["floating-ip"]["fq_name"]['uuid'] = fqname['uuid'];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"] = [];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0] = {};
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
        response = floatingIp;
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
function portSendResponse (error, req, portConfig, orginalPortData, apiLogicalRouterData, appData, callback)
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

    var logicalRouter = null;
    var logicalRouterLen = 0;
    if (('logical_router_back_refs' in orginalPortData['virtual-machine-interface']) &&
       (orginalPortData['virtual-machine-interface']['logical_router_back_refs'].length > 0)) {
        logicalRouter = orginalPortData['virtual-machine-interface']['logical_router_back_refs'];
        if (logicalRouter != null && logicalRouter != "")
            logicalRouterLen = logicalRouter.length;
    }
    
        if(logicalRouterLen === 1){
            logicalRouter = logicalRouter[0];
                var logicalRouterURL = '/logical-router/'+logicalRouter['uuid'];
                var responceData = {};
                responceData = createlogicalRouterDataObject(responceData,portConfig,apiLogicalRouterData);
                commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
                             global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                            appData);
                var lruuid = orginalPortData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"];
                var domainProject = [];
                domainProject.push(orginalPortData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][0]);
                domainProject.push(orginalPortData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][1]);
        }

    var floatingipPoolRef = null;
    var floatingipPoolRefLen = 0;

    if ('floating_ip_back_refs' in orginalPortData['virtual-machine-interface']) {
        floatingipPoolRef = orginalPortData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefLen = floatingipPoolRef.length;
    }
    if (floatingipPoolRef != null && floatingipPoolRef != "") {
        if (floatingipPoolRefLen > 0) {
            for (var i = 0; i < floatingipPoolRefLen; i++) {
                var floatingIPURL = '/floating-ip/'+floatingipPoolRef[i]['uuid'];
                responceData = {};
                responceData = createFloatingIPDataObject(responceData,portConfig,floatingipPoolRef[i]);
                commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                             global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                             appData);
            }
        }
    }
    updateAvailableDataforCreate(DataObjectArr, instIpPostDataObjArr, portConfig, fixedIpPoolRefLen, appData, function(error, result) {
        if (error) {
            callback(error, null);
            return;
        }
        if ("virtual_machine_interface_device_owner" in orginalPortData["virtual-machine-interface"] &&
           (orginalPortData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
            body = {};
            body.portID = portConfig["virtual-machine-interface"]["uuid"];
            //body.netID = portConfig["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
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



function updateAvailableDataforCreate(DataObjectArr, instIpPostDataObjArr, portConfig, fixedIpPoolRefLen, appData, callback)
{
    async.map(instIpPostDataObjArr, createInstIP, function(err, result) {
    if (DataObjectArr.length === 0) {
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
function updatePortsCB (request, appData, callback)
{
    var portId = "";
    portId = request.param('uuid');
    var portPutData = request.body;
    readVMIwithUUID(portId, appData, function(err , vmiData){
        compareUpdateVMI(err, request, portPutData, vmiData, appData, function(error, protUpdateConfig) {
            if (error) {
                callback(error, null);
            } else {
                callback(error, protUpdateConfig);
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
        compareUpdateVMI(err, request, portPutData, vmiData, appData, function(error, protUpdateConfig) {
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
 * @compareUpdateVMI
 * private function
 * 1. Callback for Ports update operations
 * 2. Compare the data from UI and data from server is compared and
 *    corresponding read/create/update data object is created.
 */

function compareUpdateVMI (error, request, portPutData, vmiData, appData, callback)
{
    if (error) {
        callback(error, null);
        return;
    }

    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    delete portPutData["virtual-machine-interface"]["id_perms"];
    //portPutData["virtual-machine-interface"]["id_perms"]["uuid"] = vmiData['virtual-machine-interface']["id_perms"]["uuid"];

    var DataObjectLenDetail = [];
    var DataObjectArr = [];
    var DataObjectDelArr = [];
    var creatFloatingIpLen = 0;
    var deleteFloatingIpLen = 0;
    var createVMISubInterfaceLen = 0;
    var deleteVMISubInterfaceLen = 0;
    if ("floating_ip_back_refs" in portPutData["virtual-machine-interface"] ||
        "floating_ip_back_refs" in vmiData["virtual-machine-interface"]) {
        filterUpdateFloatingIP(error, portPutData, vmiData, function(createFloatingIp,deleteFloatingip){
            //createFloatingIP();
            if (createFloatingIp != null && createFloatingIp != "") {
                creatFloatingIpLen = createFloatingIp.length;
                if (creatFloatingIpLen > 0) {
                    for (var i = 0; i < creatFloatingIpLen; i++) {
                        var floatingIPURL = '/floating-ip/'+createFloatingIp[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }
            DataObjectLenDetail["FloatingIpCreateStartIndex"] = 0;
            DataObjectLenDetail["FloatingIpCreateCount"] = creatFloatingIpLen;

            //deleteFloatingIP();
            if (deleteFloatingip != null && deleteFloatingip != "") {
                deleteFloatingIpLen = deleteFloatingip.length;
                if (deleteFloatingIpLen > 0) {
                    for (var i = 0; i < deleteFloatingIpLen; i++) {
                        var floatingIPURL = '/floating-ip/'+deleteFloatingip[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }
            DataObjectLenDetail["FloatingIpDeleteStartIndex"] = DataObjectArr.length - deleteFloatingip.length;
            DataObjectLenDetail["FloatingIpDeleteCount"] = deleteFloatingip.length;
        });
    }

    if("virtual_machine_interface_refs" in portPutData["virtual-machine-interface"] ||
        "virtual_machine_interface_refs" in vmiData["virtual-machine-interface"]){
        filterVMISubInterface(error, portPutData, vmiData, function(createVMISubInterface,deleteVMISubInterface){
            //createVMISubInterface();
            if(createVMISubInterface != null && createVMISubInterface != ""){
                createVMISubInterfaceLen = createVMISubInterface.length;
                if(createVMISubInterfaceLen > 0){
                    for(var i = 0;i < createVMISubInterfaceLen;i++){
                        var vmiSubInterfaceURL = '/virtual-machine-interface/'+createVMISubInterface[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, vmiSubInterfaceURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }
            DataObjectLenDetail["VMISubnetInterfaceCreateStartIndex"] = DataObjectArr.length - createVMISubInterfaceLen;;
            DataObjectLenDetail["VMISubnetInterfaceCreateCount"] = createVMISubInterfaceLen;
            //deleteVMISubInterface();
            if(deleteVMISubInterface != null && deleteVMISubInterface != ""){
                deleteVMISubInterfaceLen = deleteVMISubInterface.length;
                if(deleteVMISubInterfaceLen > 0){
                    for(var i = 0;i<deleteVMISubInterfaceLen;i++){
                        var vmiSubInterfaceURL = '/virtual-machine-interface/'+deleteVMISubInterface[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, vmiSubInterfaceURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }
            DataObjectLenDetail["VMISubnetInterfaceDeleteStartIndex"] = DataObjectArr.length - deleteVMISubInterfaceLen;
            DataObjectLenDetail["VMISubnetInterfaceDeleteCount"] = deleteVMISubInterfaceLen;
        });
    }
    if("logical_router_back_refs" in portPutData["virtual-machine-interface"] ||
        "logical_router_back_refs" in vmiData["virtual-machine-interface"])
    {
        var logicalRoutServerLen = 0;
        if ("logical_router_back_refs" in vmiData["virtual-machine-interface"]) {
            var logicalRouterURL = '/logical-router/'+vmiData["virtual-machine-interface"]["logical_router_back_refs"][0]['uuid'];
            commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
             global.HTTP_REQUEST_GET, null, configApiServer, null,
             appData);
            logicalRoutServerLen = 1;
        }
        DataObjectLenDetail["LogicalRouterServerStartIndex"] = DataObjectArr.length - logicalRoutServerLen;
        DataObjectLenDetail["LogicalRouterServerCount"] = logicalRoutServerLen;

        var logicalRoutUILen = 0
        if ("logical_router_back_refs" in portPutData["virtual-machine-interface"]) {
            var logicalRouterURL = '/logical-router/'+portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]['uuid'];
            commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
             global.HTTP_REQUEST_GET, null, configApiServer, null,
             appData);
            logicalRoutUILen = 1;
        }
        DataObjectLenDetail["LogicalRouterUIStartIndex"] = DataObjectArr.length - logicalRoutUILen;
        DataObjectLenDetail["LogicalRouterUICount"] = logicalRoutUILen;
    }

    //fixed ip
    if ("instance_ip_back_refs" in portPutData["virtual-machine-interface"] ||
        "instance_ip_back_refs" in vmiData["virtual-machine-interface"]) {
        filterUpdateFixedIP(error, portPutData, vmiData, function(createFixedIp,deleteFixedip){
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
            DataObjectLenDetail["instanceIPCreateStartIndex"] = DataObjectArr.length - createFixedIp.length;
            DataObjectLenDetail["instanceIPCreateCount"] = createFixedIp.length;

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
            DataObjectLenDetail["instanceIPDeleteStartIndex"] = DataObjectArr.length - deleteFixedip.length;
            DataObjectLenDetail["instanceIPDeleteCount"] = deleteFixedip.length;
        });
    }

    var boolDeviceOwnerChange = true;
    if ("virtual_machine_interface_device_owner" in vmiData["virtual-machine-interface"] &&
        "virtual_machine_interface_device_owner" in portPutData["virtual-machine-interface"]) {
        if(vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] ==
            portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] || 
            (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) ==
            (portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7)) {
            if ((vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
                if ("virtual_machine_refs" in vmiData["virtual-machine-interface"] &&
                    "virtual_machine_refs" in portPutData["virtual-machine-interface"]) {
                    if (vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"] ==
                        portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"]) {
                        portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = 
                        vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
                        delete(portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]);
                        delete(portPutData["virtual-machine-interface"]["virtual_machine_refs"]);
                        boolDeviceOwnerChange = false;
                    }
                }
            } else if (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] ==
                       "network:router_interface") {
                if ("logical_router_back_refs" in vmiData["virtual-machine-interface"] &&
                    "logical_router_back_refs" in portPutData["virtual-machine-interface"]) {
                    if (vmiData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"] ==
                        portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"]) {
                        boolDeviceOwnerChange = false;
                    }
                }
            } else {
                boolDeviceOwnerChange = false;
            }
        }
    }
    processDataObjects(error, DataObjectArr, DataObjectDelArr, vmiData, portPutData, DataObjectLenDetail, boolDeviceOwnerChange, request, appData,
    function(error, result){
        callback(error, result)
    });
}

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
 * 1. Callback for Ports update operations
 * 2. Compare the data from UI and data from server is compared and
 *    corresponding read/create/update data object is created.
 */
function processDataObjects (error, DataObjectArr, DataObjectDelArr, vmiData, portPutData, DataObjectLenDetail, boolDeviceOwnerChange, request, appData, callback)
{
    var portPutURL = '/virtual-machine-interface/';
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    portPutURL += vmiUUID;
    if (0 == DataObjectArr.length && 0 == DataObjectDelArr.length && boolDeviceOwnerChange == false) {
        //no change in floating or fixedip;
        updateVMI(portPutURL, portPutData, appData, function(error, data) {
            callback(error, data);
            return;
        });
    } else if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(error, result) {
            if(error){
                callback(error, result);
                return;
            }
            linkUnlinkDetails(error, result, DataObjectLenDetail, portPutData, boolDeviceOwnerChange, vmiData, request, appData,
            function(error, results, subIntfObjArr){
                if (error) {
                    callback(error, results);
                    return;
                }
                async.map(subIntfObjArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
                          function(err, results) {
                    if(err){
                        callback(err, results);
                        return;
                    }
                    deleteAllReference(DataObjectDelArr,
                                       portPutURL, portPutData,
                                       appData, function(error, results){
                        callback(error, results);
                        return;
                    });
                });
            });
        });
    } else if (boolDeviceOwnerChange == true) {
        deviceOwnerChange(error, [], DataObjectArr, DataObjectLenDetail, portPutData, vmiData, request, appData, function(novaError, data, DataObjectArr){
            if (novaError != null) {
                deleteAllReference(DataObjectDelArr, portPutURL, portPutData, appData, function(error, results){
                    if (novaError != null) {
                        if (error != null) {
                            error.messages += "<br>" + novaError.messages;
                        } else {
                            error = novaError;
                        }
                    }
                    callback(error, data);
                    return;
                });
            } else {
            if (DataObjectArr != null && DataObjectArr.length > 0) {
                async.map(DataObjectArr,
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
                function(error, results) {
                    if (error) {
                        callback(error, results);
                        return;
                    }
                    deleteAllReference(DataObjectDelArr, portPutURL, portPutData, appData, function(error, results){
                        callback(error, results);
                        return;
                    });
                });
            } else {
                deleteAllReference(DataObjectDelArr, portPutURL, portPutData, appData, function(error, results){
                    callback(error, results);
                    return;
                });
            }
            }
        });
    } else {
        deleteAllReference(DataObjectDelArr, portPutURL, portPutData, appData, function(error, results){
            callback(error, results);
            return;
        });
    }
}

/**
 * @deleteAllReference
 * private function
 * 1. Callback for Ports update operations
 * 2. Send a call to delete all refence in DataObjectDelArr.
 * 3. If no DataObjectDelArr available then pass it to update VMI.
 */
function deleteAllReference (DataObjectDelArr, portPutURL, portPutData, appData, callback)
{
    if (0 == DataObjectDelArr.length) {
        updateVMI(portPutURL, portPutData, appData, function(error, data) {
            callback(error, data);
            return;
        });
    } else {
        async.map(DataObjectDelArr,
        commonUtils.getAPIServerResponse(configApiServer.apiDelete, true),
        function(error, results) {
            updateVMI(portPutURL, portPutData, appData, function(error, data) {
               callback(error, data);
               return;
            });
        });
    }
}

/**
 * @updateVMI
 * private function
 * 1. Callback for Ports update operations
 * 2. Send a call to Update the VMI.
 */
function updateVMI (portPutURL, portPutData, appData, callback)
{
    portPutData = removeBackRef(portPutData)
    configApiServer.apiPut(portPutURL, portPutData, appData,
    function(error, data) {
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
    if ('virtual_machine_interface_refs' in 
        portPutData['virtual-machine-interface']) {
        delete 
            portPutData['virtual-machine-interface']['virtual_machine_interface_refs'];
    }
    return portPutData;
}

/**
 * @linkUnlinkDetails
 * private function
 * 1. Callback for Ports update operations
 * 2. Updating detail for floating IP.
 * 3. if Device owner is chnged then call deviceOwnerChange
 *    to update device owner.
 */
function linkUnlinkDetails (error, result, DataObjectLenDetail, portPutData, boolDeviceOwnerChange, vmiData, request, appData, callback)
{
    var i=0;
    var DataObjectArr = [];
    for (i = DataObjectLenDetail["FloatingIpCreateStartIndex"]; i < DataObjectLenDetail["FloatingIpCreateStartIndex"]+DataObjectLenDetail["FloatingIpCreateCount"]; i++) {
        if (result[i] != null) {
            var floatingIPURL = '/floating-ip/'+result[i]['floating-ip']['uuid'];
            var responceData = createFloatingIPDataObject(responceData, portPutData, result[i]);
            commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                                appData);
        }
    }
    for (i = DataObjectLenDetail["FloatingIpDeleteStartIndex"]; i < (DataObjectLenDetail["FloatingIpDeleteStartIndex"]+DataObjectLenDetail["FloatingIpDeleteCount"]); i++) {
        if (result[i] != null) {
            if ('floating-ip' in result[i] && 'virtual_machine_interface_refs' in result[i]['floating-ip']) {
                var floatingIPURL = '/floating-ip/'+result[i]['floating-ip']['uuid'];
                var vmiRef = result[i]['floating-ip']['virtual_machine_interface_refs'];
                var vmiRefLen = result[i]['floating-ip']['virtual_machine_interface_refs'].length;
                for (var j = 0; j < vmiRefLen; j++) {
                    if (vmiRef[j]['uuid'] == portPutData['virtual-machine-interface']['uuid']) {
                        result[i]['floating-ip']['virtual_machine_interface_refs'].splice(j,1);
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                           global.HTTP_REQUEST_PUT, result[i], null, null,
                           appData);
                        j--;
                        vmiRefLen--;
                        break;
                    }
                }
            }
        }
    }
    
    var subIntfObjArr = [];
    var flag = false;

    for(i = DataObjectLenDetail["VMISubnetInterfaceCreateStartIndex"];i<DataObjectLenDetail["VMISubnetInterfaceCreateStartIndex"]+DataObjectLenDetail["VMISubnetInterfaceCreateCount"];i++){
        if(result[i] != null){
            var vmiSubInterfaceURL = '/virtual-machine-interface/'+result[i]['virtual-machine-interface']['uuid'];
            var responceData =
                VMIJSONStructureSubInterface(result[i]['virtual-machine-interface'], portPutData);
            commonUtils.createReqObj(DataObjectArr, vmiSubInterfaceURL,
                                global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                                appData);
            if ((false == flag) && 
                (null != result[i]['virtual-machine-interface']
                                  ['virtual_machine_refs'])) {
                var vmiChildUrl = '/virtual-machine-interface/' +
                    vmiData['virtual-machine-interface']['uuid'];
                var vmiPutData = { 'virtual-machine-interface' : {
                    'fq_name': vmiData['virtual-machine-interface']['fq_name'],
                    'uuid': vmiData['virtual-machine-interface']['uuid']
                    }
                }

                commonUtils.createReqObj(subIntfObjArr, vmiChildUrl,
                                         global.HTTP_REQUEST_PUT, vmiPutData,
                                         null, null, appData);
                flag = true;
            }
        }
    }

    for(i = DataObjectLenDetail["VMISubnetInterfaceDeleteStartIndex"]; i < (DataObjectLenDetail["VMISubnetInterfaceDeleteStartIndex"]+DataObjectLenDetail["VMISubnetInterfaceDeleteCount"]);i++){
        if(result[i] != null){
            if( 'virtual-machine-interface' in result[i] && 'virtual_machine_interface_refs' in result[i]['virtual-machine-interface']){
                var vmiSubInterfaceURL = '/virtual-machine-interface/'+result[i]['virtual-machine-interface']['uuid'];
                var vmiRef = result[i]['virtual-machine-interface']['virtual_machine_interface_refs'];
                var vmiRefLen = result[i]['virtual-machine-interface']['virtual_machine_interface_refs'].length;
                for(var j=0;j<vmiRefLen;j++){
                    if(vmiRef[j]['uuid'] == portPutData['virtual-machine-interface']['uuid']){
                        var vmRef =
                            result[i]['virtual-machine-interface']['virtual_machine_refs'];
                        result[i]['virtual-machine-interface']['virtual_machine_interface_refs'].splice(j,1);
                        if('virtual_machine_interface_properties' in result[i]['virtual-machine-interface'] &&
                            "sub_interface_vlan_tag" in result[i]['virtual-machine-interface']['virtual_machine_interface_properties']) {
                            //delete only sub_interface_vlan_tag to make sure it wont affect if a port is created from the SI which has extra fields. 
                            delete result[i]['virtual-machine-interface']['virtual_machine_interface_properties']['sub_interface_vlan_tag'];
                        }
                        if (vmiData['virtual-machine-interface']['virtual_machine_refs']) {
                            var vmiChildUrl = '/virtual-machine-interface/' +
                                vmiData['virtual-machine-interface']['uuid'];
                            var vmiPutData = {
                                'virtual-machine-interface': {
                                    'fq_name': vmiData['fq_name'],
                                    'uuid': vmiData['uuid'],
                                    'virtual_machine_refs': []
                                }
                            };
                            commonUtils.createReqObj(subIntfObjArr, vmiChildUrl,
                                                     global.HTTP_REQUEST_PUT,
                                                     vmiPutData,
                                                     null, null, appData);
                        }
                        j--;
                        vmiRefLen--;
                        commonUtils.createReqObj(DataObjectArr, vmiSubInterfaceURL,
                           global.HTTP_REQUEST_PUT, result[i], null, null,
                           appData);
                        break;
                    }
                }
            }
        }
    }

    if (DataObjectArr != null && DataObjectArr.length > 0) {
        async.map(DataObjectArr,
        commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
        function(error, results) {
        if (error != null) {
            error.messages += error.messages;
                callback(error, results, subIntfObjArr);
            }
            setDeviceOwner (error, result, DataObjectLenDetail,
                            portPutData, vmiData, boolDeviceOwnerChange, request,
                            appData, function(error, result) {
                callback(error, result, subIntfObjArr);
                return;
            })
        });
    } else {
        setDeviceOwner (error, result, DataObjectLenDetail,
                        portPutData, vmiData, boolDeviceOwnerChange, request,
                        appData, function(error, result) {
            callback(error, result, subIntfObjArr);
            return;
        })
    }
}

function setDeviceOwner(error, result, DataObjectLenDetail,
                        portPutData, vmiData, boolDeviceOwnerChange, request,
                        appData, callback) {
    var DataObjectArr = [];
    if (boolDeviceOwnerChange == true) {
        deviceOwnerChange(error, result, DataObjectArr, DataObjectLenDetail,
                          portPutData, vmiData, request, appData, function(
                                               error, data, DataObjectArr){
             if (DataObjectArr != null && DataObjectArr.length > 0) {
                async.map(DataObjectArr,
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
                function(error, results) {
                        callback(error, results);
                        return;
                });
            } else {
                callback(error, DataObjectArr);
                return;
            }
            return;
        });
    } else {
        callback(error, DataObjectArr);
    }
}

/**
 * @deviceOwnerChange
 * private function
 * 1. Callback for Ports update operations
 * 2. Update the device owner with corresponding
 *    router or compute function
 * 3. If any compute or router has to be detached
 *    even that is taken care.
 */

function deviceOwnerChange(error, result, DataObjectArr, DataObjectLenDetail, portPutData, vmiData, request, appData, callback){
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
    if ("virtual_machine_interface_device_owner" in portPutData["virtual-machine-interface"] &&
            "virtual_machine_interface_device_owner" in vmiData["virtual-machine-interface"]) {
        var serverIndex = DataObjectLenDetail["LogicalRouterServerStartIndex"];
        var serverCount = DataObjectLenDetail["LogicalRouterServerCount"];
        var uiIndex = DataObjectLenDetail["LogicalRouterUIStartIndex"];
        var uiCount = DataObjectLenDetail["LogicalRouterUICount"];
        if((vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
            if(((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) != "compute") ||
               (((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") && 
               (vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"] != portPutData["virtual-machine-interface"][ "virtual_machine_refs"][0]["uuid"]))){
                //detach compute nova
                var body = {};
                body.portID = vmiData["virtual-machine-interface"]["uuid"];
                //body.netID = vmiData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                body.vmUUID = vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
                detachVMICompute(request, body, function(error, results){
                    if (error) {
                        callback(error, result, DataObjectArr)
                        return;
                    }
                    //Add new Compute nova entrey
                    if((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute"){
                        body = {};
                        body.portID = portPutData["virtual-machine-interface"]["uuid"];
                        //body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                        body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
                        attachVMICompute(request, body, function (error, rtData) {
                            if ('virtual_machine_refs' in portPutData['virtual-machine-interface']){
                                delete portPutData['virtual-machine-interface']['virtual_machine_refs'];
                            }
                            if ('virtual_machine_interface_device_owner' in portPutData['virtual-machine-interface']) {
                                delete portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
                            }
                            callback(error, rtData, DataObjectArr);
                            return;
                        });
                    } else if (portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "network:router_interface") {
                    //Add new router entrey
                    if(result[uiIndex] != null){
                        if(DataObjectLenDetail["LogicalRouterUICount"] == 1) {
                            var logicalRouterURL = '/logical-router/'+result[uiIndex]['logical-router']['uuid'];
                            var responceData = {};
                            var responceData = createlogicalRouterDataObject(responceData,portPutData,result[uiIndex]);
                            commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
                                global.HTTP_REQUEST_PUT, responceData, null, null,
                                appData);
                            var lruuid = portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"];
                            var domainProject = [];
                            domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][0]);
                            domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][1]);
                            callback(error, result, DataObjectArr);
                            return;
                        } else {
                            callback(error, result, DataObjectArr);
                            return;
                        }
                    }
                    } else {
                        //No attach/edit
                        callback(error, result, DataObjectArr);
                        return;
                    }
                });
            } else {
                //No change in compute nova
                callback(error, result, DataObjectArr);
                return;
            }
        }
        if (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "network:router_interface") {
            if (portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] != "network:router_interface"
               || ((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "network:router_interface") &&
                  "logical_router_back_refs" in vmiData["virtual-machine-interface"] &&
                  vmiData["virtual-machine-interface"]["logical_router_back_refs"].length > 0 &&
                  "uuid" in vmiData["virtual-machine-interface"]["logical_router_back_refs"][0] &&
                  vmiData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"] != portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"])) {
                // Detach Logical router
                if (serverCount == 1 && result[serverIndex] != null && 'logical-router' in result[serverIndex]) {
                    var logicalRouterURL = '/logical-router/'+result[serverIndex]['logical-router']['uuid'];
                    if ('virtual_machine_interface_refs' in result[serverIndex]['logical-router']) {
                        var vmiRef = result[serverIndex]['logical-router']['virtual_machine_interface_refs'];
                        var vmiRefLen = result[serverIndex]['logical-router']['virtual_machine_interface_refs'].length;
                        for (var j = 0 ; j < vmiRefLen ; j++) {
                            if (vmiRef[j]['uuid'] == portPutData['virtual-machine-interface']['uuid']) {
                                result[serverIndex]['logical-router']['virtual_machine_interface_refs'].splice(j,1);
                                var logicalRouterObj = {};
                                logicalRouterObj = genarateLogicalRouterObj(result[serverIndex],logicalRouterObj);
                                j = vmiRefLen;
                                //detaching the vmi from logical rout
                                var lruuid = vmiData["virtual-machine-interface"]["logical_router_back_refs"][0]["uuid"];
                                configApiServer.apiPut(logicalRouterURL, logicalRouterObj, appData,
                                function(error, data) {
                                    if (error) {
                                        callback(error, result, DataObjectArr);
                                        return;
                                    }
                                    if (portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "network:router_interface") {
                                        //Attaching the new Logical router
                                        var logicalRouterURL = '/logical-router/'+result[uiIndex]['logical-router']['uuid'];
                                        var vmiIndexinLR = -1;
                                        if ('virtual_machine_interface_refs' in result[uiIndex]['logical-router']) {
                                            vmiIndexinLR = result[uiIndex]['logical-router']['virtual_machine_interface_refs'].length;
                                        }
                                        if (vmiIndexinLR == -1) {
                                            result[uiIndex]["logical-router"]["virtual_machine_interface_refs"] = [];
                                            vmiIndexinLR++;
                                        }
                                        result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR] = {};
                                        result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR]["to"] = portPutData['virtual-machine-interface']["fq_name"];
                                        result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR]["uuid"] = portPutData['virtual-machine-interface']['uuid'];
                                        var logicalRouterObj = {};
                                        logicalRouterObj = genarateLogicalRouterObj(result[uiIndex],logicalRouterObj);
                                        commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
                                            global.HTTP_REQUEST_PUT, logicalRouterObj, null, null,
                                            appData);
                                        var lruuid = result[uiIndex]['logical-router']['uuid'];
                                        var domainProject = [];
                                        domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][0]);
                                        domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][1]);
                                        callback(error, result, DataObjectArr);
                                        return;
                                    } else if((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
                                        //Attach the new compute Nova
                                        body = {};
                                        body.portID = portPutData["virtual-machine-interface"]["uuid"];
                                        //body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                                        body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
                                        attachVMICompute(request, body, function(error, results){
                                            if ('virtual_machine_refs' in portPutData['virtual-machine-interface']){
                                                delete portPutData['virtual-machine-interface']['virtual_machine_refs'];
                                            }
                                            if ('virtual_machine_interface_device_owner' in portPutData['virtual-machine-interface']) {
                                                delete portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
                                            }
                                            callback(error, result, DataObjectArr);
                                            return;
                                        });
                                    } else {
                                        // No attach or editof logical rout
                                        callback(error, result, DataObjectArr);
                                        return;
                                    }
                                });
                            }
                        }
                    }
                } else {
                    // If Api serveris nothaving any data of Logical Router
                    vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
                }
            } else {
                // if Routerbackref is missing in the logical router.
                if (("logical_router_back_refs" in vmiData["virtual-machine-interface"]) &&
                (vmiData["virtual-machine-interface"]["logical_router_back_refs"].length > 0) &&
                ("uuid" in vmiData["virtual-machine-interface"]["logical_router_back_refs"][0])) {
                    // No change in Route table
                    callback(error, result, DataObjectArr);
                    return;
                } else {
                    vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
                }
            }
        }
        if (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "") {
            if (portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "network:router_interface") {
                var logicalRouterURL = '/logical-router/'+result[uiIndex]['logical-router']['uuid'];
                var vmiIndexinLR = -1;
                if ('virtual_machine_interface_refs' in result[uiIndex]['logical-router']) {
                    vmiIndexinLR = result[uiIndex]['logical-router']['virtual_machine_interface_refs'].length;
                }
                if (vmiIndexinLR == -1) {
                    result[uiIndex]["logical-router"]["virtual_machine_interface_refs"] = [];
                    vmiIndexinLR++;
                }
                result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR] = {};
                result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR]["to"] = portPutData['virtual-machine-interface']["fq_name"];
                result[uiIndex]["logical-router"]["virtual_machine_interface_refs"][vmiIndexinLR]["uuid"] = portPutData['virtual-machine-interface']['uuid'];

                commonUtils.createReqObj(DataObjectArr, logicalRouterURL,
                    global.HTTP_REQUEST_PUT, result[uiIndex], null, null,
                    appData);
                var lruuid = result[uiIndex]['logical-router']['uuid'];
                var domainProject = [];
                domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][0]);
                domainProject.push(portPutData["virtual-machine-interface"]["logical_router_back_refs"][0]["to"][1]);
                callback(error, result, DataObjectArr);
                return;
            } else if((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"]).substring(0,7) == "compute") {
                //Attach the new compute Nova
                body = {};
                body.portID = portPutData["virtual-machine-interface"]["uuid"];
                //body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"];
                attachVMICompute(request, body, function(error, results){
                    if ('virtual_machine_refs' in portPutData['virtual-machine-interface']){
                        delete portPutData['virtual-machine-interface']['virtual_machine_refs'];
                    }
                    if ('virtual_machine_interface_device_owner' in portPutData['virtual-machine-interface']) {
                        delete portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"];
                    }
                    callback(error, results, DataObjectArr);
                    return;
                });
            } else {
                // No attach or editof logical rout
                callback(error, result, DataObjectArr);
                return;
            }
        }
    } else {
        callback(error, result, DataObjectArr);
        return;
    }
}

/**
 * @genarateLogicalRouterObj
 * private function
 * 1. Callback for Ports update operations
 * 2. When logical router is set the object is genated
 *    with the corresponding values
 */
function genarateLogicalRouterObj (logicalRouter, logicalRouterObj)
{
    var returnObject = {};
    returnObject['logical-router'] = {};
    returnObject['logical-router']['fq_name'] = logicalRouter['logical-router']['fq_name'];
    returnObject['logical-router']['uuid'] = logicalRouter['logical-router']['uuid'];
    var vmiLength = logicalRouter['logical-router']['virtual_machine_interface_refs'].length;
    returnObject['logical-router']['virtual_machine_interface_refs'] = [];
    if (vmiLength > 0) {
        for (var i = 0; i < vmiLength; i++) {
            if (logicalRouter['logical-router']['virtual_machine_interface_refs'][i] != null) {
                returnObject['logical-router']['virtual_machine_interface_refs'][i] = {};
                returnObject['logical-router']['virtual_machine_interface_refs'][i]["to"] = logicalRouter['logical-router']['virtual_machine_interface_refs'][i]["to"];
                returnObject['logical-router']['virtual_machine_interface_refs'][i]["uuid"] = logicalRouter['logical-router']['virtual_machine_interface_refs'][i]["uuid"];
            }
        }
    }
    logicalRouterObj = returnObject;
    return logicalRouterObj;
}

/**
 * @filterUpdateLogicalRouter
 * private function
 * 1. Callback for Ports update operations
 * 2. filtering the logical router values either to create or delete.
 */
function filterUpdateLogicalRouter (error, portPutData, vmiData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createlogicalRouterArray = [];
    var deletelogicalRouterArray = [];
    var logicalRouteripPoolRef_server = [];
    var logicalRouteripPoolRefs_serverLen = 0;
    var logicalRouteripPoolRef_put = [];
    var logicalRouteripPoolRefs_putLen = 0;

    if ('virtual-machine-interface' in vmiData &&
        'logical_router_back_refs' in vmiData['virtual-machine-interface']) {
        logicalRouteripPoolRef_server = vmiData['virtual-machine-interface']['logical_router_back_refs'];
        logicalRouteripPoolRefs_serverLen = logicalRouteripPoolRef_server.length;
    }
    if ('virtual-machine-interface' in portPutData &&
        'logical_router_back_refs' in portPutData['virtual-machine-interface']) {
        logicalRouteripPoolRef_put = portPutData['virtual-machine-interface']['logical_router_back_refs'];
        logicalRouteripPoolRefs_putLen = logicalRouteripPoolRef_put.length;
    }
    if (logicalRouteripPoolRefs_serverLen == 0) {
        for (i = 0; i < logicalRouteripPoolRefs_putLen; i++) {
            createlogicalRouterArray.push(logicalRouteripPoolRef_put[i]);
        }
        callback(createlogicalRouterArray,deletelogicalRouterArray);
        return;

    }
    if (logicalRouteripPoolRefs_putLen == 0) {
        for (i = 0; i < logicalRouteripPoolRefs_serverLen; i++) {
            deletelogicalRouterArray.push(logicalRouteripPoolRef_server[i]);
        }
        callback(createlogicalRouterArray,deletelogicalRouterArray);
        return;
    }
    var j = 0;
    var create = true;
    for (i = 0; i < logicalRouteripPoolRefs_putLen; i++) {
        create = true;
        for (j = 0; j < logicalRouteripPoolRefs_serverLen && i >= 0; j++) {
            var portlogicalRouterip_fqname = JSON.stringify(logicalRouteripPoolRef_put[i]["to"]);
            var vmilogicalRouterip_fqname = JSON.stringify(logicalRouteripPoolRef_server[j]["to"]);
            if (portlogicalRouterip_fqname == vmilogicalRouterip_fqname) {
                logicalRouteripPoolRef_put.splice(i,1);
                logicalRouteripPoolRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                logicalRouteripPoolRefs_putLen = logicalRouteripPoolRef_put.length;
                logicalRouteripPoolRefs_serverLen = logicalRouteripPoolRef_server.length;
            }
        }
        if (create == true) {
            createlogicalRouterArray.push(logicalRouteripPoolRef_put[i]);
            logicalRouteripPoolRef_put.splice(i,1);
            i--;
            logicalRouteripPoolRefs_putLen = logicalRouteripPoolRef_put.length;
        }
    }
    for (j = 0; j < logicalRouteripPoolRefs_serverLen; j++) {
        deletelogicalRouterArray.push(logicalRouteripPoolRef_server[j]);
    }
    callback(createlogicalRouterArray,deletelogicalRouterArray);
}

/**
 * @filterUpdateFloatingIP
 * private function
 * 1. Callback for Ports update operations
 * 2. filtering the floating IP values either to create or delete.
 */
function filterVMISubInterface(error, portPutData, vmiData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createVMISubInterfaceArray = [];
    var deleteVMISubInterfaceArray = [];
    var VMISubInterfaceRef_server = [];
    var VMISubInterfaceRefs_serverLen = 0;
    var VMISubInterfaceRef_put = [];
    var VMISubInterfaceRefs_putLen = 0;

    var tempPortPutData = commonUtils.cloneObj(portPutData)
    if ( 'virtual-machine-interface' in vmiData &&
         'virtual_machine_interface_refs' in vmiData['virtual-machine-interface']) {
        VMISubInterfaceRef_server = vmiData['virtual-machine-interface']['virtual_machine_interface_refs'];
        VMISubInterfaceRefs_serverLen = VMISubInterfaceRef_server.length;
    }
    if ( 'virtual-machine-interface' in tempPortPutData &&
         'virtual_machine_interface_refs' in tempPortPutData['virtual-machine-interface']) {
        VMISubInterfaceRef_put = tempPortPutData['virtual-machine-interface']['virtual_machine_interface_refs'];
        VMISubInterfaceRefs_putLen = VMISubInterfaceRef_put.length;
    }
    if(VMISubInterfaceRefs_serverLen == 0) {
        for(i = 0;i<VMISubInterfaceRefs_putLen;i++){
            createVMISubInterfaceArray.push(VMISubInterfaceRef_put[i]);
        }
        callback(createVMISubInterfaceArray,deleteVMISubInterfaceArray);
        return;

    }
    if(VMISubInterfaceRefs_putLen == 0) {
        for(i = 0;i<VMISubInterfaceRefs_serverLen;i++){
            deleteVMISubInterfaceArray.push(VMISubInterfaceRef_server[i]);
        }
        callback(createVMISubInterfaceArray,deleteVMISubInterfaceArray);
        return;
    }
    var j = 0;
    var create = true;
    for(i=0; i<VMISubInterfaceRefs_putLen ;i++){
        create = true;
        for(j=0; j<VMISubInterfaceRefs_serverLen && i >= 0;j++){
            var portVMISubInterface_fqname = JSON.stringify(VMISubInterfaceRef_put[i]["to"]);
            var vmiVMISubInterface_fqname = JSON.stringify(VMISubInterfaceRef_server[j]["to"]);
            if( portVMISubInterface_fqname == vmiVMISubInterface_fqname){
                VMISubInterfaceRef_put.splice(i,1);
                VMISubInterfaceRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                VMISubInterfaceRefs_putLen = VMISubInterfaceRef_put.length;
                VMISubInterfaceRefs_serverLen = VMISubInterfaceRef_server.length;
            }
        }
        if(create == true) {
            createVMISubInterfaceArray.push(VMISubInterfaceRef_put[i]);
            VMISubInterfaceRef_put.splice(i,1);
            i--;
            VMISubInterfaceRefs_putLen = VMISubInterfaceRef_put.length;
        }
    }
    for(j=0; j<VMISubInterfaceRefs_serverLen;j++){
        deleteVMISubInterfaceArray.push(VMISubInterfaceRef_server[j]);
    }
    callback(createVMISubInterfaceArray,deleteVMISubInterfaceArray);
}


function filterUpdateFloatingIP(error, portPutData, vmiData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createFloatingArray = [];
    var deleteFloatingArray = [];
    var floatingipPoolRef_server = [];
    var floatingipPoolRefs_serverLen = 0;
    var floatingipPoolRef_put = [];
    var floatingipPoolRefs_putLen = 0;

    if ('virtual-machine-interface' in vmiData &&
        'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        floatingipPoolRef_server = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefs_serverLen = floatingipPoolRef_server.length;
    }
    if ('virtual-machine-interface' in portPutData &&
        'floating_ip_back_refs' in portPutData['virtual-machine-interface']) {
        floatingipPoolRef_put = portPutData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
    }
    if (floatingipPoolRefs_serverLen == 0) {
        for (i = 0; i < floatingipPoolRefs_putLen; i++) {
            createFloatingArray.push(floatingipPoolRef_put[i]);
        }
        callback(createFloatingArray,deleteFloatingArray);
        return;

    }
    if (floatingipPoolRefs_putLen == 0) {
        for (i = 0; i < floatingipPoolRefs_serverLen; i++) {
            deleteFloatingArray.push(floatingipPoolRef_server[i]);
        }
        callback(createFloatingArray,deleteFloatingArray);
        return;
    }
    var j = 0;
    var create = true;
    for (i = 0; i < floatingipPoolRefs_putLen; i++) {
        create = true;
        for (j = 0; j < floatingipPoolRefs_serverLen && i >= 0; j++){
            var portFloatingip_fqname = JSON.stringify(floatingipPoolRef_put[i]["to"]);
            var vmiFloatingip_fqname = JSON.stringify(floatingipPoolRef_server[j]["to"]);
            if (portFloatingip_fqname == vmiFloatingip_fqname) {
                floatingipPoolRef_put.splice(i,1);
                floatingipPoolRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
                floatingipPoolRefs_serverLen = floatingipPoolRef_server.length;
            }
        }
        if (create == true) {
            createFloatingArray.push(floatingipPoolRef_put[i]);
            floatingipPoolRef_put.splice(i,1);
            i--;
            floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
        }
    }
    for (j = 0; j < floatingipPoolRefs_serverLen; j++) {
        deleteFloatingArray.push(floatingipPoolRef_server[j]);
    }
    callback(createFloatingArray,deleteFloatingArray);
}

/**
 * @filterUpdateFixedIP
 * private function
 * 1. Callback for Ports update operations
 * 2. filtering the fixed IP values either to create or delete.
 */
function filterUpdateFixedIP (error, portPutData, vmiData, callback)
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
    var appData =  dataObject.appData;
    var portId = dataObject.uuid;
    var request = dataObject.request;
    var userData = dataObject.userData;
    if (userData != null) {
        var dataObjArr = [];
        var userDataLen = userData.length;
        for (var i = 0; i < userDataLen; i++) {
            dataObjArr.push({"portId" : userData[i],
                             "appData" : appData,
                             "request" :request})
        }
        async.mapLimit(dataObjArr, 100, deletePortPerUUID, function(error, data) {
            if (error) {
                callback(null, {'error': error, 'data': data});
                return;
            }
            var dataObj = {"portId" : portId,
                           "appData" : appData,
                           "request" : request};
            deletePortPerUUID (dataObj, function(error, data) {
                callback(null, {'error': error, 'data': data});
                return;
            });
        });
    } else {
        var dataObj = {"portId" : portId,
                       "appData" : appData,
                       "request" : request};
        deletePortPerUUID (dataObj, function(error, data) {
            callback(null, {'error': error, 'data': data});
            return;
        })
    }
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
    if (dataObj['type'] == 'instance-ip') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiDelete, false,item,callback)
            },
            function(error, results) {
                callback(error, results);
                return;
            });
        //return;
    } else if (dataObj['type'] == 'vmi') {
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
        //return;
    } else if (dataObj['type'] == 'floating-ip') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                vmiDelFloatingIP(error, results, dataObj['vmiData'],
                                    dataObj['appData'], function(err, data){
                        callback(err, results);
                        //return;
                });
        });
        return;
    } else if (dataObj['type'] == 'virtual-machine-interface-ref') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                removeRefSubInterface(error, results, dataObj['vmiData'],
                                    dataObj['appData'], function(err, data){
                        callback(err, results);
                        //return;
                });
        });
        return;
    } else if (dataObj['type'] == 'logicalInterface') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                vmiDelLogicalInterface(error, results, dataObj['vmiData'],
                                    dataObj['appData'], function(err, data){
                        callback(err, results);
                        //return;
                });
        });
        return;
    } else if (dataObj['type'] == 'subnet') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                delSubnet(error, results, dataObj['vmiData'], dataObj['appData'],
                    function(err, data){
                        callback(err, results);
                        //return;
                });
        });
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
    } else if (dataObj['type'] == 'logical-router') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false,item,callback)
            },
            function(error, results) {
                vmiDelLogicalRout(error, results, dataObj['vmiData'],
                     dataObj['appData'], function(err, data){
                        callback(err, results);
                        return;
                });
        });
        //return;
    } else if (dataObj['type'] == 'staticRout') {
        async.map(dataObj['dataObjArr'],
            function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiDelete, false,item,callback)
            },
            function(error, results) {
                callback(error, results);
                return;
            });
        //return;
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
    var floatingIPdataObjArr            = [];
    var logicalInterfaceObjArr            = [];
    var logicalRouterdataObjArr            = [];
    var vnObjArr            = [];
    var instanceIPdataObjArr            = [];
    var staticRoutObjArr            = [];
    var vmiObjArr            = [];
    var allDataObj            = [];
    var floatingipPoolRefsLen = 0;
    var fixedipPoolRefsLen    = 0;
    var logicalRouterRefLen    = 0;
    var logicalInterfaceRefLen    = 0;
    var vmRefLen    = 0;
    var floatingipPoolRef     = null;
    var logicalInterfaceRef     = null;
    var logicalRouterRef     = null;
    var fixedipPoolRef        = null;
    var vmRef        = null;
    var floatingipObj         = null;
    var logicalInterfaceObj         = null;
    var reqUrl                = "";
    var vmiRef               = null;
    var vmiRefLen            = 0;
    var vmiRefObjArr         = [];
    var subnetRef               = null;
    var subnetRefLen            = 0;
    var subnetRefObjArr         = [];


    var uuid = vmiData['virtual-machine-interface']['uuid'];

    if ('virtual-machine-interface' in vmiData &&
        'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        floatingipPoolRef = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefsLen = floatingipPoolRef.length;
    }
    for (i = 0; i < floatingipPoolRefsLen; i++) {
        reqUrl = '/floating-ip/' + floatingipPoolRef[i]['uuid'];
        commonUtils.createReqObj(floatingIPdataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);

    }

    if (floatingIPdataObjArr.length > 0) {
        var floatingIPObj = {};
        floatingIPObj['type'] = "floating-ip";
        floatingIPObj['dataObjArr'] = floatingIPdataObjArr;
        floatingIPObj['vmiData'] = vmiData;
        floatingIPObj['appData'] = appData;
        allDataObj.push(floatingIPObj);
    }

    if ('virtual-machine-interface' in vmiData &&
        'logical_interface_back_refs' in vmiData['virtual-machine-interface']) {
        logicalInterfaceRef = vmiData['virtual-machine-interface']['logical_interface_back_refs'];
        logicalInterfaceRefLen = logicalInterfaceRef.length;
    }
    for (i = 0; i < logicalInterfaceRefLen; i++) {
        reqUrl = '/logical-interface/' + logicalInterfaceRef[i]['uuid'];
        commonUtils.createReqObj(logicalInterfaceObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);

    }
    if (logicalInterfaceObjArr.length > 0) {
        logicalInterfaceObj = {};
        logicalInterfaceObj['type'] = "logicalInterface";
        logicalInterfaceObj['dataObjArr'] = logicalInterfaceObjArr;
        logicalInterfaceObj['vmiData'] = vmiData;
        logicalInterfaceObj['appData'] = appData;
        allDataObj.push(logicalInterfaceObj);
    }

    //LogicalRouter Reference
    if ('virtual-machine-interface' in vmiData &&
        'logical_router_back_refs' in vmiData['virtual-machine-interface']) {
        logicalRouterRef = vmiData['virtual-machine-interface']['logical_router_back_refs'];
        logicalRouterRefLen = logicalRouterRef.length;
    }
    var rtDataArr = [];
    for (i = 0; i < logicalRouterRefLen; i++) {
        reqUrl = '/logical-router/' + logicalRouterRef[i]['uuid'];
        var lruuid = logicalRouterRef[i]['uuid'];
        commonUtils.createReqObj(logicalRouterdataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
        rtDataArr.push({'action': "remove", 'vmiData': vmiData, 'lruuid': lruuid, 'domainProject':[], 'appData': appData});
    }
    if (logicalRouterdataObjArr.length > 0) {
        var logicalRouterObj = {};
        logicalRouterObj['type'] = "logical-router";
        logicalRouterObj['dataObjArr'] = logicalRouterdataObjArr;
        logicalRouterObj['vmiData'] = vmiData;
        logicalRouterObj['appData'] = appData;
        allDataObj.push(logicalRouterObj);
    }
    
    //Subnet Interface Reference
   /* if ( 'virtual_machine_interface_refs' in vmiData['virtual-machine-interface']) {
        vmiRef = vmiData['virtual-machine-interface']['virtual_machine_interface_refs'];
        vmiRefLen = vmiRef.length;
    }

    for (i = 0; i < vmiRefLen; i++) {
        reqUrl = '/virtual-machine-interface/' + vmiRef[i]['uuid'];
        commonUtils.createReqObj(vmiRefObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);

    }
    if(vmiRefObjArr.length > 0){
        var vmiSubInterfaceObj = {};
        vmiSubInterfaceObj['type'] = "virtual-machine-interface-ref";
        vmiSubInterfaceObj['dataObjArr'] = vmiRefObjArr;
        vmiSubInterfaceObj['vmiData'] = vmiData;
        vmiSubInterfaceObj['appData'] = appData;
        allDataObj.push(vmiSubInterfaceObj);
    }*/
    
    //subnet
    if ('virtual-machine-interface' in vmiData &&
        'subnet_back_refs' in vmiData['virtual-machine-interface']) {
        subnetRef = vmiData['virtual-machine-interface']['subnet_back_refs'];
        subnetRefLen = subnetRef.length;
    }
    if (subnetRefLen == 1) {
        reqUrl = '/subnet/' + subnetRef[0]['uuid'];
        commonUtils.createReqObj(subnetRefObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    if (subnetRefObjArr.length > 0) {
        var subnetObj = {};
        subnetObj['type'] = "subnet";
        subnetObj['vmiData'] = vmiData;
        subnetObj['dataObjArr'] = subnetRefObjArr;
        subnetObj['appData'] = appData;
        allDataObj.push(subnetObj);
    }

    //Instance IP
    if ('instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefsLen = fixedipPoolRef.length;
    }

    for (var i = 0; i < fixedipPoolRefsLen; i++) {
        reqUrl = '/instance-ip/' + fixedipPoolRef[i]['uuid'];
        commonUtils.createReqObj(instanceIPdataObjArr, reqUrl,
                                 global.HTTP_REQUEST_DEL, null, null, null,
                                 appData);
    }

    if (instanceIPdataObjArr.length > 0) {
        var instanceIPObj = {};
        instanceIPObj['type'] = "instance-ip";
        instanceIPObj['dataObjArr'] = instanceIPdataObjArr;
        allDataObj.push(instanceIPObj);
    }

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

    async.mapSeries(allDataObj, deletePortAsync, function(err, data) {
        callback(err, null);
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
 * @delSubnet
 * private function
 * 1. Callback for delete create
 * 2. call back for deletePortAsync.
 * 3. Delete Subnet.
 */
function delSubnet (error, results, vmiData, appData, callback)
{
    if (error) {
        callback(error, results);
        return;
    }
    var linkedvmi2subnetLength = 0;
    if ('subnet' in results[0] && 'virtual_machine_interface_refs' in results[0]['subnet']) {
        linkedvmi2subnetLength = results[0]['subnet']['virtual_machine_interface_refs'].length;
    }

    if (linkedvmi2subnetLength == 1 &&  
        results[0]['subnet']['virtual_machine_interface_refs'][0]["uuid"] == 
        vmiData["virtual-machine-interface"]["uuid"]) {
        var subnetDelURL = "/subnet/"+results[0]['subnet']["uuid"];
        configApiServer.apiDelete(subnetDelURL, appData,
        function(error, data) {
            callback(error, data);
            return;
        });
    } else {
        if(linkedvmi2subnetLength >= 1){
            for (var i=0; i < linkedvmi2subnetLength; i++) {
                if(results[0]['subnet']['virtual_machine_interface_refs'][i]["uuid"] == 
                    vmiData["virtual-machine-interface"]["uuid"]){
                    results[0]['subnet']['virtual_machine_interface_refs'].splice(i,1);
                    break;
                }
            }
            var subnetUpdateURL = "/subnet/"+results[0]['subnet']["uuid"];
            configApiServer.apiPut(subnetUpdateURL, results[0], appData,
            function (error, data) {
                callback(error, data);
            });
        } else {
            callback(error, results);
        }
    }
}

/**
 * @vmiDelLogicalInterface
 * private function
 * 1. Callback for delete create
 * 2. call back for deletePortAsync.
 * 3. Update/Remove the reference of Logical Interface.
 */
function vmiDelLogicalInterface(error, results, vmiData, appData, callback)
{
    if (error) {
        callback(error, results, null);
        return;
    }
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    var i = 0;
    var DataObjectArr = []
    if (results.length > 0) {
    var resultLength = results.length;
        for (i = 0; i < resultLength; i++) {
            if (results[i] != null) {
                if ('logical-interface' in results[i] && 'virtual_machine_interface_refs' in results[i]['logical-interface']) {
                var logivalInterfaceURL = '/logical-interface/'+results[i]['logical-interface']['uuid'];
                    var vmiRef = results[i]['logical-interface']['virtual_machine_interface_refs'];
                    var vmiRefLen = results[i]['logical-interface']['virtual_machine_interface_refs'].length;
                    for (var j = 0; j < vmiRefLen; j++) {
                        if (vmiRef[j]['uuid'] == vmiUUID) {
                            results[i]['logical-interface']['virtual_machine_interface_refs'].splice(j,1);
                            j--;
                            vmiRefLen--;
                            commonUtils.createReqObj(DataObjectArr, logivalInterfaceURL,
                            global.HTTP_REQUEST_PUT, results[i], null, null,
                            appData);
                        }
                    }
                }
            }
        }
    }
    if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,
              function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true,item,callback)
              },
              function(error, results) {
                callback(error, results);
                return
              });
    } else {
        callback(error,null);
    }
}

/**
 * @vmiDelFloatingIP
 * private function
 * 1. Callback for delete create
 * 2. call back for deletePortAsync.
 * 3. Remove the reference of Floating IP.
 */
function removeRefSubInterface(error, results, vmiData, appData, callback)
{
    if (error) {
        callback(error, results, null);
        return;
    }
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    var i = 0;
    var DataObjectArr = []
    if(results.length > 0){
    var resultLength = results.length;
        for (i = 0; i < resultLength; i++) {
            if(results[i] != null){
                if( 'virtual-machine-interface' in results[i] && 'virtual_machine_interface_refs' in results[i]['virtual-machine-interface']){
                var vmiRefURL = '/virtual-machine-interface/'+results[i]['virtual-machine-interface']['uuid'];
                    var vmiRef = results[i]['virtual-machine-interface']['virtual_machine_interface_refs'];
                    var vmiRefLen = results[i]['virtual-machine-interface']['virtual_machine_interface_refs'].length;
                    for(var j=0;j<vmiRefLen;j++){
                        if(vmiRef[j]['uuid'] == vmiUUID){
                            results[i]['virtual-machine-interface']['virtual_machine_interface_refs'].splice(j,1);
                            if('virtual_machine_interface_properties' in results[i]['virtual-machine-interface'] &&
                               "sub_interface_vlan_tag" in results[i]['virtual-machine-interface']['virtual_machine_interface_properties']) {
                                //delete only sub_interface_vlan_tag to make sure it wont affect if a port is created from the SI which has extra fields.
                                delete results[i]['virtual-machine-interface']['virtual_machine_interface_properties']['sub_interface_vlan_tag'];
                            }
                            j--;
                            vmiRefLen--;
                            commonUtils.createReqObj(DataObjectArr, vmiRefURL,
                            global.HTTP_REQUEST_PUT, results[i], null, null,
                            appData);
                        }
                    }
                }
            }
        }
    }
    if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,
              function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true,item,callback)
              },
              function(error, results) {
                callback(error, results);
                return
              });
    } else {
        callback(error,null);
    }
}

function vmiDelFloatingIP(error, results, vmiData, appData, callback)
{
    if (error) {
        callback(error, results, null);
        return;
    }
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    var i = 0;
    var DataObjectArr = []
    if (results.length > 0) {
    var resultLength = results.length;
        for (i = 0; i < resultLength; i++) {
            if (results[i] != null) {
                if ('floating-ip' in results[i] && 'virtual_machine_interface_refs' in results[i]['floating-ip']) {
                var floatingIPURL = '/floating-ip/'+results[i]['floating-ip']['uuid'];
                    var vmiRef = results[i]['floating-ip']['virtual_machine_interface_refs'];
                    var vmiRefLen = results[i]['floating-ip']['virtual_machine_interface_refs'].length;
                    for (var j = 0; j < vmiRefLen; j++) {
                        if (vmiRef[j]['uuid'] == vmiUUID) {
                            results[i]['floating-ip']['virtual_machine_interface_refs'].splice(j,1);
                            j--;
                            vmiRefLen--;
                            commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                            global.HTTP_REQUEST_PUT, results[i], null, null,
                            appData);
                        }
                    }
                }
            }
        }
    }
    if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,
              function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true,item,callback)
              },
              function(error, results) {
                callback(error, results);
                return
              });
    } else {
        callback(error,null);
    }
}

/**
 * @vmiDelLogicalRout
 * private function
 * 1. Callback for delete create
 * 2. call back for deletePortAsync.
 * 3. remove the reference Logical Router.
 */
function vmiDelLogicalRout (error, results, vmiData, appData, callback)
{
    if (error) {
        callback(error, results, null);
        return;
    }
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    var i = 0;
    var DataObjectArr = []
    if (results.length > 0) {
    var resultLength = results.length;
        for (i = 0; i < resultLength; i++) {
            if (results[i] != null) {
                if ( 'logical-router' in results[i] && 'virtual_machine_interface_refs' in results[i]['logical-router']) {
                var floatingIPURL = '/logical-router/'+results[i]['logical-router']['uuid'];
                    var vmiRef = results[i]['logical-router']['virtual_machine_interface_refs'];
                    var vmiRefLen = results[i]['logical-router']['virtual_machine_interface_refs'].length;
                    for (var j = 0; j < vmiRefLen; j++) {
                        if (vmiRef[j]['uuid'] == vmiUUID) {
                            results[i]['logical-router']['virtual_machine_interface_refs'].splice(j,1);
                            j--;
                            vmiRefLen--;
                            commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                            global.HTTP_REQUEST_PUT, results[i], null, null,
                            appData);
                        }
                    }
                }
            }
        }
    }

    if (DataObjectArr.length > 0) {
        async.map(DataObjectArr,function(item,callback) {
                commonUtils.getAPIServerResponse(configApiServer.apiPut, true,item,callback)
        },
              function(error, results) {
                callback(error, results);
                return
              });
    } else {
        callback(error,null);
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
