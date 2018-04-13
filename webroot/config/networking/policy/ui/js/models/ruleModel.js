/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, ContrailModel, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters(),
        self;
    var RuleModel = ContrailModel.extend({
        defaultConfig: {
            'action_list':{'simple_action':'pass',
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
            'user_created_analyzer_name': null,
            'user_created_juniper_header': "enabled",
            'user_created_mirroring_optns': "analyzer_instance",
            'qos':null,
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
            'siModeObjMap': ''
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            var domain = ctwu.getGlobalVariable('domain').name,
                project = ctwu.getGlobalVariable('project').name,
                simpleAction = getValueByJsonPath(modelConfig,
                               "action_list;simple_action", "");
            if (simpleAction != "") {
                simpleAction = simpleAction.toUpperCase();
                modelConfig["action_list"]["simple_action"] = simpleAction;
                modelConfig["simple_action"] = simpleAction
            }
            var protocol = getValueByJsonPath(modelConfig, "protocol", "");
            if (protocol != "") {
                modelConfig["protocol"] = (protocol).toUpperCase();
            }
            var applyService = getValueByJsonPath(modelConfig,
                           "action_list;apply_service", []);
            if (applyService.length > 0) {
                modelConfig["service_instance"] =
                    applyService.join(cowc.DROPDOWN_VALUE_SEPARATOR);
                modelConfig["apply_service_check"] = true;
            } else {
                modelConfig["service_instance"] = null;
                modelConfig["apply_service_check"] = false;
            }
            var log = getValueByJsonPath(modelConfig, "action_list;log", "");
            if (log != "") {
                modelConfig["log_checked"] = log;
            }

            //mirroring
            var mirrorAnalyzerName = getValueByJsonPath(modelConfig,
                          "action_list;mirror_to;analyzer_name", "", false);
            if(mirrorAnalyzerName) {
                var analyzerIP = getValueByJsonPath(modelConfig,
                        "action_list;mirror_to;analyzer_ip_address", "", false),
                    vtepIP = getValueByJsonPath(modelConfig,
                        "action_list;mirror_to;static_nh_header;vtep_dst_ip_address", "", false),
                    nicAssistedMirroring = getValueByJsonPath(modelConfig,
                        "action_list;mirror_to;nic_assisted_mirroring",
                        false, false), routingInst, nhMode, jnprHeader,
                    analyzerName = getValueByJsonPath(modelConfig,
                            "action_list;mirror_to;analyzer_name", null, false);
                modelConfig['mirror_to_check'] = true;
                if(nicAssistedMirroring === true) {
                    modelConfig["user_created_mirroring_optns"] = ctwc.NIC_ASSISTED;
                    modelConfig["user_created_analyzer_name"] = analyzerName;
                } else if(analyzerIP === "" && vtepIP === "") {
                    modelConfig["user_created_mirroring_optns"] = ctwc.ANALYZER_INSTANCE;
                } else {
                    modelConfig["user_created_mirroring_optns"] = ctwc.ANALYZER_IP;
                    modelConfig["user_created_analyzer_name"] = analyzerName;
                    routingInst =  getValueByJsonPath(modelConfig,
                            "action_list;mirror_to;routing_instance", "", false),
                    nhMode = getValueByJsonPath(modelConfig,
                            "action_list;mirror_to;nh_mode", ctwc.MIRROR_DYNAMIC, false),
                    jnprHeader = getValueByJsonPath(modelConfig,
                                "action_list;mirror_to;juniper_header", true, false);
                    modelConfig["user_created_juniper_header"] =
                            jnprHeader === true ? "enabled" : "disabled";
                    if (routingInst != "") {
                        modelConfig['mirrorToRoutingInstance'] = routingInst;
                    } else {
                        modelConfig['mirrorToRoutingInstance'] = null;
                    }
                    modelConfig["mirrorToNHMode"] = nhMode;
                }
            } else {
                modelConfig['mirror_to_check'] = false;
            }

            //qos
            var qos = getValueByJsonPath(modelConfig,
                    "action_list;qos_action", "");
            if(qos) {
                modelConfig["qos"] = qos;
                modelConfig["qos_action_check"] = true;
            } else {
                modelConfig["qos"] = "";
                modelConfig["qos_action_check"] = false;
            }

            if (modelConfig["src_addresses"][0] != null) {
                modelConfig["src_addresses_arr"] =
                           modelConfig["src_addresses"][0];
            } else {
                modelConfig["src_addresses"][0] =
                           modelConfig["src_addresses_arr"];
            }
            var srcAddress = getValueByJsonPath(modelConfig, "src_addresses;0","");
            if (srcAddress != "") {
                var addressObj = self.getAddress(srcAddress, domain, project);
                modelConfig["src_address"] =  addressObj.addres;
                modelConfig["src_addresses"] = addressObj.address;
            }

            if (modelConfig["dst_addresses"][0] != null) {
                modelConfig["dst_addresses_arr"] = modelConfig["dst_addresses"][0];
            } else {
                modelConfig["dst_addresses"][0] = modelConfig["dst_addresses_arr"];
            }
            var dstAddress = getValueByJsonPath(modelConfig, "dst_addresses;0","");
            if (dstAddress != "") {
                var addressObj = self.getAddress(dstAddress, domain, project);
                modelConfig["dst_address"] =  addressObj.addres;
                modelConfig["dst_addresses"] = addressObj.address;
            }

            var src_ports_text = "";
            src_ports_text = this.formatPortAddress(modelConfig["src_ports"]);
            modelConfig["src_ports_text"] = src_ports_text;
            var dst_ports_text = "";
            dst_ports_text = this.formatPortAddress(modelConfig["dst_ports"]);
            modelConfig["dst_ports_text"] = dst_ports_text;
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
        validations: {
            ruleValidation: {
               'service_instance': function(val, attr, data) {
                    if (data.apply_service_check != true) {
                        return;
                    }
                    if (val == "" || val == null) {
                        return "Select atleast one service to apply.";
                    }
                    var valArr = val.split(";");
                    var valArrLen = valArr.length;
                    var inNetworkTypeCount = 0;
                    for (var i = 0; i < valArrLen; i++) {
                        if(data.siModeObjMap[valArr[i]] === 'in-network-nat'){
                            inNetworkTypeCount++;
                            if (inNetworkTypeCount >= 2) {
                                return "Cannot have more than one 'in-network-nat'\
                                        services."
                            }
                        }
                    }
                    if(inNetworkTypeCount >= 1){
                        if(data.siModeObjMap[valArr[valArrLen-1]] !== 'in-network-nat'){
                            return "Last instance should be of 'in-network-nat'\
                            service mode while applying services."
                        }
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
                'user_created_juniper_header': function(value, attr, finalObj) {
                    if(finalObj.mirror_to_check == true &&
                        finalObj.user_created_mirroring_optns === ctwc.ANALYZER_IP &&
                        finalObj.mirrorToNHMode === ctwc.MIRROR_STATIC &&
                        value !== 'disabled') {
                        return "Static Nexthop cannot be used with Juniper Header Enabled";
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
                }
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
    return RuleModel;
});
