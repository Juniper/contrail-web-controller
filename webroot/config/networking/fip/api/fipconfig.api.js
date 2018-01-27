/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @fipconfig.api.js
 *     - Handlers for Floating IP Configuration
 *     - Interfaces with config api server
 */
var _ = require('lodash');
var rest         = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/common/rest.api');
var async        = require('async');
var fipconfigapi = module.exports;
var logutils     = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/utils/log.utils');

var commonUtils  = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/utils/common.utils');
var messages     = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/common/messages');
var global       = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/common/global');
var appErrors    = require(process.mainModule.exports["corePath"] +
                           '/src/serverroot/errors/app.errors');
var util         = require('util');
var url          = require('url');
var UUID         = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var configUtil = require('../../../common/api/configUtil.api');

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
function getFipsForProjectCb (results, response, appData)
{
    var vmiObjs           = {};
    var vmiObjArr         = [];
    var tmpVMIObjs        = {};
    var instIPObjs        = {};
    var fipDataArr        = [];
    var dataObjGetArr     = [];
    var i = 0, fipLength  = 0;
    var fipConfigBackRefs = {};

    results = results['floating-ips'];
    fipListAggCb(null, results, function (err, fipAggList) {
        if (err) {
           commonUtils.handleJSONResponse(err, response, null);
           return;
        }
        if (!fipAggList['floating_ip_back_refs'].length) {
            commonUtils.handleJSONResponse(err, response, fipAggList);
            return;
        }
        var fipBackRefsCnt = fipAggList['floating_ip_back_refs'].length;
        for (var i = 0; i < fipBackRefsCnt; i++) {
            var fipBackRef = fipAggList['floating_ip_back_refs'][i];
            if ('floating-ip' in fipBackRef &&
                'virtual_machine_interface_refs' in fipBackRef['floating-ip'] &&
                fipBackRef['floating-ip']['virtual_machine_interface_refs'].length > 0) {
                var vmiRefsCnt =
                    fipBackRef['floating-ip']['virtual_machine_interface_refs'].length;
                for (var j = 0; j < vmiRefsCnt; j++) {
                    var vmiRef = fipBackRef['floating-ip']['virtual_machine_interface_refs'][j];
                    vmiObjArr.push(vmiRef['uuid']);
                    if (null == tmpVMIObjs[vmiRef['uuid']]) {
                        tmpVMIObjs[vmiRef['uuid']] = [];
                    }
                    tmpVMIObjs[vmiRef['uuid']].push(i);
                }
            }
        }
        if (!vmiObjArr.length) {
            commonUtils.handleJSONResponse(null, response, fipAggList);
            return;
        }
        var chunk = 200;
        var vmiObjArrLen = vmiObjArr.length;
        for (var i = 0, j = vmiObjArrLen; i < j; i += chunk) {
            var tmpArray = vmiObjArr.slice(i, i + chunk);
            var instIPUrl = '/instance-ips?detail=true&back_ref_id=' +
                tmpArray.join(',') + '&fields=virtual_machine_interface_refs';
            commonUtils.createReqObj(dataObjGetArr, instIPUrl, null, null, null,
                                     null, appData);
        }

        async.map(dataObjGetArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   true),
                  function(err, results) {
            var resCnt = results.length;
            var instIpsData = [];
            for (var i = 0; i < resCnt; i++) {
                if (null == results[i]) {
                    continue;
                }
                instIpsData =
                    instIpsData.concat(results[i]['instance-ips']);
            }
            var instIpsDataCnt = instIpsData.length;
            for (var i = 0; i < instIpsDataCnt; i++) {
            		var ipVMIRefs = _.result(instIpsData, i + ".instance-ip.virtual_machine_interface_refs", []);
            		var ipVMIRefsCnt = ipVMIRefs.length;
            		for( var vCnt=0; vCnt < ipVMIRefsCnt; vCnt++){
            			var vmiUUID = _.result(instIpsData, i +".instance-ip.virtual_machine_interface_refs."+vCnt+".uuid", null);
            			if (null == instIPObjs[vmiUUID]) {
            				instIPObjs[vmiUUID] = [];
            			}
            			instIPObjs[vmiUUID].push(instIpsData[i]['instance-ip']);
            		}
            }
            for (var i = 0; i < fipBackRefsCnt; i++) {
                var vmiRefsCnt = 0;
                try {
                    vmiRefs =
                        fipAggList['floating_ip_back_refs'][i]['floating-ip']
                                  ['virtual_machine_interface_refs'];
                    if (null != vmiRefs) {
                        vmiRefsCnt = vmiRefs.length;
                    }
                } catch(e) {
                    vmiRefs = null;
                    vmiRefsCnt = 0;
                }
                for (var j = 0; j < vmiRefsCnt; j++) {
                    var instIpList = instIPObjs[vmiRefs[j]['uuid']];
                    if (null == instIpList) {
                        continue;
                    }
                    var fixedIpLen = instIpList.length;
                    var fixedIpArray = [];
                    for (var k = 0; k < fixedIpLen; k++) {
                        fixedIpArray.push({'fixedip': {'ip':
                                          instIpList[k]['instance_ip_address']}});
                    }
                    fipAggList['floating_ip_back_refs'][i]['floating-ip']
                              ['virtual_machine_interface_refs'][j]
                              ['instance_ip_back_refs'] = [];
                    fipAggList['floating_ip_back_refs'][i]['floating-ip']
                              ['virtual_machine_interface_refs'][j]
                              ['instance_ip_back_refs'] = fixedIpArray;
                }
            }
            commonUtils.handleJSONResponse(null, response, fipAggList);
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
function getInstanceIPForVirtualMachineInterface (vmiData, fip, callback)
{
    var vmiRefsCnt = 0;
    try {
        vmiRefsCnt =
            fip['floating-ip']['virtual_machine_interface_refs'].length;
    } catch(e) {
        vmiRefsCnt = 0;
    }
    for (var i = 0; i < vmiRefsCnt; i++) {
        var vmiRef = fip['floating-ip']['virtual_machine_interface_refs'][i];
        if (vmiRef["uuid"] === vmiData['virtual-machine-interface']["uuid"]) {
            fip['floating-ip']['virtual_machine_interface_refs'][i]["virtual_machine_refs"] = [];
            fip['floating-ip']['virtual_machine_interface_refs'][i]["virtual_machine_refs"] =
                vmiData['virtual-machine-interface']['virtual_machine_refs'];
            return fip;
        }
    }
    return fip;
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
    var emptyFipResp = {'floating_ip_back_refs': []};
    var tenantId = request.param('id');
    var fipReqURL = '/floating-ips?detail=true&back_ref_id=' + tenantId +
        '&fields=virtual_machine_interface_refs,project_refs';

    configApiServer.apiGet(fipReqURL, appData, function(error, data) {
        if ((null != error) || (null == data) ||
            (null == data['floating-ips']) ||
            (!data['floating-ips'].length)) {
            commonUtils.handleJSONResponse(error, response, emptyFipResp);
            return;
        }
        getFipsForProjectCb(data, response, appData);
    });
}

/**
 * @getFipPoolsForProjectCb
 * private function
 * 1. Callback for getFipPoolsForProject
 */
function getFipPoolsForProjectCb (error, projectData, appData, callback) 
{
    var fipPool = {};
    var fipPoolReqArry = [];
    if (error) {
       callback(error, fipPool);
       return;
    }
    fipPool['floating_ip_pool_refs'] = [];
    if ('floating_ip_pool_refs' in projectData['project']) {
        fipPool['floating_ip_pool_refs'] =
               projectData['project']['floating_ip_pool_refs'];
        var poolLength = fipPool['floating_ip_pool_refs'].length;   
        for(var poolCnt = 0; poolCnt <  poolLength; poolCnt++) {
            var fipPoolReqUrl = '/floating-ip-pool/' + fipPool['floating_ip_pool_refs'][poolCnt].uuid;
            commonUtils.createReqObj(fipPoolReqArry, fipPoolReqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);            
        }
        if(fipPoolReqArry.length > 0) {
            async.map(fipPoolReqArry, commonUtils.getAPIServerResponse(configApiServer.apiGet, true)
                , function(err, data){
                var nwReqArry = [];
                if (err) {
                     commonUtils.handleJSONResponse(err, response, null);
                     return;
                }
                if(data && data.length > 0) {
                    for(var poolCnt = 0; poolCnt <  data.length; poolCnt++) {
                        try {
                            var nwReqUrl =  '/' + data[poolCnt]['floating-ip-pool']['parent_type'] 
                                + '/' + data[poolCnt]['floating-ip-pool']['parent_uuid'];    
                            commonUtils.createReqObj(nwReqArry, nwReqUrl, global.HTTP_REQUEST_GET,
                                null, null, null, appData);            
                              
                        } catch (e) {
                            logutils.logger.error('getFipPoolsForProjectCb: JSON parse error :' + e);
                        }
                    }
                    if(nwReqArry.length > 0) { 
                        getFIPPoolSubnets(nwReqArry, appData, fipPool, function(subnetErr, finalFipPool) {
                            if(subnetErr) {
                                callback(subnetErr, finalFipPool);
                                return;
                            }
                            callback(null, finalFipPool);
                        });
                    } else {
                        callback(null, fipPool);
                    }    
                }                
            });        
        } else {
            callback(null, fipPool);
        }    
    } else {
        callback(null, fipPool);
    }
}

/**
 * @getFloatingIpPoolsByProject
 * private function
 * 1. Gets list of floating ip pools  from  Project's fip
 *    pool  refs
 */
function getFloatingIpPoolsByProject (request, appData, callback)
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var projectURL    = '/project';

    if ((tenantId = request.param('id'))) {
        projectURL += '/' + tenantId.toString() +
                    '?fields=floating_ip_pool_refs&' +
                    'exclude_back_refs=true&exclude_children=true';
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
        var error = new appErrors.RESTServerError('Specify Project UUID or FQ Name');
        callback(error, null);
        return;
    }
    if (tenantId.indexOf(':') != -1) {
        configUtil.getUUIDByFQN({'appData': appData,
                                  'fqnReq' : {'fq_name': tenantId.split(':'),
                                              'type': 'project'}},
            function (error, data) {
                if (error != null || data == null) {
                    var error = new appErrors.RESTServerError(
                        'Invalid Project FQName');
                    commonUtils.handleJSONResponse(error, res, data);
                    return;
                }
                projectURL = '/project/' + data.uuid + 
                    '?fields=floating_ip_pool_refs&' +
                    'exclude_back_refs=true&exclude_children=true';

                configApiServer.apiGet(projectURL, appData,
                                     function(error, data) {
                                     getFipPoolsForProjectCb(error,
                                                 data, appData, callback);
                });
        });
        return;
    }

    configApiServer.apiGet(projectURL, appData,
                         function(error, data) {
                         getFipPoolsForProjectCb(error,
                                             data, appData, callback);
    });
}
    
/**
 * @getFloatingIpPoolsByVNLists
 * private function
 * 1. Gets list of floating ip pools  from  All VNs' fip
 *    pool  refs
 */
function getFloatingIpPoolsByVNLists (request, appData, callback)
{
    var vnListURL = '/virtual-networks';
    var fipPool = {};
    var dataObjArr = [];
    fipPool['floating_ip_pool_refs'] = [];
    var vnURL =
        '/virtual-networks?detail=true&fields=' +
        'floating_ip_pools,network_ipam_refs&filters=router_external==true';
    configApiServer.apiGet(vnURL, appData, function(err, vnList) {
        if ((null != err) || (null == vnList) || 
            (null == vnList['virtual-networks'])) {
            callback(err, fipPool);
            return;
        }
        var results = vnList['virtual-networks'];
        var resCnt = results.length;
        for (i = 0; i < resCnt; i++) {
            try {
                var vn = results[i]['virtual-network'];
                if (null != vn['floating_ip_pools']) {
                    var subnets = parseVNSubnets(results[i]);
                    var fipCnt = vn['floating_ip_pools'].length;
                    for(var j = 0; j < fipCnt ; j++) {
                        vn['floating_ip_pools'][j]['subnets'] =  subnets;
                        fipPool['floating_ip_pool_refs'].push(vn['floating_ip_pools'][j]);
                    }
                }
            } catch(e) {
                continue;
            }
        }
        callback(null, fipPool);
    });
}

/**
 * @listFloatingIpPools
 * public function
 * 1. URL /api/tenants/config/floating-ip-pools/:id
 * 2. Gets list of floating ip pools  from  project's and all VNs' fip
 *    pool refs.
 *
 */
function listFloatingIpPools (request, response, appData) 
{
    var resFipPools = {'floating_ip_pool_refs': []};
    async.parallel([
        function(callback) {
            getFloatingIpPoolsByProject(request, appData, 
                                        function(error, data) {
                callback(null, data);
            });
        },
        function(callback) {
            getFloatingIpPoolsByVNLists(request, appData,
                                        function(error, data) {
                callback(null, data);
            });
        }
    ],
    function(err, results) {
        var tempFipPoolObjs = {};
        if (null == results) {
            commonUtils.handleJSONResponse(null, response, resFipPools);
            return;
        }
        var fipPoolsByProjCnt = 0;
        var fipPoolsByVNsCnt = 0;
        try {
            var fipPoolsByProj = results[0]['floating_ip_pool_refs'];
            fipPoolsByProjCnt = fipPoolsByProj.length;
        } catch(e) {
            fipPoolsByProjCnt = 0;
        }
        try {
            var fipPoolsByVNs = results[1]['floating_ip_pool_refs'];
            fipPoolsByVNsCnt = fipPoolsByVNs.length;
        } catch(e) {
            fipPoolsByVNsCnt = 0;
        }
        var fipFqn = null;
        for (var i = 0; i < fipPoolsByProjCnt; i++) {
            fipFqn = fipPoolsByProj[i]['to'].join(':');
            if (null == tempFipPoolObjs[fipFqn]) {
                resFipPools['floating_ip_pool_refs'].push(fipPoolsByProj[i]);
                tempFipPoolObjs[fipFqn] = fipFqn;
            }
        }
        for (i = 0; i < fipPoolsByVNsCnt; i++) {
            fipFqn = fipPoolsByVNs[i]['to'].join(':');
            if (null == tempFipPoolObjs[fipFqn]) {
                resFipPools['floating_ip_pool_refs'].push(fipPoolsByVNs[i]);
                tempFipPoolObjs[fipFqn] = fipFqn;
            }
        }
        commonUtils.handleJSONResponse(err, response, resFipPools);
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
 * @fipCreateCb
 * private function
 * Call back for createFloatingIp
 */
function fipCreateCb(fipDataObj, callback)
{
    var fipCreateURL = '/floating-ips';
    var fipPostData  = fipDataObj.data;
    var appData      = fipDataObj.appData;

    configApiServer.apiPost(fipCreateURL, fipPostData, appData,
                             function(error, data) {
                                 callback(error, data);
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
    var fipPostData  = request.body;
    var fipPostList  = [];

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

    var count = 1;

    if ('user_created_alloc_count' in fipPostData['floating-ip']) {
        count = parseInt(fipPostData['floating-ip']['user_created_alloc_count']);
        delete fipPostData['floating-ip']['user_created_alloc_count'];
    }

    for (var i = 0; i < count ; i++) {
        if (!(['name'] in fipPostData['floating-ip']) ||
            !(fipPostData['floating-ip']['name'].length)) {
            var uuid = UUID.create();
            fipPostData['floating-ip']['name'] = uuid['hex'];
            fipPostData['floating-ip']['display_name'] = uuid['hex'];
            fipPostData['floating-ip']['uuid'] = uuid['hex'];
            fipPostData['floating-ip']['fq_name'][4] = uuid['hex'];
        }

        fipPostList.push({appData: appData,
                    data: commonUtils.cloneObj(fipPostData)});
        fipPostData['floating-ip']['name'] = '';
    }

    async.map(fipPostList, fipCreateCb,
                function(error, data) {
                    commonUtils.handleJSONResponse(error, response, data);
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
    var fipPostURL   = '/floating-ip/';
    var fipPostData = request.body;

    if (typeof(fipPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipId = request.param('id').toString()) {
        fipPostURL += fipId;
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

    configApiServer.apiPut(fipPostURL, fipPostData, appData,
                         function(error, data) {
                         setFipRead(error, data, response, appData)
                         });

}

/**
 * @getFIPPoolSubnets
 * private function
 * 1. gets subnets for the floating ip pools
 */
function getFIPPoolSubnets (nwReqArry, appData, fipData, callback) 
{
    async.map(nwReqArry, commonUtils.getAPIServerResponse(configApiServer.apiGet, true)
        , function(error, data) {
        var subnetMap = [];
        if(error) {
            callback(error, fipData);
            return;            
        }
        for(var nwCnt = 0; nwCnt < data.length; nwCnt++) {
            var subNetStr = parseVNSubnets(data[nwCnt]);   
            var fipPoolList = data[nwCnt]['virtual-network']['floating_ip_pools'];
            if(fipPoolList && fipPoolList.length > 0) {
                for(var poolCnt = 0; poolCnt < fipPoolList.length; poolCnt++) {
                    var fipSubnet = {};
                    fipSubnet.uuid = fipPoolList[poolCnt].uuid;
                    fipSubnet.subnets = subNetStr;
                    subnetMap.push(fipSubnet);
                }
            }
            
        }
        if(subnetMap.length > 0) {
           for(var subnetCnt = 0; subnetCnt < subnetMap.length; subnetCnt++) {
               var subNet = subnetMap[subnetCnt];
               var fipPoolList =  fipData['floating_ip_pool_refs']
               for(var poolCnt = 0; poolCnt < fipPoolList.length; poolCnt++) {
                   if(subNet.uuid === fipPoolList[poolCnt].uuid) {
                       fipPoolList[poolCnt].subnets = subNet.subnets;    
                   }
               }
           }
        }
        callback(null, fipData);        
    });        
}

/**
 * @parseVNSubnets
 * private function
 * 1. parse subnets for the floating ip pools
 */
function parseVNSubnets (data) 
{
    var subNetStr = '';
    if(data && data['virtual-network'] && data['virtual-network']['network_ipam_refs'] 
        && data['virtual-network']['network_ipam_refs'].length > 0) {
        var ipamRefs = data['virtual-network']['network_ipam_refs'];
        var ipamRefsLength = ipamRefs.length;
        for(var refCnt = 0;refCnt < ipamRefsLength;refCnt++) {
            if(ipamRefs[refCnt]['to']) {
                if(ipamRefs[refCnt]['attr'] && ipamRefs[refCnt]['attr']['ipam_subnets'] 
                    && ipamRefs[refCnt]['attr']['ipam_subnets'].length > 0) {
                    var subNets = ipamRefs[refCnt]['attr']['ipam_subnets'];
                    var subnetsLength =  ipamRefs[refCnt]['attr']['ipam_subnets'].length;
                    for(var subNetCnt = 0;subNetCnt < subnetsLength;subNetCnt++) {
                        if(subNets[subNetCnt]['subnet']) {
                            var subNet = subNets[subNetCnt]['subnet']
                            var ipBlock = subNet['ip_prefix'] + '/' + subNet['ip_prefix_len'];
                            if(subNetStr === '') {
                                subNetStr = ipBlock;
                            } else {
                                subNetStr+= ',' + ipBlock;
                            }
                        }        
                    }
                }   
            }
        }
    }
    return subNetStr;
}

/* List all public function here */
exports.listFloatingIps     = listFloatingIps;
exports.listFloatingIpPools = listFloatingIpPools;
exports.createFloatingIp    = createFloatingIp
exports.deleteFloatingIp    = deleteFloatingIp
exports.updateFloatingIp    = updateFloatingIp
exports.listFloatingIpsAsync = listFloatingIpsAsync;
