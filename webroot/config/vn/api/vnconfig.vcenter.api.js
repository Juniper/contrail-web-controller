/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @vnconfig.api.js
 *     - Handlers for Virtual Network Configuration
 *     - Interfaces with config api server
 */

var async       = require('async');
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var config      = require(process.mainModule.exports["corePath"] + '/config/config.global.js');
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
var vnConfigApi = require('./vnconfig.api');
// var vCenterApi = require(process.mainModule.exports['corePath'] + '/src/serverroot/common/vcenter.api');
var vCenterApi = require(process.mainModule.exports['corePath'] + '/src/serverroot/orchestration/plugins/vcenter/vcenter.api');

/**
 * Bail out if called directly as "nodejs vnconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

//No of times to retry to check for VN on API Server
var maxRetryCnt = 10;
function ifNetworkExists(appData,projUUID,name,callback,retryCnt) {
    if(retryCnt == null)
        retryCnt = 0;
    if(retryCnt == maxRetryCnt) {
        return;
        callback(false);
    }
    retryCnt++;
    var networkListURL = '/project/' + projUUID;
    configApiServer.apiGet(networkListURL,appData,function(err,data) {
        var networkUUIDs = [],reqUrl = '';
        data = data['project']['virtual_networks'];
        var nwURLsArr = [],nwNames = [];
        for(var i=0;i<data.length;i++) {
            var nwUUID = data[i]['uuid'];
            var nwName = data[i]['to'][2];
            if(nwName == name) {
                callback(nwUUID);
                return;
            }
        }
        setTimeout(function() {
            ifNetworkExists(appData,projUUID,name,callback,retryCnt);
        },10000);

        });
}

/**
 * @deleteVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id
 * 2. Deletes the virtual network from config api server
 */
function deleteVirtualNetwork (request, response, appData) 
{
    var vnPostData = request.body;
    //Check if there any vmi back refs/instance ip backrefs
    var vnGetURL = '/virtual-network',
        virtualNetworkId = null;
    if (virtualNetworkId = request.param('id').toString()) {
        vnGetURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(vnGetURL, appData, function(err, data) {
        if (err || (null == data)) {
            var error = new appErrors.RESTServerError('Virtual Network Id' +
                                                      virtualNetworkId + ' does not exist');
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }

        var vmiBackRefs = 
            data['virtual-network']['virtual_machine_interface_back_refs'];
        var instanceIPBackRefs = data['virtual-network']['instance_ip_back_refs'];
        if (null != vmiBackRefs) {
            var uuidList = [];
            var vmiCnt = vmiBackRefs.length;
            for (var i = 0; i < vmiCnt; i++) {
                uuidList.push(vmiBackRefs[i]['uuid']);
            }   
            if (vmiCnt > 0) {
                var error =
                    new appErrors.RESTServerError('Virtual machine back refs ' +
                                                  uuidList.join(',') + ' exist');
                commonUtils.handleJSONResponse(error, response, null);
                return;                                
            }
        }
        if (null != instanceIPBackRefs) {
            var uuidList = [];
            var instanceIPBackRefCnt = instanceIPBackRefs.length;
            for (var i = 0; i < instanceIPBackRefCnt; i++) {
                uuidList.push(instanceIPBackRefs[i]['uuid']);
            }   
            if (instanceIPBackRefCnt > 0) {
                var error =
                    new appErrors.RESTServerError('Instance IP back refs ' +
                                                  uuidList.join(',') + ' exist');
                commonUtils.handleJSONResponse(error, response, null);
                return;                                
            }
        }
    });
    vCenterApi.destroyTask(appData,'DistributedVirtualPortgroup',vnPostData['Network']).done(function(data) {
        var ipPoolName = 'ip-pool-for-' + vnPostData['Network'];
        vCenterApi.queryIpPools(appData).done(function(data) {
            if(data['Fault'] != null)
                commonUtils.handleJSONResponse({custom:true,responseCode:500,message:data['Fault']['faultstring']},response,null);
            else {
                var ipPoolsArr = data['QueryIpPoolsResponse'][0]['_value']['returnval'];
                var poolId = '';
                for(var i=0;i<ipPoolsArr.length;i++) {
                    if(ipPoolsArr[i]['name'] == ipPoolName)
                        poolId = ipPoolsArr[i]['id'];
                }
                vCenterApi.destroyIpPool(appData,poolId).done(function(data) {
                    commonUtils.handleJSONResponse(null,response,data);
                });
            }
        });
    });
}


function createVirtualNetwork(req,res,appData) {
    var vnPostData = req.body;
    //Ensure only one subnet is specified
    var subnets;
    if(vnPostData['virtual-network']['network_ipam_refs'] != null)
        subnets = vnPostData['virtual-network']['network_ipam_refs'][0]['attr']['ipam_subnets']
    else {
        commonUtils.handleJSONResponse({custom:true,responseCode:500,message:'Enter one subnet'},res,null)
        return;
    }
    if(subnets.length != 1) {
        commonUtils.handleJSONResponse({custom:true,responseCode:500,message:'Only one subnet need to be specified'},res,null)
        return;
    }
    var userData = {
            name    : vnPostData['virtual-network']['display_name'],
            subnet  : {
                gateway  : subnets[0]['default_gateway'],
                address  : subnets[0]['subnet']['ip_prefix'],
                netmask  : commonUtils.prefixToNetMask(subnets[0]['subnet']['ip_prefix_len'])
            }
        };
    vCenterApi.createNetwork(userData,appData,function(err,data) {
        if(data['Fault'] != null)
            commonUtils.handleJSONResponse({custom:true,responseCode:500,message:data['Fault']['faultstring']});
        //Check if network synced on Api Server
        ifNetworkExists(appData,vnPostData['virtual-network']['parent_uuid'],userData['name'],function(vnUUID) {
            //If VN is not synced up with API Server
            if(vnUUID == false) {
                commonUtils.handleJSONResponse({custom:true,responseCode:500,message:'VN is not synced on API server'});
            }
            appData['vnUUID'] =vnUUID;
            //Update network synced on Api Server 
            vnConfigApi.updateVirtualNetwork(req,res,appData);
        });
    });
}

exports.createVirtualNetwork         = createVirtualNetwork;
exports.deleteVirtualNetwork         = deleteVirtualNetwork;

