/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
  async = require('async'),
  logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
  appErrors = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/errors/app.errors'),
  util = require('util'),
  ctrlGlobal = require('../../../../common/api/global'),
  jsonPath = require('JSONPath').eval,
  _ = require('underscore'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api'),
  configApiServer = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/configServer.api'),
  jsonDiff = require(process.mainModule.exports["corePath"] +
                     '/src/serverroot/common/jsondiff'),
  qeUtils = require(process.mainModule.exports["corePath"] +
                    "/webroot/reports/qe/api/query.utils");

var CONFIG_FOUND            = 0;
var CONFIG_NOT_FOUND        = 1;
var UVE_FOUND               = 2;
var UVE_NOT_FOUND           = 3;
var CONFIG_UVE_FOUND        = 4;
var CONFIG_UVE_NOT_FOUND    = 5;

var vmiPostCfilt = [
    'UveVMInterfaceAgent:vm_name', 'UveVMInterfaceAgent:uuid',
    'UveVMInterfaceAgent:label', 'UveVMInterfaceAgent:mac_address',
    'UveVMInterfaceAgent:active', 'UveVMInterfaceAgent:virtual_network',
    'UveVMInterfaceAgent:ip_address', 'UveVMInterfaceAgent:gateway',
    'UveVMInterfaceAgent:floating_ips', 'UveVirtualMachineAgent:ip6_active',
    'UveVirtualMachineAgent:ip6_address'];

var vRouterSandeshParams = {apiName: global.SANDESH_API};

function sortVMNames (vmNode1, vmNode2, sortKey)
{
    try {
        vmAtrr1 = vmNode1['more_attributes'][sortKey];
        vmAttr2 = vmNode2['more_attributes'][sortKey];
    } catch(e) {
        return 0;
    }
    if (vmAtrr1 < vmAttr2) {
        return -1;
    }
    if (vmAtrr1 > vmAttr2) {
        return 1;
    }
    return 0;
}

function sortTopologyVMListByVMName (vmTopoNodes, sortKey)
{
    vmTopoNodes.sort(function(vmNode1, vmNode2) {
        return sortVMNames(vmNode1, vmNode2, sortKey);
    });
    return vmTopoNodes;
}

function mergeVMAndVMIUveData (vmData, vmiData)
{
    if ((null == vmData) || (null == vmData['value']) ||
        (null == vmiData) || (null == vmiData['value'])) {
        return vmData;
    }
    var tmpVMIData = commonUtils.cloneObj(vmiData['value']);
    var vmiCnt = tmpVMIData.length;
    var vmiObjs = {};
    for (var i = 0; i < vmiCnt; i++) {
        if ((null == tmpVMIData[i]['value']) ||
            (null == tmpVMIData[i]['name'])) {
            continue;
        }
        vmiObjs[tmpVMIData[i]['name']] =
            tmpVMIData[i]['value']['UveVMInterfaceAgent'];
    }
    var tmpVMData = commonUtils.cloneObj(vmData['value']);
    var vmCnt = tmpVMData.length;
    for (var i = 0; i < vmCnt; i++) {
        var vmIntfList = [];
        var intfCnt = 0;
        try {
            var intfList =
                tmpVMData[i]['value']['UveVirtualMachineAgent']['interface_list'];
            intfCnt = intfList.length;
        } catch(e) {
            intfCnt = 0;
        }
        for (var j = 0; j < intfCnt; j++) {
            if (null != vmiObjs[intfList[j]]) {
                vmIntfList.push(vmiObjs[intfList[j]]);
                /* Add the interface name */
                vmIntfList[vmIntfList.length - 1]['interface_name'] = intfList[j];
            }
        }
        try {
            delete
                vmData['value'][i]['value']['UveVirtualMachineAgent']['interface_list'];
            vmData['value'][i]['value']['UveVirtualMachineAgent']['interface_list']
                = vmIntfList;
        } catch(e) {
        }
    }
    return vmData;
}

function buildvRouterVMTopology (nodeList, appData, callback)
{
    var vmList = [];
    var links = [];
    var postData = {};
    var tempvRouterObjs = {};
    postData['cfilt'] = [];
    var nodeCnt = nodeList.length;
    var found = false;
    var dataObjArr = [];
    for (var i = 0; i < nodeCnt; i++) {
        if (ctrlGlobal.NODE_TYPE_VROUTER == nodeList[i]['node_type']) {
            tempvRouterObjs[nodeList[i]['name']] = nodeList[i]['name'];
            found = true;
        }
    }
    if (false == found) {
        callback(null, null, null);
        return;
    }
    postData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
        'UveVirtualMachineAgent:vrouter'];
    var url = '/analytics/uves/virtual-machine';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST, postData,
                             opApiServer, null, appData);
    url = '/analytics/uves/vrouter';
    var vrPostData = {};
    // cfilts are not working for ContrailConfig object, so whole object is there.
    // Once it start working need to pass virtual_router_type
    vrPostData['cfilt'] = ['VrouterAgent:self_ip_list',
        'VrouterAgent:sandesh_http_port','VrouterStatsAgent:flow_rate',
        'ContrailConfig:elements', 'VrouterAgent:control_ip'];
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST, vrPostData,
                             opApiServer, null, appData);
    var vmiUrl = '/analytics/uves/virtual-machine-interface';
    var vmiPostData = {};
    vmiPostData['cfilt'] = vmiPostCfilt;
    commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_POST,
                             vmiPostData, opApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        var vmData = results[0];
        var vrData = results[1];
        if ((null != err) || (null == vmData) || (null == vmData['value']) ||
            (!vmData['value'].length)) {
            callback(null, null, vrData);
            return;
        }
        results[0] = mergeVMAndVMIUveData(results[0], results[2]);
        var vmCnt = vmData['value'].length;
        for (var i = 0; i < vmCnt; i++) {
            try {
                var vrName =
                    vmData['value'][i]['value']['UveVirtualMachineAgent']
                          ['vrouter'];
                if (null == tempvRouterObjs[vrName]) {
                    continue;
                }
            } catch(e) {
            }
            var moreAttr = {};
            try {
                moreAttr['vm_name'] =
                    vmData['value'][i]['value']['UveVirtualMachineAgent']
                          ['interface_list'][0]['vm_name'];
            } catch(e) {
            }
            try {
                moreAttr['interface_list'] =
                    vmData['value'][i]['value']['UveVirtualMachineAgent']
                          ['interface_list'];
            } catch(e) {
            }
            try {
                moreAttr['vrouter'] =
                    vmData['value'][i]['value']['UveVirtualMachineAgent']['vrouter'];
            } catch(e) {
            }
            try {
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
        if (vmList.length > 0) {
            vmList = sortTopologyVMListByVMName(vmList, 'vm_name');
        }
        var topoData = {'nodes': vmList, 'links': links};
        callback(null, topoData, vrData);
    });
}

function buildTopology (req, appData, callback)
{
    var prouter = req.param('prouter');
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    var tmpVRouterObjs = {};
    buildPhysicalTopology(prouter, appData, function(err, phyTopo) {
        if ((null != err) || (null == phyTopo)) {
            callback(err, phyTopo);
            return;
        }
        buildvRouterVMTopology(phyTopo['nodes'], appData,
                               function(err, vrTopo, vrData) {
            if ((null != vrData) && (null != vrData['value'])) {
                vrData = vrData['value'];
                vrCnt = vrData.length;
                for (var i = 0; i < vrCnt; i++) {
                    try {
                        tmpVRouterObjs[vrData[i]['name']] =
                            vrData[i]['value'];
                    } catch(e) {
                        continue;
                    }
                }
                var phyTopoNodesCnt = phyTopo['nodes'].length;
                for (var i = 0; i < phyTopoNodesCnt; i++) {
                    if (ctrlGlobal.NODE_TYPE_VROUTER ==
                        phyTopo['nodes'][i]['node_type']) {
                        if (null != tmpVRouterObjs[phyTopo['nodes'][i]['name']]) {
                            phyTopo['nodes'][i]['more_attributes']
                                = tmpVRouterObjs[phyTopo['nodes'][i]['name']];
                        }
                    }
                }
            }
            phyTopo['errors']['configNotFound'] =
                _.uniq(phyTopo['errors']['configNotFound']);
            phyTopo['errors']['uveNotFound'] =
                _.uniq(phyTopo['errors']['uveNotFound']);
            if ((null != err) || (null == vrTopo)) {
                callback(err, phyTopo);
                return;
            }
            topoData['nodes'] = phyTopo['nodes'].concat(vrTopo['nodes']);
            topoData['links'] = phyTopo['links'].concat(vrTopo['links']);
            topoData['errors'] = {};
            topoData['errors']['configNotFound'] =
                phyTopo['errors']['configNotFound'];
            topoData['errors']['uveNotFound'] =
                phyTopo['errors']['uveNotFound'];
            callback(null, topoData);
        });
    });
}


/* Function: getUnderlayTopology
 *  Get the Underlay Topology
 */
function getUnderlayTopology (req, res, appData)
{

    var url = '/analytics/uves/prouter';
    var key = ctrlGlobal.STR_GET_UNDERLAY_TOPOLOGY + '@' + url;
    var topologyChanged = true;
    var forceRefresh = req.param('forceRefresh');
    process.mainModule.exports.redisClient.get(key,
                                               function(error, oldValue) {
        if (null == forceRefresh) {
            if ((null != error) || (null == oldValue)) {
                redisUtils.checkAndGetRedisDataByKey(key, buildTopology, req,
                                                     appData,
                                                     function(err, topology) {
                    commonUtils.handleJSONResponse(err, res, topology);
                });
            } else {
                oldValue = JSON.parse(oldValue);
                commonUtils.handleJSONResponse(error, res, oldValue);
            }
            return;
        }
        redisUtils.checkAndGetRedisDataByKey(key, buildTopology, req,
                                             appData,
                                             function(err, topology) {
            if ((null != error) || (null == oldValue)) {
                topology['topologyChanged'] = true;
                commonUtils.handleJSONResponse(err, res, topology);
                return;
            }
            oldValue = JSON.parse(oldValue);
            var delta = jsonDiff.getConfigJSONDiff('physical-topology',
                                                   oldValue, topology);
            if (null == delta) {
                topology['topologyChanged'] = false;
            } else {
                topology['topologyChanged'] = true;
            }
            commonUtils.handleJSONResponse(err, res, topology);
        });
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
    if (ctrlGlobal.NODE_TYPE_VROUTER == nodeType || ctrlGlobal.NODE_TYPE_BMS == nodeType) {
        return ctrlGlobal.NODE_CHASSIS_TYPE_NONE;
    }

    for (var i = 0; i < prouterCnt; i++) {
        if (nodeName == prouterData[i]['name']) {
            break;
        }
    }
    if (i == prouterCnt) {
        /* We did not find the data */
        return ctrlGlobal.NODE_CHASSIS_TYPE_UNKNOWN;
    }
    try {
        var links = prouterData[i]['value']['PRouterLinkEntry']['link_table'];
    } catch(e) {
        /* We did not get any link info */
        return ctrlGlobal.NODE_CHASSIS_TYPE_UNKNOWN;
    }
    var linksCnt = 0;
    if (null != links) {
        linksCnt = links.length;
    }
    for (var i = 0; i < linksCnt; i++) {
        /* First check any one of the link is vRouter or not */
        if (ctrlGlobal.NODE_TYPE_VROUTER == getpRouterLinkType(links[i]['type']) || ctrlGlobal.NODE_TYPE_BMS == getpRouterLinkType(links[i]['type'])) {
            return ctrlGlobal.NODE_CHASSIS_TYPE_TOR;
        }
    }
    for (var i = 0; i < linksCnt; i++) {
            /* Type prouter */
        linkDataLen = prouterData.length;
        for (var j = 0; j < linkDataLen; j++) {
            if (links[i]['remote_system_name'] == prouterData[j]['name']) {
                if ((null != prouterData[j]) &&
                    (null != prouterData[j]['value']) &&
                    (null != prouterData[j]['value']['PRouterLinkEntry']) &&
                    (null !=
                     prouterData[j]['value']['PRouterLinkEntry']
                                   ['link_table'])) {
                    var isLinkvRouter =
                        isvRouterLink(prouterData[j]['value']['PRouterLinkEntry']
                                                    ['link_table']);
                    if (true == isLinkvRouter) {
                        return ctrlGlobal.NODE_CHASSIS_TYPE_SPINE;
                    }
                }
            }
        }
    }
    return ctrlGlobal.NODE_CHASSIS_TYPE_NOT_RESOLVED;
}

function buildNodeChassisType (nodes, prouterLinkData)
{
    var prObjs = {};
    var nodeCnt = nodes.length;
    var resolveNeeded = false;
    for (var i = 0; i < nodeCnt; i++) {
        var nodeChassType = getNodeChassisType(nodes[i]['name'],
                                               nodes[i]['node_type'],
                                               prouterLinkData);
        nodes[i]['chassis_type'] = nodeChassType;
        if (ctrlGlobal.NODE_CHASSIS_TYPE_NOT_RESOLVED == nodeChassType) {
            resolveNeeded = true;
        }
    }

    if (false == resolveNeeded) {
        return nodes;
    }

    var prData = null;
    var prCnt = 0;
    try {
        prData = prouterLinkData['value'];
        prCnt = prData.length;
    } catch(e) {
        prCnt = 0;
        return nodes;
    }
    for (var i = 0; i < prCnt; i++) {
        var prName = prData[i]['name'];
        var linkTable =
            commonUtils.getValueByJsonPath(prData[i],
                                           'value;PRouterLinkEntry;link_table',
                                           null);
        prObjs[prName] = linkTable;
    }

    for (var i = 0; i < nodeCnt; i++) {
        var nodeTypeObjs = {};
        for (var k = 0; k < nodeCnt; k++) {
            nodeTypeObjs[nodes[k]['name']] = nodes[k]['chassis_type'];
        }
        if (ctrlGlobal.NODE_CHASSIS_TYPE_NOT_RESOLVED !=
            nodes[i]['chassis_type']) {
            continue;
        }
        var links = prObjs[nodes[i]['name']];
        if (null == links) {
            nodes[i]['chassis_type'] = ctrlGlobal.NODE_CHASSIS_TYPE_UNKNOWN;
            continue;
        }
        var linksCnt = links.length;
        for (var j = 0; j < linksCnt; j++) {
            var remSysName = links[j]['remote_system_name'];
            if (nodeTypeObjs[remSysName] ==
                ctrlGlobal.NODE_CHASSIS_TYPE_SPINE) {
                nodes[i]['chassis_type'] = ctrlGlobal.NODE_CHASSIS_TYPE_CORE;
                break;
            }
            if (nodeTypeObjs[remSysName] ==
                ctrlGlobal.NODE_CHASSIS_TYPE_TOR){
                nodes[i]['chassis_type'] = ctrlGlobal.NODE_CHASSIS_TYPE_SPINE;
                break;
            }
            if (nodeTypeObjs[remSysName] ==
                    ctrlGlobal.NODE_CHASSIS_TYPE_CORE) {
                nodes[i]['chassis_type'] = ctrlGlobal.NODE_CHASSIS_TYPE_OTHER_SWITCH;
                break;
            }
        }
    }
    /* Now check if anyone we have not done resolution */
    for (var i = 0; i < nodeCnt; i++) {
        if (ctrlGlobal.NODE_CHASSIS_TYPE_NOT_RESOLVED ==
            nodes[i]['chassis_type']) {
            nodes[i]['chassis_type'] = ctrlGlobal.NODE_CHASSIS_TYPE_UNKNOWN;
        }
    }
    return nodes;
}

function getpRouterLinkType (linkType)
{
    if (0 == linkType) {
        return ctrlGlobal.NODE_TYPE_VROUTER;
    } else if (1 == linkType) {
        return ctrlGlobal.NODE_TYPE_PROUTER;
    } else if (2 == linkType) {
        return ctrlGlobal.NODE_TYPE_BMS;
    }else {
        return ctrlGlobal.NODE_TYPE_NONE;
    }
}

function createNodeObj (node, nodeType, prouterEntry, prConfigData)
{
    var prMgmtIP = "";
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
    if (ctrlGlobal.NODE_TYPE_PROUTER != nodeType) {
        return nodeObj;
    }
    var prCnt = 0;
    try {
        var prData = prConfigData['physical-routers'];
        prCnt = prData.length;
    } catch(e) {
        prCnt = 0;
    }
    for (var i = 0; i < prCnt; i++) {
        if (prData[i]['physical-router']['fq_name'][1] == node) {
            break;
        }
    }
    if (i < prCnt) {
        prMgmtIP =
            prData[i]['physical-router']['physical_router_management_ip'];
    }
    nodeObj['mgmt_ip'] = prMgmtIP;
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

function buildPhysicalTopologyByPRouter (prouter, pRouterData, prConfigData)
{
    data = pRouterData['value'];
    var topoData = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    topoData['errors'] = {'configNotFound': [], 'uveNotFound': []};
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
                            data[i], prConfigData);
    var found = isProuterExists(data[i]['name'], prConfigData,
                                pRouterData);
    if (CONFIG_NOT_FOUND == found) {
        topoData['errors']['configNotFound'].push(data[i]['name']);
        return topoData;
    } else if (UVE_NOT_FOUND == found) {
        topoData['errors']['uveNotFound'].push(data[i]['name']);
        return topoData;
    } else if (CONFIG_UVE_FOUND == found) {
        topoData['nodes'].push(nodeObj);
        tempNodeObjs[data[i]['name']] = data[i]['name'];
    }
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
        if ((null != pRouterLinkTable[j]['remote_system_name']) &&
            (null == tempNodeObjs[pRouterLinkTable[j]['remote_system_name']])) {
            var prLinkType =
                getpRouterLinkType(pRouterLinkTable[j]['type']);
            nodeObj =
                createNodeObj(pRouterLinkTable[j]['remote_system_name'],
                              prLinkType,
                              getPRouterEntryByName(pRouterLinkTable[j]['remote_system_name'],
                                                    data),
                              prConfigData);
            if (ctrlGlobal.NODE_TYPE_PROUTER == prLinkType) {
                var found =
                    isProuterExists(pRouterLinkTable[j]['remote_system_name'],
                                    prConfigData, pRouterData);
                if (CONFIG_NOT_FOUND == found) {
                    topoData['errors']['configNotFound'].push(pRouterLinkTable[j]['remote_system_name']);
                    continue;
                }
                if (UVE_NOT_FOUND == found) {
                    topoData['errors']['uveNotFound'].push(pRouterLinkTable[j]['remote_system_name']);
                    continue;
                }
                if (CONFIG_UVE_NOT_FOUND == found) {
                    /* Do not insert if both config/uve not found */
                    continue;
                }
            }
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

function getPhysicalTopologyByPRouter (prouter, appData, pRouterData,
                                       prConfigData, callback)
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
                topoData = buildPhysicalTopologyByPRouter(prouter, data,
                                                          prConfigData);
                callback(err, topoData);
                return;
            }
            pData = pData['value'];
            var dataLen = pData.length;
            for (var i = 0; i < dataLen; i++) {
                data['value'].push(pData[i]);
            }
        });
        topoData = buildPhysicalTopologyByPRouter(prouter, data, prConfigData);
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
    var dataObjArr = [];
    postData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable',
        'PRouterEntry:lldpTable:lldpLocalSystemData'];
    if (null != prouter) {
        postData['kfilt'] = [];
        postData['kfilt'] = [prouter];
    }
    var url = '/analytics/uves/prouter';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    var url =
        '/physical-routers?detail=true&field=physical_router_management_ip&' +
        'exclude_back_refs=true&exclude_children=true';
    commonUtils.createReqObj(dataObjArr, url, null, null, configApiServer, null,
                             appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        var pRouterData = results[0];
        var prConfigData = results[1];
        if ((null != err) || (null == pRouterData)) {
            callback(err, null);
            return;
        }
        if (null != prouter) {
            getPhysicalTopologyByPRouter(prouter, appData, pRouterData,
                                         prConfigData, callback);
        } else {
            getCompletePhysicalTopology(appData, pRouterData, prConfigData,
                                        callback);
        }
    });
}

function isProuterExists (node, prConfigData, prUVEData)
{
    var configFlag = CONFIG_NOT_FOUND;
    var uveFlag = UVE_NOT_FOUND;
    var prCnt = 0;
    try {
        var prConfig = prConfigData['physical-routers'];
        prCnt = prConfig.length;
    } catch(e) {
        prCnt = 0;
    }

    for (var i = 0; i < prCnt; i++) {
        try {
            if (node == prConfig[i]['physical-router']['fq_name'][1]) {
                configFlag = CONFIG_FOUND;
                break;
            }
        } catch(e) {
            continue;
        }
    }

    var prUVECnt = 0;
    try {
        var prUVE = prUVEData['value'];
        prUVECnt = prUVE.length;
    } catch(e) {
        prUVECnt = 0;
    }
    for (var i = 0; i < prUVECnt; i++) {
        if (node == prUVE[i]['name']) {
            uveFlag = UVE_FOUND;
            break;
        }
    }
    if (UVE_NOT_FOUND == uveFlag) {
        if (CONFIG_NOT_FOUND == configFlag) {
            return CONFIG_UVE_NOT_FOUND;
        }
        return UVE_NOT_FOUND;
    } else {
        if (CONFIG_NOT_FOUND == configFlag) {
            return CONFIG_NOT_FOUND;
        }
        return CONFIG_UVE_FOUND;
    }
    /* We will not come here */
    return CONFIG_UVE_NOT_FOUND;
}

function getCompletePhysicalTopology (appData, pRouterData, prConfigData, callback)
{
    var index = 0;
    var data = pRouterData['value'];
    var prouterCnt = data.length;
    var topoData = {};
    var tmpTopoObjs = {};
    topoData['nodes'] = [];
    topoData['links'] = [];
    topoData['errors'] = {'configNotFound': [], 'uveNotFound': []};
    var tempNodeObjs = {};
    var tempLinkObjs = {};

    for (var i = 0; i < prouterCnt; i++) {
        tempLinkObjs = {};
        if ((null != data[i]['name']) &&
            (null == tempNodeObjs[data[i]['name']])) {
            nodeObj = createNodeObj(data[i]['name'],
                                    ctrlGlobal.NODE_TYPE_PROUTER,
                                    data[i], prConfigData);
            var found = isProuterExists(data[i]['name'], prConfigData,
                                        pRouterData);
            if (CONFIG_NOT_FOUND == found) {
                topoData['errors']['configNotFound'].push(data[i]['name']);
                continue;
            }
            if (UVE_NOT_FOUND == found) {
                topoData['errors']['uveNotFound'].push(data[i]['name']);
                continue;
            }
            if (CONFIG_UVE_NOT_FOUND == found) {
                /* Do not push if config & uve not found */
                continue;
            }
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
        var linkCnt = 0;
        if (null != pRouterLinkTable) {
            linkCnt = pRouterLinkTable.length;
        }
        for (var j = 0; j < linkCnt; j++) {
            if (pRouterLinkTable[j]['remote_system_name'] === undefined){
              logutils.logger.error(data[i]['name'] + " --> one of the PRouterLinkEntry:link_table:remote_system_name is missing");
              continue;
            }
            if ((null != pRouterLinkTable[j]['remote_system_name']) &&
                (null ==
                 tempNodeObjs[pRouterLinkTable[j]['remote_system_name']])) {
                var prLinkType =
                    getpRouterLinkType(pRouterLinkTable[j]['type']);
                nodeObj =
                    createNodeObj(pRouterLinkTable[j]['remote_system_name'],
                                  prLinkType,
                                  getPRouterEntryByName(pRouterLinkTable[j]['remote_system_name'],
                                                        data),
                                  prConfigData);
                if (ctrlGlobal.NODE_TYPE_PROUTER == prLinkType) {
                    var found =
                        isProuterExists(pRouterLinkTable[j]['remote_system_name'],
                                        prConfigData, pRouterData);
                    if (CONFIG_NOT_FOUND == found) {
                        topoData['errors']['configNotFound'].push(pRouterLinkTable[j]['remote_system_name']);
                        continue;
                    }
                    if (UVE_NOT_FOUND == found) {
                        topoData['errors']['uveNotFound'].push(pRouterLinkTable[j]['remote_system_name']);
                        continue;
                    }
                    if (CONFIG_UVE_NOT_FOUND == found) {
                        /* Do not push if config & uve not found */
                        continue;
                    }
                }
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
    /* Now check if any of the config node we missed out */
    var topoNodesCnt = 0;
    topoNodesCnt = topoData['nodes'].length;
    for (var i = 0; i < topoNodesCnt; i++) {
        if ((null != topoData['nodes'][i]) &&
            (null != topoData['nodes'][i]['name'])) {
            tmpTopoObjs[topoData['nodes'][i]['name']] = {};
        }
    }
    var prConfigCnt = 0;
    try {
        var prConfig = prConfigData['physical-routers'];
        prConfigCnt = prConfig.length;
    } catch(e) {
        prConfigCnt = 0;
    }
    for (var i = 0; i < prConfigCnt; i++) {
        try {
            var prConfigName = prConfig[i]['physical-router']['fq_name'][1];
        } catch(e) {
            continue;
        }
        if (null == tmpTopoObjs[prConfigName]) {
            topoData['errors']['uveNotFound'].push(prConfigName);
        }
    }
    topoData['nodes'] = buildNodeChassisType(topoData['nodes'], pRouterData);
    callback(null, topoData);
}

function computePathByNodeList (allPaths, topoData)
{
    var endpoints = [];
    var nodeList = [];
    var pathList = JSON.parse(JSON.stringify(allPaths));
    var nodeCnt = topoData['nodes'].length;
    var endpoints = [];
    for (var i = 0; i < nodeCnt; i++) {
        if (topoData['nodes'][i]['name']) {
            nodeList.push(topoData['nodes'][i]['name']);
        }
    }
    var allPathsCnt = allPaths.length;
    for (var i = 0; i < allPathsCnt; i++) {
        if (nodeList.length != allPaths[i].length) {
            continue;
        }
        if (nodeList.sort().join(',') == (allPaths[i].sort().join(','))) {
            var computedPath = pathList[i];
            var nodesCnt = computedPath.length;
            for (var i = 0; i < nodesCnt; i++) {
                if (null != computedPath[i + 1]) {
                    endpoints.push({"endpoints": [computedPath[i], computedPath[i + 1]]});
                }
            }
            return endpoints;
        }
    }
    var nodeBits = [];
    /* We have not got the path, send the broken link */
    for (var i = 0; i < allPathsCnt; i++) {
        if (true == commonUtils.isSubArray(allPaths[i], nodeList)) {
            break;
        }
    }
    var resPath = [];
    if (i == allPathsCnt) {
        resPath = allPaths[0];
    } else {
        resPath = allPaths[i];
    }
    /* Now build the broken endpoints */
    var resPathNodeCnt = 0;
    if (null != resPath) {
        resPathNodeCnt = resPath.length;
    }
    for (var i = 1; i < resPathNodeCnt; i++) {
        if ((-1 != nodeList.indexOf(resPath[i - 1])) &&
            (-1 != nodeList.indexOf(resPath[i]))) {
            endpoints.push({'endpoints': [resPath[i - 1], resPath[i]]});
        }
    }
    return endpoints;
}

function getUnderlayPathByNodelist (req, topoData, srcNode, destNode, appData, callback)
{
    var body = req.body;
    var data = body['data'];
    var srcVM = null;
    var destVM = null;
    if (null != srcNode) {
        srcVM = srcNode['node'];
    }
    if (null != destNode) {
        destVM = destNode['node'];
    }
    doCheckIfInternalIPAndComputePath(req, srcNode, destNode, function(err, topo) {
        if (null != topo) {
            callback(err, topo, true);
            return;
        }
        getUnderlayPathByTopoData(req, topoData, srcVM, destVM, appData,
                                  callback);
    });
}

function doCheckIfInternalIPAndComputePath (req, srcNode, destNode, callback)
{
    var body = req.body;
    var data = body['data'];
    var srcVN = data['srcVN'];
    var destVN = data['destVN'];
    var srcIP = data['srcIP'];
    var destIP = data['destIP'];
    var nodeIP = data['nodeIP'];
    var topologyData = {'nodes':[], 'links': []};

    if (srcVN != destVN) {
        callback(null, null);
        return;
    }

    var srcVM = null;
    var srcVr = null;
    if (null != srcNode) {
        srcVM = srcNode['node'];
        if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == srcNode['node_type']) {
            srcVr = srcNode['vrouter'];
        }
    }
    var destVM = null;
    var destVr = null;
    if (null != destNode) {
        destVM = destNode['node'];
        if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == destNode['node_type']) {
            destVr = destNode['vrouter'];
        }
    }

    /* If any of srcIP/destIP matches with the dns/gateway ip, if
       yes, then send the path within this vrouter itself
     */
    var urlLists = [];
    var introspectUrl =
        nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT +
        '@' + '/Snh_VnListReq?name=' + srcVN;
    urlLists.push(introspectUrl);
    async.map(urlLists,
              commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                    true, vRouterSandeshParams),
              function(err, result) {
        var dnsServer = jsonPath(result[0], "$..dns_server");
        var gateway = jsonPath(result[0], "$..gateway");
        var byDest = false;
        var bySrc = false;
        if ((null != dnsServer) && (null != dnsServer[0]) &&
            (dnsServer[0].length > 0)) {
            var dnsLen = dnsServer[0].length;
            for (var i = 0; i < dnsLen; i++) {
                if (dnsServer[0][i]['_'] == srcIP) {
                    byDest = true;
                    break;
                }
                if (dnsServer[0][i]['_'] == destIP) {
                    bySrc = true;
                    break;
                }
            }
        }
        if ((false == byDest) && (false == bySrc) && (null != gateway) &&
            (null != gateway[0]) && (gateway[0].length > 0)) {
            var gwLen = gateway[0].length;
            for (var i = 0; i < gwLen; i++) {
                if (gateway[0][i]['_'] == srcIP) {
                    byDest = true;
                    break;
                }
                if (gateway[0][i]['_'] == destIP) {
                    bySrc = true;
                    break;
                }
            }
        }
        if ((true == byDest) && (null != destNode) &&
            (null != destVM) && (null != destVr) &&
            (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == destNode['node_type'])) {
            topologyData['nodes'].push({'name': destVM, 'node_type':
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
            topologyData['nodes'].push({'name': destVr, 'node_type':
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            topologyData['links'].push({'endpoints': [destVM, destVr]});
            topologyData['links'].push({'endpoints': [destVr, destVM]});
            callback(null, topologyData);
            return;
        }
        if ((true == bySrc) && (null != srcNode) &&
            (null != srcVM) && (null != srcVr) &&
            (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == srcNode['node_type'])) {
            topologyData['nodes'].push({'name': srcVM, 'node_type':
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
            topologyData['nodes'].push({'name': srcVr, 'node_type':
                                       ctrlGlobal.NODE_TYPE_VROUTER});
            topologyData['links'].push({'endpoints': [srcVM, srcVr]});
            topologyData['links'].push({'endpoints': [srcVr, srcVM]});
            callback(null, topologyData);
            return;
        }
        callback(null, null);
    });
}

function getUnderlayPathByTopoData (req, topoData, srcVM, destVM, appData,
                                    callback)
{
    var tempLinksObjArr = [];
    var url = '/analytics/uves/prouter';
    var key = ctrlGlobal.STR_GET_UNDERLAY_TOPOLOGY + '@' + url;
    redisUtils.checkAndGetRedisDataByKey(key, buildTopology, req, appData,
                                         function(err, topology) {
        for (var i = 0; i < topology['links'].length; i++) {
            delete topology['links'][i]['more_attributes'];
        }
        var nodeCnt = topoData['nodes'].length;
        var links = topology['links'];
        var linksCnt = links.length;
        for (var i = 0; i < linksCnt; i++) {
            tempLinksObjArr.push(links[i]['endpoints']);
        }
        if ((null == destVM) && ((null != topoData) &&
                                 (null != topoData['nodes']))) {
            /* In this case, check with destVM as prouter nodes which got
             * returned from OverlayToUnderlayFlowMap table
             */
            var pRouterList = [];
            var topoNodeList = topoData['nodes'];
            var nodeLen = topoNodeList.length;
            for (i = 0; i < nodeLen; i++) {
                if (ctrlGlobal.NODE_TYPE_PROUTER ==
                    topoNodeList[i]['node_type']) {
                    pRouterList.push(topoNodeList[i]['name']);
                }
            }
            if (!pRouterList.length) {
                callback(null, [], false);
                return;
            }
            var pathList = [];
            var prCnt = pRouterList.length;
            for (var i = 0; i < prCnt; i++) {
                var paths =
                    commonUtils.findAllPathsInEdgeGraph(tempLinksObjArr,
                                                        srcVM,
                                                        pRouterList[i]);
                pathList = pathList.concat(paths);
            }
            var endpoints = computePathByNodeList(pathList, topoData);
            callback(null, endpoints, false);
            return;
        }
        var nodes =
            commonUtils.findAllPathsInEdgeGraph(tempLinksObjArr, srcVM, destVM);
        var endpoints = computePathByNodeList(nodes, topoData);
        callback(null, endpoints, false);
    });
}

function getvRouterByIntfIP (intfIp, vmUVE, ipPrTable, vnFqn)
{
    var vRouterObj = {};
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
                if (vnFqn != intfList[j]['virtual_network']) {
                    continue;
                }
                return {'vrouter':
                    vmUVE[i]['value']['UveVirtualMachineAgent']['vrouter'],
                        'vm_name': intfList[j]['vm_name'],
                        'node': vmUVE[i]['name'],
                        'node_type': ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE};
            }
            var fipList = intfList[j]['floating_ips'];
            if (null != fipList) {
                var fipListLen = fipList.length;
                for (var k = 0; k < fipListLen; k++) {
                    if (fipList[k]['ip_address'] == intfIp) {
                        if (vnFqn != fipList[k]['virtual_network']) {
                            continue;
                        }
                        return {'vrouter':
                            vmUVE[i]['value']['UveVirtualMachineAgent']['vrouter'],
                                'vm_name': intfList[j]['vm_name'],
                                'node': vmUVE[i]['name'],
                                'node_type': ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE};
                    }
                }
            }
        }
    }

    if (null != ipPrTable[intfIp]) {
        return {'node': ipPrTable[intfIp],
            'node_type': ctrlGlobal.NODE_TYPE_PROUTER};
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
    var srcVN = data['srcVN'];
    var destVN = data['destVN'];
    var nodeIP = data['nodeIP'];
    if(data.hasOwnProperty("srcPort"))
        data["sport"] = data['srcPort'];
    if(data.hasOwnProperty("destPort"))
        data["dport"] = data['destPort'];
    var nodeName = null;
    var tmppRouterListObjs = {};

    var queryJSON = qeUtils.buildUnderlayQuery(data);

    qeUtils.executeQueryString(queryJSON, appData, function(err, result) {
        var flowPostData = {};
        flowPostData['cfilt'] = ['PRouterEntry:ipMib', 'ContrailConfig'];
        var url = '/analytics/uves/prouter';
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 flowPostData, null, null, appData);
        url = '/analytics/uves/virtual-machine';
        var vmPostData = {};
        vmPostData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
            'UveVirtualMachineAgent:vrouter'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vmPostData, null, null, appData);
        var vmiUrl = '/analytics/uves/virtual-machine-interface';
        var vmiPostData = {};
        vmiPostData['cfilt'] = vmiPostCfilt;
        commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_POST,
                                 vmiPostData, opApiServer, null, appData);
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(opApiServer, true),
                  function(err, results) {
            results[1] = mergeVMAndVMIUveData(results[1], results[2]);
            var ipPrTable = getIPToProuterMapTable(results[0]);

            var srcNode =
                getvRouterByIntfIP(srcIP, results[1], ipPrTable, srcVN);
            var destNode =
                getvRouterByIntfIP(destIP, results[1], ipPrTable, destVN);
            if ((null != srcNode) && (null != destNode) &&
                (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == srcNode['node_type']) &&
                (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == destNode['node_type']) &&
                (srcNode['vrouter'] == destNode['vrouter'])) {
                /* If both are on same vRouter, then directly send the link and
                 * node details, no need to consult further topology
                 */
                topoData['nodes'].push({"name": srcNode['node'],
                                       'node_type':
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['nodes'].push({"name": srcNode['vrouter'],
                                       'node_type':
                                       ctrlGlobal.NODE_TYPE_VROUTER});
                topoData['nodes'].push({"name": destNode['node'],
                                       'node_type':
                                       ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE});
                topoData['links'].push({'endpoints': [srcNode['node'],
                                       srcNode['vrouter']]});
                topoData['links'].push({'endpoints': [srcNode['vrouter'],
                                       destNode['node']]});
                commonUtils.handleJSONResponse(null, res, topoData);
                return;
            }
            if ((null != err) || (null == result) ||
                (null == result['value']) || (!result['value'].length)) {
                getUnderlayPathByNodelist(req, topoData, srcNode, destNode,
                        appData, function(err, endpoints,
                                          wholeTopo) {
                    if (true == wholeTopo) {
                        commonUtils.handleJSONResponse(err, res, endpoints);
                        return;
                    }
                    topoData['links'] = endpoints;
                    commonUtils.handleJSONResponse(err, res, topoData);
                });
                return;
            }
            result = result['value'];
            var nodeCnt = result.length;
            for (var i = 0; i < nodeCnt; i++) {
                var endPt1 = getNodeNameByPVData(result[i]['u_prouter'],
                                                  ipPrTable, results[1]);
                var nodeName = commonUtils.getValueByJsonPath(endPt1,
                                                              "nodeName", null);
                if (null == nodeName) {
                    nodeName = result[i]['u_prouter'];
                }
                tmppRouterListObjs[nodeName] = nodeName;
                topoData['nodes'].push({"name": nodeName,
                                       "node_type":
                                       ctrlGlobal.NODE_TYPE_PROUTER});
            }
            if ((null != srcNode) &&
                (null == tmppRouterListObjs[srcNode['node']])) {
                topoData['nodes'].push({"name": srcNode['node'],
                                       "node_type": srcNode['node_type']});
                tmppRouterListObjs[srcNode['node']] = srcNode['node'];
            }
            if ((null != destNode) &&
                (null == tmppRouterListObjs[destNode['node']])) {
                topoData['nodes'].push({"name": destNode['node'],
                                       "node_type": destNode['node_type']});
                tmppRouterListObjs[destNode['node']] = destNode['node'];
            }
            var srcVM = null;
            if (null != srcNode) {
                srcVM = srcNode['node'];
                if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == srcNode['node_type']) {
                    topoData['nodes'].push({"name": srcNode['vrouter'],
                                           "node_type":
                                           ctrlGlobal.NODE_TYPE_VROUTER});
                } else if (ctrlGlobal.NODE_TYPE_PROUTER ==
                           srcNode['node_type']) {
                    /* Already added in nodes array */
                }
            }
            var destVM = null;
            if (null != destNode) {
                destVM = destNode['node'];
                if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE == destNode['node_type']) {
                    topoData['nodes'].push({"name": destNode['vrouter'],
                                           "node_type":
                                           ctrlGlobal.NODE_TYPE_VROUTER});
                } else if (ctrlGlobal.NODE_TYPE_PROUTER ==
                           destNode['node_type']) {
                    /* Already added in nodes array */
                }
            }
            getUnderlayPathByNodelist(req, topoData, srcNode, destNode,
                                      appData, function(err, endpoints,
                                                        wholeTopo) {
                if (true == wholeTopo) {
                    commonUtils.handleJSONResponse(err, res, endpoints);
                    return;
                }
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
    var linkCnt = 0;
    try {
        var links = pData[node1FoundIndex]['value']['PRouterLinkEntry']['link_table'];
        linkCnt = links.length;
    } catch(e) {
        linkCnt = 0;
    }
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
    prPostData['cfilt'] = ['PRouterLinkEntry', 'PRouterEntry:ifTable'];
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             prPostData, null, null, appData);
    vrPostData['kfilt'] = [node1, node2];
    vrPostData['cfilt'] = ['VrouterStatsAgent:phy_if_stats_list'];
    url = '/analytics/uves/vrouter';
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             vrPostData, null, null, appData);
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
    var vrCnt = 0;

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
        var controlIP =
            commonUtils.getValueByJsonPath(vrouterData, "value;" + i +
                                           ";value;VrouterAgent;control_ip",
                                           "-");
        var ipList =
            commonUtils.getValueByJsonPath(vrouterData, "value;" + i +
                                           ";value;VrouterAgent;self_ip_list",
                                           []);
        if (!ipList.length) {
            ipList = [controlIP];
        }
        var ipLen = ipList.length;
        for (var j = 0; j < ipLen; j++) {
            if (ipList[j] == hop) {
                return {'nodeName': vrouterData['value'][i]['name'],
                        'nodeType': ctrlGlobal.NODE_TYPE_VROUTER};
            }
        }
    }
    return null;
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
            var prName =
                commonUtils.getValueByJsonPath(prouterData['value'][i],
                                               'name', null);
        } catch(e) {
            ipCnt = 0;
        }
        for (var idx = 0; idx < ipCnt; idx++) {
            if (null == ipPrTable[ipTable[idx]['ipAdEntIfIndex']]) {
                ipPrTable[ipTable[idx]['ipAdEntIfIndex']] = prName;
            }
        }
        var prMgmtIP =
            commonUtils.getValueByJsonPath(prouterData['value'][i],
                                           'value;ContrailConfig;elements;physical_router_management_ip',
                                           null);
        if (null != prMgmtIP) {
            var prIP = null;
            try {
                prIP = JSON.parse(prMgmtIP);
                prIP = prIP.split('\n')[0];
            } catch(e) {
                prIP = prMgmtIP;
            }
            if (null == ipPrTable[prIP]) {
                ipPrTable[prIP] = prName;
            }
        }
    }
    return ipPrTable;
}

function getTraceFlowByReqURL (req, urlLists, srcIP, destIP, srcVN, destVN,
                               appData, callback)
{
    var topoData = {};
    var dataObjArr = [];
    async.map(urlLists, commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                              false,
                                                              vRouterSandeshParams),
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
        prPostData['cfilt'] = ['PRouterEntry:ipMib', 'ContrailConfig'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 prPostData, null, null, appData);
        url = '/analytics/uves/vrouter';
        var vrPostData = {};
        vrPostData['cfilt'] = ['VrouterAgent:self_ip_list',
            'VrouterAgent:control_ip'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vrPostData, null, null, appData);
        var vmPostData = {};
        url = '/analytics/uves/virtual-machine';
        vmPostData['cfilt'] = ['UveVirtualMachineAgent:interface_list',
            'UveVirtualMachineAgent:vrouter'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 vmPostData, null, null, appData);
        var vmiUrl = '/analytics/uves/virtual-machine-interface';
        var vmiPostData = {};
        vmiPostData['cfilt'] = vmiPostCfilt;
        commonUtils.createReqObj(dataObjArr, vmiUrl, global.HTTP_REQUEST_POST,
                                 vmiPostData, opApiServer, null, appData);
        async.map(dataObjArr,
                  commonUtils.getServerResponseByRestApi(opApiServer, true),
                  function(err, results) {
            results[2] = mergeVMAndVMIUveData(results[2], results[3]);
            var hopCnt = hopList.length;
            topoData['nodes'] = [];
            var ipPrTable = getIPToProuterMapTable(results[0]);
            for (var i = 0; i < hopCnt; i++) {
                var nodeObj = getNodeNameByPVData(hopList[i]['_'], ipPrTable,
                                                  results[1]);
                var nodeName = commonUtils.getValueByJsonPath(nodeObj,
                                                              "nodeName", null);
                var nodeType = commonUtils.getValueByJsonPath(nodeObj,
                                                              "nodeType", null);
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
            var srcNode =
                getvRouterByIntfIP(srcIP, results[2], ipPrTable, srcVN);
            var destNode =
                getvRouterByIntfIP(destIP, results[2], ipPrTable, destVN);
            if (null != srcNode) {
                if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE ==
                    srcNode['node_type']) {
                    topoData['links'].push({'endpoints': [srcNode['node'],
                                       srcNode['vrouter']]});
                }
            }
            var nodeCnt = topoData['nodes'].length;
            for (var i = 0; i < nodeCnt - 1; i++) {
                topoData['links'].push({'endpoints': [topoData['nodes'][i]['name'],
                                          topoData['nodes'][i + 1]['name']]});
            }
            if (null != srcNode) {
                topoData['nodes'].push({"name": srcNode['node'],
                                       "node_type": srcNode['node_type']});
            }
            if (null != destNode) {
                topoData['nodes'].push({"name": destNode['node'],
                                       "node_type": destNode['node_type']});;
                if (ctrlGlobal.NODE_TYPE_VIRTUAL_MACHINE ==
                    destNode['node_type']) {
                    topoData['links'].push({'endpoints': [destNode['vrouter'],
                                       destNode['node']]});
                }
            }
            doCheckIfInternalIPAndComputePath(req, srcNode, destNode,
                                              function(err, topo) {
                if (null != topo) {
                    callback(null, topo);
                } else {
                    callback(null, topoData);
                }
            });
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
    var srcVN = introData['srcVN'];
    var destVN = introData['destVN'];
    var resolveVrfId = introData['resolveVrfId'];
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
    urlLists[0] = resolveVrfId + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' + vrfUrl;
    if (null == vrfName) {
        async.map(urlLists,
                  commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer,
                                                        false,
                                                        vRouterSandeshParams),
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
            getTraceFlowByReqURL(req, urlLists, srcIP, destIP, srcVN, destVN,
                                 appData, function(err, results) {
                commonUtils.handleJSONResponse(err, res, results);
            });
        });
    } else {
        url += '&vrf_name=' + vrfName;
        urlLists[0] = nodeIP + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@'
            + url + urlExtd;
        getTraceFlowByReqURL(req, urlLists, srcIP, destIP, srcVN, destVN,
                             appData, function(err, results) {
            commonUtils.handleJSONResponse(err, res, results);
        });
    }
}

function getIfStatsBypRouterLink (dataObj, callback)
{
    var appData = dataObj['appData'];
    var prouter1 = dataObj['prouter1'];
    var prouter2 = dataObj['prouter2'];
    var prouter1_ifidx = dataObj['prouter1_ifidx'];
    var prouter2_ifidx = dataObj['prouter2_ifidx'];
    var dataObjArr = [];
    var resultJSON = {};
    var timeGran;
    var timeObj = {};
    if (dataObj['more_attributes']['minsSince']!= null) {
        timeObj = qeUtils.createTimeQueryJsonObj(dataObj['more_attributes']['minsSince']);
        timeGran = qeUtils.getTimeGranByTimeSlice(timeObj,
            dataObj['more_attributes']['sampleCnt']);
    } else {
        timeGran = dataObj['more_attributes']['timeGran'];
    }

    var timeObj = qeUtils.createTimeQueryJsonObjByAppData(dataObj['more_attributes']);
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
                             queryJSON1, null, null, appData);
    commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                             queryJSON2, null, null, appData);
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
    var uiData = prObj['uiData'];
    var appData = prObj['appData'];
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
                        'more_attributes': uiData['data'], appData: appData});
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
                                            'uiData': body,
                                            'appData': appData},
                                            function(err, results) {
                    commonUtils.handleJSONResponse(err, res, results);
                    return;
                });
            });
        } else {
            buildpRouterLinkAndGetStats({'prLinkData': data,
                                         'uiData': body,
                                         'appData': appData},
                                        function(err, results) {
                commonUtils.handleJSONResponse(err, res, results);
            });
        }
    });
}

function getvnStatsPerVrouter (req, res, appData)
{
    var reqUrl = '/analytics/uves/vrouter';
    var urlKey = ctrlGlobal.STR_GET_VN_STATS_PER_VROUTER;
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             urlKey, reqUrl,
                                             0, 1, 0, -1, true, req.query);
}

exports.getvnStatsPerVrouter = getvnStatsPerVrouter;
exports.getUnderlayPath = getUnderlayPath;
exports.getUnderlayTopology = getUnderlayTopology;
exports.getUnderlayStats = getUnderlayStats;
exports.getTraceFlow = getTraceFlow;
exports.getpRouterLinkStats = getpRouterLinkStats;
