/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @serviceapplianceconfig.api.js
 *   - Handlers for Service Appliance configuration
 *   - Interfaces with config api server
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
 *  Bail out if called directly as "nodejs serviceapplianceconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 *  listServiceAppliance
 *  public function
 *  1. URL /api/tenants/config/service-appliance
 *  2. Gets list of service appliance for a given service appliance set
 *  3. Calls listServiceApplianceCb that process data from config
 *     api server and sends back the http response.
 */
function listServiceAppliance (request, response, appData) 
{
    var sapListURL   = '/service-appliances';
    var sapSetUUID = request.param('parentUUID');
    if (sapSetUUID != null) {
        sapListURL += '?parent_id=' + sapSetUUID + '&detail=true';
    } else {
        error = new appErrors.RESTServerError('Service Appliance Set UUID is missing.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(sapListURL, appData,
        function(error, data) {
          if(error)
              commonUtils.handleJSONResponse(error, response, null);
          else
              commonUtils.handleJSONResponse(null, response, data);
        }
    );
}

/**
 *  listServiceApplianceCb
 *  private function
 *  1. Callback for listServiceAppliance
 *  2. Reads the response of service appliance list from config api server
 *     and calls serviceApplianceListAggCb 
 */
function listServiceApplianceCb (error, sapListData, response, appData) 
{
    var sapURL            = null;
    var dataObjArr           = [];
    var sapLength         = 0;
    var sap               = {};
    sap['service_appliances'] = [];

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if ('service-appliances' in sapListData) {
        sap['service_appliances'] =
              sapListData['service-appliances'];
    }

    sapLength = sap['service_appliances'].length;
    
    if (!sapLength) {
        commonUtils.handleJSONResponse(error, response, sap);
        return;
    }

    for (var i=0; i<sapLength; i++) {
       var sapObj = sap['service_appliances'][i];
       sapURL = '/service-appliance/' + sapObj['uuid'];
       commonUtils.createReqObj(dataObjArr, sapURL,
               global.HTTP_REQUEST_GET, null, null, null,
               appData);
    }
    
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  serviceApplianceListAggCb(error, results, function(err, data) {
                      commonUtils.handleJSONResponse(err, response, data);
                  });
              });
}

/**
 * serviceApplianceListAggCb
 * private function
 * 1. Callback for the listServiceApplianceCb gets, 
 *    sends all service appliance to client.
 */
function serviceApplianceListAggCb (error, results, callback) 
{
    if (error) {
        callback(error, null);
        return;
    }
    var sap= {};
    sap["service_appliances"] = results;
    callback(error, sap);
}

function createServiceAppliance(request, response, appData) 
{
    var sapCreateURL = '/service-appliances';
    var sapPostData  = request.body;

    if (typeof(sapPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance' in sapPostData)) ||
        (!('fq_name' in sapPostData['service-appliance'])) ||
        (!(sapPostData['service-appliance']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid Service Appliance');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
 
    configApiServer.apiPost(sapCreateURL, sapPostData, appData,
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

function updateServiceAppliance(request, response, appData) 
{
    var sapUpdateURL = '/service-appliance/';
    var sapPutData  = request.body;
    var sapUUID = null;

    if (typeof(sapPutData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Put Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (sapUUID = request.param('id').toString()) {
        sapUpdateURL += sapUUID;
    } else {
        error = new appErrors.RESTServerError('Service Appliance ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('service-appliance' in sapPutData)) ||
        (!('fq_name' in sapPutData['service-appliance'])) ||
        (!(sapPutData['service-appliance']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid Service Appliance');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
 
    configApiServer.apiPut(sapUpdateURL, sapPutData, appData,
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

function deleteServiceAppliance (request, response, appData) 
{
    var sapDelURL     = '/service-appliance/';
    var sapUUID         = null;
    var requestParams = url.parse(request.url, true);

    if (sapUUID = request.param('id').toString()) {
        sapDelURL += sapUUID;
    } else {
        error = new appErrors.RESTServerError('Service Appliance ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(sapDelURL, appData,
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

function getAllPhysicalInterfaces(request, response, appData) {
    var phyInterfaceGetURL   = '/physical-interfaces';
    configApiServer.apiGet(phyInterfaceGetURL, appData,
        function(error, data) {
          if(error)
              commonUtils.handleJSONResponse(error, response, null);
          else
              commonUtils.handleJSONResponse(null, response, data);
        }
    );
}

exports.listServiceAppliance   = listServiceAppliance;
exports.createServiceAppliance = createServiceAppliance;
exports.updateServiceAppliance = updateServiceAppliance;
exports.deleteServiceAppliance = deleteServiceAppliance;
exports.getAllPhysicalInterfaces = getAllPhysicalInterfaces;