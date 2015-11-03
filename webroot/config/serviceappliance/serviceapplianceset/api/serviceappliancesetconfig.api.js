/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @serviceappliancesetconfig.api.js
 *     - Handlers for Service Appliance Set configuration
 *     - Interfaces with config api server
 */

var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var config      = process.mainModule.exports["config"];
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

/**
 * Bail out if called directly as "nodejs serviceappliancesetconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * listServiceApplianceSet
 * public function
 * 1. URL /api/tenants/config/service-appliance-set
 * 2. Gets list of service appliance set
 * 3. Calls listServiceApplianceSetCb that process data from config
 *    api server and sends back the http response.
 */
function listServiceApplianceSet (request, response, appData) 
{
    var sapSetListURL   = '/service-appliance-sets';

    configApiServer.apiGet(sapSetListURL, appData,
        function(error, data) {
          listServiceApplianceSetCb(error, data, response, appData);
        }
    );
}

/**
 * listServiceApplianceSetCb
 * private function
 * 1. Callback for listServiceApplianceSet
 * 2. Reads the response of service appliance set list from config api server
 *    and calls serviceApplianceSetListAggCb 
 */
function listServiceApplianceSetCb (error, sapSetListData, response, appData) 
{
    var sapSetURL            = null;
    var dataObjArr           = [];
    var sapSetLength         = 0;
    var sapSet               = {};
    sapSet['service_appliance_sets'] = [];

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if ('service-appliance-sets' in sapSetListData) {
        sapSet['service_appliance_sets'] =
              sapSetListData['service-appliance-sets'];
    }

    sapSetLength = sapSet['service_appliance_sets'].length;
    
    if (!sapSetLength) {
        commonUtils.handleJSONResponse(error, response, sapSet);
        return;
    }

    for (var i=0; i<sapSetLength; i++) {
       var sapSetObj = sapSet['service_appliance_sets'][i];
       sapSetURL = '/service-appliance-set/' + sapSetObj['uuid'];
       commonUtils.createReqObj(dataObjArr, sapSetURL,
               global.HTTP_REQUEST_GET, null, null, null,
               appData);
       
    }
    
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  serviceApplianceSetListAggCb(error, results, function(err, data) {
                      commonUtils.handleJSONResponse(err, response, data);
                  });
              });
}

/**
 * serviceApplianceSetListAggCb
 * private function
 * 1. Callback for the listServiceApplianceSetCb gets, 
 *    sends all service appliance set to client.
 */
function serviceApplianceSetListAggCb (error, results, callback) 
{
    if (error) {
        callback(error, null);
        return;
    }
    var sapSet = {};
    sapSet["service_appliance_sets"] = results;
    callback(error, sapSet);
}

function createServiceApplianceSet(request, response, appData) 
{
    var sapSetCreateURL = '/service-appliance-sets';
    var sapSetPostData  = request.body;

    if (typeof(sapSetPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance-set' in sapSetPostData)) ||
        (!('fq_name' in sapSetPostData['service-appliance-set'])) ||
        (!(sapSetPostData['service-appliance-set']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid Service Appliance Set');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
 
    configApiServer.apiPost(sapSetCreateURL, sapSetPostData, appData,
        function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, data);
                return;
            }
        });
}

function updateServiceApplianceSet(request, response, appData) 
{
    var sapSetUpdateURL = '/service-appliance-set/';
    var sapSetPutData  = request.body;
    var sapSetUUID = null;

    if (typeof(sapSetPutData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Put Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (sapSetUUID = request.param('id').toString()) {
        sapSetUpdateURL += sapSetUUID;
    } else {
        error = new appErrors.RESTServerError('Service Appliance Set ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance-set' in sapSetPutData)) ||
        (!('fq_name' in sapSetPutData['service-appliance-set'])) ||
        (!(sapSetPutData['service-appliance-set']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid Service Appliance Set');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
 
    configApiServer.apiPut(sapSetUpdateURL, sapSetPutData, appData,
        function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, data);
                return;
            }
        });
}

function deleteServiceApplianceSet (request, response, appData) 
{
    var sapSetDelURL     = '/service-appliance-set/';
    var sapSetUUID         = null;
    var requestParams = url.parse(request.url, true);

    if (sapSetUUID = request.param('id').toString()) {
        sapSetDelURL += sapSetUUID;
    } else {
        error = new appErrors.RESTServerError('Service Appliance Set ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(sapSetDelURL, appData,
        function(error, data) {
            if(error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            } else {
                commonUtils.handleJSONResponse(null, response, data);
                return;
            }

    });
}

exports.listServiceApplianceSet   = listServiceApplianceSet;
exports.createServiceApplianceSet = createServiceApplianceSet;
exports.updateServiceApplianceSet = updateServiceApplianceSet;
exports.deleteServiceApplianceSet = deleteServiceApplianceSet;
