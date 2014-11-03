
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
console.log("ListLogicalRouter");
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
console.log("ListLogicalRouterCB");

    if (error) {
        commonUtils.handleJSONResponse(error, appData, null);
        return;
    }
}
function vmIfAggCb(error, vmIfList, lrListData, appData, callback) 
{console.log("vmIfAggCb");
    if ((null != error) || (vmIfList && !vmIfList.length) || (null == vmIfList)) {
        callback(error, lrListData);
        return;
    }

    var dataObjArr = [];
    var vmIfListLen = vmIfList.length;
    var instance_ip_ObjRefs = null;
    var instance_ip_RefsLen = 0;
    
    for(var i=0; i<vmIfListLen; i++) {
        if('virtual_network_refs' in vmIfList[i]["virtual-machine-interface"]) {
            
            //instance_ip_ObjRefs = vmIfList[i]["virtual-machine-interface"]["instance_ip_back_refs"];
            //instance_ip_RefsLen = vmObjRefs.length;
            
            var vm_ref = vmIfList[i]["virtual-machine-interface"]["virtual_network_refs"][0];
            if (vm_ref) {
                lrListData['logical-router']["virtual_machine_interface_refs"][i] = vm_ref;
            }
        }
    }
    
    console.log(lrListData);

    callback(error, lrListData);
}

function readLogicalRouter (logicalRouterObj, callback)
{
console.log("readLogicalRouter");
    var dataObjArr = logicalRouterObj['reqDataArr'];
    async.map(dataObjArr, getLogicalRouterAsync, function(err, data) {
        callback(err, data);
    });
}

function getLogicalRouterAsync (logicalRouterObj, callback)
{
console.log("getLogicalRouterAsync");
    var logicalRouterId = logicalRouterObj['uuid'];
    var appData = logicalRouterObj['appData'];
    var reqUrl = '/logical-router/' + logicalRouterId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getLogicalRouterCb(err, data,appData, callback);
    });
    
}

/**
 * @getLogicalRouterCb
 * private function
 * 1. Callback for getLogicalRouterAsync
 * 2. Reads the response of Logical Router get from config api server
 *    and sends it back to the client.
 */
function getLogicalRouterCb(error, lrListData,appData, callback)
{
    console.log("getLogicalRouterCb");
    if (error) {
        commonUtils.handleJSONResponse(error, appData, null);
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
                                    appData, callback);
          });

}


/**
 * @createLogicalRouter
 * public function
 * 1. URL /api/tenants/config/logical-router Post
 * 2. Sets Post Data and sends back the Logical Router to client
 */
function createLogicalRouter(request, response, appData)
{
console.log("createLogicalRouters_ch");
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
