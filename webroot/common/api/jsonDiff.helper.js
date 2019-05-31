/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');

var configJsonModifyObj = {
    "bgp-router": {
        "isConfig": true,
        'preProcessCB': {
            'comparators': ['to', 'attr']
        }
    },
    "virtual-router": {
        "isConfig": true,
        'preProcessCB': {
            'comparators': ['to', 'attr']
        }
    },
    "physical-router": {
        "isConfig": true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHrefUUID,
            'applyOnNewJSON': modifyConfigDataByAttrHrefUUID,
            'comparators': ['to']
        }
    },
    'virtual-network': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyVirtualNetworkConfigData,
            'comparators': ['to']
        },
        'exception_list': ['network_ipam_refs'],
        'children': {
            'floating_ip_pool': {
                'comparators': ['to', 'projects'],
                "references": ["project"]
            },
            'bridge_domain': {
                'comparators': ['to']
            }
        }
    },
    'network-ipam': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to']
        }
    },
    'virtual-machine-interface': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHrefUUID,
            'applyOnNewJSON': modifyConfigDataByAttrHrefUUID
        }
    },
    "network-policy": {
        "isConfig": true
    },
    'security-group': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifySecurityGroupConfigData,
        }
    },
    'logical-router': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByHref,
            'applyOnNewJSON': modifyConfigDataByHref,
            'comparators': ['to']
        }
    },
    "routing-policy": {
        "isConfig": true
    },
    'virtual-DNS': {
        'isConfig': true,
        'mandateFields': ['fq_name', 'uuid', 'display_name', 'virtual_DNS_data',
                          'perms2','tag_refs']
    },
    'virtual-DNS-record': {
        'isConfig': true,
        'mandateFields': ['fq_name', 'uuid', 'display_name',
                          'virtual_DNS_record_data', 'perms2','tag_refs']
    },
    'service-instance': {
        'isConfig': true,
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'loadbalancer': {
        'isConfig': true
    },
    'loadbalancer-listener': {
        'isConfig': true
    },
    'loadbalancer-pool': {
        'isConfig': true
    },
    'loadbalancer-healthmonitor': {
        'isConfig': true
    },
    'loadbalancer-member': {
        'isConfig': true
    },
    'bgp-as-a-service': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref,
            'comparators': ['to']
        }
    },
    'physical-interface': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to']
        }
    },
    'logical-interface': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref,
            'comparators': ['to']
        }
    },
    'service-appliance': {
        'isConfig': true
    },
    'service-appliance-set': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to']
        }
    },
    'route-table': {
        'isConfig': true
    },
    'interface-route-table': {
        'isConfig': true
    },
    'physical-topology': {
        'preProcessCB': {
            'applyOnOldJSON': modifyPhyTopoData,
            'applyOnNewJSON': modifyPhyTopoData,
        }
    },
    'application-policy-set': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to', 'attr']
        }
    },
    'firewall-policy': {
        'isConfig': true,
        'exception_list': ['firewall_rule_refs'],
        'preProcessCB': {
            'comparators': ['to', 'attr']
        }
    },
    'firewall-rule': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to', 'attr']
        }
    },
    'service-group': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to']
        }
    },
    'address-group': {
        'isConfig': true,
        'preProcessCB': {
            'comparators': ['to']
        }
    },
    'arrayDiff': {
        'floating-ip-pool': {
            'preProcessCB': {
                'comparators': ['to', 'projects']
            },
        },
        'bgp-router': {},
        'bridge-domain': {},
        'physical-interface': {
            'preProcessCB': {
                'comparators': ['uuid', 'to']
            }
        },
        'service_health_check_back_refs': {
            'preProcessCB': {
                'comparators': ['to', 'uuid', 'attr']
            }
        },
        'application_policy_set_back_refs': {
            'preProcessCB': {
                'comparators': ['to', 'uuid', 'attr']
            }
        },
        'physical_router_back_refs': {
            'preProcessCB': {
                'comparators': ['uuid']
            }
        },
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
var configArrSkipObjsAttrHref = ['href', 'attr'];
var configArrSkipObjsHref = ['href'];
var configArrSkipObjsAttrHrefUUID = ['href', 'attr', 'uuid'];

function modifyConfigDataByAttrHref (type, configData,
    optFields, mandateFields)
{
    return modifyConfigData(type, configData, optFields, mandateFields,
            configArrSkipObjsAttrHref);
};

function modifyConfigDataByAttrHrefUUID (type, configData,
        optFields, mandateFields)
{
        return modifyConfigData(type, configData, optFields, mandateFields,
                                configArrSkipObjsAttrHrefUUID);
};

function modifyConfigDataByHrefUUID (type, configData,
        optFields, mandateFields)
{
    return modifyConfigData(type, configData, optFields, mandateFields,
            configArrSkipObjsUUID);
};

function modifyConfigDataByHref (type, configData,
        optFields, mandateFields)
{
    return modifyConfigData(type, configData, optFields, mandateFields,
            configArrSkipObjsHref);
};


function modifyVirtualNetworkConfigData (type, configData, optFields, mandateFields)
{
    /* Modify network ipam_refs in configData */
    if (null == configData[type]) {
        return configData;
    }
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
    if ((null == configData) || (null == configData[type])) {
        return configData;
    }
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
