/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @fipconfig.api.js
 *     - Handlers for Floating IP Configuration
 *     - Interfaces with config api server
 */

var ctrlerConfig = require('../../../common/js/controller.config.global');
var rest         = require(ctrlerConfig.core_path +
                           '/src/serverroot/common/rest.api');
var async        = require('async');
var fipconfigapi = module.exports;
var logutils     = require(ctrlerConfig.core_path +
                           '/src/serverroot/utils/log.utils');
var commonUtils  = require(ctrlerConfig.core_path +
                           '/src/serverroot/utils/common.utils');
var config       = require(ctrlerConfig.core_path + '/config/config.global.js');
var messages     = require(ctrlerConfig.core_path +
                           '/src/serverroot/common/messages');
var global       = require(ctrlerConfig.core_path +
                           '/src/serverroot/common/global');
var appErrors    = require(ctrlerConfig.core_path +
                           '/src/serverroot/errors/app.errors');
var util         = require('util');
var url          = require('url');
var UUID         = require('uuid-js');
var configApiServer = require(ctrlerConfig.core_path +
                              '/src/serverroot/common/configServer.api');

/**
 * Bail out if called directly as "nodejs fipconfig.api.js"
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listFloatingIpsCb
 * private function
 * 1. Callback for listFloatingIps
 * 2. Reads the response of per project floating ips from config api server
 *    and sends it back to the client.
 */
function listFloatingIpsCb (error, fipListData, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    commonUtils.handleJSONResponse(error, response, fipListData);
}

/**
 * @fipListAggCb
 * private function
 * 1. Callback for the fip gets, sends all fips to client.
 */
function fipListAggCb (error, results, callback) 
{
    var fipConfigBackRefs = {};

    if (error) {
        callback(error, null);
        return;
    }

    fipConfigBackRefs['floating_ip_back_refs'] = [];
    fipConfigBackRefs['floating_ip_back_refs'] = results;
    callback(error, fipConfigBackRefs);
}

/**
 * @getFipsForProjectCb
 * private function
 * 1. Callback for listFloatingIps
 * 2. Gets the list of Fip backrefs and does an individual
 *    get for each one of them.
 */
function getFipsForProjectCb (error, fipListData, response, appData)
{
    var reqUrl            = null;
    var dataObjArr        = [];
    var i = 0, fipLength  = 0;
    var fipConfigBackRefs = {};
    var fipObjArr = [];

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    fipConfigBackRefs['floating_ip_back_refs'] = [];

    if ('floating_ip_back_refs' in fipListData['project']) {
        fipConfigBackRefs['floating_ip_back_refs'] =
              fipListData['project']['floating_ip_back_refs'];
    }

    fipLength = fipConfigBackRefs['floating_ip_back_refs'].length;

    if (!fipLength) {
        commonUtils.handleJSONResponse(error, response, fipConfigBackRefs);
        return;
    }

    for (i = 0; i < fipLength; i++) {
       fipRef = fipConfigBackRefs['floating_ip_back_refs'][i];
       reqUrl = '/floating-ip/' + fipRef['uuid'];
       commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                null, null, null, appData);
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function(error, results) {
        fipListAggCb(error, results, function (err, fipAggList) {
            if (err) {
               commonUtils.handleJSONResponse(err, response, null);
               return;
            }
            if(fipAggList && fipAggList['floating_ip_back_refs'] && fipAggList['floating_ip_back_refs'].length > 0) {
                for(var i=0; i<fipAggList['floating_ip_back_refs'].length; i++) {
                    var fipBackRef = fipAggList['floating_ip_back_refs'][i];
                    if('floating-ip' in fipBackRef && 
                        'virtual_machine_interface_refs' in fipBackRef['floating-ip'] &&
                        fipBackRef['floating-ip']['virtual_machine_interface_refs'].length > 0) {
                        for(var j=0; j<fipBackRef['floating-ip']['virtual_machine_interface_refs'].length; j++) {
                            var vmiRef = fipBackRef['floating-ip']['virtual_machine_interface_refs'][j];
                            fipObjArr.push({'appData' : appData, 'vmiRef' : vmiRef, 'fip' : fipBackRef, 'fip_uuid' : fipBackRef['floating-ip']['uuid']});
                        }
                    }
                }
                if(fipAggList['floating_ip_back_refs'].length > 0) {
                    async.mapSeries(fipObjArr, getInstanceIPForVirtualMachineInterface, function(err, fipDetailData) {
                        if(err) {
                            commonUtils.handleJSONResponse(error, response, fipAggList);
                        }
                        else {
                            updateFipAggrList(err, response, fipAggList, fipDetailData);
                        }
                    });
                } else {
                    commonUtils.handleJSONResponse(error, response, fipAggList);
                }
          }
        });
    });
}

/**
 * @updateFipAggrList
 * private function
 * 1. Callback from getFipsForProjectCb
 * 2. Updates the original list of floating ip backrefs with  
 *    floating ip list with instance_ip_refs details, if any, of individual 
 *    virtual machine interface got from getInstanceIPForVirtualMachineInterface. 
 */
function updateFipAggrList(err, response, fipAggList, fipDetailData) {
    for(var i=0; i<fipAggList['floating_ip_back_refs'].length; i++) {
        for(var j=0; j<fipDetailData.length; j++) {
            if(fipAggList['floating_ip_back_refs'][i]['floating-ip']['uuid'] ==
              fipDetailData[j]['floating-ip']['uuid']) {
                fipAggList['floating_ip_back_refs'][i] = fipDetailData[j];
            }
        }
    }
    commonUtils.handleJSONResponse(err, response, fipAggList);
}

/**
 * @getInstanceIPForVirtualMachineInterface
 * private function
 * 1. Gets instance_ip_refs for each VMI of a Floating IP.
 * 2. Updates the list of floating ip backrefs with virtual_machine_refs 
 *    of individual virtual machine interface of the floating ip. 
 */
function getInstanceIPForVirtualMachineInterface(fipObj, callback) {
    var appData = fipObj['appData'];    
    var reqUrl = '/virtual-machine-interface/' + fipObj['vmiRef']['uuid'];
    var fip = fipObj["fip"];
    configApiServer.apiGet(reqUrl, appData, function(err, vmiData) {
        if (err) {
            callback(err, null);
            return;
        } else {
            for(var i=0; i<fip['floating-ip']['virtual_machine_interface_refs'].length; i++) {
                var vmiRef = fip['floating-ip']['virtual_machine_interface_refs'][i];
                if(vmiRef["uuid"] === vmiData['virtual-machine-interface']["uuid"]) {
                    fip['floating-ip']['virtual_machine_interface_refs'][i]["virtual_machine_refs"] = [];
                    fip['floating-ip']['virtual_machine_interface_refs'][i]["virtual_machine_refs"] = 
                        vmiData['virtual-machine-interface']['virtual_machine_refs']
                    callback(err, fip);
                }
            }
        }
    });
}

function listFloatingIpsAsync (fipObj, callback)
{
    var fipObjArr = [];
    var dataObjArr = fipObj['reqDataArr'];
    var reqLen = dataObjArr.length;

    for (var i = 0; i < reqLen; i++) {
        reqUrl = '/floating-ip/' + dataObjArr[i]['uuid'];
        commonUtils.createReqObj(fipObjArr, reqUrl, null, null, null, null,
                                 dataObjArr[i]['appData']);
    }
    if (!reqLen) {
        callback(null, null);
        return;
    }
    async.map(fipObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(err, results) {
        fipListAggCb(err, results, function (err, data) {
            callback(err, data);
        });
    });
}

/**
 * @listFloatingIps
 * public function
 * 1. URL /api/tenants/config/floating-ips/:id
 * 2. Gets list of floating ips from  project's fip backrefs
 * 3. Needs tenant / project  id as the id
 * 4. Calls listFloatingIpsCb that process data from config
 *    api server and sends back the http response.
 */
function listFloatingIps (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var projectURL   = '/project';

    if ((tenantId = request.param('id'))) {
        projectURL += '/' + tenantId.toString();
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
    configApiServer.apiGet(projectURL, appData,
                         function(error, data) {
                         getFipsForProjectCb(error, data, response, appData);
                         });
}

/**
 * @getFipPoolsForProjectCb
 * private function
 * 1. Callback for getFipPoolsForProject
 */
function getFipPoolsForProjectCb (error, projectData, response) 
{
    var fipPool = {};

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    fipPool['floating_ip_pool_refs'] = [];

    if ('floating_ip_pool_refs' in projectData['project']) {
        fipPool['floating_ip_pool_refs'] =
               projectData['project']['floating_ip_pool_refs'];
    }

    commonUtils.handleJSONResponse(error, response, fipPool);
}

/**
 * @listFloatingIpPools
 * public function
 * 1. URL /api/tenants/config/floating-ip-pools/:id
 * 2. Gets list of floating ip pools  from  project's fip
 *    pool  refs
 * 3. Needs tenant / project id as the id
 */
function listFloatingIpPools (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var projectURL    = '/project';

    if ((tenantId = request.param('id'))) {
        projectURL += '/' + tenantId.toString();
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
    configApiServer.apiGet(projectURL, appData,
                         function(error, data) {
                         getFipPoolsForProjectCb(error, data, response)
                         });
}

/**
 * @fipSendResponse
 * private function
 * 1. Sends back the response of fip read to clients after set operations.
 */
function fipSendResponse(error, fipConfig, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
    } else {
       commonUtils.handleJSONResponse(error, response, fipConfig);
    }
    return;
}

/**
 * @setFipRead
 * private function
 * 1. Callback for Fip create / update operations
 * 2. Reads the response of Fip get from config api server
 *    and sends it back to the client.
 */
function setFipRead(error, fipConfig, response, appData) 
{
    var fipGetURL = '/floating-ip/';

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    fipGetURL += fipConfig['floating-ip']['uuid'];
    configApiServer.apiGet(fipGetURL, appData,
                         function(error, data) {
                         fipSendResponse(error, data, response)
                         });
}

/**
 * @createFloatingpIp
 * public function
 * 1. URL /api/tenants/config/floating-ips - Post
 * 2. Sets Post Data and sends back the floating-ip config to client
 */
function createFloatingIp (request, response, appData) 
{
    var fipCreateURL = '/floating-ips';
    var fipPostData  = request.body;

    if (typeof(fipPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('floating-ip' in fipPostData)) ||
        (!('fq_name' in fipPostData['floating-ip'])) ||
        (!(fipPostData['floating-ip']['fq_name'][3].length))) {
        error = new appErrors.RESTServerError('Invalid Floating IP Pool');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(['name'] in fipPostData['floating-ip']) ||
        !(fipPostData['floating-ip']['name'].length)) {
        uuid = UUID.create();
        fipPostData['floating-ip']['name'] = uuid['hex'];
        fipPostData['floating-ip']['uuid'] = uuid['hex'];
        fipPostData['floating-ip']['fq_name'][4] =
                                  fipPostData['floating-ip']['name'];
    }

    configApiServer.apiPost(fipCreateURL, fipPostData, appData,
                         function(error, data) {
                         setFipRead(error, data, response, appData);
                         });

}

/**
 * @deleteFloatingIpCb
 * private function
 * 1. Return back the response of fip delete.
 */
function deleteFloatingIpCb (error, fipDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, fipDelResp);
}

/**
 * @deleteFloatingIp
 * public function
 * 1. URL /api/tenants/config/floating-ip/:id
 * 2. Deletes the floating-ip from config api server
 */
function deleteFloatingIp (request, response, appData) 
{
    var fipDelURL     = '/floating-ip/';
    var fipId         = null;
    var requestParams = url.parse(request.url, true);

    if (fipId = request.param('id').toString()) {
        fipDelURL += fipId;
    } else {
        error = new appErrors.RESTServerError('Provide Floating IP Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(fipDelURL, appData,
                            function(error, data) {
                            deleteFloatingIpCb(error, data, response)
                            });
}

/**
 * @setFipVMInterface
 * private function
 * 1. Callback for updateFloatingIp
 * 2. Updates the vm interface backrefs
 */
function setFipVMInterface(error, fipConfig, fipPostData, fipId, response,
                           appData) 
{
    var fipPostURL = '/floating-ip/' + fipId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if (!('virtual_machine_interface_refs' in fipPostData['floating-ip'])) {
        fipPostData['floating-ip']['virtual_machine_interface_refs'] = [];
    }

    fipConfig['floating-ip']['virtual_machine_interface_refs'] = [];
    fipConfig['floating-ip']['virtual_machine_interface_refs'] =
           fipPostData['floating-ip']['virtual_machine_interface_refs'];

    configApiServer.apiPut(fipPostURL, fipConfig, appData,
                         function(error, data) {
                         setFipRead(error, data, response, appData)
                         });
}

/**
 * @updateFloatingIp
 * public function
 * 1. URL /api/tenants/config/floating-ip/:id - Put
 * 2. Sets Post Data and sends back the policy to client
 */
function updateFloatingIp (request, response, appData) 
{
    var fipId       = null;
    var vmRef       = {};
    var fipGetURL   = '/floating-ip/';
    var fipPostData = request.body;

    if (typeof(fipPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipId = request.param('id').toString()) {
        fipGetURL += fipId;
    } else {
        error = new appErrors.RESTServerError('Add Floating Ip ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ('floating-ip' in fipPostData &&
        'virtual_machine_interface_refs' in fipPostData['floating-ip'] &&
        fipPostData['floating-ip']['virtual_machine_interface_refs'] &&
        fipPostData['floating-ip']
                   ['virtual_machine_interface_refs'].length) {

        vmRef = fipPostData['floating-ip']
                           ['virtual_machine_interface_refs'][0];
        if ((!('to' in vmRef)) || (vmRef['to'].length != 3)) {
            error = new appErrors.RESTServerError('Add valid Instance \n' +
                                                  JSON.stringify(vmRef));
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
    }

    configApiServer.apiGet(fipGetURL, appData,
                        function(error, data) {
                        setFipVMInterface(error, data, fipPostData,
                                          fipId, response, appData);
                        });
}

/* List all public function here */
exports.listFloatingIps     = listFloatingIps;
exports.listFloatingIpPools = listFloatingIpPools;
exports.createFloatingIp    = createFloatingIp
exports.deleteFloatingIp    = deleteFloatingIp
exports.updateFloatingIp    = updateFloatingIp
exports.listFloatingIpsAsync = listFloatingIpsAsync;

