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
    var vmiList, i, j, k, bgpaas, bgpaasDataCnt, instIPDataCnt, instIP,
        vmiRefs, vmiRefsCnt;
    if (tenantId = request.param('id').toString()) {
        bgpAsAServiceListURL += '&parent_id=' + tenantId.toString();
    } else {
        error = new appErrors.RESTServerError('Provide Tenant Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(bgpAsAServiceListURL, appData,
        function(bgpaasError, bgpaasData) {
            bgpaasData = commonUtils.getValueByJsonPath(bgpaasData,
                "bgp-as-a-services", []);
            if(bgpaasError || !bgpaasData.length) {
                commonUtils.handleJSONResponse(bgpaasError, response, null);
                return;
            }
            vmiList = [];
            bgpaasDataCnt = bgpaasData.length;
            for(j = 0; j < bgpaasDataCnt; j++) {
                vmiRefs = commonUtils.getValueByJsonPath(bgpaasData[j],
                    "bgp-as-a-service;virtual_machine_interface_refs", []);
                vmiRefsCnt = vmiRefs.length;
                for(k = 0; k < vmiRefsCnt; k++){
                    vmiList.push(vmiRefs[k].uuid);
                }
            }
            if(vmiList.length) {
                getInstanceIPs(appData, vmiList, function(instIPerr, instIPData) {
                    if(instIPerr) {
                        commonUtils.handleJSONResponse(instIPerr, response, null);
                        return;
                    } else if(!instIPData || !instIPData.length) {
                        commonUtils.handleJSONResponse(null, response,
                            {"bgp-as-a-services" : bgpaasData});
                        return;
                    }
                    for(i = 0; i < bgpaasDataCnt; i++) {
                        if(!bgpaasData[i] || !bgpaasData[i]['bgp-as-a-service']) {
                            continue;
                        }
                        bgpaas = bgpaasData[i]['bgp-as-a-service'];
                        vmiRefs = bgpaas['virtual_machine_interface_refs'];
                        if(vmiRefs && vmiRefs.length) {
                            vmiRefsCnt = vmiRefs.length;
                            for(j = 0; j < vmiRefsCnt; j++) {
                                instIPDataCnt = instIPData.length;
                                vmiRefs[j]['instance_ip_address'] = [];
                                for(k = 0; k < instIPDataCnt; k++) {
                                    if(commonUtils.getValueByJsonPath(instIPData[k],"instance-ip;virtual_machine_interface_refs;0;uuid", "") ===
                                        vmiRefs[j].uuid) {
                                        instIP = commonUtils.getValueByJsonPath(instIPData[k],
                                            "instance-ip;instance_ip_address", "");
                                        if(instIP) {
                                            vmiRefs[j]['instance_ip_address'].push(instIP);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    commonUtils.handleJSONResponse(null, response, {"bgp-as-a-services" : bgpaasData});
                });
            } else {
                commonUtils.handleJSONResponse(null, response, {"bgp-as-a-services" : bgpaasData});
            }
        }
    );
}

function getInstanceIPs(appData, vmiList, callback)
{
    var dataObjArr = [], instIPDetailsLen;
    var vmiListCnt = vmiList.length;
    var chunk = 200, chunkedVMIList, i, instIPUrl, instIPData;
    for(i = 0; i < vmiListCnt; i += chunk) {
        chunkedVMIList = vmiList.slice(i, i + chunk);
        instIPUrl =
            '/instance-ips?detail=true&back_ref_id=' +
            chunkedVMIList.join(",");
        commonUtils.createReqObj(dataObjArr, instIPUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);
    }
    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
        function(error, instIPDetails) {
            if(error) {
                callback(error, null);
                return;
            }
            instIPData = [];
            instIPDetailsLen = instIPDetails.length;
            for(i = 0; i < instIPDetailsLen; i++) {
                if(instIPDetails[i]) {
                    instIPData = instIPData.concat(instIPDetails[i]["instance-ips"]);
                }
            }
            callback(error, instIPData);
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

function updateVMIDetails(appData, bgpasaservicePostData, callback, bgpaasId)
{
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
                    if(bgpaasBackRef && bgpaasBackRef.uuid !== bgpaasId) {
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
            }, bgpasaserviceId);
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
