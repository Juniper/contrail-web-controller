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

    buildPhysicalTopology(prouter, appData, function(err, links) {
        commonUtils.handleJSONResponse(err, res, links); 
    });
}

function isvRouterLink (linkData)
{
    var linkCnt = linkData.length;
    for (var i = 0; i < linkCnt; i++) {
        if (ctrlGlobal.NODE_TYPE_VROUTER ==
            getpRouterLinkType(linkData[i]['type'])) {
            return true;
        }
    }
    return false;
}

function getNodeChassisType (nodeName, nodeType, prouterLinkData)
{
    var data = commonUtils.cloneObj(prouterLinkData);
    var prouterData = data['value'];
    var prouterCnt = prouterData.length;
    if (ctrlGlobal.NODE_TYPE_VROUTER == nodeType) {
        return ctrlGlobal.NODE_CHASSIS_TYPE_NONE;
    }
    for (var i = 0; i < prouterCnt; i++) {
        if (nodeName == prouterData[i]['name']) {
            break;
        }
    }
    if (i == prouterCnt) {
        /* We did not find the data */
        return ctrlGlobal.NODE_CHASSIS_TYPE_CORE;
    }
    try {
        var links = prouterData[i]['value']['PRouterLinkEntry']['link_table'];
    } catch(e) {
        /* We did not get any link info */
        return ctrlGlobal.NODE_CHASSIS_TYPE_CORE;
    }
    var linksCnt = links.length;
    for (var i = 0; i < linksCnt; i++) {
        if (ctrlGlobal.NODE_TYPE_VROUTER == getpRouterLinkType(links[i]['type'])) {
            return ctrlGlobal.NODE_CHASSIS_TYPE_TOR;
        } else {
            /* Type prouter */
            linkDataLen = prouterData.length;
            for (var j = 0; j < linkDataLen; j++) {
                if (links[i]['remote_system_name'] == prouterData[j]['name']) {
                    break;
                }
            }
            if (j == linkDataLen) {
                /* pRouters's link is not known */
                return ctrlGlobal.NODE_CHASSIS_TYPE_CORE;
            }
            var isLinkvRouter =
                isvRouterLink(prouterData[j]['value']['PRouterLinkEntry']['link_table']);
            if (true == isLinkvRouter) {
                return ctrlGlobal.NODE_CHASSIS_TYPE_SPINE;
            }
        }
    }
    return ctrlGlobal.NODE_CHASSIS_TYPE_CORE;
}

function buildNodeChassisType (nodes, prouterLinkData)
{
    var nodeCnt = nodes.length;
    for (var i = 0; i < nodeCnt; i++) {
        var nodeChassType = getNodeChassisType(nodes[i]['name'],
                                               nodes[i]['node_type'],
                                               prouterLinkData);
        nodes[i]['chassis_type'] = nodeChassType; 
    }
    return nodes;
}

function getpRouterLinkType (linkType)
{
    if (2 == linkType) {
        return ctrlGlobal.NODE_TYPE_VROUTER;
    } else if (1 == linkType) {
        return ctrlGlobal.NODE_TYPE_PROUTER;
    } else {
        return ctrlGlobal.NODE_TYPE_NONE;
    }
}

function createNodeObj (node, nodeType, prouterEntry)
{
    var nodeObj = {};
    try {
        lldpNode =
            prouterEntry['value']['PRouterEntry']['lldpTable']['lldpLocalSystemData'];
    } catch(e) {
        lldpNode = null;
    }
    nodeObj = ({
        "name": node,
        "node_type": nodeType,
        "more_attr": {
            "lldpLocManAddr": 
                ((null != lldpNode) && 
                 (null != lldpNode['lldpLocManAddrEntry'])) ?
                lldpNode['lldpLocManAddrEntry']['lldpLocManAddr'] : '-',
            "lldpLocSysDesc": 
                (null != lldpNode) ?
                lldpNode['lldpLocSysDesc'] : '-',
            "lldpLocSysName": 
                (null != lldpNode) ?
                lldpNode['lldpLocSysName'] : '-',
            "ifTable": ((null != prouterEntry) && 
                        (null != prouterEntry['value']) && 
                        (null != prouterEntry['value']['PRouterEntry'])) ?
                prouterEntry['value']['PRouterEntry']['ifTable'] : '-'
        }
    });
    return nodeObj;
}

function getPRouterEntryByName (prouterName, prouterData)
{
    var prLen = prouterData.length;
    for (var i = 0; i < prLen; i++) {
        if (prouterName == prouterData[i]['name']) {
            return prouterData[i];
        }
    }
    return null;
}

function buildPhysicalTopologyByPRouter (prouter, pRouterData)
{
   data = pRouterData['value'];
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tempNodeObjs = {};
    var tempLinkObjs = {};
    var prouterCnt = data.length;
    for (var i = 0; i < prouterCnt; i++) {
        if ((null != data[i]['name']) &&
            (null == tempNodeObjs[data[i]['name']]) &&
            (prouter == data[i]['name'])) {
            break;
        }
    }
    if (i == prouterCnt) {
        return topoData;
    }
    nodeObj = createNodeObj(data[i]['name'], ctrlGlobal.NODE_TYPE_PROUTER,
                            data[i]);
    topoData['nodes'].push(nodeObj);
    tempNodeObjs[data[i]['name']] = data[i]['name'];
    try {
        var pRouterLinkTable =
            data[i]['value']['PRouterLinkEntry']['link_table'];
    } catch(e) {
        logutils.logger.error("pRouterLinkEntry Parse error : " + e);
        return topoData;
    }
    linkCnt = pRouterLinkTable.length;
    for (var j = 0; j < linkCnt; j++) {
        if (null == tempNodeObjs[pRouterLinkTable[j]['remote_system_name']]) {
            nodeObj =
                createNodeObj(pRouterLinkTable[j]['remote_system_name'], 
                              getpRouterLinkType(pRouterLinkTable[j]['type']),
                              getPRouterEntryByName(pRouterLinkTable[j]['remote_system_name'],
                                                    data));
            topoData['nodes'].push(nodeObj);
            tempNodeObjs[pRouterLinkTable[j]['remote_system_name']] =
                pRouterLinkTable[j]['remote_system_name'];
        }
        linkName1 = data[i]['name'] + ":" +
            pRouterLinkTable[j]['remote_system_name'];
        linkName2 = pRouterLinkTable[j]['remote_system_name'] + ":" +
            data[i]['name'];
        if ((null == tempLinkObjs[linkName1]) &&
            (null == tempLinkObjs[linkName2])) {
            topoData['links'].push({"endpoints": [data[i]['name'],
                                   pRouterLinkTable[j]['remote_system_name']],
                                   "more_attributes": pRouterLinkTable[j]});
            tempLinkObjs[linkName1] = linkName1;
            tempLinkObjs[linkName2] = linkName2;
        }
    }
    topoData['nodes'] = buildNodeChassisType(topoData['nodes'], pRouterData);
    return topoData;
}

function getPhysicalTopologyByPRouter (prouter, appData, pRouterData, callback)
{
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tempNodeObjs = {};
    var tempLinkObjs = {};
    var postData = {};
    var tempNodeObjs = {};
    var data = null;
    var links = null;
    var linksCnt = 0;

    try {
        data = pRouterData['value'];
        links = data[0]['value']['PRouterLinkEntry']['link_table'];
        linksCnt = links.length;
    } catch(e) {
        data = null;
        links = null;
        linksCnt = 0;
    }

    postData['kfilt'] = [];
    postData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable',
        'PRouterEntry:lldpTable:lldpLocalSystemData'];

    tempNodeObjs[prouter] = prouter;
    for (var i = 0; i < linksCnt; i++) {
        if (null == tempNodeObjs[links[i]['remote_system_name']]) {
            tempNodeObjs[links[i]['remote_system_name']] =
                links[i]['remote_system_name'];
            postData['kfilt'].push(links[i]['remote_system_name']);
        }
    }
    var url = '/analytics/uves/prouter';
    opApiServer.apiPost(url, postData, appData, function(err, data) {
        if ((null != err) || (null == data) || (null == data['value']) ||
            (!data['value'].length)) {
            callback(err, topoData);
            return;
        }
        postData['kfilt'] = [];
        data['value'].push(pRouterData['value'][0]);
        var dataCnt = data['value'].length;
        for (var i = 0; i < dataCnt; i++) {
            try {
                var links = data['value'][i]['value']['PRouterLinkEntry']['link_table'];
                var linksCnt = links.length;
            } catch(e) {
                continue;
            }
            for (var j = 0; j < linksCnt; j++) {
                if (null == tempNodeObjs[links[j]['remote_system_name']]) {
                    tempNodeObjs[links[j]['remote_system_name']] =
                        links[j]['remote_system_name'];
                    postData['kfilt'].push(links[j]['remote_system_name']);
                }
            }
        }
        opApiServer.apiPost(url, postData, appData, function(err, pData) {
            if ((null != err) || (null == pData) ||
                (null == pData['value']) || (!pData['value'].length)) {
                topoData = buildPhysicalTopologyByPRouter(prouter, data);
                callback(err, topoData);
                return;
            }
            pData = pData['value'];
            var dataLen = pData.length;
            for (var i = 0; i < dataLen; i++) {
                data['value'].push(pData[i]);
            }
        });
        topoData = buildPhysicalTopologyByPRouter(prouter, data);
        callback(null, topoData);
    });
}

function buildPhysicalTopology (prouter, appData, callback)
{
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tempNodeObjs = {};
    var tempLinkObjs = {};
    var postData = {};
    postData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable',
        'PRouterEntry:lldpTable:lldpLocalSystemData'];
    var url = '/analytics/uves/prouter';
    if (null != prouter) {
        postData['kfilt'] = [];
        postData['kfilt'] = [prouter];
    }

    opApiServer.apiPost(url, postData, appData, function(err, pRouterData) {
        if ((null != err) || (null == pRouterData)) {
            callback(err, null);
            return;
        }
        if (null != prouter) {
            getPhysicalTopologyByPRouter(prouter, appData, pRouterData, callback);
        } else {
            getCompletePhysicalTopology(appData, pRouterData, callback);
        }
    });
}

function getCompletePhysicalTopology (appData, pRouterData, callback)
{
    var data = pRouterData['value'];
    var prouterCnt = data.length;
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tempNodeObjs = {};
    var tempLinkObjs = {};

    for (var i = 0; i < prouterCnt; i++) {
        if ((null != data[i]['name']) && 
            (null == tempNodeObjs[data[i]['name']])) {
            nodeObj = createNodeObj(data[i]['name'],
                                    ctrlGlobal.NODE_TYPE_PROUTER,
                                    data[i]);
            topoData['nodes'].push(nodeObj);
            tempNodeObjs[data[i]['name']] = data[i]['name'];
        }
        try {
            var pRouterLinkTable =
                data[i]['value']['PRouterLinkEntry']['link_table'];
        } catch(e) {
            logutils.logger.error("pRouterLinkEntry Parse error : " + e);
            continue;
        }
        linkCnt = pRouterLinkTable.length;
        for (var j = 0; j < linkCnt; j++) {
            if (null == tempNodeObjs[pRouterLinkTable[j]['remote_system_name']]) {
                nodeObj =
                    createNodeObj(pRouterLinkTable[j]['remote_system_name'],
                                  getpRouterLinkType(pRouterLinkTable[j]['type']),
                                  getPRouterEntryByName(pRouterLinkTable[j]['remote_system_name'],
                                                        data));

                topoData['nodes'].push(nodeObj);
                tempNodeObjs[pRouterLinkTable[j]['remote_system_name']] = 
                    pRouterLinkTable[j]['remote_system_name'];
            }
            linkName1 = data[i]['name'] + ":" +
                pRouterLinkTable[j]['remote_system_name'];
            linkName2 = pRouterLinkTable[j]['remote_system_name'] + ":" +
                data[i]['name'];
            if ((null == tempLinkObjs[linkName1]) && 
                (null == tempLinkObjs[linkName2])) {
                topoData['links'].push({"endpoints": [data[i]['name'],
                                       pRouterLinkTable[j]['remote_system_name']],
                                       "more_attributes": pRouterLinkTable[j]});
                tempLinkObjs[linkName1] = linkName1;
                tempLinkObjs[linkName2] = linkName2;
            }
        }
    }
    topoData['nodes'] = buildNodeChassisType(topoData['nodes'], pRouterData);
    callback(null, topoData);
}

function getPhysicalTopology (prouter, appData, callback)
{
        var topoData = buildPhysicalTopology(prouter, appData, prouterData);
        callback(err, topoData);
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
                return vmUVE[i]['value']['UveVirtualMachineAgent']['vrouter'];
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
    var flowIpsCnt = 0;
    var srcIP = data['srcIP'];
    var destIP = data['destIP'];

    var queryJSON = queries.buildUnderlayQuery(data);

    queries.executeQueryString(queryJSON, function(err, result) {
        if ((null != err) || (null == result) ||
            (null == result['value']) || (!result['value'].length)) {
            commonUtils.handleJSONResponse(err, res, topoData);
            return;
        }
        var flowPostData = {};
        flowPostData['cfilt'] = ['PRouterFlowEntry:flow_export_source_ip'];
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
            if ((null != err) || (null == results) || (null == results[0]) ||
                (null == results[0]['value']) || (!results[0]['value'].length)) {
                ipNotFound = true;
                flowIpsCnt = 0;
            } else {
                flowIps = results[0];
                flowIpsCnt = flowIps['value'].length;
            }
            var srcVrouter = getvRouterByIntfIP(srcIP, results[1]);
            var destVrouter = getvRouterByIntfIP(destIP, results[1]);
            for (var i = 0; i < flowIpsCnt; i++) {
                try {
                    tempFlowIpObjs[flowIps['value'][i]['value']['PRouterFlowEntry']['flow_export_source_ip']]
                        = flowIps['value'][i]['name'];
                } catch(e) {
                    logutils.logger.error("flowIPs parse error:" + e);
                }
            }
            result = result['value'];
            var nodeCnt = result.length;
            for (var i = 0; i < nodeCnt; i++) {
                endPt1 = (null != tempFlowIpObjs[result[i]['u_prouter']]) ?
                    tempFlowIpObjs[result[i]['u_prouter']] :
                    result[i]['u_prouter'];

                topoData['nodes'].push({"name": endPt1,
                                       "node-type":
                                       ctrlGlobal.NODE_TYPE_PROUTER});
            }
            if (null != srcVrouter) {
                topoData['nodes'].push({"name": srcVrouter,
                                       "node-type":
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            }
            if (null != destVrouter) {
                topoData['nodes'].push({"name": destVrouter,
                                       "node-type":
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            }
            getUnderlayPathByNodelist(topoData, appData, function(err, endpoints) {
                topoData['links'] = endpoints;
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
function getNodeNameByPVData (hop, prouterData, vrouterData)
{
    var nodeObj = {};
    nodeObj['nodeName'] = null;
    nodeObj['nodeType'] = null;
    var prCnt = prouterData['value'].length;
    for (var i = 0; i < prCnt; i++) {
        try {
            if (hop ==
                prouterData['value'][i]['value']['PRouterFlowEntry']
                           ['flow_export_source_ip']) {
                return {'nodeName': prouterData['value']['name'],
                        'nodeType': ctrlGlobal.NODE_TYPE_PROUTER};
            }
        } catch(e) {
            logutils.logger.error("We did not prouter flow_export_source_ip " +
                                  " while searching IP:" + hop);
        }
    }
    var vrCnt = vrouterData['value'].length;
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

/* Function: getTraceFlow
 *  Build the path thorugh which the trace route response came
 */
function getTraceFlow (req, res, appData)
{
    /* Dummy data, once backend implementation is done,
       then we will remove this dummy data
     */
    var topoData = {};
    var data = req.body;
    var introData = data['data'];
    var nodeIP = introData['nodeIP'];
    var srcIP = introData['srcIP'];
    var destIP = introData['destIP'];
    var srcPort = introData['srcPort'];
    var destPort = introData['destPort'];
    var protocol = introData['protocol'];
    var vrfName = introData['vrfName'];
    var maxHops = introData['maxHops'];
    var maxAttempts = introData['maxAttempts'];
    var interval = introData['interval'];
    var dataObjArr = [];
    var url = '/Snh_TraceRouteReq?source_ip=' + srcIP + '&source_port=' +
        srcPort + '&dest_ip=' + destIP + '&dest_port=' + destPort +
        '&protocol=' + protocol + '&vrf_name=' + vrfName + '&max_hops=';
    if (null != maxHops) {
        url += maxHops;
    }
    url += '&max_attempts=';
    if (null != maxAttempts) {
        url += maxAttempts;
    }
    url += '&interval=';
    if (null != interval) {
        url += interval;
    }
    var urlLists = [];
    urlLists[0] = nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' + url;
    var vRouterRestAPI =
        commonUtils.getRestAPIServer(nodeIP, global.SANDESH_COMPUTE_NODE_PORT);
    async.map(urlLists, commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                              true),
              function(err, results) {
        if ((null != err) || (null == results)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var hopList = jsonPath(results, "$..hop[0]");
        url = '/analytics/uves/prouter';
        var prPostData = {};
        prPostData['cfilt'] = ['PRouterFlowEntry:flow_export_source_ip']
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 prPostData, null, null, null);
        url = '/analytics/uves/vrouter';
        var vrPostData = {};
        vrPostData['cfilt'] = ['VrouterAgent:self_ip_list'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vrPostData, null, null, null);
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(opApiServer, true),
                  function(err, results) {
            var hopCnt = hopList.length;
            topoData['nodes'] = [];
            for (var i = 0; i < hopCnt; i++) {
                var nodeObj = getNodeNameByPVData(hopList[i]['_'], results[0], results[1]);
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
            /* TODO: Once all the IPs are populated in prouter UVE, then we need
             * to build the link here
             */
            commonUtils.handleJSONResponse(null, res, topoData);
        });
    });

}

exports.getUnderlayPath = getUnderlayPath;
exports.getUnderlayTopology = getUnderlayTopology;
exports.getUnderlayStats = getUnderlayStats;
exports.getTraceFlow = getTraceFlow;

