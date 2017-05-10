/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 /**
 * @svcApplianceSet.api.js
 *     - Handlers for Service Appliances
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


function getServiceApplianceSets (req, res, appData)
{
    var url = '/service-appliance-sets';
    var details = req.param('detail');
    if ((null != details) && ((true == details) ||
                              ('true' == details))) {
        url += '?detail=true&fields=service_appliances';
    }
    configApiServer.apiGet(url, appData, function(error, data) {
        if ((null != error) || (null == data) ||
            (null == data['service-appliance-sets'])) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        commonUtils.handleJSONResponse(null, res, data['service-appliance-sets']);
    });
}

function createServiceApplianceSet (req, res, appData)
{
    var url = '/service-appliance-sets';
    var body = req.body;
    configApiServer.apiPost(url, body, appData, function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function updateServiceApplianceSet (req, res, appData)
{
    var uuid = req.param('id');
    var url = '/service-appliance-set/' + uuid;
    var putData = req.body;
    jsonDiff.getConfigDiffAndMakeCall(url, appData, putData,
                                      function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

exports.getServiceApplianceSets = getServiceApplianceSets;
exports.createServiceApplianceSet = createServiceApplianceSet;
exports.updateServiceApplianceSet = updateServiceApplianceSet;

