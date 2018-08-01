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
var configUtils      = require(process.mainModule.exports["corePath"] +
                         '/src/serverroot/common/config.utils');
var messages         = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global           = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors        = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors.js');
var util             = require('util');
var url              = require('url');
var authApi          = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api');
var configApiServer  = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api');
var configServerUtils      = require(process.mainModule.exports["corePath"] +
                               '/src/serverroot/common/configServer.utils');
var async            = require('async');
var _                = require('underscore');
var ctrlGlobal       = require('../../../common/api/global');

var defaultDomainId = "default",
    defaultDomainName = "default-domain",
    defaultProject = "default-project",
    identity = "identity",
    apiServer = "apiServer";

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
 * @listAllProjects
 * public function
 * 1. URL /api/tenants/config/all-projects
 * 2. Gets list of all projects from identity and api server
 * 3. Takes query param domain uuid and returns filtered projects
 */
function listAllProjects (request, response, appData)
{
    var dataObjArr = [], i, identityProj, identityProjLen, apiProj,
        apiProjLen, projList = [], tempProjMap = {},
        parentId = commonUtils.getValueByJsonPath(request,
                "query;domainId", null, false),
        tempProjIdToIdxMap = {};
    var tempProjFqnToIDMap = {};
    dataObjArr.push({type : identity, request: request,
        appData: appData, parentId: parentId});
    dataObjArr.push({type : apiServer, request: request,
        appData: appData, parentId: parentId});
    async.map(dataObjArr, getAllProjectAsync, function(error, projData) {
        if (projData[0].error && projData[1].error) {
            commonUtils.handleJSONResponse(projData[0].error, response, null);
            return;
        }
        identityProj = commonUtils.getValueByJsonPath(projData,
                "0;data;projects", [], false);
        identityProjLen = identityProj.length;
        apiProj = commonUtils.getValueByJsonPath(projData,
                "1;data;projects", [], false);
        apiProjLen = apiProj.length;
        var allProjects = [];
        for (var i = 0; i < apiProjLen; i++) {
            var apiProjFQN = commonUtils.getValueByJsonPath(apiProj[i],
                                                            "fq_name", null);
            var apiProjName = commonUtils.getValueByJsonPath(apiProjFQN, "1",
                                                             null);
            var apiProjID = commonUtils.getValueByJsonPath(apiProj[i], "uuid",
                                                           null);
            apiProj[i]["display_name"] = apiProjName;
            allProjects.push(apiProj[i]);
            tempProjIdToIdxMap[apiProjID] = allProjects.length - 1;
            tempProjFqnToIDMap[apiProjFQN.join(":")] = apiProjID;
        }

        for (i = 0; i < identityProjLen; i++) {
            var identityProjID = commonUtils.getValueByJsonPath(identityProj[i],
                                                                "uuid", null);
            var idx = tempProjIdToIdxMap[identityProjID];
            var identityProjFQN =
                commonUtils.getValueByJsonPath(identityProj[i], "fq_name",
                                               null);
            var identityProjName =
                commonUtils.getValueByJsonPath(identityProjFQN, "1", null);
            if (null != idx) {
                /* Exists in API Server, so take display_name from keystone */
                allProjects[idx]["display_name"] = identityProjName;
            } else {
                identityProj[i]["display_name"] = identityProjName;
                allProjects.push(identityProj[i]);
            }
            /* If fqn matches both in Api Server and keystone, but their UUID is
             * different, then the project was deleted and recreated and the
             * project entry had child, so it did not get cleaned up from API
             * Server yet
             */
            var apiID = tempProjFqnToIDMap[identityProjFQN.join(":")];
            if ((null != apiID) && (apiID != identityProjID)) {
                idx = tempProjIdToIdxMap[apiID];
                if (null != idx) {
                    allProjects[idx]["display_name"] = identityProjName +
                        ctrlGlobal.PROJECT_NOT_FOUND_IN_KEYSTONE;
                    allProjects[idx]["error_string"] =
                        ctrlGlobal.PROJECT_NOT_FOUND_IN_KEYSTONE;
                }
            }
        }
        commonUtils.handleJSONResponse(null, response, {projects: allProjects});
    });
};

function getAllProjectAsync (dataObj, callback)
{
    var projURL, cookieDomain, projects, currentDomain;
    if(dataObj.type === identity) {
         authApi.getProjectList(dataObj.request, dataObj.appData,
                                function(error, identityData) {
             if(dataObj.parentId) {
                 cookieDomain = commonUtils.getValueByJsonPath(dataObj,
                         "request;cookies;domain", "", false);
                 projects = commonUtils.getValueByJsonPath(identityData,
                         "projects", [], false);
                 projects = _.filter(projects, function(project){
                     currentDomain = commonUtils.getValueByJsonPath(project,
                             "fq_name;0", [], false);
                     return cookieDomain === currentDomain ? true : false;
                 });
                 identityData = {"projects": projects};
             }
             callback(null, {error: error, data: identityData});
         });
     } else {
         projURL = "/projects";
         if(dataObj.parentId) {
             projURL += "?parent_id=" + dataObj.parentId;
         }
         configApiServer.apiGet(projURL, dataObj.appData,
                                function(error, configData) {
             callback(null, {error: error, data: configData});
         });
     }
};

/**
 * @listAllDomains
 * public function
 * 1. URL /api/tenants/config/all-domains
 * 2. Gets list of domains for the user from identity and api server
 */
function listAllDomains (request, response, appData)
{
    var dataObjArr = [], i, identityDomains, identityDomainsLen, apiDomains,
        apiDomainsLen, domainList = [], tempDomainMap = {},
        tempDomainIdToIdxMap = {};
    dataObjArr.push({type : identity, request: request, appData: appData});
    dataObjArr.push({type : apiServer, request: request, appData: appData});
    async.map(dataObjArr, getAllDomainAsync, function(error, domainData) {
        if (domainData[0].error && domainData[1].error) {
            commonUtils.handleJSONResponse(domainData[0].error, response, null);
            return;
        }
        identityDomains = commonUtils.getValueByJsonPath(domainData,
                "0;data", [], false);
        identityDomainsLen = identityDomains.length;
        apiDomains = commonUtils.getValueByJsonPath(domainData,
                "1;data;domains", [], false);
        apiDomainsLen = apiDomains.length;
        var allDomains = [];
        for (i = 0; i < apiDomainsLen; i++) {
            var apiDomainFQN = commonUtils.getValueByJsonPath(apiDomains[i],
                    "fq_name", [], false).join(":");
            var apiDomainId =
                commonUtils.getValueByJsonPath(apiDomains[i],
                                               "uuid", null);
            apiDomains[i]["display_name"] = apiDomainFQN;
            allDomains.push(apiDomains[i]);
            tempDomainIdToIdxMap[apiDomainId] = allDomains.length - 1;
            tempDomainMap[apiDomainFQN] = apiDomains[i];
        }

        for (i = 0; i < identityDomainsLen; i++) {
            var identityDomainFQN = commonUtils.getValueByJsonPath(
                    identityDomains[i], "fq_name", [], false).join(":");
            var identityDomainId =
                commonUtils.getValueByJsonPath(identityDomains[i], "uuid", null);
            var idx = tempDomainIdToIdxMap[identityDomainId];
            if (null != idx) {
                /* Exists in API Server, so take display_name from keystone */
                allDomains[idx]["display_name"] = identityDomainFQN;
            } else {
                if (null == tempDomainMap[identityDomainFQN]) {
                    identityDomains[i]["display_name"] = identityDomainFQN;
                    allDomains.push(identityDomains[i]);
                }
            }
        }

        commonUtils.handleJSONResponse(null, response,
                {domains: allDomains});
    });
};

function getAllDomainAsync (dataObj, callback)
{
    var appData = dataObj.appData;
    var request = dataObj.request;
     if(dataObj.type === identity) {
         var identityData = [], domainObj, domainId, domainName;
         if (('v2.0' == request.session.authApiVersion) ||
                 (null == request.session.authApiVersion)) {
                 identityData.push({uuid: defaultDomainId,
                     fq_name: [defaultDomainName]});
                 callback(null, {error: null, data: identityData});
                 return;
         }
         domainObj = commonUtils.getValueByJsonPath(request,
                 "session;last_token_used;project;domain", null, false);
         domainId = commonUtils.getValueByJsonPath(domainObj, 'id', '', false);
         domainName = commonUtils.getValueByJsonPath(domainObj, 'name', '',
                                                     false);
         if ('' == domainId) {
             logutils.logger.error("Did not find domain in last_token");
             callback(null, {error: null, data: identityData});
             return;
         }
         if(domainId === defaultDomainId) {
             identityData.push({uuid: domainId, fq_name: [defaultDomainName]});
         } else {
             //sync domain to api server
             var domainUrl = "/domain/" + commonUtils.convertUUIDToString(domainId) + "?exclude_children=true" +
                               "&exclude_back_refs=true";
             configApiServer.apiGet(domainUrl, appData,
                 function(error, data){
                     if ((null != error) || (null == data)) {
                         logutils.logger.error(
                                 'Domain Sync failed for ' + domainName);
                     }
             });
             identityData.push({uuid: commonUtils.convertUUIDToString(domainId),
                 fq_name: [domainName]})
         }
         callback(null, {error: null, data: identityData});
     } else {
         configApiServer.apiGet("/domains", appData,
                                function(error, configData) {
             callback(null, {error: error, data: configData});
         });
     }
};

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
    var config = configUtils.getConfig();
    var isDomainListFromApiServer = config.getDomainsFromApiServer;
    if (null == isDomainListFromApiServer) {
        isDomainListFromApiServer = true;
    }
    if (('v2.0' == request.session.authApiVersion) ||
        (null == request.session.authApiVersion)) {
        domains.domains.push({uuid: defaultDomainId,
            fq_name: [defaultDomainName]});
        commonUtils.handleJSONResponse(null, response, domains);
        return;
    }
    if (true == isDomainListFromApiServer) {
        configServerUtils.getDomainsFromApiServer(appData, function(error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
    } else {
        var domainObj =
            commonUtils.getValueByJsonPath(request,
                                           'session;last_token_used;project;domain',
                                           null, false);
        var domains = {};
        if ((null != domainObj) && (null != domainObj.id)) {
            if(domainObj.id === defaultDomainId) {
                domains =
                {   domains: [{
                        uuid: domainObj.id,
                        fq_name: [defaultDomainName]
                    }]
                }
            } else {
                domains =
                {   domains: [{
                        uuid: commonUtils.convertUUIDToString(domainObj.id),
                        fq_name: [domainObj.name]
                    }]
                }
            }
        }
        commonUtils.handleJSONResponse(null, response, domains);
    }
}

function getDomainsFromIdentityManager (request, appData, callback)
{
    /* /v3/users/<userid>/domains is not working, so get the domain list from
     * project list
     */
    configServerUtils.getTenantListAndSyncDomain(request, appData, callback);
}

/**
 * @getProjectByParameter
 * public function
 * 1. URL /api/tenants/config/project/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 *
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
    var reqUrl = (projectId == 'all') ? '/projects' : ('/project/' + projectId);

    reqUrl = getUrlWithParameters(reqUrl, params);
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        callback(err, data);
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

exports.listDomains  = listDomains;
exports.listProjects = listProjects;
exports.listAllProjects = listAllProjects;
exports.listAllDomains = listAllDomains;
exports.getProjectByParameter   = getProjectByParameter;
