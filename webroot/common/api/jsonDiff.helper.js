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
            'router_external', 'id_perms:enable',
            'flood_unknown_unicast' ],
        'mandateFields': ['fq_name', 'uuid', 'display_name'],
        'subType': {
            'project': {
                'optFields': ['floating_ip_pool_refs'],
                'mandateFields': ['fq_name', 'uuid', 'display_name']
            }
        },
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
    'virtual-DNS': {
        'isConfig': true,
        'mandateFields': ['fq_name', 'uuid', 'display_name', 'virtual_DNS_data']
    },
    'virtual-DNS-record': {
        'isConfig': true,
        'mandateFields': ['fq_name', 'uuid', 'display_name',
                          'virtual_DNS_record_data']
    },
    'service-instance': {
        'isConfig': true,
        'optFields': ['service_instance_properties'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'logical-interface': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref,
        },
        'optFields': ['virtual_machine_interface_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'physical-topology': {
        'preProcessCB': {
            'applyOnOldJSON': modifyPhyTopoData,
            'applyOnNewJSON': modifyPhyTopoData,
        }
    },
    'arrayDiff': {
     /*   'floating-ip-pool': {
        }
      */
      'bgp-router':{}
    },
    'configDelete': {
        'virtual-machine-interface': {
            'del-back-refs': [
                'instance-ip'
            ]
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

var configArrSkipObjsUUID = ['href', 'uuid'];
var configArrSkipObjsAttr = ['href', 'attr'];
function modifyConfigDataByAttrHref (type, configData, optFields, mandateFields)
{
    return modifyConfigData(type, configData, optFields, mandateFields,
                            configArrSkipObjsAttr);
}

function configArrAttrFound (configObj, skipArr)
{
    var skipArrLen = skipArr.length;
    for (var i = 0; i < skipArrLen; i++) {
        var found = false;
        for (key in configObj) {
            if (key == skipArr[i]) {
                found = true;
                break;
            }
        }
        if (false == found) {
            return false;
        }
    }
    return true;
}

function modifyVirtualNetworkConfigData (type, configData, optFields, mandateFields)
{
    /* Modify network ipam_refs in configData */
    var ipamRefs = configData[type]['network_ipam_refs'];
    if (null == ipamRefs) {
        return modifyConfigData(type, configData, optFields, mandateFields,
                                configArrSkipObjsUUID);
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
    return modifyConfigData(type, configData, optFields, mandateFields,
                            configArrSkipObjsUUID);
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

function modifyConfigData (type, configData, optFields, mandateFields, skipArr)
{
    var newConfigData = commonUtils.cloneObj(configData[type]);
    var optFieldsLen = 0;
    if (null != optFields) {
        optFieldsLen = optFields.length;
    }
    var configArrSkipObjsLen = skipArr.length;
    for (var i = 0; i < optFieldsLen; i++) {
        if (newConfigData[optFields[i]] instanceof Array) {
            var newConfigDataFieldsLen = newConfigData[optFields[i]].length;
            for (var j = 0; j < newConfigDataFieldsLen; j++) {
                if (false ==
                        configArrAttrFound(newConfigData[optFields[i]][j],
                                           skipArr)) {
                    continue;
                }
                for (var k = 0; k < configArrSkipObjsLen; k++) {
                    delete newConfigData[optFields[i]][j][skipArr[k]];
                }
            }
        }
    }
    var resultJSON = {};
    resultJSON[type] = newConfigData;
    return resultJSON;
}

exports.configJsonModifyObj = configJsonModifyObj;
