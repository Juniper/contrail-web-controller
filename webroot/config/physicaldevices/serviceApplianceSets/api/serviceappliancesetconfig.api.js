/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @serviceappliancesetconfig.api.js
 *     
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api');
var async = require('async');
var logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var config = process.mainModule.exports["config"];
var messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/errors/app.errors');
var util = require('util');
var url = require('url');
var imageApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/imagemanager.api');
var configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api');
var computeApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/computemanager.api');



/**
 * Bail out if called directly as "nodejs serviceappliancesetconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

function createServiceApplianceSet(request, response, appData) 
{
    var sasCreateURL = '/service-appliance-sets';
    var sasPostData = request.body;

    if (typeof(sasPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance-set' in sasPostData)) ) {
        error = new appErrors.RESTServerError('Invalid Service appliance set');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(sasCreateURL, sasPostData, appData,
        function (error, data) {
	    commonUtils.handleJSONResponse(error, response, data);
        });

}

function deleteServiceApplianceSetCb(error, stDelResp, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, stDelResp);
}

/**
 - delete service appliance set
 */
function deleteSets(request, response, appData) 
{
    var sasDelURL = '/service-appliance-set/';
    var sasId = null;

    if (sasId = request.param('id').toString()) {
        sasDelURL += sasId;
    } else {
        error = new appErrors.RESTServerError('Service appliance set ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(sasDelURL, appData,
        function (error, data) {
            deleteServiceApplianceSetCb(error, data, response)
        });
}

exports.createServiceApplianceSet= createServiceApplianceSet;
exports.deleteSets= deleteSets;


