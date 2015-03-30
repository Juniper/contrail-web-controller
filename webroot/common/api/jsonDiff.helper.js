/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');

var configJsonModifyObj = {
    'virtual-network': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyVirtualNetworkConfigData,
        },
        'optFields': ['virtual_network_properties',
            'network_ipam_refs', 'network_policy_refs',
            'route_target_list', 'is_shared',
            'router_external', 'id_perms:enable'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'network-ipam': {
        'isConfig': true,
        'optFields': ['network_ipam_mgmt', 'virtual_DNS_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'security-group': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifySecurityGroupConfigData,
        },
        'optFields': ['security_group_entries'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'physical-topology': {
        'preProcessCB': {
            'applyOnOldJSON': modifyPhyTopoData,
            'applyOnNewJSON': modifyPhyTopoData,
        }
    }
};

function modifyPhyTopoData (type, jsonData, optFields, mandateFields)
{
    if (null == jsonData) {
        return jsonData;
    }
    var resultJSON = commonUtils.cloneObj(jsonData);
    var nodesLen = 0;
    try {
        nodesLen = resultJSON['nodes'].length;
    } catch(e) {
        nodesLen = 0;
    }

    for (var i = 0; i < nodesLen; i++) {
        if (null != resultJSON['nodes'][i]['more_attributes']) {
            delete resultJSON['nodes'][i]['more_attributes'];
        }
    }
    return resultJSON;
}

var configArrSkipObjs = ['href', 'uuid'];

function configArrAttrFound (configObj)
{
    if ((null != configObj['attr']) && (null != configObj['to'])) {
        return true;
    }
    return false;
}

function modifyVirtualNetworkConfigData (type, configData, optFields, mandateFields)
{
    /* Modify network ipam_refs in configData */
    var ipamRefs = configData[type]['network_ipam_refs'];
    if (null == ipamRefs) {
        return modifyConfigData(type, configData, optFields, mandateFields);
    }
    var ipamRefsLen = ipamRefs.length;
    for (var i = 0; i < ipamRefsLen; i++) {
        var ipamSubnets = [];
        var ipamSubnetsLen = 0;
        try {
            ipamSubnets = ipamRefs[i]['attr']['ipam_subnets'];
            ipamSubnetsLen = ipamSubnets.length;
        } catch(e) {
            ipamSubnetsLen = 0;
        }
        if (null == ipamSubnets) {
            ipamSubnetsLen = 0;
        }
        for (var j = 0; j < ipamSubnetsLen; j++) {
            delete ipamSubnets[j]['dns_server_address'];
        }
    }
    return modifyConfigData(type, configData, optFields, mandateFields);
}

function modifySecurityGroupConfigData (type, configData, optFields,
                                        mandateFields)
{
    var tmpConfigData = commonUtils.cloneObj(configData);
    var policyRuleLen = 0;
    try {
        var policyRule =
            tmpConfigData[type]['security_group_entries']['policy_rule'];
        policyRuleLen = policyRule.length;
    } catch(e) {
        policyRuleLen = 0;
    }
    for (var i = 0; i < policyRuleLen; i++) {
        if (null != policyRule[i]['rule_uuid']) {
            delete policyRule[i]['rule_uuid'];
        }
    }
    return tmpConfigData;
}

function modifyConfigData (type, configData, optFields, mandateFields)
{
    var newConfigData = commonUtils.cloneObj(configData[type]);
    var optFieldsLen = 0;
    if (null != optFields) {
        optFieldsLen = optFields.length;
    }
    var configArrSkipObjsLen = configArrSkipObjs.length;
    for (var i = 0; i < optFieldsLen; i++) {
        if (newConfigData[optFields[i]] instanceof Array) {
            var newConfigDataFieldsLen = newConfigData[optFields[i]].length;
            for (var j = 0; j < newConfigDataFieldsLen; j++) {
                if (false ==
                        configArrAttrFound(newConfigData[optFields[i]][j])) {
                    continue;
                }
                for (var k = 0; k < configArrSkipObjsLen; k++) {
                    if (null != newConfigData[optFields[i]][j][configArrSkipObjs[k]]) {
                        delete newConfigData[optFields[i]][j][configArrSkipObjs[k]];
                    }
                }
            }
        }
    }
    var resultJSON = {};
    resultJSON[type] = newConfigData;
    return resultJSON;
}

exports.configJsonModifyObj = configJsonModifyObj;
