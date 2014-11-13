/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @projectconfig.api.js
 *     - Handlers for Project Configuration
 *     - Interfaces with config api server
 */

var rest             = require(process.mainModule.exports["corePath"] +
                               '/src/serverroot/common/rest.api');
var projectconfigapi = module.exports;
var logutils         = require(process.mainModule.exports["corePath"] +
                               '/src/serverroot/utils/log.utils');
var commonUtils      = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils');
var config           = process.mainModule.exports["config"];
var messages         = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global           = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors        = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors.js');
var util             = require('util');
var url              = require('url');
var authApi          = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api');
var configApiServer  = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api');
var configUtils      = require(process.mainModule.exports["corePath"] + 
                               '/src/serverroot/common/configServer.utils');
var async            = require('async');

/**
 * Bail out if called directly as "nodejs projectconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listProjects
 * public function
 * 1. URL /api/tenants/config/projects
 * 2. Gets list of projects for the user, domain support
 *    to be added
 * 3. Plumbed with Keystone for now
 */
function listProjects (request, response, appData)
{
    authApi.getProjectList(request, appData, function(err, projList) {
        commonUtils.handleJSONResponse(err, response, projList);
    });
}

/**
 * @listDomainsCb
 * private function
 */
function listDomainsCb (error, domainList, response)
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, domainList);
    }
}

/**
 * @listDomains
 * public function
 * 1. URL /api/tenants/config/domains
 * 2. Gets list of domains for the user, domain support
 *    to be added
 * 3. Keystone doesn't support domains as of now so we
 *    pick up domain from api server
 */
function listDomains (request, response, appData)
{
    var domains = {'domains': []};
    var domainsURL = '/domains';
    var isDomainListFromApiServer = config.getDomainsFromApiServer;
    if (null == isDomainListFromApiServer) {
        isDomainListFromApiServer = true;
    }
    if (('v2.0' == request.session.authApiVersion) ||
        (null == request.session.authApiVersion)) {
        isDomainListFromApiServer = true;
    }
    if (true == isDomainListFromApiServer) {
        configUtils.getDomainsFromApiServer(appData, function(error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
    } else {
        getDomainsFromIdentityManager(request, appData, function(error, data) {
            if (null != error) {
                commonUtils.handleJSONResponse(error, response, domains);
                return;
            }
            commonUtils.handleJSONResponse(error, response, data);
        });
    }
}

function getDomainsFromIdentityManager (request, appData, callback)
{
    /* /v3/users/<userid>/domains is not working, so get the domain list from
     * project list
     */
    configUtils.getTenantListAndSyncDomain(request, appData, callback);
}

/**
 * @getProjectByParameterCb
 * private function
 * 1. Callback for getProjectByParameter
 * 2. Reads the response of project get from config api server
 *    and sends it back to the client.
 */
function getProjectByParameterCb(error, projectConfig, callback) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    callback(error, projectConfig);
}

/**
 * @getProjectByParameter
 * public function
 * 1. URL /api/tenants/config/project/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls getProjectByParameterCb that process data from config
 *    api server and sends back the http response.
 */
function getProjectByParameter (request, response, appData) 
{
    var projectId = null;
    var requestParams    = url.parse(request.url, true);
    var params = {};
    if(null !== request.param("exclude_children") && 
        typeof request.param("exclude_children") !== "undefined")
        params.exclude_children = request.param("exclude_children");
    
    if(null !== request.param("exclude_back_refs") && 
        typeof request.param("exclude_back_refs") !== "undefined")
        params.exclude_back_refs = request.param("exclude_back_refs");

    if ((projectId = request.param('id'))) {
        getProjectAsync({uuid:projectId, appData:appData, params: params},
                       function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
}

function getProjectAsync (projectObj, callback)
{
    var projectId = projectObj['uuid'];
    var appData   = projectObj['appData'];
    var params    = projectObj['params'];

    var reqUrl = '/project/' + projectId;
    reqUrl = getUrlWithParameters(reqUrl, params);
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getProjectByParameterCb(err, data, callback);
    });
}

function getUrlWithParameters(baseURL, params) {
    var reqUrl = baseURL;
    if(!isEmpty(params)) {
        reqUrl += "?";
        if(params.hasOwnProperty("exclude_back_refs")) {
            reqUrl += "exclude_back_refs=" + params["exclude_back_refs"];
            delete params["exclude_back_refs"];
        }
        if(!isEmpty(params)) {
            reqUrl += "&";
            if(params.hasOwnProperty("exclude_children")) {
                
                reqUrl += "exclude_children=" + params["exclude_children"];
                delete params["exclude_children"];
            }
        }
    }
    return reqUrl;
}

function isEmpty(obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function getAvailableIPFromInstanceIPList (req, res, appData)
{
    var ipListObj = {};
    var body = req.body;
    var ipAddr = body.ipAddr;
    var subnet = body.subnet;
    var ipType = body.ipType;
    var instIPUrl = '/instance-ips';
    var dataObjArr = [];

    configApiServer.apiGet(instIPUrl, appData, function(err, instList) {
        if ((null != err) || (null == instList)) {
            commonUtils.handleJSONResponse(null, res, ipAddr);
            return;
        }
        var instList = instList['instance-ips'];
        var instCnt = instList.length;
        for (var i = 0; i < instCnt; i++) {
            var url = '/instance-ip/' + instList[i]['uuid'];
            commonUtils.createReqObj(dataObjArr, url, null, null, null, null,
                                     appData);
        }
        async.map(dataObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   true),
                  function(err, results) {
            var ipCnt = results.length;
            for (i = 0; i < ipCnt; i++) {
                if ((null != results[i]) &&
                    (null != results[i]['instance-ip']) &&
                    (null != results[i]['instance-ip']['instance_ip_address'])) {
                    ipListObj[results[i]['instance-ip']['instance_ip_address']]
                        = results[i];
                }
            }
            var ipObj = commonUtils.getAvailableIpByIPList(ipListObj, ipAddr, subnet);
            commonUtils.handleJSONResponse(ipObj['err'], res, ipObj['address']);
        });
    });
}

exports.listDomains  = listDomains;
exports.listProjects = listProjects;
exports.getProjectByParameter   = getProjectByParameter;
exports.getAvailableIPFromInstanceIPList = getAvailableIPFromInstanceIPList;

