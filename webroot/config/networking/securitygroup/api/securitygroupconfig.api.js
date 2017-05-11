/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @securitygroupconfig.api.js
 *     - Handlers for Security Group Configuration
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
 * Bail out if called directly as "nodejs securitygroupconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listSecurityGroupCb
 * private function
 * 1. Callback for listSecurityGroup
 * 2. Reads the response of per project Security group from config api server
 *    and sends it back to the client.
 */
function listSecurityGroupCb(error, securityGroupListData, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, securityGroupListData);
}

/**
 * @listSecurityGroup
 * public function
 * 1. URL /api/tenants/config/securitygroup
 * 2. Gets list of security group from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listSecurityGroupCb that process data from config
 *    api server and sends back the http response.
 */
function listSecurityGroup(request, response, appData)
{
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var securityGroupListURL = '/security-groups';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        securityGroupListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(securityGroupListURL, appData,
        function (error, data) {
            listSecurityGroupCb(error, data, response)
        });
}


function getSecurityGroupAsync (securityGroupObj, callback)
{
    var securityGroupId = securityGroupObj['uuid'];
    var appData = securityGroupObj['appData'];
    var reqUrl = '/security-group/' + securityGroupId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        callback(err, data);
    });
}

function readSecurityGroup (securityGroupObj, callback)
{
    var dataObjArr = securityGroupObj['reqDataArr'];
    async.map(dataObjArr, getSecurityGroupAsync, function(err, data) {
        callback(err, data);
    });
}



/**
 * @createSecurityGroup
 * public function
 * 1. URL /api/tenants/config/securitygroup Post
 * 2. Sets Post Data and sends back the Security Group to client
 */
function createSecurityGroup(request, response, appData)
{
    var securityGroupCreateURL = '/security-groups';
    var securityGroupPostData = request.body;

    if (typeof(securityGroupPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('security-group' in securityGroupPostData)) ||
        (!('fq_name' in securityGroupPostData['security-group'])) ||
        (!(securityGroupPostData['security-group']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Enter Security Group Name ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(securityGroupCreateURL, securityGroupPostData, appData,
        function (error, data) {
            setSecurityGroupRead(error, data, response, appData);
        });
}

/**
 * @setSTRead
 * private function
 * 1. Callback for Security Group create / update operations
 * 2. Reads the response of Security Group get from config api server
 *    and sends it back to the client.
 */
function setSecurityGroupRead(error, securityGroupConfig, response, appData)
{
    var securityGroupGetURL = '/security-group/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    securityGroupGetURL += securityGroupConfig['security-group']['uuid'];
    configApiServer.apiGet(securityGroupGetURL, appData,
        function (error, data) {
            securityGroupSendResponse(error, data, response)
        });
}

/**
 * @securityGroupSendResponse
 * private function
 * 1. Sends back the response of Security Group read to clients after set operations.
 */
function securityGroupSendResponse(error, securityGroupConfig, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, securityGroupConfig);
    }
    return;
}

function updateSecurityGroup(request, response, appData)
{
    var securityGroupId       = null;
    var securityGroupPutURL   = '/security-group/';
    var securityGroupPostData = request.body;
    var error;

    if (typeof(securityGroupPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (securityGroupId = request.param('uuid').toString()) {
        securityGroupPutURL += securityGroupId;
    } else {
        error = new appErrors.RESTServerError('Add Security Group ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('security-group' in securityGroupPostData)) ||
        (!('fq_name' in securityGroupPostData['security-group'])) ||
        (!(securityGroupPostData['security-group']['fq_name'][2].length))) {
        error = new appErrors.RESTServerError('Invalid Security Group');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    jsonDiff.getJSONDiffByConfigUrl(securityGroupPutURL, appData,
                                    securityGroupPostData,
                                    function(error, delta) {
        configApiServer.apiPut(securityGroupPutURL, delta, appData,
                               function(error, data) {
            setSecurityGroupRead(error, data, response, appData);
        });
    });
}

/**
 * @deleteSecurityGroup
 * public function
 * 1. URL /api/tenants/config/securitygroup/:id
 * 2. Deletes the Security Group from config api server
 */
function deleteSecurityGroup(request, response, appData)
{
    var securityGroupDelURL = '/security-group/',
        securityGroupId, analyzerPolicyId;

    if (securityGroupId = request.param('uuid').toString()) {
        securityGroupDelURL += securityGroupId;
    } else {
        error = new appErrors.RESTServerError('Security Group ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(securityGroupDelURL, appData,
        function (error, data) {
            deleteSecurityGroupCb(error, data, response);
        });
}
/**
 * @deleteSecurityGroupCb
 * private function
 * 1. Return back the response of security group delete.
 */
function deleteSecurityGroupCb(error, sgDelResp, response)
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, sgDelResp);
}

function getSecurityGroupDetails (req, res, appData)
{
    var projUUID = req.param('projUUID');
    var secGrpURL = '/security-groups?detail=true';
    if (null != projUUID) {
        secGrpURL += '&parent_id=' + projUUID;
    }

    configApiServer.apiGet(secGrpURL, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

exports.listSecurityGroup = listSecurityGroup;
exports.readSecurityGroup = readSecurityGroup;
exports.createSecurityGroup = createSecurityGroup;
exports.updateSecurityGroup = updateSecurityGroup;
exports.deleteSecurityGroup = deleteSecurityGroup;
exports.getSecurityGroupDetails = getSecurityGroupDetails;

