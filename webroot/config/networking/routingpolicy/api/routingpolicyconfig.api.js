/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @routingpolicyconfig.api.js
 *     - Handlers for Routing Policy Configuration
 *     - Interfaces with config api server
 */

//var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
//var global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors');
var util = require('util');
var url = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');


/**
 * Bail out if called directly as "nodejs routingpolicyconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listRoutingPolicyCb
 * private function
 * 1. Callback for listRoutingPolicy
 * 2. Reads the response of per project Security group from config api server
 *    and sends it back to the client.
 */
function listRoutingPolicyCb(error, routingPolicyListData, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, routingPolicyListData);
}

/**
 * @listRoutingPolicy
 * public function
 * 1. URL /api/tenants/config/
 * 2. Gets list of Routing policy from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listRoutingPolicyCb that process data from config
 *    api server and sends back the http response.
 */
function listRoutingPolicy(request, response, appData)
{
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var routingPolicyURL = '/routing-policys';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        routingPolicyURL += '?parent_id='
                            + tenantId.toString();
    }

    configApiServer.apiGet(routingPolicyURL, appData,
        function (error, data) {
            listRoutingPolicyCb(error, data, response)
        });
}

////////////////////////////////////////////////////////////////////////////////
function getRoutingPolicyCb(error, RoutingPolConfig, callback)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    callback(error, RoutingPolConfig);
}

function getRoutingPolicyAsync (routingPolicyObj, callback)
{
    var routingpolicyId = routingPolicyObj['uuid'];
    var appData = routingPolicyObj['appData'];

    var reqUrl = '/routing_policys/' + routingpolicyId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getRoutingPolicyCb(err, data, callback);
    });
}

function readRoutingPolicys (routingPolicyObj, callback)
{
    var dataObjArr = routingPolicyObj['reqDataArr'];
    async.map(dataObjArr, getRoutingPolicyAsync, function(err, data) {
        callback(err, data);
    });
}
////////////////////////////////////////////////////////////////////////////////


function listDetailRoutingPolicy (request, response, appData)
{
    var tenantId = request.param('id');
    var fipReqURL = '/routing-policys?detail=true&parent_id='+tenantId;

    configApiServer.apiGet(fipReqURL, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
}


////////////////////////////////////////////////////////////////////////////////
/**
 * @createRoutingPolicy
 * public function
 * 1. URL /api/tenants/config/routing-policy Post
 * 2. Sets Post Data and sends back the Routing policy to client
 */
function createRoutingPolicy(request, response, appData)
{
    var routingPolicyCreateURL = '/routing-policys';
    var routingPolicyPostData = request.body;
    if (typeof(routingPolicyPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if ((!('routing-policy' in routingPolicyPostData)) ||
        (!('fq_name' in routingPolicyPostData['routing-policy'])) ||
        (!(routingPolicyPostData['routing-policy']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Enter Routing policy Name ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(routingPolicyCreateURL, routingPolicyPostData,
        appData,
        function (error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
}

/**
 * @updateRoutingPolicy
 * public function
 * 1. URL /api/tenants/config/routing-policy/uuid Put
 * 2. Sets Put Data and sends back the Routing policy to client
 */

function updateRoutingPolicy(request, response, appData)
{
    var routingPolicyId       = null;
    var routingPolicyPutURL   = '/routing-policy/';
    var routingPolicyPostData = request.body;
    var orginalDataFromUI = commonUtils.cloneObj(request.body);
    var error;

    if (typeof(routingPolicyPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Put Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (routingPolicyId = request.param('uuid').toString()) {
        routingPolicyPutURL += routingPolicyId;
    } else {
        error = new appErrors.RESTServerError('Add Routing policy ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('routing-policy' in routingPolicyPostData)) ||
        (!('fq_name' in routingPolicyPostData['routing-policy'])) ||
        (!(routingPolicyPostData['routing-policy']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Invalid Routing policy');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    jsonDiff.getJSONDiffByConfigUrl(routingPolicyPutURL, appData,
        routingPolicyPostData,
        function(err, rpDataDelta){
            configApiServer.apiPut(routingPolicyPutURL, rpDataDelta, appData,
                function (error, data) {
                    commonUtils.handleJSONResponse(error, response, data);
                }
            );
        }
    );
}

/**
 * @deleteRoutingPolicy
 * public function
 * 1. URL /api/tenants/config/routing-policy/:id
 * 2. Deletes the service instance from config api server
 */
function deleteRoutingPolicy(request, response, appData)
{
    var routingPolicyId = request.param('uuid');
    if (null == routingPolicyId) {
        var error = new
                  appErrors.RESTServerError('Routing Policy ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var dataObj = {request: request, appData: appData, uuid: routingPolicyId};
    deleteRoutingPolicyAsync(dataObj, function(error, data) {
        commonUtils.handleJSONResponse(data.error, response, data.data);
    });
}

function deleteRoutingPolicyAsync (dataObj, callback)
{
    var request = dataObj['request'];
    var appData = dataObj['appData'];
    var routingPolicyId = dataObj['uuid'];
    var routingPolicDelURL = '/routing-policy/' + routingPolicyId;

    configApiServer.apiGet(routingPolicDelURL, appData, function(err, data) {
        if(err) {
            callback(err, null);
            return;
        }
        console.log("tt");
        configApiServer.apiDelete(routingPolicDelURL, appData,
            function (error, data) {
            console.log("tt1");
                callback(null, {'error': error, 'data': data});
                return;
            });
    });

}

exports.listRoutingPolicy = listRoutingPolicy;
exports.listDetailRoutingPolicy = listDetailRoutingPolicy;
exports.readRoutingPolicys = readRoutingPolicys;
exports.createRoutingPolicy = createRoutingPolicy;
exports.updateRoutingPolicy = updateRoutingPolicy;
exports.deleteRoutingPolicy = deleteRoutingPolicy;
exports.deleteRoutingPolicyAsync = deleteRoutingPolicyAsync;