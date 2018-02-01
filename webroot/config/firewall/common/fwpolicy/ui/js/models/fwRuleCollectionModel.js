/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/views/policyFormatters',
    'config/firewall/common/fwpolicy/ui/js/fwPolicy.utils'
], function (_, ContrailModel, PolicyFormatters, FWPolicyUtils) {
    var policyFormatters = new PolicyFormatters(),
        self;
    var fwPolicyUtils = new FWPolicyUtils();
    var fwRuleModel = ContrailModel.extend({
        defaultConfig: {
            'action_list':{
                'apply_service':null,
                'gateway_name':null,
                'log':false,
                'mirror_to':{
                    'analyzer_name': null,
                    'analyzer_ip_address': null,
                    'routing_instance': null,
                    'udp_port': null,
                    'analyzer_mac_address': null,
                    'juniper_header': "enabled",
                    'nh_mode': null,
                    'static_nh_header': {
                        'vtep_dst_ip_address': null,
                        'vtep_dst_mac_address': null,
                        'vni': null
                    },
                    'nic_assisted_mirroring': false,
                    'nic_assisted_mirroring_vlan': null
                },
                'qos_action': null},
            'log_checked':false,
            'apply_service_check' : false,
            'mirror_to_check' : false,
            'qos_action_check': false,
            'application':[],
            'direction': '<>',
            'protocol': 'any',
            'dst_addresses': [],
            'dst_address' : 'any' + cowc.DROPDOWN_VALUE_SEPARATOR + 'virtual_network',
            'dst_ports':[],
            'dst_ports_text':"ANY",
            'src_addresses':[],
            'src_address' : 'any' + cowc.DROPDOWN_VALUE_SEPARATOR + 'virtual_network',
            'src_ports':[],
            'src_ports_text': 'ANY',
            'simple_action': 'pass',
            'service_instance':'',
            'mirror':'',
            'mirrorToRoutingInstance': "",
            'mirrorToNHMode': "dynamic",
            'user_created_juniper_header': "enabled",
            'user_created_mirroring_optns': "analyzer_instance",
            'rule_uuid':'',
            'analyzer_name':'',
            'rule_sequence':{
                'major': -1,
                'minor': -1
            },
            'src_addresses_arr': {
                "security_group": null,
                "virtual_network": "any",
                "network_policy": null,
                "subnet": null
            },
            'dst_addresses_arr': {
                "security_group": null,
                "virtual_network": "any",
                "network_policy": null,
                "subnet": null
            },
            "endpoint_1": '',
            "endpoint_2": '',
            "service": {
                "protocol": null,
                "dst_ports": null,
                "src_ports": null
            },
            'fq_name': null,
            'name': null,
            'status': true,
            'user_created_service': '',
            'match_tags': [],
            'sequence': null,
            'simple_action': 'pass',
            'slo_check' : false,
            'security_logging_object_refs':'',
            'dataSourceAllData':[]
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            var domain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME),
                project = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
                simpleAction = getValueByJsonPath(modelConfig,
                               "action_list;simple_action", "");
            if (simpleAction != "") {
                modelConfig["simple_action"] = simpleAction
            }
            var direction = getValueByJsonPath(modelConfig, "direction", "");
            if(direction != ''){
                var directionList = direction.split(';');
                if(directionList.length == 3){
                    modelConfig["direction"] = '<>';
                }else if(directionList.length == 2){
                    if(directionList[0] == '&lt'){
                        modelConfig["direction"] = '<';
                    }else if(directionList[0] == '&gt'){
                        modelConfig["direction"] = '>';
                    }
                }
            }
            var tags = getValueByJsonPath(modelConfig, "match_tags;tag_list", []);
            if(tags.length > 0){
                modelConfig['match_tags'] = tags;
            }else{
                modelConfig['match_tags'] = [] ;
            }
            var serviceGrpRef = getValueByJsonPath(modelConfig,"service_group_refs",[]);
            if(serviceGrpRef.length > 0){
                var to = serviceGrpRef[0].to;
                if(modelConfig.isGlobal){
                    modelConfig["user_created_service"] = to[to.length - 1];
                }else{
                    if(to.length < 3){
                       var serviceName = 'global:' + to[to.length - 1];
                       modelConfig["user_created_service"] = serviceName;
                    } else{
                       modelConfig["user_created_service"] = to[to.length - 1];
                    }
                }
            }else{
                if(modelConfig['service'] !== undefined && Object.keys(modelConfig['service']).length > 0){
                    var serviceList = [], srcPort, dstPort;
                    var protocol = getValueByJsonPath(modelConfig, "service;protocol", "");
                    var srcStartPort = getValueByJsonPath(modelConfig, "service;src_ports;start_port", '');
                    var srcEndtPort = getValueByJsonPath(modelConfig, "service;src_ports;end_port", '');
                    var dstStartPort = getValueByJsonPath(modelConfig, "service;dst_ports;start_port", '');
                    var dstEndtPort = getValueByJsonPath(modelConfig, "service;dst_ports;end_port", '');
                    if(protocol !== ''){
                       serviceList.push(protocol);
                    }
                    if(srcStartPort === srcEndtPort){
                        srcPort = srcStartPort === -1 ? ctwl.FIREWALL_POLICY_ANY : srcStartPort;
                    }else{
                       if(srcStartPort === 0 && srcEndtPort === 65535){
                           srcPort = 'any';
                       }else{
                           srcPort = srcStartPort + '-' + srcEndtPort;
                       }
                    }
                    if(srcPort !== ''){
                       serviceList.push(srcPort);
                    }
                    if(dstStartPort === dstEndtPort){
                        dstPort = dstStartPort === -1 ? ctwl.FIREWALL_POLICY_ANY : dstStartPort;
                    }else{
                       if(dstStartPort === 0 && dstEndtPort === 65535){
                           dstPort = 'any';
                       }else{
                           dstPort = dstStartPort + '-' + dstEndtPort;
                       }
                    }
                    if(dstPort !== ''){
                       serviceList.push(dstPort);
                    }
                    modelConfig["user_created_service"] = serviceList.join(':');
                }
            }
            var endpoint1 = getValueByJsonPath(modelConfig, "endpoint_1");
            if(endpoint1 === ''){
                modelConfig['endpoint_1'] = '';
            }else{
                modelConfig['endpoint_1'] = self.getEndpointVal(endpoint1, modelConfig);
            }
            var endpoint2 = getValueByJsonPath(modelConfig, "endpoint_2");
            if(endpoint2 === ''){
                modelConfig['endpoint_2'] = '';
            }else{
                modelConfig['endpoint_2'] = self.getEndpointVal(endpoint2, modelConfig);
            }
            var sloRef = getValueByJsonPath(modelConfig,
                    "security_logging_object_refs", []);
            if (sloRef.length > 0) {
                var sloList = [];
                _.each(sloRef, function(obj) {
                    sloList.push(obj.to.join(':'));
                });
                modelConfig["security_logging_object_refs"] =
                    sloList.join(cowc.DROPDOWN_VALUE_SEPARATOR);
                modelConfig["slo_check"] = true;
            } else {
                modelConfig["security_logging_object_refs"] = null;
                modelConfig["slo_check"] = false;
            }
            return modelConfig;
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;
            isValid = model.isValid(attributePath, validation);
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                                (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        getEndpointVal : function(endpoint, modelConfig){
            var endpointArr = [];

            if(endpoint.tags && endpoint.tags.length > 0){
                _.each(endpoint.tags, function(tag){
                    var grpName = tag ? tag.split(ctwc.TAG_SEPARATOR)[0]: '';
                    grpName = grpName.indexOf('global:') != -1 ? grpName.split(':')[1] : grpName;
                    var val = tag + cowc.DROPDOWN_VALUE_SEPARATOR + cowl.getFirstCharUpperCase(grpName);
                    endpointArr.push(val);
                });
            } else if(endpoint.virtual_network) {
                var vn = endpoint.virtual_network +
                     cowc.DROPDOWN_VALUE_SEPARATOR + 'virtual_network';
                endpointArr.push(vn);
            } else if(endpoint.address_group) {
                var addressGrp = endpoint.address_group +
                cowc.DROPDOWN_VALUE_SEPARATOR + 'address_group';
                endpointArr.push(addressGrp);
            }else if(endpoint.any){
                var any = 'any'+
                cowc.DROPDOWN_VALUE_SEPARATOR + 'any_workload';
                endpointArr.push(any);
            }
            if(endpointArr.length > 0){
                return endpointArr.join(',');
            }else{
                return '';
            }
        },
        validations: {
            ruleValidation: {
               'service_instance': function(val, attr, data) {
                    if (data.apply_service_check != true) {
                        return;
                    }
                    if (val == "" || val == null) {
                        return "Select atleast one service to apply.";
                    }
                    var valArr = val.split(",");
                    var valArrLen = valArr.length;
                    var inNetworkTypeCount = 0;
                    for (var i = 0; i < valArrLen; i++) {
                        var SIValue = valArr[i].split(" ");
                        if (SIValue.length >= 2 && SIValue[1] == "in-network-nat") {
                            inNetworkTypeCount++;
                            if (inNetworkTypeCount >= 2) {
                                return "Cannot have more than one 'in-network-nat'\
                                        services."
                            }
                        }
                    }
                    var SIValue = valArr[valArrLen-1].split(" ");
                    if (inNetworkTypeCount >= 1 && SIValue[1] != "in-network-nat") {
                        return "Last instance should be of 'in-network-nat'\
                                service mode while applying services."
                    }
                    var error = self.isBothSrcDscCIDR(data);
                    if (error != "") {
                        return error;
                    }
                    var result = self.checkAnyOrLocal(data, "src_address");
                    if(result == true) {
                        return "Source network cannot be 'any' or 'local' while applying services.";
                    }
                    result = self.checkAnyOrLocal(data, "dst_address");
                    if(result == true) {
                        return "Destination network cannot be 'any' or 'local' while applying services.";
                    }

                },
                'src_address': function(val, attr, data) {
                    var result = self.validateAddressFormat(val, "Source");
                    if (result != "") {
                        return result
                    }
                    var error = self.isBothSrcDscCIDR(data);
                    if (error != "") {
                        return error;
                    }
                    var result = self.checkAnyOrLocal(data, "src_address");
                    if(result == true) {
                        return "Source network cannot be 'any' or 'local' while applying services.";
                    }
                },
                'dst_address': function(val, attr, data) {
                    var result = self.validateAddressFormat(val, "Destination");
                    if (result != "") {
                        return result
                    }
                    var error = self.isBothSrcDscCIDR(data);
                    if (error != "") {
                        return error;
                    }
                    var result = self.checkAnyOrLocal(data, "dst_address");
                    if(result == true) {
                        return "Destination network cannot be 'any' or 'local' while applying services.";
                    }
                },
                'protocol' : function(val, attr, data) {
                    if (val.trim() == "") {
                        return "Select a valid Protocol.";
                    }
                    var protocolValue = val.trim().toUpperCase();
                    var allProtocol = ['ANY', 'ICMP', 'TCP', 'UDP', 'ICMP6'];
                    if (allProtocol.indexOf(protocolValue) < 0) {
                        if (!isNumber(protocolValue)) {
                            return "Rule with invalid protocol " + protocolValue;
                        }
                        protocolValue = Number(protocolValue);
                        if (protocolValue % 1 != 0 || protocolValue < 0 || protocolValue > 255) {
                            return "Rule with invalid protocol " + protocolValue;
                        }
                    }
                },
                'simple_action' : function(val, attr, data) {
                    if (val == "") {
                        return "Select a valid Action.";
                    }
                },
                'mirror': function(val, attr, data) {
                    if (data.mirror_to_check != true) {
                        return;
                    }
                    var error = self.isBothSrcDscCIDR(data);
                    if (error != "") {
                        return error;
                    }
                    var srcProt = getValueByJsonPath(data, "src_ports_text", "");
                    if(srcProt.toUpperCase() != "ANY") {
                        return "Only 'ANY' protocol allowed while mirroring services."
                    }
                    var dscProt = getValueByJsonPath(data, "dst_ports_text", "");
                    if(dscProt.toUpperCase() != "ANY") {
                        return "Only 'ANY' protocol allowed while mirroring services."
                    }
                },
                'qos': function(val, attr, data) {
                    if (data.qos_action_check && !val) {
                        return "Select QoS to apply";
                    }
                },
                'src_ports_text' : function(val, attr, data) {
                    var result = self.validatePort(val);
                    if (result != "") {
                        return result;
                    }
                },
                'dst_ports_text' : function(val, attr, data) {
                    var result = self.validatePort(val);
                    if (result != "") {
                        return result;
                    }
                },
                'action_list.mirror_to.analyzer_name': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns === ctwc.ANALYZER_INSTANCE) {
                        if(!value) {
                            return "Select SI Analyzer";
                        }
                    }
                },
                'user_created_analyzer_name': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns !== ctwc.ANALYZER_INSTANCE) {
                        if(!value) {
                            return "Enter Analyzer Name";
                        }
                    }
                },
                'action_list.mirror_to.analyzer_ip_address': function(value, attr, finalObj) {
                    if((finalObj.mirror_to_check == true) &&
                        (finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP) &&
                        (finalObj.mirrorToNHMode !== ctwc.MIRROR_STATIC)) {
                        if(!isValidIP(value)) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                        if(value && value.split("/").length > 1) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                    }
                },
                'action_list.mirror_to.udp_port': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                        (finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP)) {
                        if(value) {
                            var vlanVal = Number(String(value).trim());
                            if (isNaN(vlanVal) ||
                                    (vlanVal < 1 || vlanVal > 65535)) {
                                return "Enter UDP Port between 1 to 65535";
                            }
                        }
                    }
                },
                'mirrorToRoutingInstance': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                        (finalObj.user_created_juniper_header === 'disabled') &&
                        (finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP)) {
                        if (!value || value.trim() == "") {
                            return "Select Routing Instance";
                        }
                    }
                },
                'action_list.mirror_to.analyzer_mac_address': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                        (finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP)) {
                        if(value) {
                            if(!isValidMACAddress(value)) {
                                return "Enter valid Analyzer MAC Address";
                            }
                        }
                    }
                },
                'action_list.mirror_to.static_nh_header.vtep_dst_mac_address': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                        if(value) {
                            if(!isValidMACAddress(value)) {
                                return "Enter valid VTEP Destination MAC Address";
                            }
                        }
                    }
                },
                'action_list.mirror_to.static_nh_header.vtep_dst_ip_address': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                       if(!isValidIP(value)) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                        if(value && value.split("/").length > 1) {
                            return "Enter a valid IP In the format xxx.xxx.xxx.xxx";
                        }
                    }
                },
                'action_list.mirror_to.static_nh_header.vni': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP &&
                            finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC) {
                        var vlanVal = Number(String(value).trim());
                        if (isNaN(vlanVal) || vlanVal < 1 || vlanVal > 65535) {
                            return "Enter VxLAN ID between 1 to 65535";
                        }
                    }
                },
                'action_list.mirror_to.nic_assisted_mirroring_vlan': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                            finalObj.user_created_mirroring_optns === ctwc.NIC_ASSISTED) {
                        var vlanVal = Number(String(value).trim());
                        if (isNaN(vlanVal) || vlanVal < 1 || vlanVal > 4094) {
                            return "Enter VLAN between 1 to 4094";
                        }
                    }
                },
                'endpoint_2' : function(value, attr, finalObj){
                    return fwPolicyUtils.validateEndPoint('endpoint_2',finalObj);
                },
                'endpoint_1' : function(value, attr, finalObj){
                    return fwPolicyUtils.validateEndPoint('endpoint_1',finalObj);
                },
                'user_created_service' : fwPolicyUtils.validateServices
            }
        },
        validatePort: function(port) {
            if (_.isString(port)) {
                if (port.toUpperCase() != "ANY") {
                    var portArr = port.split(",");
                    for (var i = 0; i < portArr.length; i++) {
                        var portSplit = portArr[i].split("-");
                        if (portSplit.length > 2) {
                            return "Invalid Port Data";
                        }
                        for (var j = 0; j < portSplit.length; j++) {
                            if (portSplit[j] == "") {
                                return "Port has to be a number";
                            }
                            if (!isNumber(portSplit[j])) {
                                return "Port has to be a number";
                            }
                            if (portSplit[j] % 1 != 0) {
                                return "Port has to be a number";
                            }
                        }
                    }
                }
            } else if (!isNumber(port)) {
                return "Port has to be a number";
            }
            return "";
        },
        isBothSrcDscCIDR: function(data) {
            var msg = "";
            if (data.apply_service_check != true) {
                return msg;
            }
            var sourceAddress = getValueByJsonPath(data, "src_address", "");
            var destAddress = getValueByJsonPath(data, "dst_address", "");
            var sourceAddressArr = sourceAddress.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            var destAddressArr = destAddress.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            if (sourceAddressArr[1] == "subnet" && destAddressArr[1] == "subnet") {
                msg =  "Both Source and Destination cannot be CIDRs\
                                while applying/mirroring services.";
            }
            return msg;
        },
        checkAnyOrLocal: function(data, path) {
            if (data.apply_service_check != true) {
                return false;
            }
            var address = getValueByJsonPath(data, path, "");
            var addressArr = address.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            if (addressArr.length >= 2 &&
                addressArr[1] == "virtual_network" &&
                (addressArr[0] == "any" ||
                 addressArr[0] == "local")) {
                 return true
            }
            return false;
        },
        getAddress: function(address, domain, project) {
            var returnObject = {},
                prefix = getValueByJsonPath(address, "subnet;ip_prefix", ""),
                prefixLen = getValueByJsonPath(address, "subnet;ip_prefix_len", ""),
                virtualNetwork = getValueByJsonPath(address, "virtual_network", ""),
                networkPolicy = getValueByJsonPath(address, "network_policy", ""),
                securityGroup =
                    getValueByJsonPath(address, "security_group", "");
            if (prefix != "" && virtualNetwork != "") {
                var subnet = prefix + "/" + prefixLen;
                virtualNetwork = virtualNetwork.split(":");
                if(virtualNetwork.length === 3) {
                    if(virtualNetwork[0] === domain && virtualNetwork[1] === project) {
                        virtualNetwork = virtualNetwork[2];
                    } else {
                        virtualNetwork = virtualNetwork[0] + ":" +
                            virtualNetwork[1] + ":" + virtualNetwork[2];
                    }
                }
                returnObject.addres = virtualNetwork + ctwc.VN_SUBNET_DELIMITER + subnet + cowc.DROPDOWN_VALUE_SEPARATOR + 'subnet';
                returnObject.address = virtualNetwork + ctwc.VN_SUBNET_DELIMITER + subnet;
                return returnObject;
            } else {
                if (virtualNetwork != "") {
                    var vnText = virtualNetwork;
                    if (vnText == "any") {
                        vnText = "ANY (All Networks in Current Project)";
                    } else if (vnText == "local") {
                        vnText = "LOCAL (All Networks to which this policy is associated)";
                    }
                    var value = virtualNetwork + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network";
                    returnObject.addres = value;
                    returnObject.address = value;
                    return returnObject;
                } else if(prefix != "") {
                    var subnet = prefix + "/" + prefixLen;
                    returnObject.addres = subnet + cowc.DROPDOWN_VALUE_SEPARATOR + 'subnet';
                    returnObject.address = subnet;
                    return returnObject;
                }
            }

            if (networkPolicy != "") {
                var value = networkPolicy + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy";
                returnObject.addres = value;
                returnObject.address = value;
                return returnObject;
            }

            if(securityGroup) {
                var value =
                    securityGroup + cowc.DROPDOWN_VALUE_SEPARATOR +
                    "security_group";
                returnObject.addres = value;
                returnObject.address = value;
                return returnObject;
            }
            return returnObject;
        },
        validateAddressFormat: function(val, srcOrDesString) {
            if (val == "") {
                return "Enter a valid " + srcOrDesString + " Address";
            }
            var address = val.split(cowc.DROPDOWN_VALUE_SEPARATOR);
            if (address.length == 2) {
                var value = address[0].trim(), group = address[1],
                    vnSubnetObj, addValue;

                if (group == 'subnet') {
                    vnSubnetObj = policyFormatters.parseVNSubnet(value);
                    if(vnSubnetObj.mode === ctwc.SUBNET_ONLY) {
                        if(vnSubnetObj.subnet &&
                                vnSubnetObj.subnet.split("/").length !== 2) {
                                return "Enter valid Subnet/Mask";
                         }
                    } else {
                        if(!vnSubnetObj.vn || !vnSubnetObj.subnet) {
                            return "Enter valid " + srcOrDesString +
                                " as CIDR or VN:CIDR";
                        }

                        if(vnSubnetObj) {
                            if(vnSubnetObj.vn){
                                addValue = vnSubnetObj.vn.split(":");
                            }
                            if(vnSubnetObj.subnet &&
                                vnSubnetObj.subnet.split("/").length !== 2) {
                                return "Enter valid Subnet/Mask";
                            }
                        }
                    }
                } else {
                    addValue = value.split(":");
                }
                if (addValue && addValue.length != 1 && addValue.length != 3) {
                    var groupSelectedString = "";
                    if (group == "virtual_network") {
                        groupSelectedString = "Network";
                    } else if (group == "network_policy") {
                        groupSelectedString = "Policy";
                    }
                    return "Fully Qualified Name of "+srcOrDesString+ " " +
                                groupSelectedString +
                                " should be in the format \
                                Domain:Project:NetworkName.";
                }
            }
            return "";
        },
        formatPortAddress: function(portArr) {
            var ports_text = "";
            if (portArr != "" && portArr.length > 0) {
                var ports_len = portArr.length;
                for (var i=0;i< ports_len; i++) {
                    if (ports_text != "") ports_text += ", ";
                    if (portArr[i]["start_port"] == -1 &&
                       portArr[i]["end_port"] == -1) {
                        ports_text = "ANY";
                    } else {
                        ports_text +=
                            portArr[i]["start_port"]
                            + " - "
                            + portArr[i]["end_port"]
                    }
                }
            }
            if (ports_text == "") {
                ports_text = "ANY";
            }
            return ports_text;
        }
    });
    return fwRuleModel;
});
