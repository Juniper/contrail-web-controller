/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
  async = require('async'),
  logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  config = require(process.mainModule.exports["corePath"] + '/config/config.global.js'),
  global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
  appErrors = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/errors/app.errors'),
  util = require('util'),
  ctrlGlobal = require('../../../../common/api/global'),
  jsonPath = require('JSONPath').eval,
  nwMonUtils = require('../../../../common/api/nwMon.utils'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api'),
  queries = require(process.mainModule.exports["corePath"] +
                    '/src/serverroot/common/queries.api');

/* Function: getUnderlayTopology
 *  Get the Underlay Topology
 */
function getUnderlayTopology (req, res, appData)
{
    var prouter = req.param('prouter');
    var key = ctrlGlobal.STR_GET_UNDERLAY_TOPOLOGY;

    var url = '/analytics/uves/prouter';
    var forceRefresh = req.param('forceRefresh');

    if (null == forceRefresh) {
        forceRefresh = false;
    } else {
        forceRefresh = true;
    }

    var jobData = {
        'prouter': prouter
    };

    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE, key,
                                             url, 0, 0, 0,
                                             ctrlGlobal.UNDERLAY_TOPO_JOB_REFRESH_TIME,
                                             forceRefresh, jobData);

}

function getUnderlayPathByNodelist (topoData, appData, callback)
{
    var endpoints = [];
    buildPhysicalTopology(null, appData, function(err, topology) {
        var nodeCnt = topoData['nodes'].length;
        var links = topology['links'];
        var linksCnt = links.length;
        var tempLinksObj = {};
        for (var i = 0; i < linksCnt; i++) {
            tempLinksObj[links[i]['endpoints'][0] + ":" +
                links[i]['endpoints'][1]] = true;
            tempLinksObj[links[i]['endpoints'][1] + ":" +
                links[i]['endpoints'][0]] = true;
        }
        for (var i = 0; i < nodeCnt - 1; i++) {
            for (var j = nodeCnt - 1; j >= 1; j--) {
                var link1 = topoData['nodes'][i]['name'] + ":" +
                    topoData['nodes'][j]['name'];
                var link2 = topoData['nodes'][j]['name'] + ":" +
                    topoData['nodes'][i]['name'];
                if ((null != tempLinksObj[link1]) ||
                    (null != tempLinksObj[link2])) {
                    endpoints.push({"endpoints": [topoData['nodes'][i]['name'],
                        topoData['nodes'][j]['name']]});
                }
            }
        }
        /* Get the VM data as well */

        callback(null, endpoints);
    });
}

function getvRouterByIntfIP (intfIp, vmUVE)
{
    var intfList = null;
    var intfListCnt = 0;
    if ((null == vmUVE) || (null == vmUVE['value'])) {
        return null;
    }
    var vmUVE = vmUVE['value'];
    var vmCnt = vmUVE.length;
    for (var i = 0; i < vmCnt; i++) {
        try {
            intfList =
                vmUVE[i]['value']['UveVirtualMachineAgent']['interface_list'];
            intfListCnt = intfList.length;
        } catch(e) {
            intfListCnt = 0;
        }
        for (var j = 0; j < intfListCnt; j++) {
            if (intfList[j]['ip_address'] == intfIp) {
                return {'vrouter':
                    vmUVE[i]['value']['UveVirtualMachineAgent']['vrouter'],
                        'vm_name': intfList[j]['vm_name'],
                        'vm_uuid': vmUVE[i]['name']};
            }
        }
    }
    return null;
}

function getUnderlayPath (req, res, appData)
{
    var dataObjArr = [];
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var body = req.body;
    var data = body['data'];
    var tempFlowIpObjs = {};
    var srcIP = data['srcIP'];
    var destIP = data['destIP'];
    var nodeName = null;

    var queryJSON = queries.buildUnderlayQuery(data);

    queries.executeQueryString(queryJSON, function(err, result) {
        if ((null != err) || (null == result) ||
            (null == result['value']) || (!result['value'].length)) {
            commonUtils.handleJSONResponse(err, res, topoData);
            return;
        }
        var flowPostData = {};
        flowPostData['cfilt'] = ['PRouterEntry:ipMib'];
        var url = '/analytics/uves/prouter';
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 flowPostData, null, null, null);
        url = '/analytics/uves/virtual-machine';
        var vmPostData = {};
        vmPostData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
            'UveVirtualMachineAgent:vrouter'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vmPostData, null, null, null);
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(opApiServer, true),
                  function(err, results) {
            var ipPrTable = getIPToProuterMapTable(results[0]);

            var srcVrouter = getvRouterByIntfIP(srcIP, results[1]);
            var destVrouter = getvRouterByIntfIP(destIP, results[1]);
            result = result['value'];
            var nodeCnt = result.length;
            for (var i = 0; i < nodeCnt; i++) {
                var endPt1 = getNodeNameByPVData(result[i]['u_prouter'],
                                                  ipPrTable, results[1]);
                if (null == endPt1) {
                    nodeName = result[i]['u_prouter'];
                } else {
                    nodeName = endPt1['nodeName'];
                }
                topoData['nodes'].push({"name": nodeName,
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_PROUTER});
            }
            if (null != srcVrouter) {
                topoData['nodes'].push({"name": srcVrouter['vrouter'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            }
            if (null != destVrouter) {
                topoData['nodes'].push({"name": destVrouter['vrouter'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            }
            getUnderlayPathByNodelist(topoData, appData, function(err, endpoints) {
                topoData['nodes'].push({"name": srcVrouter['vm_uuid'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['nodes'].push({"name": destVrouter['vm_uuid'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['links'] = endpoints;
                topoData['links'].push({'endpoints': [srcVrouter['vm_uuid'], 
                                       srcVrouter['vrouter']]});
                topoData['links'].push({'endpoints': [destVrouter['vm_uuid'], 
                                       destVrouter['vrouter']]});
                commonUtils.handleJSONResponse(err, res, topoData);
            });
        });
    });
}

function getIfEntryByIfName (ifName, pRouterData)
{
    var ifDataObj = {};
    try {
        var ifData =
            pRouterData['value']['PRouterEntry']['ifTable'];
    } catch(e) {
        ifData = null;
    }
    try {
        var ifXData =
            pRouterData['value']['PRouterEntry']['ifXTable'];
    } catch(e) {
        ifXData = null;
    }
    if ((null == ifData) && (null == ifXData)) {
        return null;
    }
    try {
        var ifCnt = ifData.length;
    } catch(e) {
        ifCnt = 0;
    }
    try {
        var ifXCnt = ifXData.length;
    } catch(e) {
        ifXCnt = 0;
    }
    for (var i = 0; i < ifCnt; i++) {
        if (ifData[i]['ifDescr'] == ifName) {
            ifDataObj['ifEntry'] = ifData[i];
            break;
        }
    }
    if (i != ifCnt) {
        if (ifXData[i]['ifName'] == ifName) {
            /* Usually the index will be same, so try first if we get the
             * indexed ifXEntry as with ifEntry
             */
            ifDataObj['ifXEntry'] = ifXData[i];
            return ifDataObj;
        }
    }
    /* Index did not match same ifName in ifTable and ifXTable */
    for (var i = 0; i < ifXCnt; i++) {
        if (ifXData[i]['ifName'] == ifName) {
            ifDataObj['ifXEntry'] = ifXData[i];
            return ifDataObj;
        }
    }
    return null;
}

/* Function: getIfStatsDataByvRouter
   Get the ifStats data from vRouter phy_if_stats_list using vRouter hostname
   for a specific interface
 */
function getIfStatsDataByvRouter (nodeName, ifName, vrouterData)
{
    if ((null == vrouterData) || (null == vrouterData['value']) ||
        (!vrouterData['value'].length)) {
        return null;
    }
    var len = vrouterData['value'].length;
    for (var i = 0; i < len; i++) {
        if (vrouterData['value'][i]['name'] == nodeName) {
            break;
        }
    }
    if (i == len) {
        return null;
    }
    try {
        var statsData =
            vrouterData['value'][i]['value']['VrouterStatsAgent']['phy_if_stats_list'];
        var statsLen = statsData.length;
    } catch(e) {
        statsLen = 0;
    }
    for (var j = 0; j < statsLen; j++) {
        if (ifName == statsData[j]['name']) {
            return statsData[j];
        }
    }
    return null;
}

/* Function: getIfStatsDataByvRouter
   Get the ifStats data from vRouter phy_if_stats_list using vRouter hostname
   for a specific interface
 */
function getIfStatsDataByvRouter (nodeName, ifName, vrouterData)
{
    if ((null == vrouterData) || (null == vrouterData['value']) ||
        (!vrouterData['value'].length)) {
        return null;
    }
    var len = vrouterData['value'].length;
    for (var i = 0; i < len; i++) {
        if (vrouterData['value'][i]['name'] == nodeName) {
            break;
        }
    }
    if (i == len) {
        return null;
    }
    try {
        var statsData =
            vrouterData['value'][i]['value']['VrouterStatsAgent']['phy_if_stats_list'];
        var statsLen = statsData.length;
    } catch(e) {
        statsLen = 0;
    }
    for (var j = 0; j < statsLen; j++) {
        if (ifName == statsData[j]['name']) {
            return statsData[j];
        }
    }
    return null;
}

/* Function: fillNodeIfStats
   Get the ifStats for nodes node1 and node2 using prouter and uve data
 */
function fillNodeIfStats (node1, node2, pRouterData, vrouterData)
{
    var resultJSON = {};
    var ifTable = [];
    var pData = pRouterData['value'];
    var pDataLen = pData.length;
    var node1FoundIndex = -1;
    var node2FoundIndex = -1;
    for (var i = 0; i < pDataLen; i++) {
        if (node1 == pData[i]['name']) {
            node1FoundIndex = i;
        }
        if (node2 == pData[i]['name']) {
            node2FoundIndex = i;
        }
    }
    resultJSON['node0'] = {};
    resultJSON['node0']['node_name'] = node1;
    resultJSON['node0']['if_stats'] = [];
    resultJSON['node1'] = {};
    resultJSON['node1']['node_name'] = node2;
    resultJSON['node1']['if_stats'] = [];
    if ((-1 == node1FoundIndex) &&
        (-1 == node2FoundIndex)) {
        return resultJSON;
    }
    var ifEntry = {};
    if (-1 == node1FoundIndex) {
        var temp = node1FoundIndex;
        node1FoundIndex = node2FoundIndex;
        node2FoundIndex = temp;
        temp = node1;
        node1 = node2;
        node2 = temp;
    }
    resultJSON['node0']['node_name'] = node1;
    resultJSON['node1']['node_name'] = node2;
    var links = pData[node1FoundIndex]['value']['PRouterLinkEntry']['link_table'];
    var linkCnt = links.length;
    var index = 0;
    for (var j = 0; j < linkCnt; j++) {
        if (node2 == links[j]['remote_system_name']) {
            if (null == resultJSON['node0']['if_stats'][index]) {
                resultJSON['node0']['if_stats'][index] = {};
            }
            if (null == resultJSON['node1']['if_stats'][index]) {
                resultJSON['node1']['if_stats'][index] = {};
            }
            resultJSON['node0']['if_stats'][index]['if_name'] =
                links[j]['local_interface_name'];
            resultJSON['node0']['if_stats'][index]['if_index'] =
                links[j]['local_interface_index'];
            var ifEntry = null;
            if (-1 != node1FoundIndex) {
                ifEntry = getIfEntryByIfName(links[j]['local_interface_name'],
                                             pData[node1FoundIndex]);
            }
            if (null != ifEntry) {
                if (null != ifEntry['ifEntry']) {
                    resultJSON['node0']['if_stats'][index]['ifEntry'] =
                        commonUtils.cloneObj(ifEntry['ifEntry']);
                }
                if (null != ifEntry['ifXEntry']) {
                    resultJSON['node0']['if_stats'][index]['ifXEntry'] =
                        commonUtils.cloneObj(ifEntry['ifXEntry']);
                }
                resultJSON['node0']['node_type'] = ctrlGlobal.NODE_TYPE_PROUTER;
            } else {
                ifEntry =
                    getIfStatsDataByvRouter(resultJSON['node0']['node_name'],
                                            resultJSON['node0']['if_stats'][index]['if_name'],
                                            vrouterData);
                if (null != ifEntry) {
                    resultJSON['node0']['node_type'] =
                        ctrlGlobal.NODE_TYPE_VROUTER;
                } else {
                    resultJSON['node0']['node_type'] =
                        global.NODE_TYPE_NONE;
                }
                resultJSON['node0']['if_stats'][index]['ifEntry'] = ifEntry;
            }
            resultJSON['node1']['if_stats'][index]['if_name'] =
                links[j]['remote_interface_name'];
            resultJSON['node1']['if_stats'][index]['if_index'] =
                links[j]['remote_interface_index'];
            ifEntry = null;
            if (-1 != node2FoundIndex) {
                ifEntry = getIfEntryByIfName(links[j]['remote_interface_name'],
                                             pData[node2FoundIndex]);
            }
            if (null != ifEntry) {
                if (null != ifEntry['ifEntry']) {
                    resultJSON['node1']['if_stats'][index]['ifEntry'] =
                        commonUtils.cloneObj(ifEntry['ifEntry']);
                }
                if (null != ifEntry['ifXEntry']) {
                    resultJSON['node1']['if_stats'][index]['ifXEntry'] =
                        commonUtils.cloneObj(ifEntry['ifXEntry']);
                }
                resultJSON['node1']['node_type'] = ctrlGlobal.NODE_TYPE_PROUTER;
            } else {
                ifEntry =
                    getIfStatsDataByvRouter(resultJSON['node1']['node_name'],
                                            resultJSON['node1']['if_stats'][index]['if_name'],
                                            vrouterData);
                if (null != ifEntry) {
                    resultJSON['node1']['node_type'] =
                        ctrlGlobal.NODE_TYPE_VROUTER;
                } else {
                    resultJSON['node1']['node_type'] =
                        global.NODE_TYPE_NONE;
                }
                resultJSON['node1']['if_stats'][index]['ifEntry'] = ifEntry;
            }
            index++;
        }
    }
    return resultJSON;
}

/* Function: getUnderlayStats
   Get the underlay stats between two nodes.
   If one node is prouter, then get the stats from ifTable
   If vrouter, then get from vRouter UVE, VrouterStatsAgent:phy_if_stats_list
 */
function getUnderlayStats (req, res, appData)
{
    var resultJSON = {};
    var dataObjArr = [];
    var node1, node2;
    var postData = req.body;
    if ((null == postData) || (null == postData['data'])) {
        var err = new appErrors.RESTServerError('postData not found');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    try {
        var endPts = postData['data']['endpoints'];
        node1 = endPts[0];
        node2 = endPts[1];
    } catch(e) {
        node1 = null;
        node2 = null;
    }
    
    if ((null == node1) || (null == node2)) {
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    var url = '/analytics/uves/prouter';
    var prPostData = {};
    var vrPostData = {};
    prPostData['kfilt'] = [node1, node2];
    prPostData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable',
        'PRouterEntry:ifXTable'];
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             prPostData, null, null, null);
    vrPostData['kfilt'] = [node1, node2];
    vrPostData['cfilt'] = ['VrouterStatsAgent:phy_if_stats_list'];
    url = '/analytics/uves/vrouter';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             vrPostData, null, null, null);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if ((null != err) || (null == results)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var pData = results[0];
        var vrData = results[1];
        if ((null != err) || (null == pData) || (null == pData['value']) ||
            (!pData['value'].length)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var resultJSON = fillNodeIfStats(node1, node2, pData, vrData);
        commonUtils.handleJSONResponse(null, res, resultJSON);
        return;
    });
}

/* Function: getNodeNameByPVData
   Get the node hostname from pRouter and vRouter UVE using node ip
   First is checked in pRouter UVE, if not found, then check for vRouter UVE.
 */
function getNodeNameByPVData (hop, ipPrTable, vrouterData)
{
    var nodeObj = {};
    var vrCnt = 0;
    nodeObj['nodeName'] = null;
    nodeObj['nodeType'] = null;

    for (key in ipPrTable) {
        if (hop == key) {
            return {'nodeName': ipPrTable[key],
                    'nodeType': ctrlGlobal.NODE_TYPE_PROUTER};
        }
    }
    try {
        vrCnt = vrouterData['value'].length;
    } catch(e) {
        vrCnt = 0;
    }
    for (var i = 0; i < vrCnt; i++) {
        try {
            var ipList =
                vrouterData['value'][i]['value']['VrouterAgent']['self_ip_list'];
            var ipLen = ipList.length;
        } catch(e) {
            ipLen = 0;
        }
        for (var j = 0; j < ipLen; j++) {
            if (ipList[j] == hop) {
                return {'nodeName': vrouterData['value'][i]['name'],
                        'nodeType': ctrlGlobal.NODE_TYPE_VROUTER};
            }
        }
    }
    return nodeObj;
}

function getIPToProuterMapTable (prouterData)
{
    var ipPrTable = {};
    var prCnt = prouterData['value'].length;
    for (var i = 0; i < prCnt; i++) {
        try {
            var prData = prouterData['value'][i]['value'];
            var ipTable = prData['PRouterEntry']['ipMib'];
            var ipCnt = ipTable.length;
        } catch(e) {
            ipCnt = 0;
        }
        for (var idx = 0; idx < ipCnt; idx++) {
            ipPrTable[ipTable[idx]['ipAdEntIfIndex']] =
                prouterData['value'][i]['name'];
        }
    }
    return ipPrTable;
}

function getTraceFlowByReqURL (urlLists, srcIP, destIP, callback)
{
    var topoData = {};
    var dataObjArr = [];
    async.map(urlLists, commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                              false),
              function(err, results) {
        if ((null != err) || (null == results)) {
            callback(err, null);
            return;
        }
        var errResp = jsonPath(results[0], "$..error_response[0]");
        if ((null != errResp) && (errResp.length > 0)) {
            var err = appErrors.RESTServerError(errResp[0]['_']);
            callback(err, errResp[0]['_']);
            return;
        }
        var hopList = jsonPath(results, "$..hop[0]");
        url = '/analytics/uves/prouter';
        var prPostData = {};
        prPostData['cfilt'] = ['PRouterEntry:ipMib'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 prPostData, null, null, null);
        url = '/analytics/uves/vrouter';
        var vrPostData = {};
        vrPostData['cfilt'] = ['VrouterAgent:self_ip_list'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vrPostData, null, null, null);
        var vmPostData = {};
        url = '/analytics/uves/virtual-machine';
        vmPostData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
            'UveVirtualMachineAgent:vrouter'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vmPostData, null, null, null);
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(opApiServer, true),
                  function(err, results) {
            var hopCnt = hopList.length;
            topoData['nodes'] = [];
            var ipPrTable = getIPToProuterMapTable(results[0]);
            for (var i = 0; i < hopCnt; i++) {
                var nodeObj = getNodeNameByPVData(hopList[i]['_'], ipPrTable,
                                                  results[1]);
                var nodeName = nodeObj['nodeName'];
                var nodeType = nodeObj['nodeType'];
                if (null != nodeName) {
                    topoData['nodes'].push({'name': nodeName,
                                           'node_type': nodeType})
                } else {
                    topoData['nodes'].push({'name': hopList[i]['_'],
                                           'node_type':
                                           ctrlGlobal.NODE_TYPE_NONE});
                }
            }
            topoData['links'] = [];
            var nodeCnt = topoData['nodes'].length;
            for (var i = 0; i < nodeCnt - 1; i++) {
                topoData['links'].push({'endpoints': [topoData['nodes'][i]['name'],
                                          topoData['nodes'][i + 1]['name']]});
            }
            var srcVrouter = getvRouterByIntfIP(srcIP, results[2]);
            var destVrouter = getvRouterByIntfIP(destIP, results[2]);
            if (null != srcVrouter) {
                topoData['nodes'].push({"name": srcVrouter['vm_uuid'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['links'].push({'endpoints': [srcVrouter['vm_uuid'],
                                       srcVrouter['vrouter']]});
            }
            if (null != destVrouter) {
                topoData['nodes'].push({"name": destVrouter['vm_uuid'],
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['links'].push({'endpoints': [destVrouter['vm_uuid'],
                                       destVrouter['vrouter']]});
            }
            callback(null, topoData);
        });
    });

}

/* Function: getTraceFlow
 *  Build the path thorugh which the trace route response came
 */
function getTraceFlow (req, res, appData)
{
    /* Dummy data, once backend implementation is done,
       then we will remove this dummy data
     */
    var data = req.body;
    var introData = data['data'];
    var nodeIP = introData['nodeIP'];
    var srcIP = introData['srcIP'];
    var destIP = introData['destIP'];
    var srcPort = introData['srcPort'];
    var destPort = introData['destPort'];
    var protocol = introData['protocol'];
    var vrfName = introData['vrfName'];
    var vrfId = introData['vrfId'];
    var maxHops = introData['maxHops'];
    var maxAttempts = introData['maxAttempts'];
    var interval = introData['interval'];
    var url = '/Snh_TraceRouteReq?source_ip=' + srcIP + '&source_port=' +
        srcPort + '&dest_ip=' + destIP + '&dest_port=' + destPort +
        '&protocol=' + protocol;
    var urlExtd = '&max_hops=';
    if (null != maxHops) {
        urlExtd += maxHops;
    }
    urlExtd += '&max_attempts=';
    if (null != maxAttempts) {
        urlExtd += maxAttempts;
    }
    urlExtd += '&interval=';
    if (null != interval) {
        urlExtd += interval;
    }
    var urlLists = [];
    var vrfUrl = '/Snh_VrfListReq?name=';
    urlLists[0] = nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' + vrfUrl;
    if (null == vrfName) {
        async.map(urlLists, 
                  commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                        false),
                  function(err, results) {
            try {
                var vrfList = jsonPath(results, "$..VrfSandeshData")[0];
                var vrfListLen = vrfList.length;
            } catch(e) {
                vrfListLen = 0;
            }
            for (var i = 0; i < vrfListLen; i++) {
                try {
                    if (vrfList[i]['l2index'][0]['_'] == vrfId) {
                        vrfName = vrfList[i]['name'][0]['_'];
                        url += '&vrf_name=' + vrfName + urlExtd;
                        break;
                    }
                } catch(e) {
                }
            }
            if (i == vrfListLen) {
                var errStr = "VRF index does not exist."
                var err = appErrors.RESTServerError(errStr)
                commonUtils.handleJSONResponse(err, res, errStr);
                return;
            }
            urlLists[0] = nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@'
                + url;
            getTraceFlowByReqURL(urlLists, srcIP, destIP, function(err, results) {
                commonUtils.handleJSONResponse(err, res, results);
            });
        });
    } else {
        url += '&vrf_name=' + vrfName;
        urlLists[0] = nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@'
            + url + urlExtd;
        getTraceFlowByReqURL(urlLists, srcIP, destIP, function(err, results) {
            commonUtils.handleJSONResponse(err, res, results);
        });
    }
}

function getIfStatsBypRouterLink (dataObj, callback)
{
    var prouter1 = dataObj['prouter1'];
    var prouter2 = dataObj['prouter2'];
    var prouter1_ifidx = dataObj['prouter1_ifidx'];
    var prouter2_ifidx = dataObj['prouter2_ifidx'];
    var dataObjArr = [];
    var resultJSON = {};
    var timeGran;
    var timeObj = {};
    if (dataObj['more_attributes']['minsSince']!= null) {
        timeObj = queries.createTimeQueryJsonObj(dataObj['more_attributes']['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            dataObj['more_attributes']['sampleCnt']);
    } else {
        timeGran = dataObj['more_attributes']['timeGran'];
    }

    var timeObj = queries.createTimeQueryJsonObjByAppData(dataObj['more_attributes']);
    var queryJSON1 = 
        commonUtils.cloneObj(ctrlGlobal.QUERY_JSON['StatTable.PRouterEntry.ifStats']);
    queryJSON1['where'][0][0]['value'] = prouter1;
    queryJSON1['where'][0][0]['suffix']['value'] = prouter1_ifidx;
    var queryJSON2 = 
        commonUtils.cloneObj(ctrlGlobal.QUERY_JSON['StatTable.PRouterEntry.ifStats']);
    queryJSON2['where'][0][0]['value'] = prouter2;
    queryJSON2['where'][0][0]['suffix']['value'] = prouter2_ifidx;
    queryJSON1['start_time'] = timeObj['start_time'];
    queryJSON2['start_time'] = timeObj['start_time'];
    queryJSON1['end_time'] = timeObj['end_time'];
    queryJSON2['end_time'] = timeObj['end_time'];
    var timeGranStr = "T=" + timeGran;
    queryJSON1['select_fields'].push(timeGranStr);
    queryJSON2['select_fields'].push(timeGranStr);
    var url = '/analytics/query';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             queryJSON1, null, null, null);
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             queryJSON2, null, null, null);
    logutils.logger.debug("Executing pRouter Stats Query1:", 
                          JSON.stringify(queryJSON1) + "at:" + new Date());
    logutils.logger.debug("Executing pRouter Stats Query2:", 
                          JSON.stringify(queryJSON2) + "at:" + new Date());
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        logutils.logger.debug("pRouter Stats Query completed at:" + new Date());
        var pr1LinkStatData = results[0]['value'];
        var pr2LinkStatData = results[1]['value'];
        var pr1LinkStatDataLen = pr1LinkStatData.length;
        var pr2LinkStatDataLen = pr2LinkStatData.length;
        var tempPR1DataObj = {};
        var tempPR2DataObj = {};
        var len = 2;
        var summaryData = [];
        var resultJSON = [];
        for (var i = 0; i < len; i++) {
            summaryData[i] = {}
            resultJSON[i] = {};
            summaryData[i]['start_time'] = timeObj['start_time'];
            summaryData[i]['end_time'] = timeObj['end_time'];
            summaryData[i]['timeGran_microsecs'] = timeGran * 1000;
        }
        summaryData[0]['name'] = dataObj['prouter1'];
        summaryData[1]['name'] = dataObj['prouter2'];
        summaryData[0]['if_name'] = dataObj['prouter1_ifname'];
        summaryData[1]['if_name'] = dataObj['prouter2_ifname'];
        summaryData[0]['if_index'] = dataObj['prouter1_ifidx'];
        summaryData[1]['if_index'] = dataObj['prouter2_ifidx'];
        resultJSON[0]['summary'] = summaryData[0];
        resultJSON[1]['summary'] = summaryData[1];
        resultJSON[0]['flow-series'] = results[0];
        resultJSON[1]['flow-series'] = results[1];
        callback(null, resultJSON);
    })
}

function buildpRouterLinkAndGetStats (prObj, callback)
{
    var prLinkData = prObj['prLinkData'];
    var uiData = prObj['appData'];
    var prouterList = uiData['data']['endpoints']
    var prouter1 = prouterList[0];
    var prouter2 = prouterList[1];
    var dataObjArr = [];
    var links = prLinkData['links'];
    var linksCnt = links.length;
    for (var i = 0; i < linksCnt; i++) {
        if (((prouter1 == links[i]['endpoints'][0]) &&
            (prouter2 == links[i]['endpoints'][1])) ||
            ((prouter1 == links[i]['endpoints'][1]) &&
             (prouter2 == links[i]['endpoints'][0]))) {
            break;
        }
    }
    if (i == linksCnt) {
        /* We have not got any link, strange??? */
        callback(null, null);
        return;
    }
    var endPts = links[i]['endpoints'];
    var intfCnt = links[i]['more_attributes'].length;
    for (var j = 0; j < intfCnt; j++) {
        dataObjArr.push({'prouter1': endPts[0], 'prouter2':
                        endPts[1], 'prouter1_ifidx':
                        links[i]['more_attributes'][j]['local_interface_index'],
                        'prouter2_ifidx':
                        links[i]['more_attributes'][j]['remote_interface_index'],
                        'prouter1_ifname':
                        links[i]['more_attributes'][j]['local_interface_name'],
                        'prouter2_ifname':
                        links[i]['more_attributes'][j]['remote_interface_name'],
                        'more_attributes': uiData['data']});
    }
    async.map(dataObjArr, getIfStatsBypRouterLink,
              function(err, results) {
        callback(null, results);
    });
}

function getpRouterLinkStats (req, res, appData)
{
    var body = req.body;
    var prouterList = body['data']['endpoints']
    var prouter1 = prouterList[0];
    var prouter2 = prouterList[1];
    var dataObjArr = [];

    buildPhysicalTopology(prouter1, appData, function(err, data) {
        if ((null != err) || (null == data) || (!data['links'].length)) {
            buildPhysicalTopology(prouter2, appData, function(err, data) {
                if ((null != err) || (null == data) ||
                    (!data['nodes'].length)) {
                    commonUtils.handleJSONResponse(null, res, null);
                    return;
                }
                buildpRouterLinkAndGetStats({'prLinkData': data,
                                            'appData': body},
                                            function(err, results) {
                    commonUtils.handleJSONResponse(err, res, results);
                    return;
                });
            });
        } else {
            buildpRouterLinkAndGetStats({'prLinkData': data,
                                        'appData': body},
                                        function(err, results) {
                commonUtils.handleJSONResponse(err, res, results);
            });
        }
    });
}

exports.getUnderlayPath = getUnderlayPath;
exports.getUnderlayTopology = getUnderlayTopology;
exports.getUnderlayStats = getUnderlayStats;
exports.getTraceFlow = getTraceFlow;
exports.getpRouterLinkStats = getpRouterLinkStats;

