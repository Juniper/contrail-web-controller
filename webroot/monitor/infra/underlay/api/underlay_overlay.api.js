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

function getUnderlayPath (req, res, appData)
{
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var body = req.body;
    var data = body['data'];
    var tempFlowIpObjs = {};

    var queryJSON = queries.buildUnderlayQuery(data);

    queries.executeQueryString(queryJSON, function(err, result) {
        if ((null != err) || (null == result) ||
            (null == result['value']) || (!result['value'].length)) {
            commonUtils.handleJSONResponse(err, res, topoData);
            return;
        }
        var postData = {};
        postData['cfilt'] = ['PRouterFlowEntry:flow_export_source_ip'];
        var url = '/analytics/uves/prouter';
        opApiServer.apiPost(url, postData, appData, function(err, flowIps) {
            if ((null != err) || (null == flowIps) || (null == flowIps['value'])
                || (!flowIps['value'].length)) {
                ipNotFound = true;
            }
            var flowIpsCnt = flowIps['value'].length;
            for (var i = 0; i < flowIpsCnt; i++) {
                tempFlowIpObjs[flowIps['value'][i]['value']['PRouterFlowEntry']['flow_export_source_ip']]
                    = flowIps['value'][i]['name'];
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
            getUnderlayPathByNodelist(topoData, appData, function(err, endpoints) {
                topoData['links'] = endpoints;
                commonUtils.handleJSONResponse(err, res, topoData);
            });
        });
    });
}

function getIfEntryByIfName (ifName, pRouterData)
{
    try {
        var ifData =
            pRouterData['value'][0]['value']['PRouterEntry']['ifTable'];
    } catch(e) {
        ifData = null;
    }
    if (null == ifData) {
        return null;
    }
    var ifCnt = ifData.length;
    for (var i = 0; i < ifCnt; i++) {
        if (ifData[i]['ifDescr'] == ifName) {
            return ifData[i];
        }
    }
    return null;
}

function getUnderlayStats (req, res, appData)
{
    var resultJSON = [];
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
    var postData = {};
    postData['kfilt'] = [node1, noded2];
    postData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable',
        'PRouterEntry:lldpTable:lldpLocalSystemData'];
    opApiServer.apiPost(url, postData, appData, function(err, pData) {
        if ((null != err) || (null == pData) || (null == pData['value']) ||
            (!pData['value'].length)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        try {
            var links =
                pData['value'][0]['value']['PRouterLinkEntry']['link_table'];
            var linksCnt = links.length;
        } catch (e) {
            linksCnt = 0;
        }
        postData['kfilt'] = [];
        var j = 0;
        for (var i = 0; i < linksCnt; i++) {
            if (node2 == links[i]['remote_system_name']) {
                resultJSON[j++] = fillIfStatsData(links[i], pData);
            }
        }
        commonUtils.handleJSONResponse(null, res, resultJSON);
    });
}

function fillIfStatsData (pLinkData, pData)
{
    var resultJSON = {};
    resultJSON['local_interface_index'] = pLinkData['local_interface_index'];
    resultJSON['local_interface_name'] = pLinkData['local_interface_name'];
    resultJSON['remote_interface_index'] =
        pLinkData['remote_interface_index'];
    resultJSON['remote_interface_name'] = pLinkData['remote_interface_name'];
    resultJSON['local_if_stats'] = {}
    var ifEntry = getIfEntryByIfName(pLinkData['local_interface_name'],
                                     pData);
    if (null == ifEntry) {
        return resultJSON;
    }
    resultJSON['local_if_stats'] = ifEntry;
    return resultJSON;
}

function getTraceFlow (req, res, appData)
{
    /* Dummy data, once backend implementation is done, 
       then we will remove this dummy data
     */
    var data = {
        "nodes": [
            {
                "name": "a7-ex2",
                "node_type": "physical-router",
                "more_attr": {
                },
                "chassis_type": "tor"
            },
            {
                "name": "a7-mx80-1",
                "node_type": "physical-router",
                "more_attr": {
                },
                "chassis_type": "spine"
            },
            {
                "name": "a7-ex1",
                "node_type": "physical-router",
                "more_attr": {
                },
                "chassis_type": "coreswitch"
            },
            {
                "name": "a7-mx80-2",
                "node_type": "physical-router",
                "more_attr": {
                },
                "chassis_type": "spine"
            },
            {
                "name": "a7-ex3",
                "node_type": "physical-router",
                "more_attr": {
                },
                "chassis_type": "tor"
            },
            {
                "name": "a7s34",
                "node_type": "virtual-router",
                "more_attr": {
                    "lldpLocManAddr": "-",
                    "lldpLocSysDesc": "-",
                    "lldpLocSysName": "-",
                    "ifTable": "-"
                },
                "chassis_type": "-"
            },
            {
                "name": "a7s36",
                "node_type": "virtual-router",
                "more_attr": {
                    "lldpLocManAddr": "-",
                    "lldpLocSysDesc": "-",
                    "lldpLocSysName": "-",
                    "ifTable": "-"
                },
                "chassis_type": "-"
            }
        ],
        "links": [
            {
                "endpoints": [
                    "a7-ex2",
                    "a7-mx80-1"
                ]
            },
            {
                "endpoints": [
                    "a7-mx80-1",
                    "a7-ex1"
                ]
            },
            {
                "endpoints": [
                    "a7-ex1",
                    "a7-mx80-2"
                ]
            },
            {
                "endpoints": [
                    "a7-mx80-2",
                    "a7-ex3"
                ]
            },
            {
                "endpoints": [
                    "a7s34",
                    "a7-ex2"
                ]
            },
            {
                "endpoints": [
                    "a7s36",
                    "a7-ex3"
                ]
            }
        ]
    };
    commonUtils.handleJSONResponse(null, res, data);
}

exports.getUnderlayPath = getUnderlayPath;
exports.getUnderlayTopology = getUnderlayTopology;
exports.getUnderlayStats = getUnderlayStats;
exports.getTraceFlow = getTraceFlow;

