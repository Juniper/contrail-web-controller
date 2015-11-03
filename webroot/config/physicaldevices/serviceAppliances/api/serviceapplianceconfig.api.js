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




function createServiceAppliance(request, response, appData) 
{
    var saCreateURL = '/service-appliances';
    var saPostData = request.body;

    if (typeof(saPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance' in saPostData)) ) {
        error = new appErrors.RESTServerError('Invalid Service appliance');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiPost(saCreateURL, saPostData, appData,
        function (error, data) {
      commonUtils.handleJSONResponse(error, response, data);
        });

}

function deleteServiceApplianceCb(error, stDelResp, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    commonUtils.handleJSONResponse(error, response, stDelResp);
}

/**
-delete service appliance by id
 */
function deleteServiceAppliance(request, response, appData) 
{

    var saDelURL = '/service-appliance/';
    var saId = null;

    if (saId = request.param('id').toString()) {
        saDelURL += saId;
    } else {
        error = new appErrors.RESTServerError('Service appliance ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(saDelURL, appData,
        function (error, data) {
            deleteServiceApplianceCb(error, data, response)
        });
}

function updateServiceAppliance(request, response, appData)
{
     var url = '/service-appliance/';
     var saId = null;

     if (saId = request.param('id').toString()) {
         url  += saId;
     } else {
         error = new appErrors.RESTServerError('Service appliance ID is required.');
         commonUtils.handleJSONResponse(error, response, null);
         return;
     } 
     var postData     =  request.body;
     configApiServer.apiPut(url, postData, appData,
         function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }         
            commonUtils.handleJSONResponse(null, response, data);
         });             
} 

exports.createServiceAppliance= createServiceAppliance;
exports.deleteServiceAppliance= deleteServiceAppliance;
exports.updateServiceAppliance= updateServiceAppliance;


