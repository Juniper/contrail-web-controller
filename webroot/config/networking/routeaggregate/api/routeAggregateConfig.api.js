/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @routeaggregateconfig.api.js
 *     - Handlers for Route Aggregate Configuration
 *     - Interfaces with config api server
 */

var logutils      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/log.utils');
var commonUtils   = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/common.utils');
var messages      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/messages');
var appErrors     = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/errors/app.errors');
var util          = require('util');
var url           = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');


/**
 * Bail out if called directly as "nodejs routeraggregateconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @getRouteAggregates
 * public function
 * 1. URL /api/tenants/config/route-aggregates/:id
 * 2. Gets list of route aggregates from config api server
 * 3. Needs tenant / project  id
 */
function getRouteAggregates (request, response, appData)
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var routeAggregateListURL   = '/route-aggregates?detail=true';

    if (tenantId = request.param('id').toString()) {
        routeAggregateListURL += '&parent_id=' + tenantId.toString();
    } else {
        error = new appErrors.RESTServerError('Provide Tenant Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(routeAggregateListURL, appData,
        function(error, routeAggregates) {
            commonUtils.handleJSONResponse(error, response, routeAggregates)
        }
    );
}

/**
 * @createRouteAggregate
 * public function
 * 1. URL /api/tenants/config/route-aggregates - Post
 * 2. Sets Post Data and sends back the Route Aggregate config to client
 */
function createRouteAggregate (request, response, appData)
{
    var routeAggregateCreateURL = '/route-aggregates';
    var routeAggregatePostData  = request.body;
    if (typeof(routeAggregatePostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiPost(routeAggregateCreateURL, routeAggregatePostData, appData,
        function(error, routeAggregate) {
            commonUtils.handleJSONResponse(error, response, routeAggregate);
        }
    );
}

/**
 * @updateRouteAggregate
 * public function
 * 1. URL /api/tenants/config/route-aggregate/:id - Put
 * 2. updates Route Aggregate config data
 */
function updateRouteAggregate (request, response, appData)
{
    var routeAggregateId         = null;
    var routeAggregateUpdateURL     = '/route-aggregate/';
    var routeAggregateData   = request.body;

    if (typeof(routeAggregateData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (routeAggregateId = request.param('id').toString()) {
        routeAggregateUpdateURL += routeAggregateId;
    } else {
        error = new appErrors.RESTServerError('Provide Route Aggregate UUID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiPut(routeAggregateUpdateURL, routeAggregateData, appData,
        function(error, routeAggregate) {
            commonUtils.handleJSONResponse(error, response, routeAggregate);
        }
    );
}

/**
 * @deleteRouteAggregate
 * public function
 * 1. URL /api/tenants/config/route-aggregate/:id - Delete
 * 2. Deletes the Route Aggregate from config api server
 */
function deleteRouteAggregate (request, response, appData)
{
    var routeAggregateId         = null;
    var routeAggregateDelURL     = '/route-aggregate/';
    var requestParams = url.parse(request.url, true);

    if (routeAggregateId = request.param('id').toString()) {
        routeAggregateDelURL += routeAggregateId;
    } else {
        error = new appErrors.RESTServerError('Provide Route Aggregate UUID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(routeAggregateDelURL, appData,
        function(error, deleteRouteAggregate) {
             commonUtils.handleJSONResponse(error, response, deleteRouteAggregate);
        }
    );
}

exports.getRouteAggregates   = getRouteAggregates;
exports.createRouteAggregate = createRouteAggregate;
exports.updateRouteAggregate = updateRouteAggregate;
exports.deleteRouteAggregate = deleteRouteAggregate;
