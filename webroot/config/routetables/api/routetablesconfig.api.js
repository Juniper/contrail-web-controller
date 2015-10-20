/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @routetablesconfig.api.js
 *     - Handlers for Route Tables Configuration
 *     - Interfaces with config api server
 */


var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var routetablesconfig = module.exports;
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
 * Bail out if called directly as "nodejs routetablesconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * @listRouteTables
 * public function
 * 1. URL /api/tenants/config/list-route-tables
 * 2. Gets list of Route Tables from config api server
 * 3. Needs tenant / project  id
 */
function listRouteTables (request, response, appData)
{
    var tenantId = null;
    var projUUID = null;
    var requestParams = url.parse(request.url, true);
    var routeTableListURL = '/route-tables';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        routeTableListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    } else if (requestParams.query && requestParams.query.projUUID) {
        projUUID = requestParams.query.projUUID;
        routeTableListURL += '?parent_id=' + projUUID.toString();
    }

    configApiServer.apiGet(routeTableListURL, appData,
        function (error, data) {
            commonUtils.handleJSONResponse(error, response, data);
        });
}

function readRouteTable (routeTableObj, callback)
{
    var dataObjArr = routeTableObj['reqDataArr'];
    async.map(dataObjArr, getRouteTableAsync, function(err, data) {
        callback(err, data);
    });
}

function getRouteTableAsync (routeTableObj, callback)
{
    var routeTableId = routeTableObj['uuid'];
    var appData = routeTableObj['appData'];
    var reqUrl = '/route-table/' + routeTableId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        callback(err, data);
    });
    
}

/**
 * @createRouteTable
 * public function
 * 1. URL /api/tenants/config/route-tables Post
 * 2. Sets Post Data and sends back the Route Table to client
 */
function createRouteTable(request, response, appData)
{
    var routeTableCreateURL = '/route-tables';
    var routeTablePostData = request.body;
    if (typeof(routeTablePostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('route-table' in routeTablePostData)) ||
        (!('fq_name' in routeTablePostData['route-table'])) ||
        (!(routeTablePostData['route-table']['fq_name'][2].length)) ||
        !('parent_uuid' in routeTablePostData['route-table']) ||
        !(typeof routeTablePostData['route-table']['parent_uuid'] === "string") ||
        !(routeTablePostData['route-table']['parent_uuid'].length > 0)) {
        error = new 
            appErrors.RESTServerError('Missing Route Table Name/Project UUID in POST data.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var project_uuid = routeTablePostData['route-table']['parent_uuid'];
    configApiServer.apiPost(routeTableCreateURL, routeTablePostData, appData,
        function (error, data) {
            if(error){
                commonUtils.handleJSONResponse(error, response, null);;
                return;
            } else {
                //update project
                updateProject(project_uuid, data, response, appData);
                return;
            }
        }
    );
}

function updateProject(project_uuid, routeTableData, response, appData) {
    var projectGetUrl = "/project/" + project_uuid + "?fields=route_tables";
    var projectPutUrl = "/project/" + project_uuid;
    configApiServer.apiGet(projectGetUrl, appData, function(err, projectConfigData) {
        if(err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        delete projectConfigData['project']['id_perms'];
        if(!(projectConfigData['project'].hasOwnProperty('route_tables'))) {
            projectConfigData['project']['route_tables'] = [];
        }
        projectConfigData['project']['route_tables'].push({
            "to": routeTableData['fq_name'],
            "uuid": routeTableData['uuid']
        });
        configApiServer.apiPut(projectPutUrl, projectConfigData, appData, function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(err, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, routeTableData);
                return;
            }
        });
    });
}

/**
 * @updateRouteTable
 * public function
 * 1. URL /api/tenants/config/route-table/:id Post
 * 2. Sets Post Data and sends back the Route Table to client
 */
function updateRouteTable(request, response, appData)
{
    var routeTableUpdateURL = '/route-table/',
        routeTableId;

    var routeTablePutData = request.body;
    if (typeof(routeTablePutData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (routeTableId = request.param('uuid').toString()) {
        routeTableUpdateURL += routeTableId;
    } else {
        error = new appErrors.RESTServerError('Route Table ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('route-table' in routeTablePutData)) ||
        (!('fq_name' in routeTablePutData['route-table'])) ||
        (!(routeTablePutData['route-table']['fq_name'][2].length))) {
        error = new 
            appErrors.RESTServerError('Missing Route Table Name in PUT data.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiPut(routeTableUpdateURL, routeTablePutData, appData,
        function (error, data) {
            if(error){
                commonUtils.handleJSONResponse(error, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, data);
                return;
            }
        }
    );
}

/**
 * @deleteRouteTable
 * public function
 * 1. URL /api/tenants/config/route-table/:id
 * 2. Deletes the route table from config api server
 */
function deleteRouteTable(request, response, appData)
{
    var routeTableDelURL = '/route-table/',
        routeTableId;

    if (routeTableId = request.param('uuid').toString()) {
        routeTableDelURL += routeTableId;
    } else {
        error = new appErrors.RESTServerError('Route Table ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    
    var routeTableURL = routeTableDelURL;
    configApiServer.apiDelete(routeTableURL, appData,
        function (error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, data);
            }
    });
}

exports.listRouteTables = listRouteTables;
exports.readRouteTable = readRouteTable;
exports.createRouteTable = createRouteTable;
exports.updateRouteTable = updateRouteTable;
exports.deleteRouteTable = deleteRouteTable;