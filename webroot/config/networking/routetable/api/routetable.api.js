/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @routetable.api.js
 *     - Handlers for Route Table Configuration
 *     - Interfaces with config api server
 */

var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/messages');
var util = require('util');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');


/**
 * Bail out if called directly as "nodejs routetable.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

function createRouteTable (req, res, appData)
{
    var type = req.param('type');
    var rtCreateURL = '/' + type + 's';
    var postData = req.body;

    configApiServer.apiPost(rtCreateURL, postData, appData,
                            function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function updateRouteTable (req, res, appData)
{
    var id = req.param('id');
    var type = req.param('type');
    var putData = req.body;
    var rtEditURL = '/' + type + '/' + id;
    jsonDiff.getConfigDiffAndMakeCall(rtEditURL, appData, putData,
                                      function(error, data) {
        commonUtils.handleJSONResponse(error, res, data);
    });
}

exports.createRouteTable = createRouteTable;
exports.updateRouteTable = updateRouteTable;

