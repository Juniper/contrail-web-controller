/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @quotasconfig.api.js
 *     - Handlers for project quotas
 *     - Interfaces with config api server
 */
var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var svcAppliance = module.exports;
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/messages');
var global      = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/global');
var appErrors   = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/errors/app.errors');
var util        = require('util');
var url         = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var jsonDiff    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/jsondiff');


function getServiceAppliances (req, res, appData)
{
    var url = '/service-appliances';
    var details = req.param('detail');
    var parent_id = req.param('parent_id');
    console.log("getting detailas a:s", details, typeof details);
    if ((null != details) && ((true == details) ||
                              ('true' == details))) {
        url += '?detail=true';
    }
    if (null != parent_id) {
        url += '&parent_id=' + parent_id;
    }
    configApiServer.apiGet(url, appData, function(error, data) {
        if ((null != error) || (null == data) ||
            (null == data['service-appliances'])) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        commonUtils.handleJSONResponse(null, res, data['service-appliances']);
    });
}

function createServiceAppliance (req, res, appData)
{
    var url = '/service-appliances';
    var body = req.body;
    configApiServer.apiPost(url, body, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function updateServiceAppliance (req, res, appData)
{
    var uuid = req.param('id');
    var url = '/service-appliance/' + uuid;
    var putData = req.body;
    jsonDiff.getConfigDiffAndMakeCall(url, appData, putData,
                                      function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

exports.getServiceAppliances = getServiceAppliances;
exports.createServiceAppliance = createServiceAppliance;
exports.updateServiceAppliance = updateServiceAppliance;
