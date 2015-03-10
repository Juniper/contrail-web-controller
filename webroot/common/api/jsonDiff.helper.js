/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');

var configJsonModifyObj = {
    'virtual-network': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigData,
        },
        'optFields': ['virtual_network_properties',
            'network_ipam_refs', 'network_policy_refs',
            'route_target_list', 'floating_ip_pools'],
        'mandateFields': ['fq_name', 'uuid']
    },
    'network-ipam': {
        'isConfig': true,
        'optFields': ['network_ipam_mgmt', 'virtual_DNS_refs'],
        'mandateFields': ['fq_name', 'uuid']
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
