/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @portsconfig.api.js
 *     - Handlers for Security Group Configuration
 *     - Interfaces with config api server
 */

//var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
//var config = require(process.mainModule.exports["corePath"] + '/config/config.global.js');

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
 *
 */

function readPorts (portsObj, callback)
{
    var dataObjArr = portsObj['reqDataArr'];
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
        getVirtualIachineInterfaceCb(err, data, appData, callback);
    });
}

function getVirtualIachineInterfaceCb(err, vmiData, appData, callback)
{
    var dataObjArr            = [];
    var floatingipPoolRefsLen = 0;
    var fixedipPoolRefsLen    = 0;
    var routeTableRefsLen     = 0;
    var floatingipPoolRef     = null;
    var fixedipPoolRef        = null;
    var routeTableRef         = null;
    var floatingipObj         = null;
    var fixedipObj            = null;
    var routeTableObj         = null;

    if ( 'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
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
    if ('interface_route_table_refs' in vmiData['virtual-machine-interface']) {
        routeTableRef = vmiData['virtual-machine-interface']['interface_route_table_refs'];
        routeTableRefsLen = routeTableRef.length;
    }

    for (i = 0; i < routeTableRefsLen; i++) {
        routeTableObj = routeTableRef[i];
        reqUrl = '/interface-route-table/' + routeTableObj['uuid'];
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
        vmiFloatingFixedIP(error, results, vmiData, floatingipPoolRefsLen, routeTableRefsLen,
                              appData, callback);
    });
}

function vmiFloatingFixedIP(error, results, vmiData, floatingipPoolRefsLen, routeTableRefsLen, appData, callback)
{
    if (error) {
        callback(error, vmiData);
        return;
    }
    var i = 0, IpPoolsLen = 0;
    IpPoolsLen = results.length;
    instanceIPLen = IpPoolsLen-routeTableRefsLen;

    for (i = 0; i < floatingipPoolRefsLen; i++) {
        if(results[i] != null){
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'] = {};
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'].ip =
                     results[i]['floating-ip']['floating_ip_address'];
            vmiData['virtual-machine-interface']['floating_ip_back_refs'][i]['floatingip'].subnet_uuid =
                     results[i]['floating-ip']['subnet_uuid'];
        }
    }

    for(i = floatingipPoolRefsLen; i< instanceIPLen;i++){
        if(results[i]){
            vmiData['virtual-machine-interface']['instance_ip_back_refs'][i - floatingipPoolRefsLen]['fixedip'] = {};
            vmiData['virtual-machine-interface']['instance_ip_back_refs'][i - floatingipPoolRefsLen]['fixedip'].ip =
                     results[i]['instance-ip']['instance_ip_address'];
        }
    }
    for(i = instanceIPLen; i< IpPoolsLen;i++){
        if(results[i]){
            vmiData['virtual-machine-interface']['interface_route_table_refs'][i - instanceIPLen]['sharedip'] =
                     results[i]['interface-route-table']['interface_route_table_routes'];
        }
    }
    callback(error, vmiData);
}


/**
 * @createPorts
 * public function
 * 1. URL /api/tenants/config/ports Post
 * 2. Sets Post Data and sends back the VMI to client
 */

function createPortsCB (req, appData, callback)
{
    createPortsValidate(request, response, appData, function (error, results) {
        callback(error, results);
    }) ;
}
function createPorts(request, response, appData){
    createPortsValidate(request, response, appData, function (error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    }) ;
}

function createPortsValidate(request, response, appData, callback){
    var portsCreateURL = '/virtual-machine-interfaces';
    var portPostData = request.body;
    var orginalPortData = commonUtils.cloneObj(request.body);

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
    var uuid = UUID.create();
    portPostData["virtual-machine-interface"]["uuid"] = uuid['hex'];
    if(portPostData['virtual-machine-interface']['fq_name'].length == 2) {
        portPostData["virtual-machine-interface"]["fq_name"][2] = uuid['hex'];
        portPostData["virtual-machine-interface"]["display_name"] = uuid['hex'];
        portPostData["virtual-machine-interface"]["name"] = uuid['hex'];
    }

    if ((('instance_ip_back_refs' in portPostData['virtual-machine-interface']))){
        delete portPostData['virtual-machine-interface']['instance_ip_back_refs'];
    }
    if ((('interface_route_table_refs' in portPostData['virtual-machine-interface']))){
        delete portPostData['virtual-machine-interface']['interface_route_table_refs'];
    }
    configApiServer.apiPost(portsCreateURL, portPostData, appData,
    function (error, vmisData) {
        if(error) {
            callback(error, null);
            return;
        }
        var portId = vmisData['virtual-machine-interface']['uuid'];
        readVMIwithUUID(portId, appData, function(err, vmiData){
            if(err) {
                callback(error, vmiData);
                return;
            }
            portSendResponse(error, request, vmiData, orginalPortData, appData, function (err, results) {
                callback(error, results);
                return;
            });
        });
    });
}

/**
 * @createFixedIPDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Reads the response of Ports get from config api server
 *    and sends it back to the client.
 */
function createFixedIPDataObject(response,portConfig, fixedip)
{
    if(fixedip != null && fixedip != ""){
        var fixedIpObj = {};
        fixedIpObj["instance-ip"] = {};
        uuid = UUID.create();
        fixedIpObj["instance-ip"]["fq_name"] = [];
        fixedIpObj["instance-ip"]["fq_name"][0] = uuid['hex'];
        fixedIpObj["instance-ip"]["display_name"] = uuid['hex'];
        fixedIpObj["instance-ip"]["name"] = uuid['hex'];
        fixedIpObj["instance-ip"]["uuid"] = uuid['hex'];
        fixedIpObj["instance-ip"]["instance_ip_address"] = fixedip['instance_ip_address'][0]["fixedIp"];
        fixedIpObj["instance-ip"]["subnet_uuid"] = fixedip['instance_ip_address'][0]["subnet_uuid"];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"] = [];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0] = {};
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["attr"] = null;
        fixedIpObj["instance-ip"]["virtual_machine_interface_refs"][0]["href"] = portConfig['virtual-machine-interface']['href'];
        fixedIpObj["instance-ip"]["virtual_network_refs"] = [];
        fixedIpObj["instance-ip"]["virtual_network_refs"] = portConfig['virtual-machine-interface']['virtual_network_refs'];
        response = fixedIpObj;
    }
    return response;
}


/**
 * @createStaticIPDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Reads the response of Ports get from config api server
 *    and sends it back to the client.
 */
function createStaticIPDataObject(response, portConfig, sharedip,staticRoutIndex)
{
    if(sharedip != null && sharedip != "" && 'route' in sharedip && sharedip.route.length > 0){
        var sharedIpObj = {};
        sharedIpObj["interface-route-table"] = {};
        uuid = UUID.create();
        sharedIpObj["interface-route-table"]["fq_name"] = [];
        sharedIpObj["interface-route-table"]["fq_name"][0] = portConfig['virtual-machine-interface']["fq_name"][0];
        sharedIpObj["interface-route-table"]["fq_name"][1] = portConfig['virtual-machine-interface']["fq_name"][1];
        sharedIpObj["interface-route-table"]["fq_name"][2] = uuid['hex'];
        sharedIpObj["interface-route-table"]["display_name"] = uuid['hex'];
        sharedIpObj["interface-route-table"]["name"] = uuid['hex'];
        sharedIpObj["interface-route-table"]["uuid"] = uuid['hex'];
        sharedIpObj["interface-route-table"]["parent_type"] = "project";
        sharedIpObj["interface-route-table"]["interface_route_table_routes"] = {};
        sharedIpObj["interface-route-table"]["interface_route_table_routes"]["route"] = [];
        sharedIpObj["interface-route-table"]["interface_route_table_routes"]["route"] = sharedip.route;
        response = sharedIpObj;
    }
    return response;
}


/**
 * @createFloatingIPDataObject
 * private function
 * 1. Callback for Ports create / update operations
 * 2. Reads the response of Ports get from config api server
 *    and sends it back to the client.
 */
function createFloatingIPDataObject(response,portConfig, fqname)
{
    if(fqname != null && fqname != ""){
        var floatingIp = {};
        floatingIp["floating-ip"] = {};
        floatingIp["floating-ip"]["fq_name"] = [];
        floatingIp["floating-ip"]["fq_name"][0] = fqname['to'];
        floatingIp["floating-ip"]["fq_name"]['uuid'] = fqname['uuid'];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"] = [];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0] = {};
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["to"] = portConfig['virtual-machine-interface']["fq_name"];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["uuid"] = portConfig['virtual-machine-interface']['uuid'];
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["attr"] = null;
        floatingIp["floating-ip"]["virtual_machine_interface_refs"][0]["href"] = portConfig['virtual-machine-interface']['href'];
        response = floatingIp;
    }
    return response;
}


/**
 * @portSendResponse
 * private function
 * 1. Sends back the response of port read to clients after set operations.
 */
function portSendResponse(error, req, portConfig, orginalPortData, appData, callback)
{
    if (error) {
        callback(error, null);
        return;
    }
    var fixedIpPoolRef = null;
    var fixedIpPoolRefLen = 0;
    var DataObjectArr = [];
    if (('instance_ip_back_refs' in orginalPortData['virtual-machine-interface']) &&
       (orginalPortData['virtual-machine-interface']['instance_ip_back_refs'].length > 0)){
        fixedIpPoolRef = orginalPortData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedIpPoolRefLen = fixedIpPoolRef.length;
    }
    if(fixedIpPoolRef != null && fixedIpPoolRef != ""){
        if(fixedIpPoolRefLen > 0){
            var instanceCreateURL = '/instance-ips';
            for(var i = 0;i<fixedIpPoolRefLen;i++){
                var responceData = {};
                responceData = createFixedIPDataObject(responceData,portConfig,fixedIpPoolRef[i]);
                commonUtils.createReqObj(DataObjectArr, instanceCreateURL,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(responceData), null, null,
                                 appData);
            }
        }
    }

    var staticIpPoolRef = null;
    var staticIpPoolRefLen = 0;
    if (('interface_route_table_refs' in orginalPortData['virtual-machine-interface']) &&
       (orginalPortData['virtual-machine-interface']['interface_route_table_refs'].length > 0)){
        staticIpPoolRef = orginalPortData['virtual-machine-interface']['interface_route_table_refs'];
        staticIpPoolRefLen = staticIpPoolRef.length;
    }

    if(staticIpPoolRef != null && staticIpPoolRef != ""){
        if(staticIpPoolRefLen > 0){
            var staticIpCreateURL = '/interface-route-tables';
            for(var i = 0;i<staticIpPoolRefLen;i++){
                var responceData = {};
                responceData = createStaticIPDataObject(responceData,portConfig,staticIpPoolRef[i]["sharedip"],i);
                commonUtils.createReqObj(DataObjectArr, staticIpCreateURL,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(responceData), null, null,
                                 appData);
            }
        }
    }

    var floatingipPoolRef = null;
    var floatingipPoolRefLen = 0;

    if ((('floating_ip_back_refs' in orginalPortData['virtual-machine-interface']))){
        floatingipPoolRef = orginalPortData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefLen = floatingipPoolRef.length;
    }
    if(floatingipPoolRef != null && floatingipPoolRef != ""){
        if(floatingipPoolRefLen > 0){
            for(var i = 0;i<floatingipPoolRefLen;i++){
                var floatingIPURL = '/floating-ip/'+floatingipPoolRef[i]['uuid'];
                responceData = {};
                responceData = createFloatingIPDataObject(responceData,portConfig,floatingipPoolRef[i]);
                commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                             global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                             appData);
            }
        }
    }

    if("virtual_machine_interface_device_owner" in orginalPortData["virtual-machine-interface"] &&
       orginalPortData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "compute:nova") {
        body = {};
        body.portID = portConfig["virtual-machine-interface"]["uuid"];
        body.netID = portConfig["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
        //req.body.fixedIP = results[0]["instance-ip"]["instance_ip_address"];
        body.vmUUID = orginalPortData["virtual-machine-interface"]["virtual_machine_refs"][0]["to"][0];
        attachVMICompute(req, body, function (error, results){
            if(error){
                callback(error, result)
                return;
            }
        });
    }
    if (DataObjectArr.length === 0) {
        callback(error, portConfig)
        return;
    }
    async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(error, results) {
            var DataObjectArrUpdate = [];
            if(staticIpPoolRefLen <= 0){
                callback(error, results);
                return;
            } else if(staticIpPoolRefLen > 0){
                portConfig["virtual-machine-interface"]["interface_route_table_refs"] = [];
                for(var i=fixedIpPoolRefLen;i< (fixedIpPoolRefLen+staticIpPoolRefLen);i++){
                    portConfig["virtual-machine-interface"]["interface_route_table_refs"][i-fixedIpPoolRefLen] = {}
                    portConfig["virtual-machine-interface"]["interface_route_table_refs"][i-fixedIpPoolRefLen]["to"] = results[i]["interface-route-table"]["fq_name"];
                    portConfig["virtual-machine-interface"]["interface_route_table_refs"][i-fixedIpPoolRefLen]["uuid"] = results[i]["interface-route-table"]["uuid"];
                }

                var portPutURL = '/virtual-machine-interface/'+portConfig['virtual-machine-interface']['uuid'];
                commonUtils.createReqObj(DataObjectArrUpdate, portPutURL,
                         global.HTTP_REQUEST_PUT, portConfig, null, null,
                         appData);

                if(DataObjectArrUpdate.length > 0){
                    async.map(DataObjectArrUpdate,
                        commonUtils.getServerResponseByRestApi(configApiServer, true),
                        function(error, results) {
                             callback(error, portConfig);
                             return;
                        });
                } else {
                    callback(error, portConfig);
                    return;
                }
            }
    });

}

/**
 * @updatePorts
 * public function
 * 1. URL /api/tenants/config/ports/:id
 * 2. Update the ports from config api server
 */
function updatePortsCB(request, appData, callback)
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


function updatePorts(request, response, appData)
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

function attachVMICompute(req, body, callback){
    computeApi.portAttach(req, body, function(err, data) {
        callback(err, data);
        return;
    });
}

function detachVMICompute(req, body, callback){
    computeApi.portDetach(req,  body.portID, body.vmUUID, function(err, data) {
        callback(err, data);
        return;
    });
}

function compareUpdateVMI(error, request, portPutData, vmiData, appData, callback)
{
    if (error) {
        callback(error, null);
        return;
    }
    var vmiUUID = vmiData['virtual-machine-interface']['uuid'];
    portPutData["virtual-machine-interface"]["id_perms"]["uuid"] = vmiData['virtual-machine-interface']["id_perms"]["uuid"];

    var DataObjectArr = [];
    var DataObjectDelArr = [];
    var creatFloatingIpLen = 0;
    var deleteFloatingIpLen = 0;

    if("floating_ip_back_refs" in portPutData["virtual-machine-interface"] ||
        "floating_ip_back_refs" in vmiData["virtual-machine-interface"])
    {
        filterUpdateFloatingIP(error, portPutData, vmiData, function(createFloatingIp,deleteFloatingip){
            //createFloatingIP();
            if(createFloatingIp != null && createFloatingIp != ""){
                creatFloatingIpLen = createFloatingIp.length;
                if(creatFloatingIpLen > 0){
                    for(var i = 0;i<creatFloatingIpLen;i++){
                        var floatingIPURL = '/floating-ip/'+createFloatingIp[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }

            //deleteFloatingIP();
            if(deleteFloatingip != null && deleteFloatingip != ""){
                deleteFloatingIpLen = deleteFloatingip.length;
                if(deleteFloatingIpLen > 0){
                    for(var i = 0;i<deleteFloatingIpLen;i++){
                        var floatingIPURL = '/floating-ip/'+deleteFloatingip[i]['uuid'];
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                     global.HTTP_REQUEST_GET, null, configApiServer, null,
                                     appData);
                    }
                }
            }

        });
    }


    if("instance_ip_back_refs" in portPutData["virtual-machine-interface"] ||
        "instance_ip_back_refs" in vmiData["virtual-machine-interface"])
    {
        filterUpdateFixedIP(error, portPutData, vmiData, function(createFixedIp,deleteFixedip){
            if(createFixedIp != null && createFixedIp != ""){
                if(createFixedIp.length > 0){
                    for(var i = 0;i<createFixedIp.length;i++){
                        var fixedIPURL = '/instance-ips';
                        responceData = {};
                        responceData = createFixedIPDataObject(responceData,portPutData,createFixedIp[i]);
                        commonUtils.createReqObj(DataObjectArr, fixedIPURL,
                                     global.HTTP_REQUEST_POST, commonUtils.cloneObj(responceData), configApiServer, null,
                                     appData);
                    }
                }
            }
            if(deleteFixedip != null && deleteFixedip != ""){
                if(deleteFixedip.length > 0){
                    for(var i = 0;i<deleteFixedip.length;i++){
                        var fixedIPURL = '/instance-ip/'+deleteFixedip[i]["uuid"];
                        commonUtils.createReqObj(DataObjectDelArr, fixedIPURL,
                                     global.HTTP_REQUEST_DEL, null, configApiServer, null,
                                     appData);
                    }
                }
            }
        });
    }

    var createStaticRoutLen = 0;
    var DataSRObjectArr = [];
    if("interface_route_table_refs" in portPutData["virtual-machine-interface"] ||
        "interface_route_table_refs" in vmiData["virtual-machine-interface"])
    {
        var portDataLen = 0;
        if('interface_route_table_refs' in portPutData["virtual-machine-interface"])
            portDataLen = portPutData["virtual-machine-interface"]["interface_route_table_refs"].length;
        if(portDataLen > 0){

            for(i = 0 ; i< portDataLen ; i++){
                if(portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["uuid"] == undefined ||
                   portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["uuid"] == null ||
                   portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["uuid"] == ""){
                    var staticRouteURL = '/interface-route-tables';
                    responceData = {};
                    responceData = createStaticIPDataObject(responceData,portPutData,portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["sharedip"],i);
                    portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["uuid"] = responceData["interface-route-table"]["uuid"];
                    portPutData["virtual-machine-interface"]["interface_route_table_refs"][i]["to"] = responceData["interface-route-table"]["fq_name"];
                    commonUtils.createReqObj(DataObjectArr, staticRouteURL,
                                 global.HTTP_REQUEST_POST, commonUtils.cloneObj(responceData), configApiServer, null,
                                 appData);
               }
            }
        }
        filterUpdateStaticRoute(error, portPutData, vmiData, function(deleteStaticRoute){
            if(deleteStaticRoute != null && deleteStaticRoute != ""){
                if(deleteStaticRoute.length > 0){
                    for(var i = 0;i<deleteStaticRoute.length;i++){
                        var staticRouteURL = '/interface-route-table/'+deleteStaticRoute[i]["uuid"];
                        commonUtils.createReqObj(DataSRObjectArr, staticRouteURL,
                                     global.HTTP_REQUEST_DEL, null, configApiServer, null,
                                     appData);
                    }
                }
            }

        });
    }
    processDataObjects(DataObjectArr, DataObjectDelArr, DataSRObjectArr, vmiUUID, portPutData, creatFloatingIpLen, deleteFloatingIpLen, appData,
    function(error, result){
        if(error){
            callback(error, result);
            return;
        }
        computeVMI(portPutData, vmiData, request, function (error, result){
            callback(error, result)
        });
    });
}

function computeVMI(portPutData, vmiData, request, callback){
    if("virtual_machine_interface_device_owner" in portPutData["virtual-machine-interface"] &&
            "virtual_machine_interface_device_owner" in vmiData["virtual-machine-interface"]){

        if(portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "compute:nova" &&
           vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "compute:nova"){
               if(vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"] != portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["uuid"]){
                //detach and attach
                var body = {};
                body.portID = vmiData["virtual-machine-interface"]["uuid"];
                body.netID = vmiData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                //req.body.fixedIP = results[0]["instance-ip"]["instance_ip_address"];
                body.vmUUID = vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["to"][0];

                detachVMICompute(request, body, function (error, results){
                    if(error){
                        callback(error, result)
                        return;
                    }
                    body = {};
                    body.portID = portPutData["virtual-machine-interface"]["uuid"];
                    body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
                    //req.body.fixedIP = results[0]["instance-ip"]["instance_ip_address"];
                    body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["to"][0];
                    attachVMICompute(request, body, function (error, results){
                        callback(error, result)
                        return;
                    });
                });
            } else {
                //No change in compute nova
                callback(null, vmiData);
                return;
            }
        } else if((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "compute:nova") &&
                 (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] != "compute:nova")){
            //attach

            var body = {};
            body.portID = portPutData["virtual-machine-interface"]["uuid"];
            body.netID = portPutData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
            //req.body.fixedIP = results[0]["instance-ip"]["instance_ip_address"];
            body.vmUUID = portPutData["virtual-machine-interface"]["virtual_machine_refs"][0]["to"][0];

            attachVMICompute(request, body, function (error, results){
                callback(error, results);
                return;
            });
        } else if((portPutData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] != "compute:nova") &&
                 (vmiData["virtual-machine-interface"]["virtual_machine_interface_device_owner"] == "compute:nova")){
            //detach
            var body = {};
            body.portID = vmiData["virtual-machine-interface"]["uuid"];
            body.netID = vmiData["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"];
            //req.body.fixedIP = results[0]["instance-ip"]["instance_ip_address"];
            body.vmUUID = vmiData["virtual-machine-interface"]["virtual_machine_refs"][0]["to"][0];

            detachVMICompute(request, body, function (error, results){
                callback(error, results);
                return;
            });
        }
    }
}

function processDataObjects(DataObjectArr, DataObjectDelArr, DataSRObjectArr, vmiUUID, portPutData, creatFloatingIpLen, deleteFloatingIpLen, appData, callback) {

    var portPutURL = '/virtual-machine-interface/';
    portPutURL += vmiUUID;

    if (0 == DataObjectArr.length && 0 == DataObjectDelArr.length && 0 == DataSRObjectArr.length) {
        //no change in floating or fixedip;
        updateVMI(DataSRObjectArr, portPutURL, portPutData, appData, function(error, data) {
            callback(error, data);
            return;
        });
    } else if (DataObjectArr.length >  0){
        async.map(DataObjectArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(error, floatingIP) {
            linkUnlinkFloatingIp(error, floatingIP, creatFloatingIpLen, deleteFloatingIpLen, portPutData, appData,
            function(error, data){
                if(error){
                    callback(error, results);
                    return;
                }
                deleteAllReference(DataObjectDelArr, DataSRObjectArr, portPutURL, portPutData, appData, function(error, results){
                    callback(error, results);
                });
            });
        });
    } else {
        deleteAllReference(DataObjectDelArr, DataSRObjectArr, portPutURL, portPutData, appData, function(error, results){
            callback(error, results);
        });
    }

}

function deleteAllReference(DataObjectDelArr, DataSRObjectArr, portPutURL, portPutData, appData, callback){
    if (0 == DataObjectDelArr.length) {
        updateVMI(DataSRObjectArr, portPutURL, portPutData, appData, function(error, data) {
            callback(error, data);
            return;
        });
    } else {
        async.map(DataObjectDelArr,
        commonUtils.getAPIServerResponse(configApiServer.apiDelete, true),
        function(error, results) {
            updateVMI(DataSRObjectArr, portPutURL, portPutData, appData, function(error, data) {
               callback(error, data);
               return;
            });
        });
    }
}


function updateVMI(DataSRObjectArr, portPutURL, portPutData, appData, callback){
    configApiServer.apiPut(portPutURL, portPutData, appData,
    function (error, data) {
        if(error){
            callback(error, data);
            return;
        }
        if(DataSRObjectArr.length > 0){
            async.map(DataSRObjectArr,
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, true),
            function(error, results) {
                callback(error, results);
                return;
            });
        } else {
            callback(error, data);
            return;
        }
    });
}

function linkUnlinkFloatingIp(error, floatingIP, creatFloatingIpLen, deleteFloatingIpLen, portPutData, appData, callback){
    var i=0;
    var DataObjectArr = [];
    for(i = 0;i<creatFloatingIpLen;i++){
        if(floatingIP[i] != null){
            var floatingIPURL = '/floating-ip/'+floatingIP[i]['floating-ip']['uuid'];
            var responceData = createFloatingIPDataObject(responceData,portPutData,floatingIP[i]);
            commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                                global.HTTP_REQUEST_PUT, commonUtils.cloneObj(responceData), null, null,
                                appData);
        }
    }
    for(i = creatFloatingIpLen; i < (creatFloatingIpLen+deleteFloatingIpLen);i++){
        if(floatingIP[i] != null){
            if( 'floating-ip' in floatingIP[i] && 'virtual_machine_interface_refs' in floatingIP[i]['floating-ip']){
                var floatingIPURL = '/floating-ip/'+floatingIP[i]['floating-ip']['uuid'];
                var vmiRef = floatingIP[i]['floating-ip']['virtual_machine_interface_refs'];
                var vmiRefLen = floatingIP[i]['floating-ip']['virtual_machine_interface_refs'].length;
                for(var j=0;j<vmiRefLen;j++){
                    if(vmiRef[j]['uuid'] == portPutData['virtual-machine-interface']['uuid']){
                        floatingIP[i]['floating-ip']['virtual_machine_interface_refs'].splice(j,1);
                        j--;
                        vmiRefLen--;
                        commonUtils.createReqObj(DataObjectArr, floatingIPURL,
                           global.HTTP_REQUEST_PUT, floatingIP[i], null, null,
                           appData);
                        break;
                    }
                }
            }
        }
    }

    async.map(DataObjectArr,
      commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
      function(error, results) {
          callback(error, results);
      });

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

    if ( 'virtual-machine-interface' in vmiData &&
         'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        floatingipPoolRef_server = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefs_serverLen = floatingipPoolRef_server.length;
    }
    if ( 'virtual-machine-interface' in portPutData &&
         'floating_ip_back_refs' in portPutData['virtual-machine-interface']) {
        floatingipPoolRef_put = portPutData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
    }
    if(floatingipPoolRefs_serverLen == 0) {
        for(i = 0;i<floatingipPoolRefs_putLen;i++){
            createFloatingArray.push(floatingipPoolRef_put[i]);
        }
        callback(createFloatingArray,deleteFloatingArray);
        return;

    }
    if(floatingipPoolRefs_putLen == 0) {
        for(i = 0;i<floatingipPoolRefs_serverLen;i++){
            deleteFloatingArray.push(floatingipPoolRef_server[i]);
        }
        callback(createFloatingArray,deleteFloatingArray);
        return;
    }
    var j = 0;
    var create = true;
    for(i=0; i<floatingipPoolRefs_putLen ;i++){
        create = true;
        for(j=0; j<floatingipPoolRefs_serverLen && i >= 0;j++){
            var portFloatingip_fqname = JSON.stringify(floatingipPoolRef_put[i]["to"]);
            var vmiFloatingip_fqname = JSON.stringify(floatingipPoolRef_server[j]["to"]);
            if( portFloatingip_fqname == vmiFloatingip_fqname){
                floatingipPoolRef_put.splice(i,1);
                floatingipPoolRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
                floatingipPoolRefs_serverLen = floatingipPoolRef_server.length;
            }
        }
        if(create == true) {
            createFloatingArray.push(floatingipPoolRef_put[i]);
            floatingipPoolRef_put.splice(i,1);
            i--;
            floatingipPoolRefs_putLen = floatingipPoolRef_put.length;
        }
    }
    for(j=0; j<floatingipPoolRefs_serverLen;j++){
        deleteFloatingArray.push(floatingipPoolRef_server[j]);
    }
    callback(createFloatingArray,deleteFloatingArray);
}

function filterUpdateFixedIP(error, portPutData, vmiData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createFixedArray = [];
    var deleteFixedArray = [];
    var fixedipPoolRef_server = [];
    var fixedipPoolRefs_serverLen = 0;
    var fixedipPoolRef_put = [];
    var fixedipPoolRefs_putLen = 0;
    if ( 'virtual-machine-interface' in vmiData &&
         'instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef_server = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefs_serverLen = fixedipPoolRef_server.length;
    }
    if ( 'virtual-machine-interface' in portPutData &&
         'instance_ip_back_refs' in portPutData['virtual-machine-interface']) {
        fixedipPoolRef_put = portPutData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefs_putLen = fixedipPoolRef_put.length;
    }
    if(fixedipPoolRefs_serverLen == 0) {
        for(i = 0;i<fixedipPoolRefs_putLen;i++){
            createFixedArray.push(fixedipPoolRef_put[i]);
        }
        callback(createFixedArray,deleteFixedArray);
        return;
    }
    if(fixedipPoolRefs_putLen == 0) {
        for(i = 0;i<fixedipPoolRefs_serverLen;i++){
            deleteFixedArray.push(fixedipPoolRef_server[i]);
        }
        callback(createFixedArray,deleteFixedArray);
        return;
    }
    var j = 0;
    var create = true;
    for(i=0; i<fixedipPoolRefs_putLen && i >= 0 ;i++){
        create = true;
        for(j=0; j<fixedipPoolRefs_serverLen && j >= 0 && i >= 0;j++){
            var portFixedip_uuid = JSON.stringify(fixedipPoolRef_put[i]["uuid"]);
            var vmiFixedip_uuid = JSON.stringify(fixedipPoolRef_server[j]["uuid"]);
            if( portFixedip_uuid == vmiFixedip_uuid){
                fixedipPoolRef_put.splice(i,1);
                fixedipPoolRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                fixedipPoolRefs_putLen--;
                fixedipPoolRefs_serverLen--;
            }
        }
        if(create == true) {
            createFixedArray.push(fixedipPoolRef_put[i]);
            fixedipPoolRef_put.splice(i,1);
            i--;
            fixedipPoolRefs_putLen--;
        }
    }
    for(j=0; j<fixedipPoolRefs_serverLen;j++){
        deleteFixedArray.push(fixedipPoolRef_server[j]);
    }

    callback(createFixedArray,deleteFixedArray);
}

function filterUpdateStaticRoute(error, portPutData, vmiData, callback)
{
    var i = 0;
    var postCopyData = [];
    var createStaticRouteArray = [];
    var deleteStaticRouteArray = [];
    var staticRouteRef_server = [];
    var staticRouteRefs_serverLen = 0;
    var staticRouteRef_put = [];
    var staticRouteRefs_putLen = 0;
    if ( 'virtual-machine-interface' in vmiData &&
         'interface_route_table_refs' in vmiData['virtual-machine-interface']) {
        staticRouteRef_server = vmiData['virtual-machine-interface']['interface_route_table_refs'];
        staticRouteRefs_serverLen = staticRouteRef_server.length;
    }
    if ( 'virtual-machine-interface' in portPutData &&
         'interface_route_table_refs' in portPutData['virtual-machine-interface']) {

        staticRouteRef_put = commonUtils.cloneObj(portPutData['virtual-machine-interface']['interface_route_table_refs']);
        staticRouteRefs_putLen = staticRouteRef_put.length;
    }
    if(staticRouteRefs_putLen == 0) {
        deleteStaticRouteArray  = [];
        for(i = 0;i<staticRouteRefs_serverLen;i++){
            deleteStaticRouteArray.push(staticRouteRef_server[i]);
        }
        callback(createStaticRouteArray,deleteStaticRouteArray);
        return;
    }
    var j = 0;
    var create = true;
    deleteStaticRouteArray  = [];
    for(i=0; i<staticRouteRefs_putLen && i >= 0 ;i++){
        create = true;
        for(j=0; j<staticRouteRefs_serverLen && j >= 0 && i >= 0;j++){
            var portStaticRouteip_uuid = JSON.stringify(staticRouteRef_put[i]["uuid"]);
            var vmiStaticRouteip_uuid = JSON.stringify(staticRouteRef_server[j]["uuid"]);
            if( portStaticRouteip_uuid == vmiStaticRouteip_uuid){
                staticRouteRef_put.splice(i,1);
                staticRouteRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                staticRouteRefs_putLen--;
                staticRouteRefs_serverLen--;
            }
        }
        if(create == true) {
            staticRouteRef_put.splice(i,1);
            i--;
            staticRouteRefs_putLen--;
        }
    }
    for(j=0; j<staticRouteRefs_serverLen;j++){
        deleteStaticRouteArray.push(staticRouteRef_server[j]);
    }

    callback(deleteStaticRouteArray);
}


/**
 * @deletePorts
 * public function
 * 1. URL /api/tenants/config/ports/:id
 * 2. Deletes the ports from config api server
  */

function deletePortsCB(request, appData, callback)
{
    var portId = "";
    portId = request.param('uuid');
    readVMIwithUUID(portId, appData, function(err, vmiData){
        getReadDelVMICb(err, vmiData, appData, function(error, response, data){
            callback(error, data);
            return;
        });
    });
}

function deletePorts(request, response, appData)
{
    var portId = "";
    portId = request.param('uuid');
    readVMIwithUUID(portId, appData, function(err, vmiData){
        getReadDelVMICb(err, vmiData, appData, function(error, response, data){
            commonUtils.handleJSONResponse(error, response, data);
            return;
        });
    });
}

function readVMIwithUUID(uuid, appData, callback ){
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

function deletePortAsync (dataObj, callback)
{
    if (dataObj['type'] == 'floating-ip') {
        async.map(dataObj['dataObjArr'],
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, results) {
                vmiDelFloatingIP(error, results, dataObj['vmiData'],
                                    dataObj['appData'], function(err, data){
                        callback(error, results);
                        return;
                });
        });
        return;
    }
    if (dataObj['type'] == 'instance-ip') {
        async.map(dataObj['dataObjArr'],
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function(error, results) {
                callback(error, results);
                return;
            });
        return;
    }
    if (dataObj['type'] == 'vmi') {
        async.map(dataObj['dataObjArr'],
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function(error, results) {
                callback(error, results);
                return;
            });
        return;
    }
    if (dataObj['type'] == 'staticRout') {
        async.map(dataObj['dataObjArr'],
            commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function(error, results) {
                callback(error, results);
                return;
            });
        return;
    }
    callback(null, null);
    return;
}

function getReadDelVMICb(err, vmiData, appData, callback)
{
    var floatingIPdataObjArr            = [];
    var instanceIPdataObjArr            = [];
    var staticRoutObjArr            = [];
    var vmiObjArr            = [];
    var allDataObj            = [];
    var floatingipPoolRefsLen = 0;
    var fixedipPoolRefsLen    = 0;
    var floatingipPoolRef     = null;
    var fixedipPoolRef        = [];
    var floatingipObj         = null;

    var uuid = vmiData['virtual-machine-interface']['uuid'];
    if ( 'virtual-machine-interface' in vmiData &&
         'floating_ip_back_refs' in vmiData['virtual-machine-interface']) {
        floatingipPoolRef = vmiData['virtual-machine-interface']['floating_ip_back_refs'];
        floatingipPoolRefsLen = floatingipPoolRef.length;
    }
    for (i = 0; i < floatingipPoolRefsLen; i++) {
        floatingipObj = floatingipPoolRef[i];
        reqUrl = '/floating-ip/' + floatingipObj['uuid'];
        commonUtils.createReqObj(floatingIPdataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);

    }

    if(floatingIPdataObjArr.length > 0){
        var floatingIPObj = {};
        floatingIPObj['type'] = "instance-ip";
        floatingIPObj['dataObjArr'] = floatingIPdataObjArr;
        floatingIPObj['vmiData'] = vmiData;
        floatingIPObj['appData'] = appData;
        allDataObj.push(floatingIPObj);
    }

    if ('instance_ip_back_refs' in vmiData['virtual-machine-interface']) {
        fixedipPoolRef = vmiData['virtual-machine-interface']['instance_ip_back_refs'];
        fixedipPoolRefsLen = fixedipPoolRef.length;
    }

    for (var i = 0; i < fixedipPoolRefsLen; i++) {
        fixedipObj = fixedipPoolRef[i];
        reqUrl = '/instance-ip/' + fixedipObj['uuid'];
        commonUtils.createReqObj(instanceIPdataObjArr, reqUrl,
                                 global.HTTP_REQUEST_DEL, null, null, null,
                                 appData);
    }

    if(instanceIPdataObjArr.length > 0){
        var instanceIPObj = {};
        instanceIPObj['type'] = "instance-ip";
        instanceIPObj['dataObjArr'] = instanceIPdataObjArr;
        allDataObj.push(instanceIPObj);
    }
    var portsDelURL = '/virtual-machine-interface/'+uuid;
        commonUtils.createReqObj(vmiObjArr, portsDelURL,
                                 global.HTTP_REQUEST_DEL, null, null, null,
                                 appData);
    if(vmiObjArr.length > 0){
        var vmiObj = {};
        vmiObj['type'] = "vmi";
        vmiObj['dataObjArr'] = vmiObjArr;
        allDataObj.push(vmiObj);
    }
    var staticRoutRef = [];
    var staticRoutRefLen = 0;
    if ('interface_route_table_refs' in vmiData['virtual-machine-interface']) {
        staticRoutRef = vmiData['virtual-machine-interface']['interface_route_table_refs'];
        staticRoutRefLen = staticRoutRef.length;
    }
    for (var i = 0; i < staticRoutRefLen ; i++) {
        staticRoutObj = staticRoutRef[i];
        reqUrl = '/interface-route-table/' + staticRoutObj['uuid'];
        commonUtils.createReqObj(staticRoutObjArr, reqUrl,
                                 global.HTTP_REQUEST_DEL, null, null, null,
                                 appData);
    }
    if(staticRoutObjArr.length > 0){
        var statObj = {};
        statObj['type'] = "staticRout";
        statObj['dataObjArr'] = staticRoutObjArr;
        allDataObj.push(statObj);
    }

    async.mapSeries(allDataObj, deletePortAsync, function(err, data) {
    });
    callback(err, null);
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
    if(results.length > 0){
    var resultLength = results.length;
        for (i = 0; i < resultLength; i++) {
            if(results[i] != null){
                if( 'floating-ip' in results[i] && 'virtual_machine_interface_refs' in results[i]['floating-ip']){
                var floatingIPURL = '/floating-ip/'+results[i]['floating-ip']['uuid'];
                    var vmiRef = results[i]['floating-ip']['virtual_machine_interface_refs'];
                    var vmiRefLen = results[i]['floating-ip']['virtual_machine_interface_refs'].length;
                    for(var j=0;j<vmiRefLen;j++){
                        if(vmiRef[j]['uuid'] == vmiUUID){
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
              commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
              function(error, results) {
                callback(error, results);
                return
              });
    }
    callback(error,null);
}
/*
function deleteVMI(error, uuid, response, appData, callback){
    var portsDelURL = '/virtual-machine-interface/';
    var portId = uuid;

    if (portId != null && portId != "") {
        portsDelURL += portId;
    } else {
        error = new appErrors.RESTServerError('Port UUID is required.');
        callback(error, response, null);
        return;
    }
    configApiServer.apiDelete(portsDelURL, appData,
        function (error, data) {
            callback(error, response ,null);
            return;
        });
    callback(error, response ,null);
}
*/
exports.readPorts = readPorts;
exports.createPorts = createPorts;
exports.createPortsCB = createPortsCB;
exports.updatePorts = updatePorts;
exports.updatePortsCB = updatePortsCB;
exports.deletePorts = deletePorts;
exports.deletePortsCB = deletePortsCB;