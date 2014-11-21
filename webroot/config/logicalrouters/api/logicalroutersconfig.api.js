
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
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');


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
/*
function vmIfAggCb(error, vmiData, lrListData, appData, callback) 
{
    if ((null != error) || (vmiData && !vmiData.length) || (null == vmiData)) {
        callback(error, lrListData);
        return;
    }

    var dataObjArr = [];
    var vmiDataLen = vmiData.length;
    var instance_ip_ObjRefs = null;
    var instance_ip_RefsLen = 0;
    var fixedipPoolRefsLen    = 0;
    var fixedipPoolRef        = [];
            //instance_ip_ObjRefs = vmiData[i]["virtual-machine-interface"]["instance_ip_back_refs"];
            //instance_ip_RefsLen = vmObjRefs.length;
            console.log("vmiData['virtual-machine-interface']"+JSON.stringify(vmiData));
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
    
    async.map(dataObjArr,
    commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
    function(error, results) {
        vmiFixedIP(error, results, vmiData,
                              appData, function (error, vmiData){
                                if(error){
                                    callback(error, lrListData);
                                }
                                for(i=0;i<vmiData.length;i++){
                                      lrListData['logical-router']['virtual_machine_interface_refs'][i] = vmiData['virtual-machine-interface']['instance_ip_back_refs'][i];
                                }
                                callback(error, lrListData);
                              });
    });
    
}
*/
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


/**
 * @getLogicalRouterCb
 * private function
 * 1. Callback for getLogicalRouterAsync
 * 2. Reads the response of Logical Router get from config api server
 *    and sends it back to the client.
 */
/*function getLogicalRouterCb(error, lrListData,appData, callback)
{
    if (error) {
        callback(error, lrListData);
        return;
    }
    //callback(error, lrConfig);
    var dataObjArr = [];
    var vmObjRefs = null;
    var vmRefsLen = 0;
    
    if ( 'virtual_machine_interface_refs' in lrListData['logical-router']) {
        vmObjRefs = lrListData['logical-router']['virtual_machine_interface_refs'];
        vmRefsLen = vmObjRefs.length;
    }

    for (i = 0; i < vmRefsLen; i++) {
        reqUrl = '/virtual-machine-interface/' + vmObjRefs[i]['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    async.map(dataObjArr,
          commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
          function(error, results) {
              vmIfAggCb(error, results, lrListData,
                                    appData, function (error, results){
                                        callback(error, results);
                                    });
          });

}*/

function listVMInterfacesAggCb (error, logicalRouterDetail, appData, callback) 
{
//console.log("logicalRouterDetail"+JSON.stringify(logicalRouterDetail));
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var vmListRef = [];
    var dataObjArr = [];

    if (error) {
       callback(error, null);
       return;
    }
    var vmList = logicalRouterDetail;
/*
    vnListLen = logicalRouterDetail.length;
    vnRef = logicalRouterDetail['logical-router'];
        if ('virtual_machine_interface_refs' in vnRef) {
            for (i = 0; i < vnRef['virtual_machine_interface_refs']; i++) {
            vmListRef = vnRef;
            vmList
            .push(vmListRef);
        }
    }
*/
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
//console.log("vmIfAggCb-vmIfList"+JSON.stringify(vmIfList));
//console.log("vmIfAggCb-logicalRouterDetail"+JSON.stringify(logicalRouterDetail));

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
        if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var vm_ref = vmIfList[i]["virtual-machine-interface"]["instance_ip_back_refs"];
            logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]["virtual_network_refs"] = vmIfList[i]["virtual-machine-interface"]["virtual_network_refs"]
            if (vm_ref) {
                logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]['instance_ip_back_refs'] = [];
                logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]['instance_ip_back_refs'] = vm_ref;
            }
        }
    }
    console.log("logicalRouterDetail"+JSON.stringify(logicalRouterDetail));
    for(var i=0; i<vmiLen; i++) {
        if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var inst_ip_ref = logicalRouterDetail['logical-router']["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0];
            if (inst_ip_ref) {
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
                instanceIPRefAggCb(error, results, logicalRouterDetail, vmiLen, appData, function(error, logicalRouterDetail){
                    callback(error, logicalRouterDetail);
                });
            });
}

function instanceIPRefAggCb(error, instanceIPList, logicalRouterDetail, vmiLen, appData, callback) 
{
console.log("instanceIPRefAggCb-instanceIPList"+JSON.stringify(instanceIPList));
console.log("instanceIPRefAggCb-logicalRouterDetail"+JSON.stringify(logicalRouterDetail));
console.log("vmiLen"+vmiLen);

    if (error) {
        callback(error, null);
        return;
    }
    if(instanceIPList.length <= 0) {
        callback(error, logicalRouterDetail);
        return;
    }
    for(var i=0; i<vmiLen; i++) {
        console.log("instanceIPList[i]"+instanceIPList[i]+","+i);
        logicalRouterDetail["logical-router"]["virtual_machine_interface_refs"][i]["instance_ip_back_refs"][0]["ip"] = instanceIPList[i]["instance-ip"]["instance_ip_address"];
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

    configApiServer.apiPost(logicalRouterCreateURL, logicalRouterPostData, appData,
        function (error, data) {
            setLogicalRouterRead(error, data, response, appData);
        });
}

/**
 * @setSTRead
 * private function
 * 1. Callback for Logical Router create / update operations
 * 2. Reads the response of Logical Router get from config api server
 *    and sends it back to the client.
 */
function setLogicalRouterRead(error, logicalRouterConfig, response, appData)
{
    var logicalRouterGetURL = '/logical-router/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    logicalRouterGetURL += logicalRouterConfig['logical-router']['uuid'];
    configApiServer.apiGet(logicalRouterGetURL, appData,
        function (error, data) {
            logicalRouterSendResponse(error, data, response)
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
    var error;

    if (typeof(logicalRouterPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
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
    configApiServer.apiPut(logicalRouterPutURL, logicalRouterPostData, appData,
        function (error, data) {
            setLogicalRouterRead(error, data, response, appData);
        });
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
        error = new appErrors.RESTServerError('Service Instance ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(logicalRouterDelURL, appData,
        function (error, data) {
            deleteLogicalRouterCb(error, data, response);
        });
}
/**
 * @deleteLogicalRouterCb
 * private function
 * 1. Return back the response of logical router delete.
 */
function deleteLogicalRouterCb(error, logicalRouterDelResp, response)
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, logicalRouterDelResp);
}

exports.listLogicalRouter = listLogicalRouter;
exports.readLogicalRouter = readLogicalRouter;
exports.createLogicalRouter = createLogicalRouter;
exports.updateLogicalRouter = updateLogicalRouter;
exports.deleteLogicalRouter = deleteLogicalRouter;
