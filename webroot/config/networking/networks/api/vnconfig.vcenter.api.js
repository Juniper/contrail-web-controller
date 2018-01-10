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
var maxRetryCnt = 100;
function ifNetworkExists(appData, fqName, name, callback, retryCnt) {
    if(retryCnt == null)
        retryCnt = 0;
    if(retryCnt == maxRetryCnt) {
        callback(false);
        return;
    }
    retryCnt++;
    configApiServer.apiPost('/fqname-to-id',
                            {'fq_name': fqName, 'type': 'virtual-network'},
                            appData,function(err , data) {
        if (!err) {
            callback(data.uuid)
            return;
        }

        setTimeout(function() {
            ifNetworkExists(appData, fqName, name, callback, retryCnt);
        },500);
    });
}

function waitForNetworkDelete(appData,vnUUID,callback,retryCnt) {
    if(retryCnt == null)
        retryCnt = 0;
    if(retryCnt == maxRetryCnt) {
        callback(false);
        return;
    }
    retryCnt++;
    var networkURL = '/virtual-network/' + vnUUID; 
    configApiServer.apiGet(networkURL,appData,function(err,data) {
        if(data['virtual-network'] == null) {
            callback(true);
            return;
        }
        setTimeout(function() {
            waitForNetworkDelete(appData,vnUUID,callback,retryCnt);
        },500);
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
    var vnGetURL = '/virtual-network/',
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
        var dataObjArr = [];
        /* Check if we have any floating-ip-pool */
        var fipPoolList = data['virtual-network']['floating_ip_pools'];
        if (null != fipPoolList) {
            var fipPoolCnt = fipPoolList.length;
            for (i = 0; i < fipPoolCnt; i++) {
                dataObjArr[i] = {};
                dataObjArr[i]['virtualNetworkId'] = virtualNetworkId;
                dataObjArr[i]['fipPoolId'] = fipPoolList[i]['uuid'];
                dataObjArr[i]['appData'] = appData;
            }
        }
        async.map(dataObjArr, vnConfigApi.fipPoolDelete, function(err, results) {
            if(err != null) {
                commonUtils.handleJSONResponse(err,response,null);
                return;
            } else {
                vCenterApi.getIdByMobName(appData,'DistributedVirtualPortgroup',vnPostData['Network']).done(function(portGroupId) {
                    vCenterApi.retrievePropertiesExForObj(appData,'DistributedVirtualPortgroup',portGroupId,'summary').done(function(portGroupSummary) {
                        //Delete portGroup and its IPPool from vCenter
                        vCenterApi.destroyTask(appData,'DistributedVirtualPortgroup',vnPostData['Network']).done(function(data) {
                            if(data['Fault'] != null) {
                                commonUtils.handleJSONResponse(createErrorObjFromFaultObj(data['Fault']),response,null);
                                return;
                            }
                            var poolId = commonUtils.getValueByJsonPath(portGroupSummary,'RetrievePropertiesExResponse;returnval;objects;propSet;val;0;_value;ipPoolId',null);
                            vCenterApi.destroyIpPool(appData,poolId).done(function(data) {
                                if(data['Fault'] != null) {
                                    commonUtils.handleJSONResponse({custom:true,responseCode:500,message:data['Fault']['faultstring']},response,null);
                                    return;
                                } else {
                                    //Wait for network to be deleted from API server
                                    waitForNetworkDelete(appData,virtualNetworkId,function(result) {
                                        if(result == false) {
                                            commonUtils.handleJSONResponse({custom:true,responseCode:500,message:'Error in deleting virtual network' + virtualNetworkId},response,null);
                                            return
                                        } else {
                                            commonUtils.handleJSONResponse(null,response,data);
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });
    });
}

function deletevCenterPortGroup (vnPostData, appData, callback)
{
    vCenterApi.getIdByMobName(appData,
                                'DistributedVirtualPortgroup',
                                vnPostData['name']).done(function(portGroupId) {
        vCenterApi.retrievePropertiesExForObj(appData,
                                                'DistributedVirtualPortgroup',
                                                portGroupId,'summary').done(function(portGroupSummary) {
            //Delete portGroup and its IPPool from vCenter
            vCenterApi.destroyTask(appData,
                                    'DistributedVirtualPortgroup',
                                    vnPostData['name']).done(function(data) {
                if(data['Fault'] != null) {
                    callback(createErrorObjFromFaultObj(data['Fault']), null);
                    return;
                }
                var poolId = commonUtils.getValueByJsonPath(portGroupSummary,
                                    'RetrievePropertiesExResponse;returnval;' +
                                    'objects;propSet;val;0;_value;ipPoolId', null);
                vCenterApi.destroyIpPool(appData, poolId).done(function(data) {
                    if(data['Fault'] != null) {
                        callback(createErrorObjFromFaultObj(data['Fault']), null);
                        return;
                    } else {
                        //Wait for network to be deleted from API server
                        waitForNetworkDelete(appData,
                                             vnPostData['uuid'], function(result) {
                            if(result == false) {
                                callback(createErrorObjFromFaultObj(data['Fault']), null);
                                //vnName not passed in error
                                return;
                            } else {
                                callback(null, data);
                            }
                        });
                    }
                });
            });
        });
    });
}

function createErrorObjFromFaultObj(faultObj) {
    return {custom:true,responseCode:500,message:faultObj['faultstring']}
}


function createVirtualNetwork(req,res,appData) {
    var vnPostData = req.body;
    //Ensure only one subnet is specified
    var subnets;
    var pVlanId;
    pVlanId = vnPostData['virtual-network']['pVlanId'];
    delete vnPostData['virtual-network']['pVlanId'];
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
    var allocationPools = commonUtils.getValueByJsonPath(subnets[0], 'allocation_pools', []);
    var ranges = [];
    var allocationPoolsLen = allocationPools.length;
    for(var i=0;i<allocationPoolsLen;i++) {
        ranges.push(allocationPools[i]['start'] + ' # ' + commonUtils.getIPRangeLen(allocationPools[i]));
    }
    var userData = {
            name    : vnPostData['virtual-network']['display_name'],
            pVlanId : Number(pVlanId),
            static_ip : vnPostData['virtual-network']['external_ipam'],
            subnet  : {
                gateway  : subnets[0]['default_gateway'],
                address  : subnets[0]['subnet']['ip_prefix'],
                netmask  : commonUtils.prefixToNetMask(subnets[0]['subnet']['ip_prefix_len']),
            }
        };
    if (ranges.length > 0)
        userData['subnet']['range'] = ranges.join(',');

    vCenterApi.createNetwork(userData,appData,function(err,data) {
        if(data['Fault'] != null) {
            commonUtils.handleJSONResponse({custom:true,responseCode:500,message:data['Fault']['faultstring']},res,null);
            return;
        }
        //Check if network synced on Api Server
        ifNetworkExists(appData,
                        vnPostData['virtual-network']['fq_name'],
                        userData['name'], function(vnUUID) {
            //If VN is not synced up with API Server
            if(vnUUID == false) {
                commonUtils.handleJSONResponse({custom:true,responseCode:500,
                            message:'VN ' + userData['name'] +
                            " doesn't exist on config server"},res,null);
                return;
            }
            appData['vnUUID'] = vnUUID;
            //Update network synced on Api Server 
            delete req.body['virtual-network']['perms2'];
            vnConfigApi.updateVirtualNetwork(req,res,appData);
        });
    });
}

exports.createVirtualNetwork    = createVirtualNetwork;
exports.deleteVirtualNetwork    = deleteVirtualNetwork;
exports.deletevCenterPortGroup  = deletevCenterPortGroup;

