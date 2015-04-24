
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
                          
var portConfig = require('../../ports/api/portsconfig.api');
var config = process.mainModule.exports["config"];
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
 * 1. URL /api/tenants/config/lr
 * 2. Gets list of Logical Routers from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listLogicalRouterCb that process data from config
 *    api server and sends back the http response.
 */
function listLogicalRouter(request, response, appData)
{
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var logicalRouterListURL = '/logical-routers';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        logicalRouterListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(logicalRouterListURL, appData,
        function (error, data) {
            listLogicalRouterCb(error, data, response)
        });
}

/**
 * @listLogicalRouterCb
 * private function
 * 1. Callback for listLogicalRouter
 * 2. Reads the response of per project Logical Routers from config api server
 *    and sends it back to the client.
 */
function listLogicalRouterCb(error, lrListData, appData)
{

    if (error) {
        commonUtils.handleJSONResponse(error, appData, null);
        return;
    }
}

function vmiFixedIP(error, instanceIPData, vmiData, appData, callback)
{
    if (error) {
        callback(error, vmiData);
        return;
    }
    var i = 0;
    var IpPoolsLen = results.length;

    for(i = 0; i< IpPoolsLen;i++){
        if(results[i]){
            vmiData['virtual-machine-interface']['instance_ip_back_refs'][i]['instanceIp'] =
                     instanceIPData[i]['interface-route-table']['interface_route_table_routes'];
        }
    }
    callback(error, vmiData);
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
           delete logicalRouterPostData['logical-router']['virtual_network_refs'];
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
                vmidata["virtual-machine-interface"]["name"] = uuid['hex'];
            }
            allDataArr.push({
                request: request,
                vmidata: vmidata,
                response: response,
                appData: appData
            });
        }
        async.mapSeries(allDataArr, portConfig.createPortsCB, function(error, data){
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
                setLogicalRouterRead(error, data, networkUUID, [], request, response, appData);
            });
        });
    } else {
    configApiServer.apiPost(logicalRouterCreateURL, logicalRouterPostData, appData,
        function (error, data) {
            setLogicalRouterRead(error, data, networkUUID, [], request, response, appData);
        });
    }
}

/**
 * @setSTRead
 * private function
 * 1. Callback for Logical Router create / update operations
 * 2. Reads the response of Logical Router get from config api server
 *    and sends it back to the client.
 */
function setLogicalRouterRead(error, logicalRouterConfig, networkUUID, addVMIData, request, response, appData)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(addVMIData != null && addVMIData.length > 0){
        var fqNameDomain = logicalRouterConfig['logical-router']["fq_name"][0];
        var fqNameproject = logicalRouterConfig['logical-router']["fq_name"][1];
        var lruuid = logicalRouterConfig['logical-router']["uuid"];
        updateRouteTable(addVMIData, fqNameDomain, fqNameproject, lruuid, appData, function (error, data){
            updteExternalNetwork(logicalRouterConfig, networkUUID, request, response, appData);
        });
    } else {
        updteExternalNetwork(logicalRouterConfig, networkUUID, request, response, appData);
    }
}

function updteExternalNetwork(logicalRouterConfig, networkUUID, request, response, appData)
{
	var routerObj = {};
    routerObj["router"] = {};
    routerObj["router"]["external_gateway_info"] = {};
    var logicalRouterGetURL = '/logical-router/';
    logicalRouterGetURL += logicalRouterConfig['logical-router']['uuid'];
    var routerUUID = logicalRouterConfig['logical-router']['uuid'];
    if(config.network.router_L3Enable === true){
        if(networkUUID != null) {
            routerObj["router"]["external_gateway_info"]["network_id"] = networkUUID;
        }
        networkManager.updateRouter(request, routerObj, routerUUID,  function (error ,data) {
            if(error) {
                logicalRouterSendResponse(error, data, response);
            }
            configApiServer.apiGet(logicalRouterGetURL, appData,
                function (error, data) {
                    logicalRouterSendResponse(error, data, response);
            });
        });
    } else {
        configApiServer.apiGet(logicalRouterGetURL, appData,
            function (error, data) {
                logicalRouterSendResponse(error, data, response);
        });
    }
    
}

function updateRouteTable(addVMIData, domain, project, lruuid, appData, callback){
	var vnDataArr = [];
	var addVMIDataLength = addVMIData.length;
	for (var i = 0; i < addVMIDataLength; i++){
	    var vnuuid = addVMIData[i];
        var reqUrl = '/virtual-network/' + vnuuid + "?exclude_back_refs=true&exclude_children=true&fields=route_table_refs";
        commonUtils.createReqObj(vnDataArr, reqUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);        
    }
    if (vnDataArr.length > 0) {
        async.map(vnDataArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function(error, vnData) {
            if(error){
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
           updateVTDataforAdd (vnData, lruuid, appData, domain, project, function(error, rtableResult) {
               callback(error, rtableResult);
           });
        });
    }
}

function updateVTDataforAdd(vnData, lruuid, appData, domain, project, callback){
	var vnDataArr = [];
	var vnDataLength = vnData.length;
	for (var i = 0; i < vnDataLength; i++){
	    var hasData = false;
	    var rtref = [];
	    if("route_table_refs" in vnData[i]["virtual-network"]){
	        rtref = vnData[i]["virtual-network"]["route_table_refs"];
            if (rtref.length > 0){
	        var rtrefLen = rtref.length;
                for (var j = 0; j < rtrefLen; j++){
                    if (rtref[j]["to"][2] == ("rt_"+lruuid)){
                        hasData = true;
                    }
                }
            }
        }
        if(hasData == false){
            var reqUrl = '/virtual-network/' + vnData[i]["virtual-network"]["uuid"];
            rtref.push({"to":[domain, project,"rt_"+lruuid]});
            var responceData = createvnObj(vnData[i], rtref);
            commonUtils.createReqObj(vnDataArr, reqUrl,
                   global.HTTP_REQUEST_PUT, responceData, null, null,
                   appData);
        }
    }
    if (vnDataArr.length > 0) {
        async.map(vnDataArr,
        commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
        function(error, vnData) {
            callback(error, vnData);
            return;
        });
    } else {
        callback(null, []);
        return;
    }
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
        if('virtual_network_refs' in logicalRouterPostData['logical-router']) {
           delete logicalRouterPostData['logical-router']['virtual_network_refs'];
        }
    }
    configApiServer.apiGet(logicalRouterPutURL, appData, function(err, data) {
        readLogicalRouterToUpdate(err, logicalRouterPutURL, orginalDataFromUI, logicalRouterPostData, data, networkUUID, request, response, appData);
    });
}

function readLogicalRouterToUpdate(error, logicalRouterURL, orginalDataFromUI, logicalRouterPostData, datafromAPI, networkUUID, request, response, appData){
    var updateRouteTableFlag = false;


    filterVMI(error, orginalDataFromUI, datafromAPI, function (createVMIArray,deleteVMIArray){
       var allDataArr = [];
        
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
                    vmidata["virtual-machine-interface"]["name"] = uuid['hex'];
                }
                allDataArr.push({
                    request: request,
                    vmidata: vmidata,
                    response: response,
                    appData: appData
                });
                
            }
            
            async.mapSeries(allDataArr, portConfig.createPortsCB, function(error, data){
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
                updateLogicalRouterWithVMI(logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, request, response, appData);
            });
        } else {
            updateLogicalRouterWithVMI(logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, [], request, response, appData);
        }
    });
}

function removeVMI(error, logicalRouterURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, request, response, appData){
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
        var lruuid = logicalRouterPostData["logical-router"]["uuid"];
        removeRTableRef(allDataArr, lruuid, appData, function() {
            async.mapSeries(allDataArr, portConfig.deletePortsCB, function(error, data){
                if(error){
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                setLogicalRouterRead(error, logicalRouterPostData, networkUUID, addVMIData, request, response, appData);
            });
        });
    } else {
        setLogicalRouterRead(error, logicalRouterPostData, networkUUID, addVMIData, request, response, appData);
    }

}

function removeRTableRef (allDataArr, lruuid, appData, callback) {
	//Read vmi
	var vmiDataArr = [];
	var allDataArrLen = allDataArr.length;
	for (var i = 0; i < allDataArrLen; i++){
        var reqUrl = '/virtual-machine-interface/' + allDataArr[i]["uuid"];
        commonUtils.createReqObj(vmiDataArr, reqUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);        
    }
    if (vmiDataArr.length > 0) {
        async.map(vmiDataArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function(error, vmiData) {
            if(error){}
                callback(error, vmiData);
                return;
            }
           readVMforRTable (vmiData, lruuid, appData, function(error, vmResult) {
               callback(error, vmResult);
           });
        });
    }
}

function readVMforRTable(vmiData, lruuid, appData, callback){
	var vnDataArr = [];
	var vmiDataLength = vmiData.length;
	for (var i = 0; i < vmiDataLength; i++){
	    var vnuuid = vmiData[i]["virtual-machine-interface"]["virtual_network_refs"][0]["uuid"]
        var reqUrl = '/virtual-network/' + vnuuid + "?exclude_back_refs=true&exclude_children=true&fields=route_table_refs";
        commonUtils.createReqObj(vnDataArr, reqUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);        
    }
    if (vnDataArr.length > 0) {
        async.map(vnDataArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function(error, vnData) {
            if(error){
               callback(error, vnData);
               return;
            }
            updateVTData (vnData, lruuid, appData, function(error, rtableResult) {
            callback(error, rtableResult);
           });
        });
    }
}

function updateVTData(vnData, lruuid, appData, callback){
    var vnDataArr = [];
    var vnDataLength = vnData.length;
    for (var i = 0; i < vnDataLength; i++){
        if("route_table_refs" in vnData[i]["virtual-network"]){
            var rtref = vnData[i]["virtual-network"]["route_table_refs"];
            if (rtref.length > 0){
                var rtrefLen = rtref.length;
                for (var j = 0; j < rtrefLen; j++){
                    if (rtref[j]["to"][2] == ("rt_"+lruuid)){
                        var vnuuid = vnData[i]["virtual-network"]["uuid"]
                        rtref.splice(j, 1);
                        var reqUrl = '/virtual-network/' + vnuuid;
                        var responceData = createvnObj(vnData[i], rtref);
                        commonUtils.createReqObj(vnDataArr, reqUrl,
                               global.HTTP_REQUEST_PUT, responceData, null, null,
                               appData);
                        break;
                    }
                }
            }
        }
    }
    if (vnDataArr.length > 0) {
        async.map(vnDataArr,
        commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
        function(error, vnData) {
            callback(error, vnData);
            return;
        });
    } else {
        callback(null, []);
        return;
    }
}

function createvnObj(vnObj, rtObj) {
    var vnreturnObj = {};
    vnreturnObj["virtual-network"] = {};
    vnreturnObj["virtual-network"]["fq_name"] = vnObj["virtual-network"]["fq_name"];
    vnreturnObj["virtual-network"]["uuid"] = vnObj["virtual-network"]["uuid"];
    vnreturnObj["virtual-network"]["route_table_refs"] = rtObj;
    return vnreturnObj;
}

function updateLogicalRouterWithVMI(logicalRouterPutURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, request, response, appData){
    configApiServer.apiPut(logicalRouterPutURL, logicalRouterPostData, appData,
    function (error, data) {
        removeVMI(error, logicalRouterPutURL, logicalRouterPostData, deleteVMIArray, networkUUID, addVMIData, request, response, appData);
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
    var logicalRouterDelURL = '/logical-router/',
        logicalRouterId, analyzerPolicyId;

    if (logicalRouterId = request.param('uuid').toString()) {
        logicalRouterDelURL += logicalRouterId;
    } else {
        error = new appErrors.RESTServerError('Logical Router ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    
    var logicalRouterURL = logicalRouterDelURL;
    configApiServer.apiGet(logicalRouterURL, appData, function(err, data) {
        deleteLogicalRouterCb(err, logicalRouterURL, data, request, response, appData);
    });

}

function readLogicalRouterToDeleteVMI(error, logicalRouterURL, datafromAPI, request, response, appData){    
    configApiServer.apiDelete(logicalRouterURL, appData,
        function (error, data) {
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
                            commonUtils.handleJSONResponse(error, response, null);
                            return;
                    });
                }
            } else {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
        });
}

/**
 * @deleteLogicalRouterCb
 * private function
 * 1. Return back the response of logical router delete.
 */
function deleteLogicalRouterCb(error, logicalRouterGetURL, datafromAPI, request, response, appData)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
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
                    commonUtils.handleJSONResponse(error, appData, null);
                    return;
                }
                configApiServer.apiGet(logicalRouterGetURL, appData,
                    function (error, data) {
                        readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, response, appData)
                    });
            });
        } else {
            readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, response, appData);
        }
    } else {
        readLogicalRouterToDeleteVMI(error, logicalRouterGetURL, datafromAPI, request, response, appData);
    }

}

exports.listLogicalRouter = listLogicalRouter;
exports.readLogicalRouter = readLogicalRouter;
exports.createLogicalRouter = createLogicalRouter;
exports.updateLogicalRouter = updateLogicalRouter;
exports.deleteLogicalRouter = deleteLogicalRouter;
