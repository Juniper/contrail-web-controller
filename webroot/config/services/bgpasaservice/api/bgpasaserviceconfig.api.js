/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @bgpasaserviceconfig.api.js
 *     - Handlers for BGPASASERVICE Configuration
 *     - Interfaces with config api server
 */

var rest          = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/rest.api');
var async         = require('async');
var logutils      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/log.utils');
var commonUtils   = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/common.utils');
var config        = process.mainModule.exports["config"];
var messages      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/messages');
var appErrors     = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/errors/app.errors');
var util          = require('util');
var url           = require('url');
var jsonDiff      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/jsondiff');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');


/**
 * Bail out if called directly as "nodejs bgpasaserviceconfig.api.js"
 */
if (!module.parent)
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @getBGPAsAServices
 * public function
 * 1. URL /api/tenants/config/get-bgp-as-a-services/:id
 * 2. Gets list of bgpasaservice from config api server
 * 3. Needs tenant / project  id
 */
function getBGPAsAServices (request, response, appData)
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var bgpAsAServiceListURL   = '/bgp-as-a-services?detail=true';

    if (tenantId = request.param('id').toString()) {
        bgpAsAServiceListURL += '&parent_id=' + tenantId.toString();
    } else {
        error = new appErrors.RESTServerError('Provide Tenant Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(bgpAsAServiceListURL, appData,
        function(error, bgpaasData) {
            if(error || !bgpaasData || !bgpaasData["bgp-as-a-services"]
                || !bgpaasData["bgp-as-a-services"].length) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            var vmiList = [];
            var bgpaasDataArry = bgpaasData["bgp-as-a-services"];
            var bgpaasDataCnt = bgpaasDataArry.length;
            for(var j = 0; j < bgpaasDataCnt; j++) {
                var bgpaas = bgpaasDataArry[j]['bgp-as-a-service'];
                if('virtual_machine_interface_refs' in bgpaas) {
                    var vmiRefs = bgpaas['virtual_machine_interface_refs'];
                    for(var k = 0 ; k < vmiRefs.length; k++){
                        vmiList.push(vmiRefs[k].uuid);
                    }
                }
            }
            if(vmiList.length > 0) {
                getVMIDetails(appData, vmiList, function(err, vmiData) {
                    if(err || !vmiData || !vmiData.length) {
                        commonUtils.handleJSONResponse(err, response, null);
                        return
                    }
                    for(var i = 0; i < bgpaasDataCnt; i++) {
                        var bgpaas = bgpaasDataArry[i]['bgp-as-a-service'];
                        var vmiRefs = bgpaas['virtual_machine_interface_refs'];
                        if(vmiRefs != null && vmiRefs.length > 0) {
                            var vmiRefsCnt =  vmiRefs.length;
                            for(var j = 0; j < vmiRefsCnt; j++) {
                                var uuid = vmiRefs[j].uuid;
                                var vmiDataCnt = vmiData.length;
                                for(var k = 0; k < vmiDataCnt; k++) {
                                    if(vmiData[k]['virtual-machine-interface'].uuid === uuid) {
                                        vmiRefs[j] = vmiData[k];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    commonUtils.handleJSONResponse(error, response, bgpaasData)
                });
            } else {
                commonUtils.handleJSONResponse(error, response, bgpaasData)
            }
        }
    );
}

function getVMIDetails(appData, vmiList, callback) {
    var dataObjArr = [];
    var resultJSON = [];
    var vmiResourceObj = [];
    var vmiCnt = vmiList.length;
    for(var i = 0; i < vmiCnt; i++) {
        var vmiUrl = '/virtual-machine-interface/' + vmiList[i];
        commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);
    }
    async.mapLimit(dataObjArr, global.ASYNC_MAP_LIMIT_COUNT,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
        function(error, vmiData) {
            callback(error, vmiData);
        }
    );
}

/**
 * @createBGPAsAService
 * public function
 * 1. URL /api/tenants/config/create-bgp-as-a-service - Post
 * 2. Sets Post Data and sends back the bgpasaservice config to client
 */
function createBGPAsAService (request, response, appData)
{
    var bgpasaserviceCreateURL = '/bgp-as-a-services';
    var bgpasaservicePostData  = request.body;
    if (typeof(bgpasaservicePostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    updateVMIDetails(appData, bgpasaservicePostData, function(error, bgpaasData) {
        if(error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        configApiServer.apiPost(bgpasaserviceCreateURL, bgpasaservicePostData, appData,
            function(error, data) {
                commonUtils.handleJSONResponse(error, response, data);
            }
        );
    });
}

function updateVMIDetails(appData, bgpasaservicePostData, callback) {
    var vmiRefs = commonUtils.getValueByJsonPath(bgpasaservicePostData,
        "bgp-as-a-service;virtual_machine_interface_refs", []);
    var vmiUUIDs = [], bgpaasBackRefUUDs = [], bgpaasUUIDs = [], bgpaasPutObjArray = [];
    var vmiIndex, vmiRefLength, bgpaasBackRef, bgpaasIndex,
        bgpaasLength, bgpaasPutURl, currbgpaasVMIs;
    if(vmiRefs.length) {
        vmiRefLength = vmiRefs.length
        for(vmiIndex = 0;  vmiIndex < vmiRefLength; vmiIndex++) {
            vmiUUIDs.push(vmiRefs[vmiIndex].uuid);
        }
        //get virtual machine interfaces
        configApiServer.apiGet("/virtual-machine-interfaces?detail=true&fields=bgp_as_a_service_back_refs&obj_uuids="
            + vmiUUIDs.join(","), appData,
            function(error, vmiDetails) {
                vmiDetails = commonUtils.getValueByJsonPath(vmiDetails,
                    "virtual-machine-interfaces", [])
                if(error || !vmiDetails.length) {
                    callback(error, null);
                    return;
                }

                // filter the virtual machine interfaces with bgp_as_a_service_back_refs
                vmiRefLength = vmiDetails.length;
                for(vmiIndex = 0; vmiIndex < vmiRefLength; vmiIndex++) {
                    bgpaasBackRef =
                    commonUtils.getValueByJsonPath(vmiDetails[vmiIndex],
                        "virtual-machine-interface;bgp_as_a_service_back_refs;0", null);
                    if(bgpaasBackRef) {
                        bgpaasUUIDs.push(bgpaasBackRef.uuid);
                    }
                }
                if(bgpaasUUIDs.length) {
                    //get bgp as a services
                    configApiServer.apiGet("/bgp-as-a-services?detail=true&obj_uuids="
                        + bgpaasUUIDs.join(","), appData,
                        function(err, bgpaasData) {
                        bgpaasData = commonUtils.getValueByJsonPath(bgpaasData,
                            "bgp-as-a-services", [])
                        if(err || !bgpaasData.length) {
                            callback(err, null);
                            return;
                        }
                        bgpaasLength = bgpaasData.length;
                        var bgpaasPutObjArray = [];
                        for(bgpaasIndex = 0; bgpaasIndex < bgpaasLength; bgpaasIndex++){
                            bgpaasPutURl = '/bgp-as-a-service/' + bgpaasData[bgpaasIndex]['bgp-as-a-service'].uuid;
                            currbgpaasVMIs =
                                bgpaasData[bgpaasIndex]['bgp-as-a-service']['virtual_machine_interface_refs'];
                            for(var i =  currbgpaasVMIs.length - 1; i >= 0 ;i--){
                                for(var k = 0; k < vmiUUIDs.length; k++){
                                    if(currbgpaasVMIs[i] != null && currbgpaasVMIs[i]['uuid'] == vmiUUIDs[k]){
                                        /*remove the vmi_refs from the existing
                                        bgpasaservice whose are part of new bgpasaservice*/
                                        currbgpaasVMIs.splice(i, 1);
                                    }
                                }
                            }
                            commonUtils.createReqObj(bgpaasPutObjArray, bgpaasPutURl, global.HTTP_REQUEST_PUT,
                                    commonUtils.cloneObj(bgpaasData[bgpaasIndex]), null, null, appData);
                        }
                        if(bgpaasPutObjArray.length >0) {
                            async.map(bgpaasPutObjArray,commonUtils.getAPIServerResponse(configApiServer.apiPut, true),
                                function(err, bgpaasPutDetails){
                                    if(err){
                                        callback(err, null);
                                        return;
                                    }
                                    callback(null, bgpasaservicePostData);
                                }
                            );
                        } else {
                            callback(null, bgpasaservicePostData);
                        }
                    });
                } else {
                    callback(null, bgpasaservicePostData);
                }
        });
    } else {
        callback(null, bgpasaservicePostData);
    }
}

/**
 * @updateBGPAsAService
 * public function
 * 1. URL /api/tenants/config/update-bgp-as-a-service/:id - Put
 * 2. updates bgpasaservice config data
 */
function updateBGPAsAService (request, response, appData)
{
    var bgpasaserviceId         = null;
    var bgpasaserviceUpdateURL     = '/bgp-as-a-service/';
    var bgpasaserviceData   = request.body;

    if (typeof(bgpasaserviceData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (bgpasaserviceId = request.param('id').toString()) {
        bgpasaserviceUpdateURL += bgpasaserviceId;
    } else {
        error = new appErrors.RESTServerError('Provide BGPAsAService Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    jsonDiff.getJSONDiffByConfigUrl(bgpasaserviceUpdateURL, appData,
        bgpasaserviceData,
        function(err, bgpasaserviceDeltaConfig){
            if(err) {
                commonUtils.handleJSONResponse(err, response, null);
                return;
            }
            updateVMIDetails(appData, bgpasaserviceDeltaConfig, function(error, bgpaasData) {
                if(error) {
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                configApiServer.apiPut(bgpasaserviceUpdateURL, bgpasaserviceDeltaConfig, appData,
                    function(er, data) {
                        commonUtils.handleJSONResponse(er, response, data);
                        return;
                    }
                );
            });
        }
    );
}

/**
 * @deleteBGPAsAService
 * public function
 * 1. URL /api/tenants/config/delete-bgp-as-a-service/:id - Delete
 * 2. Deletes the BGPAsAService from config api server
 */
function deleteBGPAsAService (request, response, appData)
{
    var bgpasaserviceId         = null;
    var bgpasaserviceDelURL     = '/bgp-as-a-service/';
    var requestParams = url.parse(request.url, true);

    if (bgpasaserviceId = request.param('id').toString()) {
        bgpasaserviceDelURL += bgpasaserviceId;
    } else {
        error = new appErrors.RESTServerError('Provide BGPAsAService Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(bgpasaserviceDelURL, appData,
        function(error, data) {
             commonUtils.handleJSONResponse(error, response, data);
        }
    );
}

exports.getBGPAsAServices   = getBGPAsAServices;
exports.createBGPAsAService = createBGPAsAService;
exports.updateBGPAsAService = updateBGPAsAService;
exports.deleteBGPAsAService = deleteBGPAsAService;
