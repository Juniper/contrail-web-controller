
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @logicalroutersconfig.api.js
 *     - Handlers for Logical Router Configuration
 *     - Interfaces with config api server
 */


var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logicalroutersconfig = module.exports;
var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
                          
var portConfig = require('../../../networking/port/api/portsconfig.api');
var configUtils = require(process.mainModule.exports["corePath"] +
                 '/src/serverroot/common/config.utils');
var messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors');
var util = require('util');
var url = require('url');
var UUID = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var networkManager = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/networkmanager.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');



/**
 * Bail out if called directly as "nodejs logicalroutersconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listLogicalRouters
 * public function
 * 1. URL /api/tenants/config/list-logical-routers
 * 2. Gets list of Logical Routers from config api server
 * 3. Needs tenant / project  id
 */
function listLogicalRouters (request, response, appData)
{
    var tenantId = null;
    var projUUID = null;
    var requestParams = url.parse(request.url, true);
    var logicalRouterListURL = '/logical-routers';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        logicalRouterListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    } else if (requestParams.query && requestParams.query.projUUID) {
        projUUID = requestParams.query.projUUID;
        logicalRouterListURL += '?parent_id=' + projUUID.toString();
    }

    configApiServer.apiGet(logicalRouterListURL, appData,
        function (error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
}

function readLogicalRouter (logicalRouterObj, callback)
{
    var dataObjArr = logicalRouterObj['reqDataArr'];
    async.map(dataObjArr, getLogicalRouterAsync, function(err, data) {
        callback(err, data);
    });
}

function getLogicalRouterAsync (logicalRouterObj, callback)
{
    var logicalRouterId = logicalRouterObj['uuid'];
    var appData = logicalRouterObj['appData'];
    var reqUrl = '/logical-router/' + logicalRouterId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        listVMInterfacesAggCb(err, data, appData, function(err, data) {
           callback(err, data);
        });
    });
    
}

function listVMInterfacesAggCb (error, logicalRouterDetail, appData, callback) 
{
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var vmListRef = [];
    var dataObjArr = [];

    if (error) {
       callback(error, null);
       return;
    }
    var vmList = logicalRouterDetail;
    if(('logical-router' in logicalRouterDetail) &&
      ('virtual_machine_interface_refs' in logicalRouterDetail['logical-router'])){
        var vmiLen = logicalRouterDetail['logical-router']['virtual_machine_interface_refs'].length;
        for(i=0; i<vmiLen; i++) {
            var reqUrl = '/virtual-machine-interface/' + logicalRouterDetail['logical-router']['virtual_machine_interface_refs'][i]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl,
                    global.HTTP_REQUEST_GET, null, null, null,
                    appData);        
        }
        async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
                function(error, results) {
                    if(error){
                       callback(error, results);
                       return;
                    }
                   vmIfAggCb(error, results, logicalRouterDetail, appData, function(error, logicalRouterDetail) {
                       callback(error, logicalRouterDetail);
                   });
                });
    } else {
        callback(error, logicalRouterDetail);
    }
}

function vmIfAggCb(error, vmIfList, logicalRouterDetail, appData, callback) 
{
    var dataObjArr = [];
    if (error) {    
        callback(error, null);
        return;
    }
    var vmiLen = vmIfList.length;
    if( vmiLen <= 0) {
        callback(error,logicalRouterDetail);
        return;
    }
    for(var i=0; i<vmiLen; i++) {
        logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]["virtual_network_refs"] = vmIfList[i]["virtual-machine-interface"]["virtual_network_refs"]
        if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var vm_ref = vmIfList[i]["virtual-machine-interface"]["instance_ip_back_refs"];
            if (vm_ref) {
                logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]['instance_ip_back_refs'] = vm_ref;
            }
        }
    }
    for(var i=0; i<vmiLen; i++) {
        if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var inst_ip_ref = logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0];
            if (inst_ip_ref && 'uuid' in inst_ip_ref) {
                var reqUrl = '/instance-ip/' + inst_ip_ref['uuid'];
            
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_GET, 
                                         null, null, null, appData);
            }
        }
    }
    async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, results) {
                if(error){
                    callback(error, results);
                    return;
                }
                instanceIPRefAggCb(error, results, logicalRouterDetail, vmiLen, appData, function(error, logicalRouterDetail){
                    callback(error, logicalRouterDetail);
                });
            });
}

function instanceIPRefAggCb(error, instanceIPList, logicalRouterDetail, vmiLen, appData, callback) 
{
    if (error) {
        callback(error, null);
        return;
    }
    if(instanceIPList.length <= 0) {
        callback(error, logicalRouterDetail);
        return;
    }
    var instIPLen = instanceIPList.length;
    for(var i=0, inst=0; i< vmiLen && inst < instIPLen; i++) {
        if(("virtual_machine_interface_refs" in logicalRouterDetail['logical-router']) && 
          (logicalRouterDetail['logical-router']["virtual_machine_interface_refs"].length > 0) &&
          ("instance_ip_back_refs" in logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i] > 0)){
            var inst_ip_ref = logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0];
            if(inst_ip_ref && instanceIPList[inst] != undefined && instanceIPList[inst] != null) {
                inst_ip_ref["ip"] = instanceIPList[inst]["instance-ip"]["instance_ip_address"];
                inst++;
            }
        }
    }
    callback(error, logicalRouterDetail);
}


/**
 * @createLogicalRouter
 * public function
 * 1. URL /api/tenants/config/logical-router Post
 * 2. Sets Post Data and sends back the Logical Router to client
 */
function createLogicalRouter(request, response, appData)
{
    var logicalRouterCreateURL = '/logical-routers';
    var logicalRouterPostData = request.body;
    var orginalDataFromUI = commonUtils.cloneObj(request.body);
    var config = configUtils.getConfig();
    if (typeof(logicalRouterPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('logical-router' in logicalRouterPostData)) ||
        (!('fq_name' in logicalRouterPostData['logical-router'])) ||
        (!(logicalRouterPostData['logical-router']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Enter Logical Router Name ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var networkUUID = null;
    if(config.network.router_L3Enable === true){
        if('virtual_network_refs' in logicalRouterPostData['logical-router'] && 
           logicalRouterPostData['logical-router']['virtual_network_refs'].length > 0 &&
           'uuid' in logicalRouterPostData['logical-router']['virtual_network_refs'][0]) {
           networkUUID = logicalRouterPostData['logical-router']['virtual_network_refs'][0]["uuid"];
        }
    }
    if('virtual_machine_interface_refs' in orginalDataFromUI['logical-router']){
        var vmiLength = orginalDataFromUI['logical-router']['virtual_machine_interface_refs'].length;
        var allDataArr = []
        for(var i=0;i<vmiLength;i++){
            var vmidata = {};
            vmidata["virtual-machine-interface"] = {};
            vmidata["virtual-machine-interface"] = orginalDataFromUI['logical-router']['virtual_machine_interface_refs'][i];
            //setUUID
            if(vmidata['virtual-machine-interface']['fq_name'].length == 2) {
                var uuid = UUID.create();
                vmidata["virtual-machine-interface"]["fq_name"][2] = uuid['hex'];
                vmidata["virtual-machine-interface"]["display_name"] = uuid['hex'];
                vmidata["virtual-machine-interface"]["uuid"] = uuid['hex'];
                vmidata["virtual-machine-interface"]["name"] = uuid['hex'];
                vmidata["virtual-machine-interface"]["port_security_enabled"] = false;
            }
            allDataArr.push({
                request: request,
                vmidata: vmidata,
                response: response,
                appData: appData
            });
        }
        async.mapSeries(allDataArr, portConfig.createPortCB, function(error, data){
            if(error){
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            logicalRouterPostData['logical-router']['virtual_machine_interface_refs'] = [];
            var datalen = data.length;
            for(var i = 0; i < datalen; i++){
                if(data[i] != null){
                    logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][i] = {};
                    logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][i]["to"] = data[i]["virtual-machine-interface"]["fq_name"];
                    logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][i]["uuid"] = data[i]["virtual-machine-interface"]["uuid"];
                }
            }
            removeBackRefFromPostData(logicalRouterPostData);
            configApiServer.apiPost(logicalRouterCreateURL, logicalRouterPostData, appData,
            function (error, data) {
                logicalRouterSendResponse(error, data, response);
            });
        });
    } else {
    configApiServer.apiPost(logicalRouterCreateURL, logicalRouterPostData, appData,
        function (error, data) {
            logicalRouterSendResponse(error, data, response);
        });
    }
}

function updateRouterCB (request, routerObj, routerUUID, callback)
{
    networkManager.updateRouter(request, routerObj, routerUUID,  function (error, data) {
        callback (error, data);
    });
}

/**
 * @logicalRouterSendResponse
 * private function
 * 1. Sends back the response of Logical Router read to clients after set operations.
 */
function logicalRouterSendResponse(error, logicalRouterConfig, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, logicalRouterConfig);
    }
    return;
}

function updateLogicalRouter(request, response, appData)
{
    var logicalRouterId       = null;
    var logicalRouterPutURL   = '/logical-router/';
    var logicalRouterPostData = request.body;
    var orginalDataFromUI = commonUtils.cloneObj(request.body);
    var error;
    var config = configUtils.getConfig();

    if (typeof(logicalRouterPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Router Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (logicalRouterId = request.param('uuid').toString()) {
        logicalRouterPutURL += logicalRouterId;
    } else {
        error = new appErrors.RESTServerError('Add Logical Router ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('logical-router' in logicalRouterPostData)) ||
        (!('fq_name' in logicalRouterPostData['logical-router'])) ||
        (!(logicalRouterPostData['logical-router']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Invalid Logical Router');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var networkUUID = null;
    if(config.network.router_L3Enable === true){
        if('virtual_network_refs' in logicalRouterPostData['logical-router'] && 
           logicalRouterPostData['logical-router']['virtual_network_refs'].length > 0 &&
           'uuid' in logicalRouterPostData['logical-router']['virtual_network_refs'][0]) {
           networkUUID = logicalRouterPostData['logical-router']['virtual_network_refs'][0]["uuid"];
        }
    }
    configApiServer.apiGet(logicalRouterPutURL, appData, function(err, data) {
        readLogicalRouterToUpdate(err, logicalRouterPutURL, orginalDataFromUI, logicalRouterPostData, data, networkUUID, request, response, appData);
    });
}

function readLogicalRouterToUpdate(error, logicalRouterURL, orginalDataFromUI, logicalRouterPostData, datafromAPI, networkUUID, request, response, appData){
    var updateRouteTableFlag = false;
    var resetExternalGateway = false;

    filterVMI(error, orginalDataFromUI, datafromAPI, function (createVMIArray,deleteVMIArray){
        var allDataArr = [];
        if ("logical-router" in orginalDataFromUI &&
            "virtual_network_refs" in orginalDataFromUI["logical-router"] &&
            orginalDataFromUI["logical-router"]["virtual_network_refs"].length > 0 &&
            "uuid" in orginalDataFromUI["logical-router"]["virtual_network_refs"][0] &&
            "logical-router" in datafromAPI &&
            "virtual_network_refs" in datafromAPI["logical-router"] &&
            datafromAPI["logical-router"]["virtual_network_refs"].length > 0 &&
            "uuid" in datafromAPI["logical-router"]["virtual_network_refs"][0] &&
            orginalDataFromUI["logical-router"]["virtual_network_refs"][0]["uuid"] != datafromAPI["logical-router"]["virtual_network_refs"][0]["uuid"]){
                resetExternalGateway = true;
        }
        if(createVMIArray.length > 0){
            if ("logical-router" in orginalDataFromUI && 
                "virtual_network_refs" in orginalDataFromUI["logical-router"] && 
                orginalDataFromUI["logical-router"]["virtual_network_refs"].length > 0 &&
                "uuid" in orginalDataFromUI["logical-router"]["virtual_network_refs"][0] &&
                "logical-router" in datafromAPI &&
                "virtual_network_refs" in datafromAPI["logical-router"] &&
                datafromAPI["logical-router"]["virtual_network_refs"].length > 0 &&
                "uuid" in datafromAPI["logical-router"]["virtual_network_refs"][0] &&
                orginalDataFromUI["logical-router"]["virtual_network_refs"][0]["uuid"] == datafromAPI["logical-router"]["virtual_network_refs"][0]["uuid"]){
                    updateRouteTableFlag = true;
            }
            
            for(var i=0;i<createVMIArray.length;i++){
                var vmidata = {};
                vmidata["virtual-machine-interface"] = {};
                vmidata["virtual-machine-interface"] = createVMIArray[i];
                //setUUID
                var uuid = UUID.create();
                if(vmidata['virtual-machine-interface']['fq_name'].length == 2) {
                    vmidata["virtual-machine-interface"]["fq_name"][2] = uuid['hex'];
                    vmidata["virtual-machine-interface"]["display_name"] = uuid['hex'];
                    vmidata["virtual-machine-interface"]["uuid"] = uuid['hex'];
                    vmidata["virtual-machine-interface"]["name"] = uuid['hex'];
                    vmidata["virtual-machine-interface"]["port_security_enabled"] = false;
                }
                allDataArr.push({
                    request: request,
                    vmidata: vmidata,
                    response: response,
                    appData: appData
                });
                
            }
            
            async.mapSeries(allDataArr, portConfig.createPortCB, function(error, data){
                if(error){
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                var datalen = data.length;
                var vmiLength = logicalRouterPostData['logical-router']['virtual_machine_interface_refs'].length;
                var addVMIData = [];
                for(var i = 0; i < datalen; i++){
                    if(data[i] != null){
                        logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][vmiLength] = {};
                        logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][vmiLength]["to"] = data[i]["virtual-machine-interface"]["fq_name"];
                        logicalRouterPostData['logical-router']['virtual_machine_interface_refs'][vmiLength]["uuid"] = data[i]["virtual-machine-interface"]["uuid"];
                        vmiLength++
                        addVMIData.push((data[i]['virtual-machine-interface']["virtual_network_refs"][0]["uuid"]).toString());
                    }
                }
                if(updateRouteTableFlag != true){
                    addVMIData = [];
                }
                removeBackRefFromPostData(logicalRouterPostData);
                updateLogicalRouterWithVMI(logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, resetExternalGateway, request, response, appData);
            });
        } else {
            updateLogicalRouterWithVMI(logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, [], resetExternalGateway, request, response, appData);
        }
    });
}

function removeVMI(error, logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, resetExternalGateway, request, response, appData, data){
    // delete vmi Reference 
    if(deleteVMIArray.length > 0){
        var allDataArr = [];
        var delVMILength = deleteVMIArray.length;
        for (var j = 0 ; j < delVMILength ; j++){
            var uuid = deleteVMIArray[j]["uuid"];
            allDataArr.push({
                uuid: uuid,
                appData: appData,
                request: request
            });
        }
        async.mapSeries(allDataArr, portConfig.deletePortsCB, function(error, data){
            if(error){
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            logicalRouterSendResponse(error, data, response);
        });
    } else {
        logicalRouterSendResponse(error, data, response);
    }

}

function updateLogicalRouterWithVMI(logicalRouterPutURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, resetExternalGateway, request, response, appData){
    jsonDiff.getConfigDiffAndMakeCall(logicalRouterPutURL, appData, logicalRouterPostData,
                                          function(error, data) {
        removeVMI(error, logicalRouterPutURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, resetExternalGateway, request, response, appData, data);
    });
}

function removeBackRefFromPostData(logicalRouterPostData){
    if("virtual_machine_interface_refs" in logicalRouterPostData["logical-router"] && 
       logicalRouterPostData["logical-router"]["virtual_machine_interface_refs"].length > 0){
        var vmiLength = logicalRouterPostData["logical-router"]["virtual_machine_interface_refs"].length;
        for(var i = 0 ; i < vmiLength ; i++){
            if(!('uuid' in logicalRouterPostData["logical-router"]["virtual_machine_interface_refs"][i])){
                logicalRouterPostData["logical-router"]["virtual_machine_interface_refs"].splice(i,1);
                i--;
                vmiLength--;
            }
        }
    }
}

function filterVMI(error, orginalDataFromUI, datafromAPI, callback)
{
    var i = 0;
    var createVMIArray = [];
    var deleteVMIArray = [];
    var vmiRef_server = [];
    var vmiRefs_serverLen = 0;
    var vmiReffrom_ui = [];
    var logicalRouteripPoolRefs_putLen = 0;

    if ( 'logical-router' in datafromAPI &&
         'virtual_machine_interface_refs' in datafromAPI['logical-router']) {
        vmiRef_server = datafromAPI['logical-router']['virtual_machine_interface_refs'];
        vmiRefs_serverLen = vmiRef_server.length;
    }
    if ( 'logical-router' in orginalDataFromUI &&
         'virtual_machine_interface_refs' in orginalDataFromUI['logical-router']) {
        vmiReffrom_ui = orginalDataFromUI['logical-router']['virtual_machine_interface_refs'];
        logicalRouteripPoolRefs_putLen = vmiReffrom_ui.length;
    }
    if(vmiRefs_serverLen == 0) {
        for(i = 0;i<logicalRouteripPoolRefs_putLen;i++){
            createVMIArray.push(vmiReffrom_ui[i]);
        }
        callback(createVMIArray,deleteVMIArray);
        return;
    }
    if(logicalRouteripPoolRefs_putLen == 0) {
        for(i = 0;i<vmiRefs_serverLen;i++){
            deleteVMIArray.push(vmiRef_server[i]);
        }
        callback(createVMIArray,deleteVMIArray);
        return;
    }
    var j = 0;
    var create = true;
    for(i=0; i<logicalRouteripPoolRefs_putLen ;i++){
        create = true;
        for(j=0; j<vmiRefs_serverLen && i >= 0;j++){
            var portlogicalRouterip_fqname = JSON.stringify(vmiReffrom_ui[i]["uuid"]);
            var vmilogicalRouterip_fqname = JSON.stringify(vmiRef_server[j]["uuid"]);
            if( portlogicalRouterip_fqname == vmilogicalRouterip_fqname){
                vmiReffrom_ui.splice(i,1);
                vmiRef_server.splice(j,1);
                create = false;
                i--;
                j--;
                logicalRouteripPoolRefs_putLen = vmiReffrom_ui.length;
                vmiRefs_serverLen = vmiRef_server.length;
            }
        }
        if(create == true) {
            createVMIArray.push(vmiReffrom_ui[i]);
            vmiReffrom_ui.splice(i,1);
            i--;
            logicalRouteripPoolRefs_putLen = vmiReffrom_ui.length;
        }
    }
    for(j=0; j<vmiRefs_serverLen;j++){
        deleteVMIArray.push(vmiRef_server[j]);
    }
    callback(createVMIArray,deleteVMIArray);
}


/**
 * @deleteServiceInstance
 * public function
 * 1. URL /api/tenants/config/logical-router/:id
 * 2. Deletes the service instance from config api server
 */
function deleteLogicalRouter(request, response, appData)
{
    var logicalRouterId = request.param('uuid');
    if (null == logicalRouterId) {
        var error = new appErrors.RESTServerError('Logical Router ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var dataObj = {request: request, appData: appData, uuid: logicalRouterId};
    deleteLogicalRouterAsync(dataObj, function(error, data) {
        commonUtils.handleJSONResponse(data.error, response, data.data);
    });
}

function deleteLogicalRouterAsync (dataObj, callback)
{
    var request = dataObj['request'];
    var appData = dataObj['appData'];
    var logicalRouterId = dataObj['uuid'];
    var logicalRouterDelURL = '/logical-router/' + logicalRouterId;
    
    configApiServer.apiGet(logicalRouterDelURL, appData, function(err, data) {
        deleteLogicalRouterCb(err, logicalRouterDelURL, data, request, appData,
            function (error, data) {
            callback(null, {'error': error, 'data': data});
            });
    });

}

function readLogicalRouterToDeleteVMI(error, logicalRouterURL, datafromAPI, request, appData, callback){
            if('virtual_machine_interface_refs' in datafromAPI['logical-router'] && 
                datafromAPI['logical-router']['virtual_machine_interface_refs'].length > 0){
                var deleteVMIArray = datafromAPI['logical-router']['virtual_machine_interface_refs']
                if(deleteVMIArray.length > 0){
                    var allDataArr = [];
                    var delVMILength = deleteVMIArray.length;
                    for(var j = 0 ; j < delVMILength ; j++){
                        var uuid = deleteVMIArray[j]["uuid"];
                        allDataArr.push({
                            uuid: uuid,
                            appData: appData
                        });
                    }
                    async.mapSeries(allDataArr, portConfig.deletePortsCB, function(error, data){
                        if(data == null || data.error != null) {
                            callback(error, null);

                            return
                        }
                        setTimeout(function() {
                            removeRouter(logicalRouterURL, appData, callback);
                        }, 3000);
                        return;
                    });
                }
            } else {
                removeRouter(logicalRouterURL, appData, callback);
                return;
            }
}

function removeRouter(logicalRouterURL, appData, callback){
    configApiServer.apiDelete(logicalRouterURL, appData,
    function (error, data) {
        callback(error, data);
        return;
    });
}

/**
 * @deleteLogicalRouterCb
 * private function
 * 1. Return back the response of logical router delete.
 */
function deleteLogicalRouterCb(error, logicalRouterGetURL, datafromAPI, request, appData, callback)
{
    if (error) {
        callback(error, null);
        return;
    }
    var config = configUtils.getConfig();
    if(config.network.router_L3Enable === true){
        var networkUUID = null; 
        if("logical-router" in datafromAPI && 
        'virtual_network_refs' in datafromAPI['logical-router']){
            networkUUID = datafromAPI['logical-router']['virtual_network_refs']
        }
        if(networkUUID != null) {
            var routerObj = {};
            routerObj["router"] = {};
            routerObj["router"]["external_gateway_info"] = {};
            var routerUUID = datafromAPI['logical-router']['uuid'];
            networkManager.updateRouter(request, routerObj, routerUUID,  function (error ,data) {
                if(error) {
                    callback(error, null);

                    return;
                }
                configApiServer.apiGet(logicalRouterGetURL, appData,
                    function (error, data) {
                        readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, appData, callback)
                    });
            });
        } else {
            readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, appData, callback);
        }
    } else {
        readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, appData, callback);
    }

}

exports.listLogicalRouters = listLogicalRouters;
exports.readLogicalRouter = readLogicalRouter;
exports.createLogicalRouter = createLogicalRouter;
exports.updateLogicalRouter = updateLogicalRouter;
exports.deleteLogicalRouter = deleteLogicalRouter;
exports.deleteLogicalRouterAsync = deleteLogicalRouterAsync;
