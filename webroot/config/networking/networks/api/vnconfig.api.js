/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @vnconfig.api.js
 *     - Handlers for Virtual Network Configuration
 *     - Interfaces with config api server
 */

var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var vnconfigapi = module.exports;
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
var jsonDiff    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/jsondiff');
var  _ = require('lodash');
                          
/**
 * Bail out if called directly as "nodejs vnconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listVirtualNetworksCb
 * private function
 * 1. Callback for listVirtualNetworks
 * 2. Reads the response of per tenant vn list from config api server
 *    and sends it back to the client.
 */
function listVirtualNetworksCb (error, vnListData, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    commonUtils.handleJSONResponse(error, response, vnListData);
}

/**
 * @listVirtualNetworks
 * public function
 * 1. URL /api/tenants/config/virtual-networks
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls listVirtualNetworksCb that process data from config
 *    api server and sends back the http response.
 */
function listVirtualNetworks (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var vnListURL     = '/virtual-networks';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId   = requestParams.query.tenant_id;
        vnListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(vnListURL, appData,
                         function(error, data) {
                         listVirtualNetworksCb(error, data, response)
                         });
}

/**
 * @sendVnGetResponse
 * private function
 * 1. Called from the last callback of vn config processig
 */ 
function sendVnGetResponse (error, vnConfig, callback) 
{

    delete vnConfig['virtual-network']['access_control_lists'];
    delete vnConfig['virtual-network']['href'];
    //delete vnConfig['virtual-network']['id_perms'];
    delete vnConfig['virtual-network']['routing_instances'];
    callback(error, vnConfig);
}

/**
 * @parseVNSubnets
 * private function
 * 1. Parses the quantum subnets and adds it to ipam refs of the VN config
 */
function parseVNSubnets (error, vnConfig, callback) 
{
    var ipamRef       = null;
    var ipamSubnetLen = 0, i = 0;

    if (error) {
        callback(error, null);
        return;
    }

    var k = 0;
    try {
        var nwIpamRefs = [];
        var nwIpamRefsClone = [];
        try {
            var nwIpamRefs = vnConfig['virtual-network']['network_ipam_refs'];
            var nwIpamRefsLen = nwIpamRefs.length;
        } catch(e) {
            nwIpamRefsLen = 0;
        }
        for (var i = 0; i < nwIpamRefsLen; i++) {
            var ipamSubnets = nwIpamRefs[i]['attr']['ipam_subnets'];
            var ipamSubnetsLen = ipamSubnets.length;
            var m = 0;
            for (var j = 0; j < ipamSubnetsLen; j++) {
                nwIpamRefsClone[k] = {};
                nwIpamRefsClone[k]['subnet'] = {};
                if(ipamSubnets[j]['subnet'] == null) {
                    nwIpamRefsClone[k]['subnet']['ipam_uuid'] =
                        nwIpamRefs[i].uuid;
                    nwIpamRefsClone[k]['subnet']['subnet_uuid'] =
                        ipamSubnets[j]['subnet_uuid'];
                    k++;
                    continue;
                }
                nwIpamRefsClone[k]['subnet']['ipam_subnet'] =
                    ipamSubnets[j]['subnet']['ip_prefix'] + '/' +
                    ipamSubnets[j]['subnet']['ip_prefix_len'];
                if(null == ipamSubnets[j]['default_gateway'] ||
                    typeof ipamSubnets[j]['default_gateway'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['default_gateway'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['default_gateway'] =
                    ipamSubnets[j]['default_gateway'];

                if(null == ipamSubnets[j]['enable_dhcp'] ||
                    typeof ipamSubnets[j]['enable_dhcp'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['enable_dhcp'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['enable_dhcp'] =
                    ipamSubnets[j]['enable_dhcp'];

                if(null == ipamSubnets[j]['dns_server_address'] ||
                    typeof ipamSubnets[j]['dns_server_address'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['dns_server_address'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['dns_server_address'] =
                    ipamSubnets[j]['dns_server_address'];

                if(null == ipamSubnets[j]['allocation_pools'] ||
                    typeof ipamSubnets[j]['allocation_pools'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['allocation_pools'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['allocation_pools'] =
                    ipamSubnets[j]['allocation_pools'];

                if(null == ipamSubnets[j]['host_routes'] ||
                    typeof ipamSubnets[j]['host_routes'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['host_routes'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['host_routes'] =
                    ipamSubnets[j]['host_routes'];

                if(null == ipamSubnets[j]['dhcp_option_list'] ||
                    typeof ipamSubnets[j]['dhcp_option_list'] === "undefined")
                    nwIpamRefsClone[k]['subnet']['dhcp_option_list'] = "";
                else
                    nwIpamRefsClone[k]['subnet']['dhcp_option_list'] =
                    ipamSubnets[j]['dhcp_option_list'];

                /*if(null !== nwIpamRefs[i]['attr']['host_routes'] &&
                    typeof nwIpamRefs[i]['attr']['host_routes'] !== "undefined" && !m) {
                    nwIpamRefsClone[k]["host_routes"] = {};
                    nwIpamRefsClone[k]["host_routes"] = nwIpamRefs[i]['attr']['host_routes'];
                    m++;
                }*/

                nwIpamRefsClone[k]['subnet']['subnet_uuid'] = ipamSubnets[j]['subnet_uuid'];
                nwIpamRefsClone[k]['subnet']['ipam'] = nwIpamRefs[i]['to'];
                k++;
            }
        }
        vnConfig['virtual-network']['network_ipam_refs'] = [];
        vnConfig['virtual-network']['network_ipam_refs'] = nwIpamRefsClone;
    } catch(e) {
        logutils.logger.debug("In parseVNSubnets(): JSON Parse error:" + e);
    }
    sendVnGetResponse(error, vnConfig, callback);
}

/**
 * @VnGetSubnetResponse
 * private function
 * 1. Called from the last callback of vn config processig
 */ 
function VnGetSubnetResponse (error, vnConfig, callback)
{
    if (error) {
        callback(error, null);
        return;
    }
    parseVNSubnets(error, vnConfig, callback);
}

/**
 * @VNFloatingIpPoolAggCb
 * private function
 * 1. Callback for the floating ip pool get for a give VN.
 */
function VNFloatingIpPoolAggCb (error, results, vnConfig, appData, callback)
{
    var i = 0, floatingIpPoolsLen = 0;

    if (error) {
        callback(error, null);
        return;
    }

    floatingIpPoolsLen = results.length;
    for (i = 0; i < floatingIpPoolsLen; i++) {
        vnConfig['virtual-network']['floating_ip_pools'][i]['projects'] = 
                     results[i]['floating-ip-pool']['project_back_refs'];
    }

    VnGetSubnetResponse(error, vnConfig, callback);
}

/**
 * @parseVNFloatingIpPools
 * private function
 * 1. Gets the Floating ip pool list and then does an individual get on
 *    the floating ip pool for a given virtual network
 */
function parseVNFloatingIpPools (vnConfig, appData, callback)
{
    var error          = null;
    var fipPoolRef     = null;
    var dataObjArr     = [];
    var fipObj         = null;
    var fipPoolRefsLen = 0;
    var reqUrl         = null;

    if ( 'floating_ip_pools' in vnConfig['virtual-network']) {
        fipPoolRef = vnConfig['virtual-network']['floating_ip_pools'];
        fipPoolRefsLen = fipPoolRef.length;
    }

    for (i = 0; i < fipPoolRefsLen; i++) {
        fipObj = fipPoolRef[i];
        reqUrl = '/floating-ip-pool/' + fipObj['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    if (!dataObjArr.length) {
        VnGetSubnetResponse(error, vnConfig, callback);
        return;
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  VNFloatingIpPoolAggCb(error, results, vnConfig,
                                        appData, callback);
              });
}

/**
 * @getVirtualNetworkCb
 * private function
 * 1. Callback for getVirtualNetwork
 * 2. Reads the response of a particular virtual-network from config
 *    api server
 *    - Gets each IpamSubnet
 *    - Gets each Floating IP pool
 *    - ACL Reference is already part of the virtual-network get
 */
function getVirtualNetworkCb (vnGetData, appData, callback)
{
    parseVNFloatingIpPools(vnGetData, appData, callback);
}

/**
 * @readVirtualNetwork
 * private function
 * 1. Needs network uuid in string format
 */
function readVirtualNetwork (netIdStr, appData, callback) 
{
    var vnGetURL         = '/virtual-network/';

    if (netIdStr.length) {
        vnGetURL += netIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        callback(error, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                         function(error, data) {
                         if (null != error) {
                            callback(error, data);
                            return;
                         }
                         getVirtualNetworkCb(data, appData, callback);
                         });
}

/**
 * @getVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls getVirtualNetworkCb that process data from config
 *    api server and sends back the http response.
 */
function getVirtualNetwork (request, response, appData) 
{
    var virtualNetworkId = null;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readVirtualNetwork(virtualNetworkId, appData,
                       function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
}

/** 
 * @parseSharedVN
 * private function
 * Parse the shared VN data got from API Server
 */
function parseSharedVN (vnObj, callback)
{
    var data = vnObj['data'];
    var appData = vnObj['appData'];
    getVirtualNetworkCb(data, appData, function(err, data) {
        callback(null, data);
    });
}

/**
 * @getSharedVirtualNetworks
 * public function
 * 1. URL /api/tenants/config/shared-virtual-networks
 * 2. Gets list of shared virtual networks from config api server
 *
 */
function getSharedVirtualNetworks (req, res, appData)
{
    var resultJSON = [];
    var vnObjArr = [];
    var vnURL = '/virtual-networks?detail=true&fields=' +
        'physical_router_back_refs,floating_ip_pools' +
        '&filters=is_shared==true';
    configApiServer.apiGet(vnURL, appData, function(err, vnDetails) {
        if ((null != err) || (null == vnDetails) || 
            (null == vnDetails['virtual-networks'])) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var vns = vnDetails['virtual-networks'];
        var vnCnt = vns.length;
        for (var i = 0; i < vnCnt; i++) {
            vnObjArr.push({'data':vns[i], 'appData': appData});
        }
        async.map(vnObjArr, parseSharedVN, function (err, data) {
            commonUtils.handleJSONResponse(null, res, data);
        });
    });
}

/**
 * @getExternalVirtualNetworks
 * public function
 * 1. URL /api/tenants/config/external-virtual-networks
 * 2. Gets list of external virtual networks from config api server
 *
 */
function getExternalVirtualNetworks (req, res, appData)
{
    var resultJSON = [];
    var vnObjArr = [];
    var vnURL = '/virtual-networks?detail=true&filters=router_external==true';
    configApiServer.apiGet(vnURL, appData, function(err, vnDetails) {
        if ((null != err) || (null == vnDetails) ||
            (null == vnDetails['virtual-networks'])) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var vns = vnDetails['virtual-networks'];
        var vnCnt = vns.length;
        for (var i = 0; i < vnCnt; i++) {
            vnObjArr.push({'data':vns[i], 'appData': appData});
        }
        async.map(vnObjArr, parseSharedVN, function (err, data) {
            commonUtils.handleJSONResponse(null, res, data);
        });
    });
}

function readVirtualNetworkAsync (vnObj, callback)
{
    var vnID = vnObj['uuid'];
    var appData = vnObj['appData'];

    readVirtualNetwork(vnID, appData, function(err, data) {
        callback(err, data);
    });
}

function readVirtualNetworks (dataObj, callback)
{
    var dataObjArr = dataObj['reqDataArr'];
    async.map(dataObjArr, readVirtualNetworkAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @readVirtualNetworkWOBackRefs
 *  Retrieves virtual network data without any back_refs
 * private function
 * 1. Needs network uuid in string format
 */
function readVirtualNetworkWOBackRefs (netIdStr, appData, callback)
{
    var vnGetURL         = '/virtual-network/';

    if (netIdStr.length) {
        vnGetURL += netIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        callback(error, null);
        return;
    }

//    TODO this affects perforamce 
    //vnGetURL += '?exclude_back_refs=false';
    configApiServer.apiGet(vnGetURL, appData,
                           function(error, data) {
        if (null != error) {
            callback(error, data);
            return;
        }
        getVirtualNetworkCb(data, appData, callback);
    });
}

function readVirtualNetworkAsyncIgnoreError(vnObj, callback)
{
    var vnID = vnObj['uuid'];
    var appData = vnObj['appData'];

    readVirtualNetworkWOBackRefs(vnID, appData, function(err, data) {
        callback(null, data);
    });
}

function getPagedVirtualNetworks (dataObj, callback)
{
    var dataObjArr = dataObj['reqDataArr'];
    async.map(dataObjArr, readVirtualNetworkAsyncIgnoreError,
              function(err, data) {
        callback(err, data);
    });
}

/**
 * @createVirtualNetworkCb
 * private function
 * 1. Callback for CreateVirtualNetwork
 * 2. Again reads the response of the created network and updates
 *    the route target.
 */
function createVirtualNetworkCb (error, vnConfig, vnPostData, response, appData, callback)
{
    var bdDataList;
    if (error) {
        if(callback){
            callback(error, null);
        } else {
            commonUtils.handleJSONResponse(error, response, null);
        }
        return;
    }
    vnPostData['virtual-network']['uuid'] = vnConfig['virtual-network']['uuid'];

    //response.req.body = vnPostData;
    bdDataList = commonUtils.getValueByJsonPath(vnPostData,
            'virtual-network;bridge_domains', [], false);
    if(bdDataList.length) {
        createBridgeDomains(bdDataList, appData, function(){
            updateVNFipPoolAdd(vnPostData, response, appData, callback);
        });
    } else {
     updateVNFipPoolAdd(vnPostData, response, appData, callback);
    }
}

/**
 * updatePhysicalRouters
 * private function
 * 1. Callback for CreateVirtualNetwork
 */
function updatePhysicalRouters (mode, newPRoutersUUIDS,error,newVnData,
                                vnConfigData,request,response,appData, callback)
{
    //Current physical routers
    var currPRouters = [];
    var currPRouterUUIDS = [];
    var reqUrl;
    var dataObjArr = [];
    var allPRouters = [];
    var newVnUUID = newVnData['virtual-network']['uuid'];
    var newVNFQName = newVnData['virtual-network']['fq_name'];
    var newVNRef = {"to":newVNFQName};
    reqUrl = '/virtual-network/' + newVnUUID;
    //First get the full details of the VN to fetch the physical routers back refs
    configApiServer.apiGet(reqUrl, appData, function(err, newVnConfigData) {
        if (err) {
            callback(err, null);
            return;
        }
        currPRouters = newVnConfigData['virtual-network']['physical_router_back_refs'];
        newVnUUID = newVnConfigData['virtual-network']['uuid'];
        newVNFQName = newVnConfigData['virtual-network']['fq_name'];
        newVNRef = {"to":newVNFQName};
        if(currPRouters != null){
            for(var i=0; i < currPRouters.length; i++){
                currPRouterUUIDS.push(currPRouters[i]['uuid']);
            }
        }
        
        //get only the changed prouters ie unique ones. If they are same then no need to modify them
        var allPRouters1 = currPRouterUUIDS.filter(function(obj) { return newPRoutersUUIDS.indexOf(obj) == -1; });
        var allPRouters2 = newPRoutersUUIDS.filter(function(obj) { return currPRouterUUIDS.indexOf(obj) == -1; });
        allPRouters = allPRouters1.concat(allPRouters2);
        
        //If no prouters to update just return by calling the callback
        if(allPRouters.length == 0){
            callback(error, newVnData,
                    vnConfigData, request, response,
                    appData);
            return;
        }
        
        //Get the physical routers data for both current and new physical routers
        for(i = 0; i < allPRouters.length; i++) {
            reqUrl = '/physical-router/' +  allPRouters[i];
            commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                    null, null, null, appData);        
        }
        if(dataObjArr.length > 0) {
            async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                function(error, results) {
                    if (error) {
                        if(callback) {
                            callback(err, null);
                            return;
                        }
                       commonUtils.handleJSONResponse(error, response, null);
                       return;
                    }
                    //Remove the refs to this VN from the current Physical Routers
                    //Add the refs to this VN for the new Physical Routers
                    var oldPRDetails = commonUtils.cloneObj(results);
                    for(var i=0; i < results.length; i++){
                        var currVns = results[i]['physical-router']['virtual_network_refs'];
                        currVns = (currVns == null)? [] : currVns;
                        
                        if(currPRouterUUIDS.indexOf(results[i]['physical-router']['uuid']) != -1 && 
                                newPRoutersUUIDS.indexOf(results[i]['physical-router']['uuid']) == -1){
                            for(var j=0; j < currVns.length ;j++){
                                if(currVns[j]['uuid'] == newVnUUID){
                                    currVns.splice(j,1);//remove this vn from the current vn list
                                }
                            }
                        } else if (currPRouterUUIDS.indexOf(results[i]['physical-router']['uuid']) == -1 &&
                                newPRoutersUUIDS.indexOf(results[i]['physical-router']['uuid']) != -1){
                            currVns.push(newVNRef);
                        }
                        
                        results[i]['physical-router']['virtual_network_refs'] = currVns;
                    }
                    //Update the PRouters with the updated refs
                    var reqUrl = null;
                    var dataObjArr        = [];
                    for(i = 0; i < results.length; i++) {
                        reqUrl = '/physical-router/' +  results[i]['physical-router']['uuid'];
                        var deltaConfig = {};
                        deltaConfig =
                            jsonDiff.getConfigJSONDiff('physical-router',
                                                       oldPRDetails[i],
                                                       results[i]);
                        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_PUT,
                                deltaConfig, null, null, appData);
                    }
                    async.map(dataObjArr,
                        commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
                        function(error, results) {
                            if (error) {
                               commonUtils.handleJSONResponse(error, response, null);
                               return;
                            }
                            callback(error, newVnData,
                                    vnConfigData, request, response,
                                    appData);
                        }
                    );
                }
            );
        }
    });
    
    
}

/**
 * @setVNPolicySequence
 * private function
 * 1. Iterates through policy refs and sets the sequence numbers,
 */
function setVNPolicySequence (vnPostData) 
{
    var netPolRefLen = 0, i = 0;

    if ('network_policy_refs' in vnPostData['virtual-network']) {
        netPolRefLen = vnPostData['virtual-network']
                                 ['network_policy_refs'].length;
    }

    for (i = 0; i < netPolRefLen; i++) {
        if (!(vnPostData['virtual-network']['network_policy_refs']
              [i]['to'][2].length)) {
            vnPostData['virtual-network']['network_policy_refs'] = [];
            return vnPostData
        }
        var timer = null;
        if(null !== vnPostData['virtual-network']['network_policy_refs'][i]['attr'] &&
            typeof vnPostData['virtual-network']['network_policy_refs'][i]['attr'] !== "undefined" &&
            null !== vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'] &&
            typeof vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'] !== "undefined") {
            timer = vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'];
        }
        vnPostData['virtual-network']['network_policy_refs'][i]['attr'] = {};
        vnPostData['virtual-network']['network_policy_refs']
                  [i]['attr'] = {
                      'timer': timer,
                      'sequence': {
                          major: i,
                          minor: 0
                      }
                  };
    }
    return vnPostData;
}

function getNewFipPoolLists (vnPutData, configData)
{
    var result = commonUtils.cloneObj(vnPutData);
    var fipList = [], k = 0;
    try {
        var fipPool = 
            result['virtual-network']['floating_ip_pools'];
        if (null == fipPool) {
            return result;
        }
        var configFipPool = 
            configData['virtual-network']['floating_ip_pools'];
        if (null == configFipPool) {
            return result;
        }
        var cnt = fipPool.length;
        var cCnt = configFipPool.length;
        for (var i = 0; i < cnt; i++) {
            fipTo = fipPool[i]['to'].join(':');
            for (var j = 0; j < cCnt; j++) {
                if (fipTo == configFipPool[j]['to'].join(':')) {
                    /* Already Exists */
                    break;
                }
            }
            if (j == cCnt) {
                fipList[k++] = fipPool[i];
            }
        }
    } catch(e) {
        logutils.logger.debug("In getNewFipPoolLists(): JSON Parse error:" + e);
    }
    if (!fipList.length) {
        delete result['virtual-network']['floating_ip_pools'];
    } else {
        result['virtual-network']['floating_ip_pools'] = fipList;
    }
    return result;
}

function getDelFipPoolLists (vnPutData, configData)
{
    var result = commonUtils.cloneObj(configData);
    try {
        var fipPool = 
            vnPutData['virtual-network']['floating_ip_pools'];
        if (null == fipPool) {
            return result;
        }

        var configFipPool = 
            result['virtual-network']['floating_ip_pools'];
        if (null == configFipPool) {
            return result;
        }
        var cnt = fipPool.length;
        var cCnt = configFipPool.length;
        for (var i = 0; i < cCnt; i++) {
            fipTo = configFipPool[i]['to'].join(':');
            for (var j = 0; j < cnt; j++) {
                if (fipTo == fipPool[j]['to'].join(':')) {
                    break;
                }
            }
            if (j != cnt) {
                result['virtual-network']['floating_ip_pools'].splice(i, 1);
                i = -1;
                cCnt--;
            }
        }
    } catch(e) {
        logutils.logger.debug("In getDelFipPoolLists(): JSON Parse error:" + e);
    }
    return result;
}

function getFipPoolToUpdate(vnConfigData, vnPutData)
{
    var tempFipPool = [];
    try {
        var configFipPool = vnConfigData['virtual-network']['floating_ip_pools'];
        var configFipPoolCnt = configFipPool.length;
        var vnPutFipPool = vnPutData['virtual-network']['floating_ip_pools'];
        var vnPutFipPoolCnt = vnPutFipPool.length;
    } catch(e) {
        return null;
    }

    for (var i = 0, k = 0; i < vnPutFipPoolCnt; i++) {
        for (var j = 0; j < configFipPoolCnt; j++) {
            try {
                if (vnPutFipPool[i]['to'].join(':') ==
                    configFipPool[j]['to'].join(':')) {
                    tempFipPool[k] = vnPutFipPool[i];
                    tempFipPool[k]['uuid'] = configFipPool[j]['uuid'];
                    k++;
                }
            } catch(e) {
            }
        }
    }
    vnPutData['virtual-network']['floating_ip_pools'] = tempFipPool;
    return vnPutData;
}

function updateVNFipPool (dataObj, callback)
{
    var fipPutData = dataObj['fipPutData'];
    var vnId = dataObj['vnId'];
    var appData = dataObj['appData'];

    var fipPoolId =
        fipPutData['virtual-network']['floating_ip_pools'][0]['uuid'];
    var reqUrl = '/floating-ip-pool/' + fipPoolId;

    configApiServer.apiGet(reqUrl, appData, function(err, configFipData) {
        if (err) {
            callback(err, null);
            return;
        }
        updateVNFipPoolReadUpdate(null, configFipData, fipPutData, vnId,
                                  appData, function(err, data) {
            callback(err, data);
        });
    });
}

function updateVNFipPoolEdit (error, vnConfigData, vnPutData, appData,
                              resultData, callback)
{
    var dataObjArr = [];
    if (error) {
        callback(error, null);
        return;
    }

    /* Now check what are the fip-pools are edit-config */
    var vnPutData = getFipPoolToUpdate(vnConfigData, vnPutData);
    if (null == vnPutData) {
        callback(null, null);
        return;
    }
    var fipPool = vnPutData['virtual-network']['floating_ip_pools'];
    if (null == fipPool) {
        callback(null, null);
        return;
    }
    var fipPoolLen = fipPool.length;
    var fipPutData = commonUtils.cloneObj(vnPutData);
    for (var i = 0; i < fipPoolLen; i++) {
        dataObjArr[i] = {};
        fipPutData['virtual-network']['floating_ip_pools'] = [];
        fipPutData['virtual-network']['floating_ip_pools'][0] =
            vnPutData['virtual-network']['floating_ip_pools'][i];
        dataObjArr[i]['fipPutData'] = commonUtils.cloneObj(fipPutData);
        dataObjArr[i]['vnId'] = vnConfigData['virtual-network']['uuid'];
        dataObjArr[i]['appData'] = appData;
    }
    async.mapSeries(dataObjArr, updateVNFipPool, function(err, data) {
        callback(err, resultData);
    });
}

function updateFloatingIpList (vnId, vnPutData, appData, response, callback)
{
    var vnUrl = '/virtual-network/' + vnId;
    var fipDelList = [];
    configApiServer.apiGet(vnUrl, appData, function(err, configData) {
        var fipNewPoolVN = getNewFipPoolLists(vnPutData, configData);
        var fipDelPoolVN = getDelFipPoolLists(vnPutData, configData);
        try {
            var len = 0;
            if('floating_ip_pools' in fipDelPoolVN['virtual-network']) {
                len = fipDelPoolVN['virtual-network']['floating_ip_pools'].length;
            }
            for (var i = 0; i < len; i++) {
                fipDelList[i] = {};
                fipDelList[i]['virtualNetworkId'] = vnId;
                fipDelList[i]['fipPoolId'] =
                    fipDelPoolVN['virtual-network']['floating_ip_pools'][i]['uuid'];
                fipDelList[i]['appData'] = appData;
            }
        } catch(e) {
            logutils.logger.debug('In updateFloatingIpList():' +
                                  ' JSON Parse error:' + e);
        }
        if (fipDelList.length > 0) {
            async.mapSeries(fipDelList, fipPoolDelete, function(error, results) {
                updateVNFipPoolAddCb(fipNewPoolVN, appData, 
                                     function(err, data) {
                    if (err) {
                        error = err;
                    }
                    updateVNFipPoolEdit(error, configData, vnPutData, appData,
                                        data, callback);
                });
            });
        } else {
            updateVNFipPoolAddCb(fipNewPoolVN, appData, function(err, data) {
                updateVNFipPoolEdit(err, configData, vnPutData, appData,
                                    null, callback);
            });
        }
    });
}

function updateVNPolicyRefs (vnConfig, response, appData)
{
    var vnPutData = response.req.body;
    var vnId = response.req.param('id');
    if(vnId == null)
        vnId = appData['vnUUID'];
    var vnPutURL = '/virtual-network/' + vnId;

    if(null === vnConfig['virtual-network']['virtual_network_properties'] ||
       typeof vnConfig['virtual-network']['virtual_network_properties'] === "undefined") {
        if ('virtual_network_properties' in vnPutData['virtual-network']) {
            vnConfig['virtual-network']['virtual_network_properties'] = {};
        }
    }
    if(null !== vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] &&
        typeof vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] !== "undefined") {
        vnConfig['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] =
        vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'];
    }
    if(null !== vnPutData['virtual-network']['virtual_network_properties']['allow_transit'] &&
        typeof vnPutData['virtual-network']['virtual_network_properties']['allow_transit'] !== "undefined") {
        vnConfig['virtual-network']['virtual_network_properties']['allow_transit'] =
        vnPutData['virtual-network']['virtual_network_properties']['allow_transit'];
    }
    if(null !== vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'] &&
        typeof vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'] !== "undefined") {
        vnConfig['virtual-network']['virtual_network_properties']['forwarding_mode'] =
        vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'];
    }

    vnConfig['virtual-network']['route_target_list'] = {};
    if ('route_target_list' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['route_target_list'] = 
            vnPutData['virtual-network']['route_target_list'];
    }

    vnConfig['virtual-network']['network_ipam_refs'] = [];
    if ('network_ipam_refs' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['network_ipam_refs'] = 
            vnPutData['virtual-network']['network_ipam_refs'];
    }

    vnConfig['virtual-network']['network_policy_refs'] = [];
    if ('network_policy_refs' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['network_policy_refs'] =
            vnPutData['virtual-network']['network_policy_refs'];
        vnSeqConfig = setVNPolicySequence(vnConfig);
    } else {
        vnSeqConfig = vnConfig;
    }

    vnPutData['virtual-network']['uuid'] = vnId;
    if (null !=
        vnSeqConfig['virtual-network']['virtual_machine_interface_back_refs']) {
        delete
            vnSeqConfig['virtual-network']['virtual_machine_interface_back_refs'];
    }
    if (null !=
        vnSeqConfig['virtual-network']['instance_ip_back_refs']) {
        delete vnSeqConfig['virtual-network']['instance_ip_back_refs'];
    }
    configApiServer.apiPut(vnPutURL, vnSeqConfig, appData, function(err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        readVirtualNetworkAsync({uuid:vnId, appData:appData},
                                function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    }); 
}

function updateVirtualNetworkCB (dataObjArray, callback)
{
    var vnPutData = _.get(dataObjArray, 'data', {});
    var vnId = _.get(vnPutData, 'virtual-network.uuid', null);

    var reqUrl = '/virtual-network/' + vnId;
    var physicalRouters = [];
    var appData = _.get(dataObjArray, 'appData', null);
    physicalRouters = vnPutData["virtual-network"]['physical-routers'];
    delete vnPutData["virtual-network"]['physical-routers'];
    //vnPutData['virtual-network']['uuid'] = vnId;
    updateFloatingIpList(vnId, vnPutData, appData, null,
                         function(err, data) {
        if (err) {
            if(callback){
                callback(err, null);
                return;
            }
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        if ('network_policy_refs' in vnPutData['virtual-network']) {
            vnPutData = setVNPolicySequence(vnPutData);
        }
        updateBridgeDomains(vnId, vnPutData, appData, function(bdError, bdData){
            if (bdError) {
                if(callback){
                    callback(bdError, null);
                    return;
                }
                commonUtils.handleJSONResponse(bdError, response, null);
                return;
            }
        jsonDiff.getJSONDiffByConfigUrl(reqUrl, appData, vnPutData,
                                         function(err, delta) {
            configApiServer.apiPut(reqUrl, delta, appData,
                                   function(err, data) {
                if (err) {
                    if(callback){
                        callback(err, null);
                        return;
                    }
                    commonUtils.handleJSONResponse(err, response, null);
                    return;
                }
                //Update the physical router
                updatePhysicalRouters("edit",physicalRouters,err,data,
                        vnPutData,null,null,appData,
                        function(){
                                readVirtualNetworkAsync({uuid:vnId, appData:appData},
                                        function(err, data) {
                                                if(callback){
                                                    callback(err, data);
                                                    return;
                                                }
                                                commonUtils.handleJSONResponse(err, response, data);
                                        });
                        }
                );
            });
        });
        });
    });
}

function updateVirtualNetwork (request, response, appData)
{
    var vnId;
    var vnPutData = request.body;
    if(request.param('id') != null)
        vnId = request.param('id'); 
    else
        vnId = appData['vnUUID'];

    var reqUrl = '/virtual-network/' + vnId;
    var physicalRouters = [];
    
    physicalRouters = vnPutData["virtual-network"]['physical-routers'];
    delete vnPutData["virtual-network"]['physical-routers'];
    
    vnPutData['virtual-network']['uuid'] = vnId;
    updateFloatingIpList(vnId, vnPutData, appData, response,
                         function(err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        if ('network_policy_refs' in vnPutData['virtual-network']) {
            vnPutData = setVNPolicySequence(vnPutData);
        }
        updateBridgeDomains(vnId, vnPutData, appData, function(bdError, bdData){
            if (bdError) {
                commonUtils.handleJSONResponse(bdError, response, null);
                return;
            }
        jsonDiff.getJSONDiffByConfigUrl(reqUrl, appData, vnPutData,
                                         function(err, delta) {
            configApiServer.apiPut(reqUrl, delta, appData,
                                   function(err, data) {
                if (err) {
                    commonUtils.handleJSONResponse(err, response, null);
                    return;
                }
                //Update the physical router
                updatePhysicalRouters("edit",physicalRouters,err,data,
                        vnPutData,request,response,appData,
                        function(){
                                readVirtualNetworkAsync({uuid:vnId, appData:appData},
                                        function(err, data) {
                                                commonUtils.handleJSONResponse(err, response, data);
                                        });
                        }
                );
            });
        });
        });
    });
}

function updateBridgeDomains(vnId, vnPutData, appData, callback)
{
    configApiServer.apiGet("/virtual-network/" + vnId, appData,
            function(err, configData){
                 var configBDList = commonUtils.getValueByJsonPath(configData,
                         'virtual-network;bridge_domains', [], false),
                     changedBDList = commonUtils.getValueByJsonPath(vnPutData,
                             'virtual-network;bridge_domains', [], false),
                     deleteBDObjList = [], deleteBDURL, createBDDataList = [],
                     editBDDataList = [],
                     changedBDIds = _.map(changedBDList, 'uuid');
                 _.each(changedBDList, function(bdData){
                     if(!bdData.uuid){
                         createBDDataList.push(bdData);
                     } else {
                         editBDDataList.push(bdData);
                     }
                 });
                 _.each(configBDList, function(configbdData){
                     if(_.indexOf(changedBDIds, configbdData.uuid) === -1) {
                         deleteBDURL = '/bridge-domain/' + configbdData.uuid;
                         commonUtils.createReqObj(deleteBDObjList, deleteBDURL,
                                 global.HTTP_REQUEST_DEL, null,
                                 configApiServer, null, appData);
                     }
                 });
                 editBridgeDomains(editBDDataList, appData, function(editBDError, editBDData){
                     if(editBDError) {
                         callback(editBDError, null);
                         return;
                     }
                     deleteBridgeDomainAsync(deleteBDObjList, function(deleteBDError, deleteBDData){
                         if(deleteBDError) {
                             callback(deleteBDError, null);
                             return;
                         }
                         createBridgeDomains(createBDDataList, appData, function(createBDError, createBDData){
                             if(createBDError){
                                 callback(createBDError, null);
                                 return;
                             }
                             callback(createBDError, createBDData);
                         })
                     });
                 });
            }
    );
}

function createBridgeDomains(bdDataList, appData, callback)
{
    if(!bdDataList.length){
        callback(null, null);
        return;
    }
    var bdCreateDataArr = [], bdCreateData = {}, bdPostURL = '/bridge-domains';
    _.each(bdDataList, function(bdData) {
        bdCreateData["bridge-domain"] = {};
        bdCreateData["bridge-domain"]["fq_name"] = bdData["to"];
        bdCreateData["bridge-domain"]["name"] =
            commonUtils.getValueByJsonPath(bdData, "to;3", null, false);
        bdCreateData["bridge-domain"]["parent_type"] = "virtual-network";
        bdCreateData["bridge-domain"]["isid"] = bdData["isid"];
        bdCreateData["bridge-domain"]["mac_learning_enabled"] =
            bdData["mac_learning_enabled"];
        bdCreateData["bridge-domain"]["mac_limit_control"] =
            bdData["mac_limit_control"];
        bdCreateData["bridge-domain"]["mac_move_control"] =
            bdData["mac_move_control"];
        bdCreateData["bridge-domain"]["mac_aging_time"] =
            bdData["mac_aging_time"];
        commonUtils.createReqObj(bdCreateDataArr, bdPostURL,
                global.HTTP_REQUEST_POST,
                commonUtils.cloneObj(bdCreateData), null, null,
                appData);
    });
    if(!bdCreateDataArr.length){
        callback(null, null);
        return;
    }
    async.map(bdCreateDataArr,
            commonUtils.getAPIServerResponse(configApiServer.apiPost, false),
                function(error, results) {
                    callback(error, results);
                    return;
                }
        );
}

function editBridgeDomains(bdDataList, appData, callback)
{
    if(!bdDataList.length){
        callback(null, null);
        return;
    }
    var bdEditDataArr = [], bdEditData = {}, bdPutURL;
    _.each(bdDataList, function(bdData) {
        bdEditData["bridge-domain"] = {};
        bdEditData["bridge-domain"]["uuid"] = bdData.uuid;
        bdEditData["bridge-domain"]["fq_name"] = bdData["to"];
        bdEditData["bridge-domain"]["parent_type"] = "virtual-network";
        bdEditData["bridge-domain"]["isid"] = bdData["isid"];
        bdEditData["bridge-domain"]["mac_learning_enabled"] =
            bdData["mac_learning_enabled"];
        bdEditData["bridge-domain"]["mac_limit_control"] =
            bdData["mac_limit_control"];
        bdEditData["bridge-domain"]["mac_move_control"] =
            bdData["mac_move_control"];
        bdEditData["bridge-domain"]["mac_aging_time"] =
            bdData["mac_aging_time"];
        bdPutURL = '/bridge-domain/' +  bdData.uuid;
        commonUtils.createReqObj(bdEditDataArr, bdPutURL,
                global.HTTP_REQUEST_PUT,
                commonUtils.cloneObj(bdEditData), null, null,
                appData);
    });
    if(!bdEditDataArr.length){
        callback(null, null);
        return;
    }
    async.map(bdEditDataArr,
            commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
                function(error, results) {
                    callback(error, results);
                    return;
                }
        );
}

function deleteBridgeDomains(bdDataList, appData, callback)
{
    var deleteBDObjList = [], deleteBDURL;
    _.each(bdDataList, function(bdData){
            deleteBDURL = '/bridge-domain/' + bdData.uuid;
            commonUtils.createReqObj(deleteBDObjList, deleteBDURL,
                    global.HTTP_REQUEST_DEL, null,
                    configApiServer, null, appData);
    });
    deleteBridgeDomainAsync(deleteBDObjList, callback);
}

function deleteBridgeDomainAsync(deleteBDObjList, callback)
{
    if(!deleteBDObjList.length) {
        callback(null, null);
        return;
    }
    async.map(deleteBDObjList,
        commonUtils.getAPIServerResponse(configApiServer.apiDelete, false),
            function(error, results) {
                callback(error, results);
                return;
            }
    );
}

/**
 * @updateRouterExternalFlag
 * private function
 * 1. configData:  Data returned from Config API Server.
 * 2. requestData: PUT request data
 * 3. Sets 'router_external' flag to true if any Floating IP Pools 
 *    associated to this vitual network, false otherwise.
*/
function updateRouterExternalFlag(configData, requestData) {
    if(requestData && requestData.hasOwnProperty("virtual-network")) {
        if(requestData["virtual-network"].hasOwnProperty("router_external")) {
            configData["virtual-network"]["router_external"] = 
                requestData["virtual-network"]["router_external"];
        } else {
            configData["virtual-network"]["router_external"] = false;
            /*if(requestData["virtual-network"].hasOwnProperty("floating_ip_pools")) {
                if(requestData["virtual-network"]["floating_ip_pools"].length > 0) {
                    configData["virtual-network"]["router_external"] = true;
                }
            }*/
        }
        if(requestData["virtual-network"].hasOwnProperty("is_shared")) {
           configData["virtual-network"]["is_shared"] = 
                requestData["virtual-network"]["is_shared"];
        } else {
            configData["virtual-network"]["is_shared"] = false;
        }
        if(requestData["virtual-network"]["id_perms"].hasOwnProperty("enable")) {
           configData["virtual-network"]["id_perms"]["enable"] = 
                requestData["virtual-network"]["id_perms"]["enable"];
        } else {
            configData["virtual-network"]["id_perms"]["enable"] = false;
        }
        if(requestData["virtual-network"].hasOwnProperty("display_name")) {
           configData["virtual-network"]["display_name"] = requestData["virtual-network"]["display_name"];
        }
    }
}

function createVirtualNetworkCB(dataObjArr, callback)
{
    var appData = _.get(dataObjArr, 'appData', {});
    var vnCreateURL    = '/virtual-networks';
    var vnPostData     = _.get(dataObjArr, 'data', null);
    var vnSeqPostData  = {};
    var vnConfigData   = null;
    var physicalRouters= [];
    if (typeof(vnPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }

    vnConfigData = JSON.parse(JSON.stringify(vnPostData));
    physicalRouters = vnConfigData["virtual-network"]['physical-routers'];
    delete vnConfigData["virtual-network"]['physical-routers'];

    if ('route_target_list' in vnPostData['virtual-network'] &&
       'route_target' in vnPostData['virtual-network']['route_target_list']) {
        if (!(vnPostData['virtual-network']['route_target_list']
                      ['route_target'].length)) {
            delete vnPostData['virtual-network']['route_target_list'];
        }
    }


    vnSeqPostData = setVNPolicySequence(vnPostData);
    configApiServer.apiPost(vnCreateURL, vnSeqPostData, appData,
                         function(error, data) {
                           if (error || data == null) {
                               callback(error, null);
                               return;
                           }
                           updatePhysicalRouters("create",physicalRouters,error,data,
                                   vnConfigData,null,null,appData,function(error,data){
                                                                   createVirtualNetworkCb(error, data,
                                                                         vnConfigData, null,
                                                                         appData, callback);
                                                               }
                           );
    });
}

/**
 * @createVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-networks - Post
 * 2. Gets list of virtual networks from config api server
 */
function createVirtualNetwork (request, response, appData) 
{
    var vnCreateURL    = '/virtual-networks';
    var vnPostData     = request.body;
    var vnSeqPostData  = {};
    var vnConfigData   = null;
    var physicalRouters= [];
    if (typeof(vnPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vnConfigData = JSON.parse(JSON.stringify(vnPostData));
    physicalRouters = vnConfigData["virtual-network"]['physical-routers'];
    delete vnConfigData["virtual-network"]['physical-routers'];

    if ('route_target_list' in vnPostData['virtual-network'] &&
       'route_target' in vnPostData['virtual-network']['route_target_list']) {
        if (!(vnPostData['virtual-network']['route_target_list']
                      ['route_target'].length)) {
            delete vnPostData['virtual-network']['route_target_list'];
        }
    }


    vnSeqPostData = setVNPolicySequence(vnPostData);
    configApiServer.apiPost(vnCreateURL, vnSeqPostData, appData,
                         function(error, data) {
                           if (error || data == null) {
                               commonUtils.handleJSONResponse(error, response, null);
                               return;
                           }
                           updatePhysicalRouters("create",physicalRouters,error,data,
                                   vnConfigData,request,response,appData,function(error,data){
                                                                   createVirtualNetworkCb(error, data,
                                                                         vnConfigData, response,
                                                                         appData);
                                                               }
                           );
    });
}

/**
 * @deleteVirtualNetworkCb
 * private function
 * 1. Return back the response of net delete.
 */
function deleteVirtualNetworkCb (error, vnDelResp, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, vnDelResp);
}

/**
 * @deleteVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id
 * 2. Deletes the virtual network from config api server
 */
function deleteVirtualNetwork (request, response, appData) 
{
    var requestParams    = url.parse(request.url, true);
    var virtualNetworkId = null;

    if (virtualNetworkId = request.param('id').toString()) {
        vnDelURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var dtaObj = {uuid: virtualNetworkId,
                    appData: appData, request: request};
    deleteVirtualNetworkAsync(dataObj, function (error, data) {
        commonUtils.handleJSONResponse(data.error, response, data.data);
        return;
    });
}


/**
 * @deleteVirtualNetworkAsync
 * Callback for multi delete of VN's
 */
function deleteVirtualNetworkAsync (dataObj, callback)
{
    var vnDelURL            = '/virtual-network/';
    var uuidList            = [];
    var dataObjArr          = [];
    var virtualNetworkId    = dataObj.uuid;//commonUtils.getValueByJsonPath(dataObj,'uuid', null);
    var appData             = dataObj.appData;//commonUtils.getValueByJsonPath(dataObj,'appData', null);
    var request             = dataObj.request;//commonUtils.getValueByJsonPath(dataObj,'request', null);

    if (virtualNetworkId != null) {
        vnDelURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        callback(null, {'error': error, 'data': null} );
        return;
    }

    configApiServer.apiGet(vnDelURL, appData, function(err, data) {
        if (err || (null == data)) {
            callback(null, {'error': err, 'data': null});
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
                callback(null, {'error': error, 'data': null});
                return;                               
            }
        }
        //bridge domain
        var bdDataList = commonUtils.getValueByJsonPath(data,
                'virtual-network;bridge_domains', [], false);
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
                callback(null, {'error': error, 'data': null});
                return;                                
            }
        }
        var loggedInOrchMode = commonUtils.getValueByJsonPath(request,
                                            'session;loggedInOrchestrationMode', null);
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
            async.map(dataObjArr, fipPoolDelete, function(err, results) {
                if(err) {
                    callback(null, {'error': err, 'data': null});
                    return;
                }

                deleteBridgeDomains(bdDataList, appData, function(){
                    configApiServer.apiDelete(vnDelURL, appData,
                        function(error, data) {
                            callback(null, {'error': error, 'data': data});
                            return;
                        });
                    });
            });
        } else {
            deleteBridgeDomains(bdDataList, appData, function(){
                configApiServer.apiDelete(vnDelURL, appData,
                    function(error, data) {
                        callback(null, {'error': error, 'data': data});
                        return;
                    });
                });
        }
    });
}

function doIpamSubnetExist(nwIpam, nwSubnet, vnNwIpamRefs)
{
    var vnIpam = null;
    var vnSubnet = null;
    var vnNwIpamRefsLen = vnNwIpamRefs.length;

    for (var i = 0; i < vnNwIpamRefsLen; i++) {
        vnIpam = vnNwIpamRefs[i]['subnet']['ipam'].join(':');
        if (nwIpam == vnIpam) {
            subnet = vnNwIpamRefs[i]['subnet']['ipam_subnet'];
            if (subnet == nwSubnet) {
                return true;
            }
        }
    }
    return false;
}

function updateVNSubnetByConfigData (request, response, vnConfigData, appData,
                                     callback)
{
    var nwConfigData     = request.body;
    var vnIpamRefs = 
        vnConfigData['virtual-network']['network_ipam_refs'];
    var virtualNetworkId = request.param('id').toString();
    var vnURL = '/virtual-network/' + virtualNetworkId;
    var vnIpamRefsLen = vnIpamRefs.length;
    for (var i = 0; i < vnIpamRefsLen; i++) {
        var vnIpam = vnIpamRefs[i]['to'].join(':');
        var vnSubnets = vnIpamRefs[i]['attr']['ipam_subnets'];
        var vnSubnetsLen = vnSubnets.length;
        for (var j = 0; j < vnSubnetsLen; j++) {
            var vnSubnet = vnSubnets[j]['subnet']['ip_prefix'] + "/" + 
                vnSubnets[j]['subnet']['ip_prefix_len'];
            if (false == doIpamSubnetExist(vnIpam, vnSubnet,
                                          nwConfigData['virtual-network']
                                          ['network_ipam_refs'])) {
                vnSubnets.splice(j, 1);
                i = 0;
                break;
            }
        }
    }
    configApiServer.apiPut(vnURL, vnConfigData, appData, function(error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            readVirtualNetworkAsync({uuid:virtualNetworkId, appData:appData},
                                    function(err, data) {
                commonUtils.handleJSONResponse(err, response, data);
            });
        }
    });
}

/**
 * @updateVNSubnetDelete
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/ipam/:ipamid
 * 2. Deletes the subnet from Virtual Network, uses quantum to
 *    delete the subnet
 * 3. Reads updated config and sends it back to client
 */
function updateVNSubnetDelete (request, response, appData) 
{
    var vnURL            = '/virtual-network/';
    var virtualNetworkId = null;
    var vnSubnetId       = null;
    var requestParams    = url.parse(request.url, true);
    var subnetFoundFlag  = false;

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vnURL += virtualNetworkId;
    configApiServer.apiGet(vnURL, appData, function(error, vnConfigData) {
        updateVNSubnetByConfigData(request, response, vnConfigData, appData, 
                                   function (err, data) {
        });
    });
}

/**
 * @updateVNSubnetAdd
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/ipams
 * 2. Adds subnet to Virtual Network, uses quantum to
 *    add the subnet.
 * 3. Reads updated config and sends it back to client
 */
function updateVNSubnetAdd (vnId, vnPostData, vnConfigData, appData, callback)
{
    var vnURL            = '/virtual-network/';
    var subnetPostData   = {};
    var virtualNetworkId = null;
    var netIpamRef       = null;
    var subnet_prefix    = null;
    var configIpamRefsLen = 0;
    var configIpamRefs    = [];
    var noIpSubnet        = false;

    vnURL += vnId;

        configApiServer.apiPut(vnURL, vnConfigData, appData,
                               function(error, data) {
            callback(error, data);
            return;
        });
        return;
    netIpamRef = vnPostData['virtual-network']['network_ipam_refs'];
    if (null == netIpamRef) {
        noIpSubnet = true;
    }
    try {
        if (!netIpamRef[0]['attr']['ipam_subnets'][0]
            ['subnet']['ip_prefix'].length) {
            noIpSubnet = true;
        }
    } catch(e) {
    }
    if (true == noIpSubnet) {
        configApiServer.apiPut(vnURL, vnConfigData, appData,
                               function(error, data) {
            callback(error, data);
            return;
        });
    }
    try {
        netIpamTo = netIpamRef[0]['to'].join(':');
        configIpamRefs = vnConfigData['virtual-network']['network_ipam_refs'];
        configIpamRefsLen = configIpamRefs.length;
    } catch(e) {
        configIpamRefsLen = 0;
        vnConfigData['virtual-network']['network_ipam_refs'] = [];
        vnConfigData['virtual-network']['network_ipam_refs'][configIpamRefsLen]
            = netIpamRef[0];
    }
    try {
        for (var i = 0; i < configIpamRefsLen; i++) {
            configIpamTo = configIpamRefs[i]['to'].join(':');
            if (netIpamTo == configIpamTo) {
                var subnet = configIpamRefs[i]['attr']['ipam_subnets'];
                var subnetLen = subnet.length;
                configIpamRefs[i]['attr']['ipam_subnets'][subnetLen] =
                    netIpamRef[0]['attr']['ipam_subnets'][0];
                break;
            }
        }
        if (i == configIpamRefsLen) {
            configIpamRefs[configIpamRefsLen] = netIpamRef[0];
        }
    } catch(e) {
    }
    configApiServer.apiPut(vnURL, vnConfigData, appData, function(error, data) {
        callback(error, data);
    });
}

/**
 * @createFipPoolUpdateSendResponse
 * private function
 */ 
function createFipPoolUpdateSendResponse (error, results, response,
                                          fipPool, fipPostData, appData) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(fipPostData['virtual-network']['uuid'].toString(),
                       appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
    return;
}

function getFipUUID (fipFqn, fipPool)
{
    var cnt = fipPool.length;
    for (var i = 0; i < cnt; i++) {
        if (fipFqn == fipPool[i]['floating-ip-pool']['fq_name'].join(':')) {
            return fipPool[i]['floating-ip-pool']['uuid'];
        }
    }
    return null;
}

function getFipPoolToEntry (fipPoolRef, fipPool, projUUID, fipPostData)
{
    try {
        var fipPoolCnt = fipPool.length;
        var fip = fipPostData['virtual-network']['floating_ip_pools'];
        var fipCnt = fip.length;
    } catch(e) {
        return;
    }
    for (var i = 0; i < fipCnt; i++) {
        try {
            var projCnt = fip[i]['projects'].length;
        } catch(e) {
            continue;
        }
        for (var j = 0; j < projCnt; j++) {
            if (projUUID == fip[i]['projects'][j]['uuid']) {
                var fipName = fip[i]['to'].join(':');
                var fipUUID = getFipUUID(fipName, fipPool);
                if (fipUUID == null) {
                    continue;
                }
                fipPoolRefObj = {
                    to: fip[i]['to'],
                    attr: null,
                    uuid: fipUUID
                }
                fipPoolRef.push(fipPoolRefObj);
            }
        }
    }
}

/**
 * @createFipPoolUpdateProjects
 * private function
 */ 
function createFipPoolUpdateProjects (error, results,
                                      fipPool, fipPostData, appData,
                                      callback) 
{
    var projRef     = null;
    var fipPoolRef  = [];
    var dataObjArr  = [];
    var projURL     = null;
    var projLen     = 0, i = 0;
    var fipPoolRefObj = {};

    if (error) {
        callback(null, null);
        return;
    }

    if (!(projLen = results.length)) {
        callback(null, null);
        return;
    }

    var origProjConfigData = commonUtils.cloneObj(results);
    fipPoolCnt = fipPool.length;
    for (i = 0; i < projLen ; i++) {
        projURL = '/project/' + results[i]['project']['uuid'];

        if (!('floating_ip_pool_refs' in results[i]['project'])) {
            results[i]['project']['floating_ip_pool_refs'] = [];
        }
        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        getFipPoolToEntry(fipPoolRef, fipPool,
                          results[i]['project']['uuid'],
                          fipPostData);
        var projDelta =
            jsonDiff.getConfigJSONDiff('virtual-network:project',
                                       origProjConfigData[i],
                                       results[i]);
        commonUtils.createReqObj(dataObjArr, projURL, global.HTTP_REQUEST_PUT,
                                 projDelta, null, null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  callback(error, results);
              });
    return;
}

/**
 * @createFipPoolProjectsGet
 * private function
 */ 
function createFipPoolProjectsGet (error, fipPool, fipPostData,
                                   appData, callback) 
{
    var reqUrl         = null;
    var fipPoolRef     = 0;
    var dataObjArr     = [];
    var fipProjRefsLen = 0, i = 0, j = 0, k = 0;

    if (error) {
        callback(error, null);
       return;
    }

    try {
        fipPoolRef = fipPostData['virtual-network']['floating_ip_pools'];
        var fipPoolRefCnt = fipPoolRef.length;
    } catch(e) {
        callback(null, null);
        return;
    }
    for (var i = 0; i < fipPoolRefCnt; i++) {
        try {
            if (!(('projects' in fipPoolRef[i]))) {
                continue;
            }
        } catch(e) {
            continue;
        }
        try {
            fipProjRefsLen = fipPoolRef[i]['projects'].length;
        } catch(e) {
            continue;
        }
        for (var j = 0; j < fipProjRefsLen; j++) {
            reqUrl = '/project/' + fipPoolRef[i]['projects'][j]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);
        }
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  createFipPoolUpdateProjects(error, results,
                                              fipPool, fipPostData,
                                              appData, callback);
              });

    return;
}

/**
 * @updateVNFipPoolAdd
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/floatingip-pools
 * 2. Adds a Floating IP pool to network and associates the
 *    floatingip-pool to projects
 * 3. Reads back the updated virtual network config and send it
 *    back to the client
 */
function updateVNFipPoolAdd (fipPostData, response, appData, callback)
{
    //var fipPostData   = request.body;
    var vnId = fipPostData['virtual-network']['uuid'];

    updateVNFipPoolAddCb(fipPostData, appData, function(err, data) {
        readVirtualNetwork(vnId, appData,
                           function(err, data) {
            if(callback) {
                callback(err, data);
            } else {
                commonUtils.handleJSONResponse(err, response, data);
            }
        });
    });
}

function updateVNFipPoolAddCb (fipPostData, appData, callback) 
{
    var fipCreateDataArr = [];
    var fipPostURL    = '/floating-ip-pools';
    var fipCreateData = {};

    try {
        var fipPoolData = fipPostData['virtual-network']['floating_ip_pools'];
        var fipPoolCnt = fipPoolData.length;
        for (var i = 0; i < fipPoolCnt; i++) {
            fipCreateData = {
                "floating-ip-pool": {
                    "fq_name": fipPostData['virtual-network']
                        ['floating_ip_pools'][i]['to'],
                    "parent_type": "virtual-network"
                }
            };
            commonUtils.createReqObj(fipCreateDataArr, fipPostURL,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(fipCreateData), null, null,
                                     appData);
        }
    } catch(e) {
        callback(null, null);
        return;
    }
    async.map(fipCreateDataArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPost, false),
              function(error, results) {
        createFipPoolProjectsGet(error, results, fipPostData, appData,
                                 function(err, data) {
            callback(err, data);
        });
    });
}

/**
 * @deleteFipPoolUpdateSendResponse
 * private function
 */ 
function deleteFipPoolUpdateSendResponse (error, results,
                                          fipPool, virtualNetworkId, appData,
                                          callback) 
{
    var fipPoolURL = '/floating-ip-pool/';

    if (error) {
        callback(error, null);
        return;
    }

    fipPoolURL += fipPool['floating-ip-pool']['uuid'];
    configApiServer.apiDelete(fipPoolURL, appData, function (error) {
        callback(error, null);
    });
}

/**
 * @deleteFipPoolUpdateProjects
 * private function
 * Deletes the FIP pool references from projects
 */
function deleteFipPoolUpdateProjects (error, results,
                                      fipPool, virtualNetworkId, appData,
                                      callback) 
{
    var projRef       = null;
    var fipPoolRef    = [];
    var dataObjArr    = [];
    var projURL       = null;
    var projLen       = 0, i = 0, j = 0;
    var fipPoolRefLen = [];
    var fipPoolRefObj = {};

    if (error) {
        callback(error, null);
        return;
    }

    projLen = results.length;
    var origProjConfigData = commonUtils.cloneObj(results);

    for (i = 0; i < projLen ; i++) {
        projURL = '/project/' + results[i]['project']['uuid'];

        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        fipPoolRefLen = fipPoolRef.length;
        for (j = 0; j < fipPoolRefLen; j++) {
            if (fipPool['floating-ip-pool']['uuid']
                           == fipPoolRef[j]['uuid']) {
               fipPoolRef.splice(j, 1);
               break; 
            }
        }
        var projDelta =
            jsonDiff.getConfigJSONDiff('virtual-network:project',
                                       origProjConfigData[i],
                                       results[i]);
        commonUtils.createReqObj(dataObjArr, projURL,
                                 global.HTTP_REQUEST_PUT, projDelta, null, null,
                                 appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  deleteFipPoolUpdateSendResponse(error, results,
                                                  fipPool, virtualNetworkId,
                                                  appData, callback);
              });
}

/**
 * @updateVNFipPoolReadDel
 * private function
 */ 
function updateVNFipPoolReadDel (error, fipPool, virtualNetworkId, 
                                 appData, callback) 
{
    var reqUrl         = null;
    var fipProjRef     = [];
    var dataObjArr     = [];
    var fipPoolURL     = '/floating-ip-pool/';
    var fipProjRefsLen = 0, i = 0;

    if (error) {
        callback(error, null);
        return;
    }

    if (('floating_ips' in fipPool['floating-ip-pool']) &&
        fipPool['floating-ip-pool']['floating_ips'].length) {
        error = new appErrors.RESTServerError('Delete Floating IPs from ' +
                                              'the Floating IP Pool');
        callback(error, null);
        return;
    }

    if (('project_back_refs' in fipPool['floating-ip-pool']) &&
        (fipPool['floating-ip-pool']['project_back_refs'].length)) {
        fipProjRef = fipPool['floating-ip-pool']['project_back_refs'];
        fipProjRefsLen = fipProjRef.length;
    } else {
        fipPoolURL += fipPool['floating-ip-pool']['uuid'];
        configApiServer.apiDelete(fipPoolURL, appData, function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, null);
            }
            return;
        });
        return;
    }
    for (var i = 0; i < fipProjRefsLen; i++) {
        var putData = {
            'type': 'project',
            'uuid': fipProjRef[i]['uuid'],
            'ref-type': 'floating-ip-pool',
            'ref-uuid': fipPool['floating-ip-pool']['uuid'],
            'operation': 'DELETE'
        };
        var reqUrl = '/ref-update';
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 commonUtils.cloneObj(putData), null,
                                 null, appData);
    }
    async.map(dataObjArr,
            commonUtils.getServerResponseByRestApi(configApiServer, true),
            function(error, results) {
                deleteFipPoolUpdateSendResponse(error, results,
                        fipPool, virtualNetworkId,
                        appData, callback);
                return;
            }
    );
}

/**
 * @updateVNFipPoolDelete
 * public function
 * 1. URL api/config/virtual-network/:id/floatingip-pool/:fipid
 * 2. Gets floating-ip-pool object and checks if there are floating-ips
 *    requested by the project. 
 * 2. Removes floating-ip-pool references from projects and deletes
 *    the floating-ip-pool.
 * 3. Reads updated config and sends it back to client
 */
function updateVNFipPoolDelete (request, response, appData) 
{
    var fipPoolURL       = '/floating-ip-pool/';
    var virtualNetworkId = null;
    var fipPoolId        = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipPoolId = request.param('fipid').toString()) {
        fipPoolURL += fipPoolId;
    } else {
        error = new appErrors.RESTServerError('Add Floating IP Pool id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var obj = [];
    obj[0] = {};
    obj[0]['virtualNetworkId'] = virtualNetworkId;
    obj[0]['fipPoolId'] = fipPoolId;
    obj[0]['appData'] = appData;
    async.map(obj, fipPoolDelete, function(err, results) {
        readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    });
}

function fipPoolDelete (obj, callback)
{
    var virtualNetworkId = obj['virtualNetworkId'];
    var fipPoolId = obj['fipPoolId'];
    var appData = obj['appData'];

    var fipPoolURL = '/floating-ip-pool/' + fipPoolId;

    configApiServer.apiGet(fipPoolURL, appData,
                           function(error, data) {
        updateVNFipPoolReadDel(error, data, virtualNetworkId, appData,
                               callback);
    });
}

/**
 * @updateFipPoolUpdateSendResponse
 * private function
 */ 
function updateFipPoolUpdateSendResponse (error, results,
                                          response, virtualNetworkId, appData)
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });

    return;
}

/**
 * @updateFipPoolUpdateProjects
 * private function
 * Deletes the FIP pool references from projects
 */
function updateFipPoolUpdateProjects (error, results,
                                      fipPool, virtualNetworkId, appData,
                                      callback)
{
    var projRef       = null;
    var fipProjRef    = {};
    var fipPoolRef    = [];
    var dataObjArr    = [];
    var projURL       = null;
    var projLen       = 0, i = 0, j = 0;
    var fipPoolRefLen = [];
    var fipPoolRefObj = {};

    if (error) {
       callback(error, null);
       return;
    }

    var origProjConfigData = commonUtils.cloneObj(results);
    projLen = results.length;

    for (i = 0; i < projLen ; i++) {
        projUUID = results[i]['project']['uuid'];
        fipProjRef = fipPool['floating-ip-pool']['project_uuid'][projUUID];
        projURL = '/project/' + projUUID;
        if (!('floating_ip_pool_refs' in results[i]['project'])) {
            results[i]['project']['floating_ip_pool_refs'] = [];
        }

        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        if (fipProjRef['oper'] == 'add') {
            fipPoolRefObj =
            {
                          to: fipPool['floating-ip-pool']['fq_name'],
                          attr: null,
                          uuid: fipPool['floating-ip-pool']['uuid']
            };
            fipPoolRef.push(fipPoolRefObj);
        } else {
            fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
            fipPoolRefLen = fipPoolRef.length;
            for (j = 0; j < fipPoolRefLen; j++) {
                if (fipPool['floating-ip-pool']['uuid']
                               == fipPoolRef[j]['uuid']) {
                   fipPoolRef.splice(j, 1);
                   break; 
                }
            }
        }
        var projDelta =
            jsonDiff.getConfigJSONDiff('virtual-network:project',
                                       origProjConfigData[i],
                                       results[i]);
        commonUtils.createReqObj(dataObjArr, projURL, global.HTTP_REQUEST_PUT,
                                 projDelta, null, null, appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  callback(error, results);
              });

    return;
}

/**
 * @updateVNFipPoolReadUpdate
 * private function
 */ 
function updateVNFipPoolReadUpdate (error, fipPool,
                                    vnPostData, virtualNetworkId,
                                    appData, callback) 
{
    var j               = 0;
    var reqUrl          = null;
    var fipProjObjArr   = [];
    var fipProjRef      = [];
    var fipProjRefsLen  = 0, i = 0;
    var fipProjUIRef    = [];
    var fipProjUIRefLen = 0;
    var curCfgAllDel    = false;


    if (error) {
       callback(error, null);
       return;
    }

    fipPool['floating-ip-pool']['project_uuid'] = {};

    if ((!('floating_ip_pools' in vnPostData['virtual-network'])) ||
        (!(vnPostData['virtual-network']['floating_ip_pools'].length)) ||
        (!('projects' in vnPostData['virtual-network']
         ['floating_ip_pools'][0])) ||
        (!(vnPostData['virtual-network']['floating_ip_pools'][0]
                   ['projects'][0]['uuid'].length))) {
        curCfgAllDel = true;
    }

    if ((!('project_back_refs' in fipPool['floating-ip-pool'])) &&
                curCfgAllDel) {
        callback(null, null);
        return;
    }

    j = 0;
    if ((!(['project_back_refs'] in fipPool['floating-ip-pool'])) &&
         !curCfgAllDel) {
        fipPool['floating-ip-pool']['project_back_refs'] = [];
        fipProjUIRef    =  vnPostData['virtual-network']
                                     ['floating_ip_pools'][0]['projects'];
        fipProjUIRefLen = fipProjUIRef.length;
        for (i = 0; i < fipProjUIRefLen ; i++) {
            uuid = fipProjUIRef[i]['uuid'];
            fipPool['floating-ip-pool'] ['project_uuid'][uuid] =
                {'to':fipProjUIRef[i]['to'],
                 'attr': null,
                 'uuid': fipProjUIRef[i]['uuid'],
                 'oper': 'add'
                };
            reqUrl = '/project/' + fipProjUIRef[i]['uuid'];
            commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);

        }

        async.map(fipProjObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   false),
                  function(error, results) {
                      updateFipPoolUpdateProjects(error, results,
                                                  fipPool, virtualNetworkId,
                                                  appData, callback);
                  });
        return;
    }

    if (['project_back_refs'] in fipPool['floating-ip-pool'] && 
        fipPool['floating-ip-pool']['project_back_refs'].length) {
        fipProjRef = fipPool['floating-ip-pool']['project_back_refs'];
        fipProjRefLen = fipProjRef.length;
        for (i = 0; i < fipProjRefLen ; i++) {
            uuid = fipProjRef[i]['uuid'];
            if (fipPool['floating-ip-pool']
                       ['project_uuid'][uuid] == null) {
                reqUrl = '/project/' + uuid;
                commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                         global.HTTP_REQUEST_GET, null, null,
                                         null, appData);
            }
            fipPool['floating-ip-pool']['project_uuid'][uuid] =
                {'to':fipProjRef[i]['to'],
                 'attr': null,
                 'uuid': fipProjRef[i]['uuid'],
                 'oper': 'delete'
                };
        }
        if (curCfgAllDel) {
            async.map(fipProjObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   false),
                    function(error, results) {
                        updateFipPoolUpdateProjects(error, results,
                                                    fipPool, virtualNetworkId,
                                                    appData, callback);
                    });
            return;
        }
    }

    fipProjUIRef = vnPostData['virtual-network']
                             ['floating_ip_pools'][0]['projects'];
    fipProjUIRefLen = fipProjUIRef.length;
    for (i = 0; i < fipProjUIRefLen ; i++) {
        uuid = fipProjUIRef[i]['uuid'];
        if (fipPool['floating-ip-pool']
                   ['project_uuid'][uuid] == null) {
            reqUrl = '/project/' + uuid;
            commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);
        }
        fipPool['floating-ip-pool']['project_uuid'][uuid] = 
              {'to':fipProjUIRef[i]['to'],
               'attr': null,
               'uuid': fipProjUIRef[i]['uuid'],
               'oper': 'add'
              };
    }

    async.map(fipProjObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  updateFipPoolUpdateProjects(error, results,
                                              fipPool, virtualNetworkId,
                                              appData, callback);
              });

    return;
}

/**
 * @updateVNFipPoolUpdate
 * public function
 * 1. URL api/config/virtual-network/:id/floatingip-pool/:fipid
 * 2. Gets floating-ip-pool object figures the diff for association.
 * 3. Resets the floating-ip-pool references from / to projects.
 * 4. Reads updated config and sends it back to client
 */
function updateVNFipPoolUpdate (request, response, appData) 
{
    var fipPoolURL       = '/floating-ip-pool/';
    var virtualNetworkId = null;
    var fipPoolId        = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipPoolId = request.param('fipid').toString()) {
        fipPoolURL += fipPoolId;
    } else {
        error = new appErrors.RESTServerError('Add Floating IP Pool id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(fipPoolURL, appData,
                        function(error, data) {
                        updateVNFipPoolReadUpdate(error, data, vnPostData,
                                                  virtualNetworkId,
                                                  appData, function(err, data) {
                            if (err) {
                                commonUtils.handleJSONResponse(err, response,
                                                               appData);
                            } else {
                                readVirtualNetwork(virtualNetworkId, appData,
                                                   function(err, data) {
                                    commonUtils.handleJSONResponse(err, response, 
                                                                   data);
                                });
                            }
                        });
     });
}

/**
 * @updateVNNetPoliciesSendResponse
 * private function
 */ 
function updateVNNetPoliciesSendResponse(error, results,
                                         response, virtualNetworkId, appData) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });

    return;
}

/**
 * @updateVNNetPoliciesRead
 * private function
 */ 
function updateVNNetPoliciesRead (error, vnConfig,
                                  vnPostData, virtualNetworkId, response,
                                  appData) 
{
    var vnSeqConfig = {};

    var vnPostURL = '/virtual-network/' + virtualNetworkId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnConfig['virtual-network']['network_policy_refs'] = [];
    if ('network_policy_refs' in vnPostData['virtual-network']) {
        vnConfig['virtual-network']['network_policy_refs'] = 
            vnPostData['virtual-network']['network_policy_refs'];
        vnSeqConfig = setVNPolicySequence(vnConfig);
    }

    configApiServer.apiPut(vnPostURL, vnSeqConfig, appData,
                         function(error, data) {
                         updateVNNetPoliciesSendResponse(error, data,
                                        response, virtualNetworkId, appData);
   });
 
}

/**
 * @updateVNNetPolicies
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/network-policys
 * 2. Gets VN config and updates Network policy references for it.
 * 3. Reads updated config and sends it back to client
 */
function updateVNNetPolicies (request, response, appData) 
{
    var vnGetURL         = '/virtual-network/';
    var virtualNetworkId = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
        vnGetURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                        function(error, data) {
                        updateVNNetPoliciesRead(error, data, vnPostData,
                                                virtualNetworkId, response,
                                                appData)
                        });
}

/**
 * @listVMInterfacesAggCb
 * private function
 * 1. Aggregates vm interfaces across all VN's
 */
function listVMInterfacesAggCb (error, vnListData, response, appData) 
{
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var vmListRef = [];
    var dataObjArr = [];

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    var vmList = [];

    vnListLen = vnListData.length;
    for (i = 0; i < vnListLen; i++) {
        vnRef = vnListData[i]['virtual-network'];
        if ('virtual_machine_interface_back_refs' in vnRef) {
            vmListRef = vnRef['virtual_machine_interface_back_refs'];
            vmList = vmList.concat(vmListRef);
        }
    }

    var vmIfRefLen = vmList.length;
    for(i=0; i<vmIfRefLen; i++) {
        var reqUrl = '/virtual-machine-interface/' + vmList[i]['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);        
    }
    async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, results) {
            vmIfAggCb(error, results, response, vmList, appData);
            });
}

function vmIfAggCb(error, vmIfList, response, vmList, appData) 
{
    var dataObjArr = [];
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(vmIfList.length <= 0) {
        commonUtils.handleJSONResponse(error, response,
            {'virtual_machine_interface_back_refs': vmList});        
        return;
    }
    for(var i=0; i<vmIfList.length; i++) {
        if('virtual_machine_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var vm_ref = vmIfList[i]["virtual-machine-interface"]["virtual_machine_refs"][0];
            if (vm_ref) {
                vmList[i]["vm_uuid"] = vm_ref["uuid"];
            }
        }
    }
    for(var i=0; i<vmIfList.length; i++) {
        if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
            var inst_ip_ref = vmIfList[i]["virtual-machine-interface"]["instance_ip_back_refs"];
            if (inst_ip_ref) {
                var inst_ip_ref_len = inst_ip_ref.length;
                for (var j = 0; j < inst_ip_ref_len; j++) {
                    var reqUrl = '/instance-ip/' + inst_ip_ref[j]['uuid'];
                    commonUtils.createReqObj(dataObjArr, reqUrl,
                                             global.HTTP_REQUEST_GET,
                                             null, null, null, appData);
                }
            }
        }
    }
    async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
            function(error, results) {
            instanceIPRefAggCb(error, results, response, vmList, appData);
            });
}

function instanceIPRefAggCb(error, instanceIPList, response, vmList, appData)
{
    var respVMList = [];
    var tmpVMObjs = {};
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(instanceIPList.length <= 0) {
        commonUtils.handleJSONResponse(error, response,
            {"virtual_machine_interface_back_refs" : vmList});
        return;
    }
    var vmListLen = vmList.length;
    for (var i = 0; i < vmListLen; i++) {
        tmpVMObjs[vmList[i]['uuid']] = vmList[i];
    }
    var instanceIPListLen = instanceIPList.length;
    for (i = 0, k = 0; i < instanceIPListLen; i++) {
        if ((null == instanceIPList[i]['instance-ip']) &&
            (null ==
             instanceIPList[i]['instance-ip']['virtual_machine_interface_refs'])) {
            continue;
        }
        var vmRefs =
            instanceIPList[i]['instance-ip']['virtual_machine_interface_refs'][0];
        if (null != tmpVMObjs[vmRefs['uuid']]) {
            respVMList[k] = {};
            respVMList[k] = commonUtils.cloneObj(tmpVMObjs[vmRefs['uuid']]);
            respVMList[k]['instance_ip_address'] =
                instanceIPList[i]['instance-ip']['instance_ip_address'];
            k++;
        }
    }
    commonUtils.handleJSONResponse(error, response,
        {'virtual_machine_interface_back_refs': respVMList});
}

/**
 * @listVMInterfacesVNRead
 * private function
 * 1. Callback for listVirtualMachineInterfaces
 * 2. Does a VN Get of all VN's for a tenant / project
 */
function listVMInterfacesVNRead (error, vnListData, response, appData) 
{
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var dataObjArr = [];
    var reqUrl     = null;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnRef     = vnListData['virtual-networks'];
    vnListLen = vnRef.length;
    for (i = 0; i < vnListLen; i++) {
       reqUrl = '/virtual-network/' + vnRef[i]['uuid'];
       commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                null, null, null, appData);
    }
        
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  listVMInterfacesAggCb(error, results, response, appData);
              });
}

/**
 * @listVirtualMachineInterfaces
 * public function
 * 1. URL /api/tenants/config/virtual-machine-interfaces/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Fetches each VN and extracts VM interfaces and sends it to client.
 */
function listVirtualMachineInterfaces (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var vnListURL     = '/virtual-networks';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId   = requestParams.query.tenant_id;
        vnListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(vnListURL, appData,
                         function(error, data) {
                         listVMInterfacesVNRead(error, data, response, appData);
                         });
}

/**
 * @updateVNRouteTargetUpdate
 * private function
 */ 
function updateVNRouteTargetUpdate (error, vnConfig, vnPostData,
                                    virtualNetworkId, response, appData) 
{
    var vnPostURL = '/virtual-network/' + virtualNetworkId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnConfig['virtual-network']['route_target_list'] = [];
    if ('route_target_list' in vnPostData['virtual-network']) {
        vnConfig['virtual-network']['route_target_list'] = 
            vnPostData['virtual-network']['route_target_list'];
    }

    configApiServer.apiPut(vnPostURL, vnConfig, appData,
    function(error, data) {
        if (error) {
        } else {
            readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
                commonUtils.handleJSONResponse(err, response, data);
            });
        }
        return;
   });
}

/**
 * @updateVNRouteTargets
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/route-targets
 * 2. Gets VN config and updates the route-target list.
 * 3. Reads updated config and sends it back to client
 */
function updateVNRouteTargets (request, response, appData) 
{
    var vnGetURL         = '/virtual-network/';
    var virtualNetworkId = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
        vnGetURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                        function(error, data) {
                        updateVNRouteTargetUpdate(error, data, vnPostData,
                                                  virtualNetworkId, response,
                                                  appData);
                        });
}

function vnGetSubnetResponseAsync (vnObj, callback)
{
    VnGetSubnetResponse(null, vnObj, function(err, data) {
        callback(err, data);
    });
}

function getAllVirtualNetworks (req, res, appData)
{
    var resultJSON = [];
    var vnObjArr = [];
    var projUUID = req.param('uuid');
    var vnURL = '/virtual-networks?detail=true&fields=' +
        'network_ipam_refs';
    var dataObjArr = [];

    if (projUUID != null) {
        vnURL += '&parent_id=' + projUUID;
    }
    commonUtils.createReqObj(dataObjArr, vnURL,
                             global.HTTP_REQUEST_GET, null, null, null,
                             appData);
    vnURL = '/virtual-networks?detail=true&fields=network_ipam_refs&' +
        'filters=is_shared==true';
    commonUtils.createReqObj(dataObjArr, vnURL,
                             global.HTTP_REQUEST_GET, null, null, null,
                             appData);

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
              function(error, results) {
        var vnConfigDetails = [];
        if ((null != results) && (null != results[0]) &&
            (null != results[0]['virtual-networks']) &&
            (results[0]['virtual-networks'].length > 0)) {
            vnConfigDetails = results[0]['virtual-networks'];
        }
        var vnConfigDetailsCnt = vnConfigDetails.length;
        var tmpVNObjs = {};
        for (var i = 0; i < vnConfigDetailsCnt; i++) {
            tmpVNObjs[vnConfigDetails[i]['virtual-network']['uuid']] =
                vnConfigDetails[i];
        }
        if ((null != results) && (null != results[1]) &&
            (null != results[1]['virtual-networks']) &&
            (results[1]['virtual-networks'].length > 0)) {
            var sharedVNData = results[1]['virtual-networks'];
            var sharedVNDataCnt = sharedVNData.length;
            for (var i = 0; i < sharedVNDataCnt; i++) {
                if (null == tmpVNObjs[sharedVNData[i]['virtual-network']['uuid']]) {
                    vnConfigDetails.push(sharedVNData[i]);
                }
            }
        }
        if (!vnConfigDetails.length) {
            commonUtils.handleJSONResponse(error, res, vnConfigDetails);
            return;
        }
        async.map(vnConfigDetails, vnGetSubnetResponseAsync, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
        });
    });
}

function getAllVirtualNetworksWFields (req, res, appData)
{
    var resultJSON = [];
    var vnObjArr = [];
    var projUUID = req.param('uuid');
    var vnURL = '/virtual-networks?detail=true&fields=' +
        'network_ipam_refs,is_shared';
    if (projUUID != null) {
        vnURL += '&parent_id=' + projUUID;
    }
    var resultJSON = [];
    var tmpVNUUIDs = {};
    configApiServer.apiGet(vnURL, appData, function(err, vnDetails) {
        if ((null != err) || (null == vnDetails) ||
            (null == vnDetails['virtual-networks'])) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var resultJSON = vnDetails['virtual-networks'];
        /*
        // We will not get VNs acroos project now
        var vnCnt = vns.length;
        var vnUUID = null;
        for (var i = 0; i < vnCnt; i++) {
            if (null != vns[i]['virtual-network']) {
                vnUUID = vns[i]['virtual-network']['uuid'];
                if ((null != vns[i]['virtual-network']['is_shared']) &&
                    (true == vns[i]['virtual-network']['is_shared']) &&
                    (null == tmpVNUUIDs[vnUUID])) {
                    resultJSON.push(vns[i]);
                    tmpVNUUIDs[vnUUID] = vnUUID;
                } else if ((null == tmpVNUUIDs[vnUUID]) &&
                           (projUUID ==
                            vns[i]['virtual-network']['parent_uuid'])) {
                    resultJSON.push(vns[i]);
                    tmpVNUUIDs[vnUUID] = vnUUID;
                }
            }
        }
        */
        if (!resultJSON.length) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        async.map(resultJSON, vnGetSubnetResponseAsync, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
        });
    });
}

function getVNListOrDetails (req, res, appData)
{
    var resultJSON = {};
    var body = req.body;
    var fields = body['fields'];

    var vnCountUrl = '/virtual-networks?count=true';
    configApiServer.apiGet(vnCountUrl, appData, function(err, vnCountData) {
        if ((null != err) || (null == vnCountData) ||
            (null == vnCountData['virtual-networks']) ||
            (null == vnCountData['virtual-networks']['count'])) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var vnCnt = vnCountData['virtual-networks']['count'];
        if (vnCnt > 1000) {
            /* If vn count is more than 8k, we will send only list, not whole
             * data
             */
            vnUrl = '/virtual-networks';
            resultJSON['isList'] = true;
        } else {
            vnUrl = '/virtual-networks?detail=true';
            resultJSON['isList'] = false;
            if (fields != null) {
                vnUrl += ',fields=' + fields.join(',');
            }
        }
        configApiServer.apiGet(vnUrl, appData, function(err, vnData) {
            resultJSON['data'] = vnData;
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    });
}


/**
 * @getVNDetails
 * public function
 * 1. URL /api/tenants/config/virtual-networks-details
 * 2. Gets list of shared virtual networks from config api server
 * 3. Can pass parent_id (tenant_id) or filters as query params.
 *
 */
function getVNDetails (req, res, appData)
{
    var tenantId      = null, filters = null;
    var requestParams = url.parse(req.url,true);
    var vnURL         = '/virtual-networks';
    var resultJSON    = [];
    var vnObjArr      = [];

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        vnURL += '?parent_id=' + tenantId.toString();
        vnURL += '&';
    } else {
        vnURL += '?';
    }

    vnURL += 'detail=true&fields=' +
             'physical_router_back_refs,floating_ip_pools,bridge_domains';

    if (requestParams.query && requestParams.query.filters) {
        filters = requestParams.query.filters;
        vnURL += '&filters=' + filters.toString();
    }

    configApiServer.apiGet(vnURL, appData,
        function(err, data) {
            if ((null != err) || (null == data)) {
                commonUtils.handleJSONResponse(err, res, data);
                return;
            }
            getBridgeDomains(data, appData, function(vnDetails){
                commonUtils.handleJSONResponse(null, res, vnDetails);
            });
    });
}

function getBridgeDomains (vnList, appData, callback)
{
    var bduuidList = [], reqURL, vnBDMap = {}, bdList, vnUUID,
        actVNList = commonUtils.getValueByJsonPath(vnList,
            "virtual-networks", [], false);
    _.each(actVNList, function(vnData){
        vnUUID = commonUtils.getValueByJsonPath(vnData,
                'virtual-network;uuid', '', false)
        bdList = commonUtils.getValueByJsonPath(vnData,
                'virtual-network;bridge_domains', [], false);
        _.each(bdList, function(bdData){
            bduuidList.push(bdData.uuid);
        });
    });
    if(!bduuidList.length) {
        callback(vnList);
        return;
    }

    reqURL= '/bridge-domains?detail=true&obj_uuids=' + bduuidList.join(',');
    configApiServer.apiGet(reqURL, appData, function(bdError, bdDetails){
        if ((null != bdError) || (null == bdDetails)) {
            callback(vnList);
            return;
        }
        _.each(bdDetails["bridge-domains"], function(bdData){
            actbdData = bdData['bridge-domain'];
            var bdKeys = _.keys(vnBDMap);
            if(_.indexOf(bdKeys, actbdData.parent_uuid) === -1) {
                vnBDMap[actbdData.parent_uuid] = [];
            }
            vnBDMap[actbdData.parent_uuid].push(actbdData);
        });
        _.each(actVNList, function(vnData){
            vnUUID = commonUtils.getValueByJsonPath(vnData,
                    'virtual-network;uuid', '', false);
            vnData["virtual-network"]["bridge_domains"] =
                vnBDMap[vnUUID]
        });
        callback({"virtual-networks" : actVNList});
    });
}
function deleteFippoolAsync (dataObj, callback)
{
    var dataObjArr = [];
    var request = dataObj['request'];
    var appData = dataObj['appData'];
    var floatingIpPoolId = dataObj['uuid'];
    var floatingIPoolURL = '/floating-ip-pool/' + floatingIpPoolId;
    configApiServer.apiGet(floatingIPoolURL, appData, function(err, data) {
        if (err || data == null) {
            callback(err,null);
            return;
        }
        if(data['floating-ip-pool']['project_back_refs'] != undefined){
            var projectBackRefs = data['floating-ip-pool']['project_back_refs'];
            for(var i=0; i<projectBackRefs.length; i++){
                var putData = {
                        'type': 'project',
                        'uuid': projectBackRefs[i]['uuid'],
                        'ref-type': 'floating-ip-pool',
                        'ref-uuid': data['floating-ip-pool']['uuid'],
                        'ref-fq-name': data['floating-ip-pool']['fq_name'],
                         'operation': 'DELETE'
                    };
                    var reqUrl = '/ref-update';
                    commonUtils.createReqObj(dataObjArr, reqUrl,
                                             global.HTTP_REQUEST_POST,
                                             commonUtils.cloneObj(putData), null,
                                             null, appData);
            }
            async.map(dataObjArr,
                    commonUtils.getServerResponseByRestApi(configApiServer, true),
                    function(error, results) {
                    if (error || results == null) {
                        callback(error,null);
                        return;
                    }
                    configApiServer.apiDelete(floatingIPoolURL, appData,
                            function(error, data) {
                                callback(null, {'error': error,
                                    'data': data});
                                return;
                    });
                    });
        }
        else{
            configApiServer.apiDelete(floatingIPoolURL, appData,
                    function(error, data) {
                        callback(null, {'error': error,
                            'data': data});
                        return;
            });
        }
    });
}
exports.listVirtualNetworks          = listVirtualNetworks;
exports.getVirtualNetwork            = getVirtualNetwork;
exports.readVirtualNetworks          = readVirtualNetworks;
exports.readVirtualNetworkAsync      = readVirtualNetworkAsync;
exports.createVirtualNetwork         = createVirtualNetwork;
exports.updateVirtualNetwork         = updateVirtualNetwork;
exports.deleteVirtualNetwork         = deleteVirtualNetwork;
exports.deleteVirtualNetworkAsync    = deleteVirtualNetworkAsync;
exports.updateVNSubnetDelete         = updateVNSubnetDelete;
exports.updateVNFipPoolAdd           = updateVNFipPoolAdd;
exports.updateVNFipPoolDelete        = updateVNFipPoolDelete;
exports.updateVNFipPoolUpdate        = updateVNFipPoolUpdate;
exports.updateVNNetPolicies          = updateVNNetPolicies;
exports.listVirtualMachineInterfaces = listVirtualMachineInterfaces;
exports.updateVNRouteTargets         = updateVNRouteTargets;
exports.getSharedVirtualNetworks     = getSharedVirtualNetworks;
exports.getExternalVirtualNetworks   = getExternalVirtualNetworks;
exports.getPagedVirtualNetworks      = getPagedVirtualNetworks;
exports.getAllVirtualNetworksWFields = getAllVirtualNetworksWFields;
exports.fipPoolDelete                = fipPoolDelete;
exports.getVirtualNetworkCb          = getVirtualNetworkCb;
exports.getVNListOrDetails           = getVNListOrDetails;
exports.getAllVirtualNetworks        = getAllVirtualNetworks;
exports.getVNDetails                 = getVNDetails;
exports.createVirtualNetworkCB       = createVirtualNetworkCB;
exports.updateVirtualNetworkCB       = updateVirtualNetworkCB;
exports.deleteFippoolAsync           = deleteFippoolAsync;