/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var logutils = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  global = require(process.mainModule.exports["corePath"] +
                   '/src/serverroot/common/global'),
  ctrlGlobal = require('./global'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api');

function buildvRouterVMTopology (nodeList, appData, callback)
{
    var vmList = [];
    var links = [];
    var postData = {};
    var tempvRouterObjs = {};
    postData['cfilt'] = [];
    var nodeCnt = nodeList.length;
    var found = false;
    for (var i = 0; i < nodeCnt; i++) {
        if (ctrlGlobal.NODE_TYPE_VROUTER == nodeList[i]['node_type']) {
            tempvRouterObjs[nodeList[i]['name']] = nodeList[i]['name'];
            found = true;
        }
    }
    if (false == found) {
        callback(null, null);
        return;
    }
    postData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
        'UveVirtualMachineAgent:vrouter'];
    var url = '/analytics/uves/virtual-machine';
    opApiServer.apiPost(url, postData, appData, function(err, vmData) {
        if ((null != err) || (null == vmData) || (null == vmData['value']) ||
            (!vmData['value'].length)) {
            callback(null, null);
            return;
        }
        var vmCnt = vmData['value'].length;
        for (var i = 0; i < vmCnt; i++) {
            try {
                var vrName =
                    vmData['value'][i]['value']['UveVirtualMachineAgent']['vrouter'];
                if (null == tempvRouterObjs[vrName]) {
                    continue;
                }
            } catch(e) {
            }
            try {
                var moreAttr = {'vm_name':
                    vmData['value'][i]['value']['UveVirtualMachineAgent']
                        ['interface_list'][0]['vm_name']};
                vmList.push({'name': vmData['value'][i]['name'],
                    'node_type': ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE,
                    'chassis_type': ctrlGlobal.NODE_TYPE_NONE,
                    'more_attributes': moreAttr});
                links.push({'endpoints': [vmData['value'][i]['name'],
                           vrName],
                           'more_attributes': '-'});
            } catch(e) {
                logutils.logger.error("In buildvRouterVMTopology(): VM JSON " +
                                      "Parse error:" + e);
            }
        }
        var topoData = {'nodes': vmList, 'links': links};
        callback(null, topoData);
    });
}

function buildTopology (prouter, appData, callback)
{
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    buildPhysicalTopology(prouter, appData, function(err, phyTopo) {
        if ((null != err) || (null == phyTopo)) {
            callback(err, phyTopo);
            return;
        }
        buildvRouterVMTopology(phyTopo['nodes'], appData,
                               function(err, vrTopo) {
            if ((null != err) || (null == vrTopo)) {
                callback(err, phyTopo);
                return;
            }
            topoData['nodes'] = phyTopo['nodes'].concat(vrTopo['nodes']);
            topoData['links'] = phyTopo['links'].concat(vrTopo['links']);
            callback(null, topoData);
        });
    });
}

/* Function: getUnderlayTopology
 *  Get the Underlay Topology
 */
function getUnderlayTopology (req, res, appData)
{
    var prouter = req.param('prouter');

    buildTopology(prouter, appData, function(err, topology) {
        commonUtils.handleJSONResponse(err, res, topology);
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
        /* First check any one of the link is vRouter or not */
        if (ctrlGlobal.NODE_TYPE_VROUTER == getpRouterLinkType(links[i]['type'])) {
            return ctrlGlobal.NODE_CHASSIS_TYPE_TOR;
        }
    }
    for (var i = 0; i < linksCnt; i++) {
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
        "more_attributes": {
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
                prouterEntry['value']['PRouterEntry']['ifTable'] : '-',
            "ifXTable": ((null != prouterEntry) &&
                         (null != prouterEntry['value']) &&
                         (null != prouterEntry['value']['PRouterEntry'])) ?
                prouterEntry['value']['PRouterEntry']['ifXTable'] : '-'
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
    var index = 0;
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
                                   "more_attributes": [pRouterLinkTable[j]]});
            tempLinkObjs[linkName1] = index;
            tempLinkObjs[linkName2] = index;
            index++;
        } else {
            if (null != tempLinkObjs[linkName1]) {
                topoData['links'][tempLinkObjs[linkName1]]['more_attributes'].push(pRouterLinkTable[j]);
            } else if (null != tempLinkObjs[linkName2]) {
                topoData['links'][tempLinkObjs[linkName2]]['more_attributes'].push(pRouterLinkTable[j]);
            }
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
        'PRouterEntry:ifXTable', 'PRouterEntry:lldpTable:lldpLocalSystemData'];

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
        'PRouterEntry:ifXTable', 'PRouterEntry:lldpTable:lldpLocalSystemData'];
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
    var index = 0;
    var data = pRouterData['value'];
    var prouterCnt = data.length;
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tempNodeObjs = {};
    var tempLinkObjs = {};

    for (var i = 0; i < prouterCnt; i++) {
        tempLinkObjs = {};
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
                                       "more_attributes": [pRouterLinkTable[j]]});
                tempLinkObjs[linkName1] = index;
                tempLinkObjs[linkName2] = index;
                index++;
            } else {
                /* It is expected that remote links should be populated for all
                 * nodes, ex: If p1 is remote entry for p2, then p2 is remote
                 * entry for p1, so check only for the current node, what are
                 * the remote nodes, so update in the current index only
                 */
                var idx1 = tempLinkObjs[linkName1];
                var idx2 = tempLinkObjs[linkName2];
                if ((null != idx1) &&
                    (pRouterLinkTable[j]['remote_system_name'] ==
                     topoData['links'][idx1]['endpoints'][1])) {
                    topoData['links'][idx1]['more_attributes'].push(pRouterLinkTable[j]);
                } else if ((null != idx2) &&
                           (pRouterLinkTable[j]['remote_system_name'] ==
                            topoData['links'][idx2]['endpoints'][0])) {
                    topoData['links'][idx2]['more_attributes'].push(pRouterLinkTable[j]);
                }
            }
        }
    }
    topoData['nodes'] = buildNodeChassisType(topoData['nodes'], pRouterData);
    callback(null, topoData);
}

exports.buildTopology = buildTopology;

