/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

module.exports;

var cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api'),
    global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api'),
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    infraCmn = require('../../../common/api/infra.common.api'),
    nwMonUtils = require('../../../common/api/nwMon.utils'),
    assert = require('assert'),
    async = require('async');

var instanceFilters = [
    'UveVirtualMachineAgent:vm_name',
    'UveVirtualMachineAgent:uuid',
    'UveVirtualMachineAgent:cpu_info',
    'UveVirtualMachineAgent:vrouter',
    'UveVirtualMachineAgent:interface_list'
];

var interfaceFilters = [
    'UveVMInterfaceAgent:vm_name',
    'UveVMInterfaceAgent:virtual_network',
    'UveVMInterfaceAgent:uuid',
    'UveVMInterfaceAgent:if_stats',
    'UveVMInterfaceAgent:vm_uuid',
    'UveVMInterfaceAgent:ip_address',
    'UveVMInterfaceAgent:gateway',
    'UveVMInterfaceAgent:mac_address',
    'UveVMInterfaceAgent:is_health_check_active',
    'UveVMInterfaceAgent:health_check_instance_list'
];

var networkFilters = [
    'UveVirtualNetworkAgent:in_stats',
    'UveVirtualNetworkAgent:out_stats',
    'UveVirtualNetworkAgent:in_bandwidth_usage',
    'UveVirtualNetworkAgent:out_bandwidth_usage',
    'UveVirtualNetworkAgent:virtualmachine_list',
    'UveVirtualNetworkAgent:interface_list',
    'UveVirtualNetworkAgent:associated_fip_count',
    'UveVirtualNetworkConfig'
];

function vnLinkListed(srcVN, dstVN, dir, vnNodeList) {
    var cnt = vnNodeList.length;
    for (var i = 0; i < cnt; i++) {
        if (((vnNodeList[i]['src'] == srcVN) && (vnNodeList[i]['dst'] == dstVN)) || ((vnNodeList[i]['src'] == dstVN) && (vnNodeList[i]['dst'] == srcVN))) {
            if (dir != vnNodeList[i]['dir']) {
                vnNodeList[i]['error'] = 'Other link marked as ' + dir + 'directional, attach policy';
            }
            return i;
        }
    }
    return -1;
}

function vnNameListed(vnName, nodes, fqName) {
    var cnt = nodes.length;
    for (var i = 0; i < cnt; i++) {
        if (vnName == nodes[i]['name']) {
            return true;
        }
    }
    return false;
}

function ifLinkStatExists(srcVN, dstVN, stats, resultJSON) {
    var cnt = stats.length;
    for (var i = 0; i < cnt; i++) {
        if ((srcVN == stats[i]['src']) &&
            (dstVN == stats[i]['dst'])) {
            resultJSON['error'] = 'Other link marked as unidirectional, attach policy.';
            return true;
        }
    }
    return false;
}

function getLinkStats(linkMoreAttrs, vnUVENode, connectedVNFQN, link) {
    var j = 0, inStats =
        commonUtils.getValueByJsonPath(vnUVENode,
                                       "value;UveVirtualNetworkAgent;in_stats",
                                       []),
        outStats;

    if (inStats.length > 0) {
        if (null == linkMoreAttrs['in_stats']) {
            linkMoreAttrs['in_stats'] = [];
            j = 0;
        } else {
            j = linkMoreAttrs['in_stats'].length;
        }
        var inStatLength = inStats.length;
        for (var i = 0; i < inStatLength; i++) {
            if (ifLinkStatExists(vnUVENode['name'], connectedVNFQN, linkMoreAttrs['in_stats'], link)) {
                continue;
            }
            if (inStats[i]['other_vn'] == connectedVNFQN) {
                linkMoreAttrs['in_stats'][j] = {};
                linkMoreAttrs['in_stats'][j]['src'] = vnUVENode['name'];
                linkMoreAttrs['in_stats'][j]['dst'] = connectedVNFQN;
                linkMoreAttrs['in_stats'][j]['pkts'] = inStats[i]['tpkts'];
                linkMoreAttrs['in_stats'][j]['bytes'] = inStats[i]['bytes'];
                j++;
                break;
            }
        }
    }

    j = 0;
    outStats =
        commonUtils.getValueByJsonPath(vnUVENode,
                                       "value;UveVirtualNetworkAgent;out_stats",
                                       []);

    if (outStats.length > 0) {
        if (null == linkMoreAttrs['out_stats']) {
            linkMoreAttrs['out_stats'] = [];
            j = 0;
        } else {
            j = linkMoreAttrs['out_stats'].length;
        }
        inStatLength = outStats.length;
        for (i = 0; i < inStatLength; i++) {
            if (ifLinkStatExists(vnUVENode['name'], connectedVNFQN,
                                 linkMoreAttrs['out_stats'], link)) {
                continue;
            }
            if (outStats[i]['other_vn'] == connectedVNFQN) {
                linkMoreAttrs['out_stats'][j] = {};
                linkMoreAttrs['out_stats'][j]['src'] = vnUVENode['name'];
                linkMoreAttrs['out_stats'][j]['dst'] = connectedVNFQN;
                linkMoreAttrs['out_stats'][j]['pkts'] = outStats[i]['tpkts'];
                linkMoreAttrs['out_stats'][j]['bytes'] = outStats[i]['bytes'];
                j++;
                break;
            }
        }
    }
    return linkMoreAttrs;
}

function getVNPolicyRuleDirection(dir) {
    if (dir == '<>') {
        return 'bi';
    } else {
        return 'uni';
    }
}


function vnOrSIConfigExist(fqName, configData) {
    try {
        var configDataCnt = configData.length;
    } catch (e) {
        return false;
    }
    for (var i = 0; i < configDataCnt; i++) {
        try {
            var configNode = configData[i]['fq_name'].join(':');
            if (configNode == fqName) {
                break;
            }
        } catch (e) {
        }
    }
    if (i == configDataCnt) {
        return false;
    }
    return true;
}

function parseAndGetMissingVNsUVEs(fqName, vnUVE, appData, callback) {
    var resultJSON = [], insertedVNObjs = {}, index = 0,
        vnCnt = vnUVE.length, arrIndex = 0,
        url = '/analytics/uves/virtual-network',
        vnName, pos;
        var vnKfilt = [];

    for (var i = 0; i < vnCnt; i++) {
        vnName = vnUVE[i]['name'];
        if (false == isAllowedVN(fqName, vnName)) {
            continue;
        }
        pos = vnName.indexOf(fqName);
        if (pos != -1) {
            if (insertedVNObjs[vnName] == null) {
                insertedVNObjs[vnName] = vnName;
                resultJSON[index++] = vnUVE[i];
            }
            var partConnNws =
                commonUtils.getValueByJsonPath(vnUVE[i],
                                               "value;UveVirtualNetworkConfig;partially_connected_networks",
                                               []);

            var len = partConnNws.length;
            for (var j = 0; j < len; j++) {
                var partConnVN = partConnNws[j];
                if ((insertedVNObjs[partConnVN] == null) &&
                    (false == isServiceVN(partConnVN))) {
                    insertedVNObjs[partConnVN] = partConnVN;
                    if (false == isAllowedVN(fqName, partConnVN)) {
                        vnKfilt.push(partConnVN);
                    } else {
                        resultJSON[index++] = getVNUVEByVNName(vnUVE,
                            partConnVN);
                    }
                }
            }
            var connNws =
                commonUtils.getValueByJsonPath(vnUVE[i],
                                               "value;UveVirtualNetworkConfig;connected_networks",
                                               []);
            len = connNws.length;
            for (j = 0; j < len; j++) {
                var connVN = connNws[j];
                if ((insertedVNObjs[connVN] == null) &&
                    (false == isServiceVN(connVN))) {
                    insertedVNObjs[connVN] = connVN;
                    if (false == isAllowedVN(fqName, connVN)) {
                        vnKfilt.push(connVN);
                    } else {
                        resultJSON[index++] = getVNUVEByVNName(vnUVE, connVN);
                    }
                }
            }
        }
    }
    if (!vnKfilt.length) {
        /* All VNs are included */
        callback(null, resultJSON);
        return;
    }
    var postData = {};
    postData['kfilt'] = vnKfilt;
    opApiServer.apiPost(url, postData, appData, function (err, data) {
        if (err || (null == data)) {
            logutils.logger.error('In Network Topology: we did not get data ' +
            'for: ' + url);
            callback(null, resultJSON);
            return;
        }
        var len = resultJSON.length;
        data = data['value'];
        var newCnt = data.length;
        for (var i = 0; i < newCnt; i++) {
            resultJSON[len + i] = data[i];
        }
        callback(null, resultJSON);
    });
};

function getVNUVEByVNName(vnUVEs, vnName) {
    var uve = {};
    uve['name'] = vnName;
    uve['value'] = {};
    var cnt = vnUVEs.length;
    for (var i = 0; i < cnt; i++) {
        if (vnUVEs[i]['name'] == vnName) {
            return vnUVEs[i];
        }
    }
    return uve;
}

function isAllowedVN(fqName, vnName) {
    if ((null == vnName) || (null == fqName)) {
        return false;
    }

    if (true == isServiceVN(vnName)) {
        return false;
    }

    var vnNameArr = vnName.split(':'),
        fqNameArr = fqName.split(':'),
        fqLen = fqNameArr.length;

    if (3 == fqLen) {
        /* VN */
        if (fqName == vnName) {
            return true;
        }
    } else if (2 == fqLen) {
        /* Project */
        if ((vnNameArr[0] == fqNameArr[0]) && (vnNameArr[1] == fqNameArr[1])) {
            return true;
        }
    } else if (1 == fqLen) {
        if ('*' == fqNameArr[0]) {
            return true;
        }
        if (vnNameArr[0] == fqNameArr[0]) {
            return true;
        }
    }
    return false;
}

function updateMissingVNsByConfig(fqName, nwTopoData, configData) {
    var nwList = {};
    try {
        var vnConfig = configData['virtual-networks'];
        var vnConfigCnt = vnConfig.length;
    } catch (e) {
        return nwTopoData;
    }
    try {
        var nodesCnt = nwTopoData['nodes'].length;
    } catch (e) {
        nwTopoData = {};
        nwTopoData['nodes'] = [];
        nodesCnt = 0;
    }
    try {
        var linkCnt = nwTopoData['links'].length;
    } catch (e) {
        nwTopoData['links'] = [];
    }

    for (var i = 0; i < nodesCnt; i++) {
        var vn = nwTopoData['nodes'][i]['name'];
        if (vn) {
            nwList[vn] = vn;
        }
    }
    for (i = 0; i < vnConfigCnt; i++) {
        try {
            var vn = vnConfig[i]['fq_name'].join(':');
            if ((nwList[vn] == null) &&
                (true == isAllowedVN(fqName, vn))) {
                nwTopoData['nodes'][nodesCnt++] = createNWTopoVNNode(vn, "Active");
            }
        } catch (e) {
            continue;
        }
    }
    return nwTopoData;
}

function makeBulkDataByFqn(fqName, data) {
    var tempArr = fqName.split(':');
    if (tempArr.length == 3) {
        /* Exact VN, now change the data format */
        var tempData = {};
        tempData['value'] = [];
        tempData['value'][0] = {};
        tempData['value'][0]['name'] = fqName;
        tempData['value'][0]['value'] = commonUtils.cloneObj(data);
        data = tempData;
    }
    return data;
}

function parseServiceChainUVE(fqName, resultJSON, scUVE) {
    var cnt = scUVE ? scUVE.length : 0;
    for (var i = 0; i < cnt; i++) {
        resultJSON = getServiceChainNode(fqName, resultJSON, scUVE[i]);
    }
    return resultJSON;
}

function parseVirtualNetworkUVE(fqName, vnUVE) {
    var resultJSON = { nodes: [], links: [] },
        vnCnt = vnUVE.length;

    for (var i = 0; i < vnCnt; i++) {
        resultJSON = getVirtualNetworkNode(fqName, resultJSON, vnUVE[i]);
    }
    return resultJSON;
}

function updateVNStatsBySIData(scResultJSON, vnUVE) {
    try {
        var links = scResultJSON['links'],
            linksCnt = links.length;

    } catch (e) {
        return scResultJSON;
    }

    for (var i = 0; i < linksCnt; i++) {
        if (null == links[i]['service_inst']) {
            continue;
        }
        if (getVNStatsBySIData(scResultJSON['links'][i], scResultJSON, vnUVE)) {
            i = -1;
            linksCnt--;
        }
    }
    return scResultJSON;
}

function getVNStatsBySIData(links, scResultJSON, vnUVE) {
    var src = links['src'],
        dst = links['dst'],
        dir = links['dir'];

    try {
        var scLinks = scResultJSON['links'],
            linksCnt = scLinks.length;

        for (var i = 0; i < linksCnt; i++) {
            try {
                if (null == scLinks[i]['service_inst']) {
                    if (((scResultJSON['links'][i]['src'] == links['src']) && (scResultJSON['links'][i]['dst'] == links['dst'])) ||
                        ((scResultJSON['links'][i]['src'] == links['dst']) && (scResultJSON['links'][i]['dst'] == links['src']))) {
                        links['more_attributes'] = scResultJSON['links'][i]['more_attributes'];
                        scResultJSON['links'].splice(i, 1);
                        return 1;
                    }
                }
            } catch (e) {
                continue;
            }
        }
    } catch (e) {
    }
    /* Now check if we have any stat in UVE */
    var srcVNUVE = getVNUVEByVNName(vnUVE, links['src']),
        destVNUVE = getVNUVEByVNName(vnUVE, links['dst']);

    links['more_attributes'] = {};
    getVNStats(links, srcVNUVE, "in_stats", links['src'], links['dst']);
    getVNStats(links, srcVNUVE, "out_stats", links['src'], links['dst']);
    getVNStats(links, destVNUVE, "in_stats", links['dst'], links['src']);
    getVNStats(links, destVNUVE, "out_stats", links['dst'], links['src']);
    return 0;
}

function getVNStats(links, vnUVE, jsonP, src, dest) {
    var stats =
        commonUtils.getValueByJsonPath(vnUVE,
                                       "value;UveVirtualNetworkAgent;" + jsonP,
                                       []),
    statsCnt = stats.length;
    for (var i = 0; i < statsCnt; i++) {
        if (stats[i]['other_vn'] == dest) {
            if (null == links['more_attributes'][jsonP]) {
                links['more_attributes'][jsonP] = [];
                cnt = 0;
            } else {
                cnt = links['more_attributes'][jsonP].length;
            }
            links['more_attributes'][jsonP][cnt] = {};
            links['more_attributes'][jsonP][cnt]['src'] = src;
            links['more_attributes'][jsonP][cnt]['dst'] = dest;
            links['more_attributes'][jsonP][cnt]['pkts'] =
                stats[i]['tpkts'];
            links['more_attributes'][jsonP][cnt]['bytes'] =
                stats[i]['bytes'];
            break;
        }
    }
}

function getVNNodeAttributes(vnUVENode) {
    var moreAttributes = {vm_count: 0, vmi_count: 0, in_throughput: 0, out_throughput: 0, virtualmachine_list: []},
        uveVirtualNetworkAgent;

    try {
        uveVirtualNetworkAgent = vnUVENode['value']['UveVirtualNetworkAgent'];
        if (uveVirtualNetworkAgent != null) {
            moreAttributes['vm_count'] = commonUtils.getValueByJsonPath(uveVirtualNetworkAgent, 'virtualmachine_list', []).length;
            moreAttributes['vmi_count'] = commonUtils.getValueByJsonPath(uveVirtualNetworkAgent, 'interface_list', []).length;
            moreAttributes['in_throughput'] = commonUtils.getValueByJsonPath(uveVirtualNetworkAgent, 'in_bandwidth_usage', 0);
            moreAttributes['out_throughput'] = commonUtils.getValueByJsonPath(uveVirtualNetworkAgent, 'out_bandwidth_usage', 0);
            moreAttributes['virtualmachine_list'] = commonUtils.getValueByJsonPath(uveVirtualNetworkAgent,'virtualmachine_list', []);
        }
    } catch (e) {
        logutils.logger.error(e.stack);
    }
    return moreAttributes;
};

function getVirtualNetworkNode(fqName, resultJSON, vnUVENode) {
    var i = 0, j = 0, nodeCnt = resultJSON['nodes'].length,
        linkCnt = resultJSON['links'].length;

    resultJSON['nodes'][nodeCnt] = {};
    resultJSON['nodes'][nodeCnt]['name'] = vnUVENode['name'];
    resultJSON['nodes'][nodeCnt]['more_attributes'] = getVNNodeAttributes(vnUVENode);
    //resultJSON['nodes'][nodeCnt]['raw_uve_data'] = vnUVENode['value'];

    var partConnNws =
        commonUtils.getValueByJsonPath(vnUVENode,
                                       "value;UveVirtualNetworkConfig;partially_connected_networks",
                                       []);
    var len = partConnNws.length;

    for (var i = 0; i < len; i++) {
        if (((-1 == (vnUVENode['name']).indexOf(fqName)) &&
             (-1 == (partConnNws[i]).indexOf(fqName))) ||
            (true == isServiceVN(vnUVENode['name'])) ||
            (true == isServiceVN(partConnNws[i]))) {
            continue;
        }
        var index = vnLinkListed(vnUVENode['name'], partConnNws[i], 'uni', resultJSON['links']);

        if (-1 != index) {
            getLinkStats(resultJSON['links'][index]['more_attributes'], vnUVENode, partConnNws[i], resultJSON['links'][index]);
            continue;
        }
        index = linkCnt + j;
        resultJSON['links'][index] = {};
        resultJSON['links'][index]['src'] = vnUVENode['name'];
        resultJSON['links'][index]['dst'] = partConnNws[i];
        resultJSON['links'][index]['dir'] = 'uni';
        resultJSON['links'][index]['more_attributes'] = {};
        getLinkStats(resultJSON['links'][index]['more_attributes'], vnUVENode, partConnNws[i], resultJSON['links'][index]);
        resultJSON['links'][index]['error'] = 'Other link marked as ' + 'unidirectional, attach policy';
        j++;
    }

    var linkCount = resultJSON['links'].length,
        connectedVNs =
            commonUtils.getValueByJsonPath(vnUVENode,
                                           "value;UveVirtualNetworkConfig;connected_networks",
                                           []);
    var connectedVNLength = connectedVNs.length;
    j = 0;

    resultJSON['nodes'][nodeCnt]['more_attributes']['connected_networks'] =
        [connectedVNs];
    for (var i = 0; i < connectedVNLength; i++) {
        if ((-1 == (vnUVENode['name']).indexOf(fqName)) ||
            (true == isServiceVN(vnUVENode['name'])) ||
            (true == isServiceVN(connectedVNs[i]))) {
            continue;
        }
        var index = vnLinkListed(vnUVENode['name'], connectedVNs[i], 'bi', resultJSON['links']);

        if (-1 != index) {
            getLinkStats(resultJSON['links'][index]['more_attributes'],
                             vnUVENode, connectedVNs[i], resultJSON['links'][index]);
        } else {
            resultJSON['links'][linkCount + j] = {};
            resultJSON['links'][linkCount + j]['src'] = vnUVENode['name'];
            resultJSON['links'][linkCount + j]['dst'] = connectedVNs[i];
            resultJSON['links'][linkCount + j]['dir'] = 'bi';
            resultJSON['links'][linkCount + j]['more_attributes'] = {};
            getLinkStats(resultJSON['links'][linkCount + j]['more_attributes'],
                         vnUVENode, connectedVNs[i], resultJSON['links'][index]);
            j++;
        }
    }

    var nodeCnt = resultJSON['nodes'].length;
    for (i = 0; i < nodeCnt; i++) {
        resultJSON['nodes'][i]['node_type'] = global.STR_NODE_TYPE_VIRTUAL_NETWORK;
    }
    return resultJSON;
}

function getServiceChainNode(fqName, resultJSON, scUVENode) {
    var nodeCnt = resultJSON['nodes'].length,
        linkCnt = resultJSON['links'].length,
        srcVN = scUVENode['value']['UveServiceChainData']['source_virtual_network'],
        destVN = scUVENode['value']['UveServiceChainData']['destination_virtual_network'],
        j = 0, found, services;

    if ((false == isAllowedVN(fqName, srcVN)) && (false == isAllowedVN(fqName, destVN))) {
        return resultJSON;
    }

    found = vnNameListed(srcVN, resultJSON['nodes']);
    if (false == found) {
        if (true == isServiceVN(srcVN)) {
            return;
        }
        resultJSON['nodes'][nodeCnt + j] = {};
        resultJSON['nodes'][nodeCnt + j]['name'] = srcVN;
        resultJSON['nodes'][nodeCnt + j]['node_type'] = global.STR_NODE_TYPE_VIRTUAL_NETWORK;
        j++;
    }

    found = vnNameListed(destVN, resultJSON['nodes']);
    if (false == found) {
        if (true == isServiceVN(destVN)) {
            return;
        }
        resultJSON['nodes'][nodeCnt + j] = {};
        resultJSON['nodes'][nodeCnt + j]['name'] = destVN;
        resultJSON['nodes'][nodeCnt + j]['node_type'] = global.STR_NODE_TYPE_VIRTUAL_NETWORK;
        j++;
    }

    services =
        commonUtils.getValueByJsonPath(scUVENode,
                                       "value;UveServiceChainData;services",
                                       []);
    var svcCnt = services.length,
        nodeCnt = resultJSON['nodes'].length;

    j = 0;
    resultJSON['links'][linkCnt] = {};
    resultJSON['links'][linkCnt]['src'] = srcVN;
    resultJSON['links'][linkCnt]['dst'] = destVN;
    resultJSON['links'][linkCnt]['more_attributes'] = {};
    resultJSON['links'][linkCnt]['service_inst'] = services;
    var dir =
        commonUtils.getValueByJsonPath(scUVENode,
                                       "value;UveServiceChainData;direction",
                                       null);
    resultJSON['links'][linkCnt]['dir'] = getVNPolicyRuleDirection(dir);

    for (var i = 0; i < svcCnt; i++) {
        found = vnNameListed(services[i], resultJSON['nodes']);
        if (false == found) {
            resultJSON['nodes'][nodeCnt + j] = {};
            resultJSON['nodes'][nodeCnt + j]['name'] = services[i];
            resultJSON['nodes'][nodeCnt + j]['node_type'] = global.STR_NODE_TYPE_SERVICE_CHAIN;
            j++;
        }
    }
    return resultJSON;
}

function updateVNNodeStatus(result, configVN, configSI, fqName) {
    var nodes = result['nodes'],
        nodeCnt = nodes.length,
        found = false;

    for (var i = 0; i < nodeCnt; i++) {
        var node = result['nodes'][i]['name'];
        var nodeType = result['nodes'][i]['node_type'];
        if (global.STR_NODE_TYPE_VIRTUAL_NETWORK == nodeType) {
            found = vnOrSIConfigExist(node, configVN);
        } else {
            found = vnOrSIConfigExist(node, configSI);
        }
        if (found == false) {
            result['nodes'][i]['status'] = 'Deleted';
        } else {
            result['nodes'][i]['status'] = 'Active';
        }
    }

    var links = result['links'],
        linkCnt = links.length;

    for (var i = 0; i < linkCnt; i++) {
        if ((false == isAllowedVN(fqName, links[i]['src'])) && (false == isAllowedVN(fqName, links[i]['dst']))) {
            result['links'].splice(i, 1);
            i = -1;
            linkCnt--;
        }
        /*
        if ((links[i]['more_attributes']['in_stats']) && (links[i]['more_attributes']['out_stats'])) {
            result['links'][i]['dir'] = 'bi';
        } else {
            result['links'][i]['dir'] = 'uni';
        }
        */
    }
}

function createNWTopoVNNode(vnName, status) {
    var node = {};
    node['name'] = vnName;
    node['more_attributes'] = {};
    node['node_type'] = global.STR_NODE_TYPE_VIRTUAL_NETWORK;
    node['status'] = status;
    return node;
}

function setAssociatedPolicys4Network(fqName, scResultJSON) {
    var nodes = scResultJSON['nodes'],
        node, i, attachedPolicies, networkPolicys = [];
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        if (node['name'] == fqName && node['node_type'] == global.STR_NODE_TYPE_VIRTUAL_NETWORK) {
            attachedPolicies = node['more_attributes']['attached_policies'];
            for (var j = 0; attachedPolicies != null && j < attachedPolicies.length; j++) {
                networkPolicys.push({"fq_name": (attachedPolicies[j]['vnp_name']).split(":")});
            }
            scResultJSON['configData']['network-policys'] = networkPolicys;
        }
    }
}

function updatePolicyConfigData(configGraphJSON, appData, callback) {
    var reqUrl = null, dataObjArr = [],
        policys, policyCount;

    try {
        policys = configGraphJSON['configData']['network-policys'];
        policyCount = policys.length;
        for (var i = 0; i < policyCount; i++) {
            reqUrl = '/network-policy/' + policys[i]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, null, null, appData);
        }
    } catch (e) {
        callback(configGraphJSON);
        return;
    }

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false), function (err, data) {
        for (var j = 0; j < data.length; j++) {
            try {
                var npEntries = data[j]['network-policy']['network_policy_entries'];
                policys[j]['network_policy_entries'] = npEntries;
            } catch (error) {
                policys[j]['network_policy_entries'] = {'policy_rule': []};
            }
        }
        callback(configGraphJSON);
    });
}

function updateServiceInstanceConfigData(scResultJSON, siConfig, appData, callback) {
    var reqUrl = null;
    var dataObjArr = [];

    try {
        var links = scResultJSON['links'];
        var linkCnt = links.length;
        var siConfigCnt = siConfig.length;
    } catch (e) {
        callback(scResultJSON);
        return;
    }
    var urlLists = [];
    var storedSIList = {};

    for (var i = 0, l = 0; i < linkCnt; i++) {
        try {
            var svcCnt = links[i]['service_inst'].length;
        } catch (e) {
            continue;
        }
        for (var j = 0; j < svcCnt; j++) {
            if (null != storedSIList[links[i]['service_inst'][j]]) {
                /* Already taken */
                continue;
            }
            for (var k = 0; k < siConfigCnt; k++) {
                var fqn = siConfig[k]['fq_name'].join(':');
                if (fqn == links[i]['service_inst'][j]) {
                    storedSIList[fqn] = fqn;
                    reqUrl = '/service-instance/' +
                    siConfig[k]['uuid'];
                    commonUtils.createReqObj(dataObjArr, reqUrl,
                        global.HTTP_REQUEST_GET,
                        null, null, null,
                        appData);
                }
            }
        }
    }
    async.map(dataObjArr,
        commonUtils.getServerResponseByRestApi(configApiServer, false),
        function (err, data) {
            scResultJSON['configData']['service-instances'] = data;
            callback(scResultJSON);
        });
}

function isServiceVN(vnName) {
    if (null == isServiceVN) {
        return false;
    }
    var vnNameArr = vnName.split(':');
    var vnNameLen = vnNameArr.length;

    if (3 != vnNameLen) {
        return false;
    }
    if ((-1 == vnNameArr[2].indexOf('svc-vn-right')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-left')) &&
        (-1 == vnNameArr[2].indexOf('svc-vn-mgmt'))) {
        return false;
    }
    return true;
}

function getProjectFQN4Network(networkFQN) {
    var networkFQNArray = networkFQN.split(":");
    if (networkFQNArray.length == 3) {
        return networkFQNArray[0] + ":" + networkFQNArray[1];
    } else {
        return null;
    }
}

function getNetworkConnectedGraph(req, res, appData) {
    var fqName = req.query['fqName'],
        dataObjArr = [], reqUrl;

    reqUrl = '/analytics/uves/virtual-network/' + fqName + '?cfilt=' + networkFilters.join(',');
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
    if (req.session.userRole.indexOf(global.STR_ROLE_ADMIN) > -1) {
        reqUrl = '/analytics/uves/service-chain/*';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
    }

    reqUrl = '/virtual-networks';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    reqUrl = '/service-instances';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false), function (err, networkData) {
        networkData[0] = makeBulkDataByFqn(fqName, networkData[0]);
        processNetworkConnectedGraph(fqName, networkData, appData, function (err, result) {
            result = updateMissingVNsByConfig(fqName, result, networkData[2]);
            commonUtils.handleJSONResponse(null, res, result);
        });
    });
};

function processNetworkConnectedGraph(fqName, networkData, appData, callback) {
    var resultJSON = [], vnFound = true,
        configVN = commonUtils.getValueByJsonPath(networkData,
                '2;virtual-networks', []),
        configSI = commonUtils.getValueByJsonPath(networkData,
                '3;service-instances', []);

    try {
        var vnUVE = networkData[0]['value'],
            scUVE = networkData[1]['value'];

        if ((null == vnUVE) && (null == scUVE)) {
            vnFound = false;
        }
    } catch (e) {
        vnFound = false;
    }

    if (false == vnFound) {
        callback(null, resultJSON);
        return;
    }

    parseAndGetMissingVNsUVEs(fqName, vnUVE, appData, function (err, vnUVE) {
        var vnResultJSON = parseVirtualNetworkUVE(fqName, vnUVE),
            scResultJSON = parseServiceChainUVE(fqName, vnResultJSON, scUVE);

        scResultJSON = updateVNStatsBySIData(scResultJSON, vnUVE);
        scResultJSON['config-data'] = {'virtual-networks': configVN, 'service-instances': configSI};

        updateVNNodeStatus(scResultJSON, configVN, configSI, fqName);
        callback(null, scResultJSON);
    });
};

function getNetworkConfigGraph(req, res, appData) {
    var fqName = req.query['fqName'],
        dataObjArr = [], reqUrl;

    reqUrl = '/network-policys?parent_type=project&parent_fq_name_str=' + getProjectFQN4Network(fqName);
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false), function (err, networkConfigData) {
        processNetworkConfigGraph(fqName, networkConfigData, appData, function (err, result) {
            commonUtils.handleJSONResponse(null, res, result);
        });
    });
}

function processNetworkConfigGraph(fqName, networkData, appData, callback) {
    var networkConfigGraph = {},
        configPolicy = networkData[0]['network-policys'];

    networkConfigGraph['configData'] = {"network-policys": configPolicy};
    //setAssociatedPolicys4Network(fqName, networkConfigGraph);

    updatePolicyConfigData(networkConfigGraph, appData, function (resultJSON) {
        callback(null, resultJSON);
    });

    /*
     updateServiceInstanceConfigData(scResultJSON, configSI, appData, function (scResultJSON) {
     callback(null, scResultJSON)
     });
     */
};

function getProjectConnectedGraph(req, res, appData) {
    var fqName = req.query['fqName'],
        dataObjArr = [], reqUrl;

    reqUrl = '/analytics/uves/virtual-network/' + fqName + ':*?cfilt=' + networkFilters.join(',');
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
    if (req.session.userRole.indexOf(global.STR_ROLE_ADMIN) > -1) {
        reqUrl = '/analytics/uves/service-chain/*';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
    }

    reqUrl = '/virtual-networks';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    reqUrl = '/service-instances';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false), function (err, projectData) {
        processProjectConnectedGraph(fqName, projectData, appData, function (err, result) {
            result = updateMissingVNsByConfig(fqName, result, projectData[2]);
            commonUtils.handleJSONResponse(null, res, result);
        });
    });
}

function processProjectConnectedGraph(fqName, projectData, appData, callback) {
    var resultJSON = [], vnFound = true,
        configVN = commonUtils.getValueByJsonPath(projectData,
                '2;virtual-networks', []),
        configSI = commonUtils.getValueByJsonPath(projectData,
                '3;service-instances',[]);

    try {
        var vnUVE = projectData[0]['value'];
        var scUVE = projectData[1]['value'];
        if ((null == vnUVE) && (null == scUVE)) {
            vnFound = false;
        }
    } catch (e) {
        vnFound = false;
    }

    if (false == vnFound) {
        callback(null, resultJSON);
        return;
    }

    parseAndGetMissingVNsUVEs(fqName, vnUVE, appData, function (err, vnUVE) {
        var vnResultJSON = parseVirtualNetworkUVE(fqName, vnUVE),
            scResultJSON = parseServiceChainUVE(fqName, vnResultJSON, scUVE);

        scResultJSON = updateVNStatsBySIData(scResultJSON, vnUVE);
        scResultJSON['config-data'] = {'virtual-networks': configVN, 'service-instances': configSI};

        updateVNNodeStatus(scResultJSON, configVN, configSI, fqName);
        callback(err, scResultJSON);
    });
}

function getProjectConfigGraph(req, res, appData) {
    var fqName = req.query['fqName'],
        dataObjArr = [], reqUrl;

    reqUrl = '/network-policys?parent_type=project&parent_fq_name_str=' + fqName;
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    reqUrl = '/security-groups?parent_type=project&parent_fq_name_str=' + fqName;
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    reqUrl = '/network-ipams?parent_type=project&parent_fq_name_str=' + fqName;
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, configApiServer, null, appData);

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false), function (err, projectConfigData) {
        processProjectConfigGraph(fqName, projectConfigData, appData, function (err, result) {
            commonUtils.handleJSONResponse(null, res, result);
        });
    });
}


function processProjectConfigGraph(fqName, projectConfigData, appData, callback) {
    var configNP = commonUtils.getValueByJsonPath(projectConfigData,
            "0;network-policys", [], false),
        configSG = commonUtils.getValueByJsonPath(projectConfigData,
            "1;security-groups", [], false),
        configIPAM = commonUtils.getValueByJsonPath(projectConfigData,
            "2;network-ipams", [], false),
        configGraphJSON = {};

    configGraphJSON['configData'] = {
        'network-policys': configNP,
        'security-groups': configSG,
        'network-ipams': configIPAM
    };

    updatePolicyConfigData(configGraphJSON, appData, function (resultJSON) {
        callback(null, resultJSON);
    });
}

function getInstanceConnectedGraph(req, res, appData) {
    var instanceUUID = req.query['instanceUUID'],
        interfaceList = req.query['interfaceList'],
        instanceUrl, interfaceUrl, networkUrl,
        dataObjArr = [];
    instanceUrl = '/analytics/uves/virtual-machine/' + instanceUUID + '?cfilt=' + instanceFilters.join(',');
    commonUtils.createReqObj(dataObjArr, instanceUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);

    async.map(dataObjArr, commonUtils.getServerResponseByRestApi(configApiServer, false),
              function (err, instanceData) {
        var interfaceList =
            commonUtils.getValueByJsonPath(instanceData,
                                           "0;UveVirtualMachineAgent;interface_list",
                                           []);
        interfaceUrl = "/analytics/uves/virtual-machine-interface/*?kfilt=" +
            interfaceList.join(",") + "&cfilt=" + interfaceFilters.join(",");

        opApiServer.apiGet(interfaceUrl, appData, function (err, interfaceData) {
            var interfaceDetailsList = interfaceData['value'],
                networkList = [], interfaceMap = {}, network;

            for (var i = 0; i < interfaceDetailsList.length; i++) {
                network = interfaceDetailsList[i]['value']['UveVMInterfaceAgent']['virtual_network'];
                interfaceMap[network] = interfaceDetailsList[i];
                networkList.push(network);
            }

            instanceData[0]['UveVirtualMachineAgent']['interface_map'] = interfaceMap;
            networkUrl = '/analytics/uves/virtual-network/*?kfilt=' + networkList.join(',') + "&cfilt=" + networkFilters.join(",");

            opApiServer.apiGet(networkUrl, appData, function (err, networkData) {
                processInstanceConnectedGraph({instance: instanceData[0], networks: networkData['value']}, function (error, connectedGraphJSON) {
                    commonUtils.handleJSONResponse(null, res, connectedGraphJSON);
                });
            });
        });
    });
};

function processInstanceConnectedGraph(instanceGraphData, callback) {
    var connectedGraphJSON = {nodes: [], links: []},
        instance = instanceGraphData['instance'],
        networkList = instanceGraphData['networks'] || [],
        instanceFQN = instance['UveVirtualMachineAgent']['vm_name'],
        interfaceMap = instance['UveVirtualMachineAgent']['interface_map'],
        instanceNode = {name: instanceFQN, fqName: instance['UveVirtualMachineAgent']['uuid'], uve: instance, node_type: "virtual-machine", status: "Active"};

    connectedGraphJSON['nodes'].push(instanceNode);

    for (var i = 0; i < networkList.length; i++) {
        var networkName = networkList[i]['name'],
            interfaceDetails = interfaceMap[networkName],
            interfaceStats = interfaceDetails['value']['UveVMInterfaceAgent']['if_stats'] || {},
            isHealthCheckActive = interfaceDetails['value']['UveVMInterfaceAgent']['is_health_check_active'],
            networkNode = {name: networkName, more_attributes: getVNNodeAttributes(networkList[i]), node_type: "virtual-network", status: "Active"};

        if(!isServiceVN(networkName) && instanceNode['srcVNDetails'] == null) {
            instanceNode['srcVNDetails'] = {name: networkName};
        }

        var inStats = {src: networkName, dst: instanceFQN , pkts: interfaceStats['in_pkts'], bytes: interfaceStats['in_bytes']},
            outStats = {src: networkName, dst: instanceFQN, pkts: interfaceStats['out_pkts'], bytes: interfaceStats['out_bytes']},
            link = {
                src: networkName, dst: instanceFQN, dir: "bi",
                more_attributes: {in_stats: [inStats], out_stats: [outStats], is_health_check_active: isHealthCheckActive}
            };

        connectedGraphJSON['nodes'].push(networkNode);
        connectedGraphJSON['links'].push(link);
    }

    callback(null, connectedGraphJSON);
};

exports.getProjectConnectedGraph = getProjectConnectedGraph;
exports.getProjectConfigGraph = getProjectConfigGraph;

exports.getNetworkConnectedGraph = getNetworkConnectedGraph;
exports.getNetworkConfigGraph = getNetworkConfigGraph;

exports.getInstanceConnectedGraph = getInstanceConnectedGraph;
exports.getInstanceConfigGraph = getNetworkConfigGraph;
