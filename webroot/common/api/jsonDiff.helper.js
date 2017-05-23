/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');

var configJsonModifyObj = {
    "bgp-router": {
        "isConfig": true,
        "optFields": ["bgp_router_parameters",
                      "bgp_router_refs", "perms2","tag_refs"],
        "mandateFields":["fq_name", "uuid", "display_name"]
    },
    "virtual-router": {
        "isConfig": true,
        "optFields": ["virtual_router_ip_address",
                      "virtual_router_type", "perms2","tag_refs"],
        "mandateFields":["fq_name", "uuid", "display_name"]
    },
    "physical-router": {
        "isConfig": true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHrefUUID,
            'applyOnNewJSON': modifyConfigDataByAttrHrefUUID
        },
        "optFields": ["physical_router_vendor_name",
                      "physical_router_product_name",
                      "physical_router_management_ip",
                      "physical_router_dataplane_ip",
                      "physical_router_loopback_ip",
                      "physical_router_snmp_credentials",
                      "physical_router_user_credentials",
                      "physical_router_junos_service_ports",
                      "virtual_router_refs",
                      "bgp_router_refs",
                      "physical_router_vnc_managed",
                      "virtual_network_refs", "perms2","tag_refs"],
        "mandateFields":["fq_name", "uuid", "display_name"]
    },
    'virtual-network': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyVirtualNetworkConfigData,
        },
        'optFields': ['virtual_network_properties',
            'network_ipam_refs', 'network_policy_refs',
            'route_target_list', 'export_route_target_list',
            'import_route_target_list', 'is_shared',
            'router_external', 'id_perms:enable',
            'flood_unknown_unicast', 'multi_policy_service_chains_enabled',
            'route_table_refs', 'provider_properties',
            'ecmp_hashing_include_fields',
            'address_allocation_mode',
            'qos_config_refs',
            'perms2', 'pbb_evpn_enable', 'pbb_etree_enable',
            'layer2_control_word', 'mac_learning_enabled',
            'mac_limit_control', 'mac_move_control', 'mac_aging_time',"tag_refs"],
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
        'optFields': ['network_ipam_mgmt', 'virtual_DNS_refs', 'perms2', 'ipam_subnets','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'virtual-machine-interface': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHrefUUID,
            'applyOnNewJSON': modifyConfigDataByAttrHrefUUID
        },
        'optFields': ['ecmp_hashing_include_fields', 'virtual_machine_interface_bindings',
            'virtual_machine_interface_allowed_address_pairs',
            'service_health_check_refs', 'virtual_machine_interface_dhcp_option_list',
            'virtual_machine_interface_fat_flow_protocols',
            'id_perms:enable',
            'virtual_machine_interface_refs',
            'interface_route_table_refs',
            'virtual_machine_interface_properties',
            'virtual_machine_interface_mac_addresses', 'security_group_refs',
            'virtual_network_refs', 'virtual_machine_interface_device_owner',
            'virtual_machine_interface_disable_policy',
            'qos_config_refs',
            'port_security_enabled',
            'perms2',
            'tag_refs'
        ],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    "network-policy": {
        "isConfig": true,
        "optFields": ["network_policy_entries", "perms2","tag_refs"],
        "mandateFields":["fq_name", "uuid", "display_name"]
    },
    'security-group': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifySecurityGroupConfigData,
        },
        'optFields': ['security_group_entries', 'configured_security_group_id',
                      'perms2',"tag_refs"],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'logical-router': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref,
            'applyOnNewJSON': modifyConfigDataByAttrHref
        },
        'optFields': [
            'virtual_machine_interface_refs',
            'virtual_network_refs',
            'configured_route_target_list',
            'perms2',
            'tag_refs'
        ],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    "routing-policy": {
        "isConfig": true,
        "optFields": ["routing_policy_entries", "perms2","tag_refs"],
        "mandateFields":["fq_name", "uuid", "display_name"]
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
        'optFields': ['service_instance_properties', 'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'bgp-as-a-service': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref
        },
        'optFields': ['bgpaas_session_attributes',
                      'autonomous_system',
                      'bgpaas_ip_address',
                      'virtual_machine_interface_refs',
                      'bgpaas_ipv4_mapped_ipv6_nexthop',
                      'bgpaas_suppress_route_advertisement',
                      'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'physical-interface': {
        'isConfig': true,
        'optFields': ['physical_interface_refs', 'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'logical-interface': {
        'isConfig': true,
        'preProcessCB': {
            'applyOnOldJSON': modifyConfigDataByAttrHref
        },
        'optFields': ['virtual_machine_interface_refs', 'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'global-system-config': {
        'isConfig': true,
        'optFields': ['autonomous_system', 'ibgp_auto_mesh', 'ip_fabric_subnets'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'global-vrouter-config': {
        'isConfig': true,
        'optFields': ['forwarding_mode', 'vxlan_network_identifier_mode',
                      'encapsulation_priorities', 'linklocal_services',
                      'flow_export_rate', 'flow_aging_timeout_list',
                      'ecmp_hashing_include_fields'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'service-appliance': {
        'isConfig': true,
        'optFields': ['service_appliance_ip_address',
            'service_appliance_user_credentials',
            'service_appliance_properties', 'physical_interface_refs',
            'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'service-appliance-set': {
        'isConfig': true,
        'optFields': ['service_appliance_ha_mode', 'service_appliance_driver',
            'service_appliance_set_properties', 'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'route-table': {
        'isConfig': true,
        'optFields': ['routes', 'perms2','tag_refs'],
        'mandateFields': ['fq_name', 'uuid', 'display_name']
    },
    'interface-route-table': {
        'isConfig': true,
        'optFields': ['interface_route_table_routes', 'perms2','tag_refs'],
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
var configArrSkipObjsAttrHref = ['href', 'attr'];
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
