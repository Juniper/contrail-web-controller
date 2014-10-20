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


function ifNetworkExists(appData,projUUID,name,callback) {
    var networkListURL = '/project/' + projUUID;
    configApiServer.apiGet(networkListURL,appData,function(err,data) {
        var networkUUIDs = [],reqUrl = '';
        data = data['project']['virtual_networks'];
        var nwURLsArr = [],nwNames = [];
        for(var i=0;i<data.length;i++) {
            // nwUUIDs.push(data[i]['uuid']);
            // nwNames.push(data[i]['to'][2]);
            var nwUUID = data[i]['uuid'];
            var nwName = data[i]['to'][2];
            if(nwName == name) {
                callback(nwUUID);
                return;
            }
            /*
            reqUrl = '/virtual-network/' + data[i]['uuid'];
            commonUtils.createReqObj(nwURLsArr, reqUrl,global.HTTP_REQUEST_GET,
                null,null,null,appData);*/
        }
        setTimeout(function() {
            ifNetworkExists(appData,projUUID,name,callback);
        },3000);

        /*async.map(nwURLsArr,commonUtils.getAPIServerResponse(configApiServer.apiGet, true),function(error,results) {
            console.info(results);
            var nwDisplayNames = [];
            for(var i=0;i<results.length;i++) {
                var currNw= results[i]['project'];
                if(currNw['display_name'] == name) {
                }
            }
            callback(null, projectList);*/
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
            appData['vnUUID'] =vnUUID;
            //Update network synced on Api Server 
            vnConfigApi.updateVirtualNetwork(req,res,appData);
        });
    });
}

exports.createVirtualNetwork         = createVirtualNetwork;
exports.deleteVirtualNetwork         = deleteVirtualNetwork;

