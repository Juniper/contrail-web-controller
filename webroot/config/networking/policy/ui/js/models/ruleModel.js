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
                'mirror_to':{'analyzer_name':null}},
            'log_checked':false,
            'apply_service_check' : false,
            'mirror_to_check' : false,
            'application':[],
            'direction': '<>',
            'protocol': 'any',
            'dst_addresses': [],
            'dst_address' : 'any~virtual_network',
            'dst_ports':[],
            'dst_ports_text':"ANY",
            'src_addresses':[],
            'src_address' : 'any~virtual_network',
            'src_ports':[],
            'src_ports_text': 'ANY',
            'simple_action': 'pass',
            'service_instance':'',
            'mirror':'',
            'rule_uuid':'',
            'analyzer_name':'',
            'src_customValue':{
                'text': 'ANY (All Networks in Current Project)',
                'value':'any~virtual_network', 'groupName': 'Networks'},
            'dst_customValue':{
                'text': 'ANY (All Networks in Current Project)',
                'value':'any~virtual_network', 'groupName': 'Networks'},
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
            }
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
                modelConfig["service_instance"] = applyService.join(",");
                modelConfig["apply_service_check"] = true;
            } else {
                modelConfig["service_instance"] = null;
                modelConfig["apply_service_check"] = false;
            }
            var log = getValueByJsonPath(modelConfig, "action_list;log", "");
            if (log != "") {
                modelConfig["log_checked"] = log;
            }
            var mirrorTo = getValueByJsonPath(modelConfig,
                           "action_list;mirror_to;analyzer_name", "");
            if (mirrorTo == "") {
                modelConfig["mirror"] = null;
                modelConfig["mirror_to_check"] = false;
            } else {
                modelConfig["mirror"] = mirrorTo;
                modelConfig["mirror_to_check"] = true;
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
                modelConfig["src_customValue"] =  addressObj.customValue;
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
                modelConfig["dst_customValue"] =  addressObj.customValue;
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
                    var protocolValue = val.trim();
                    var allProtocol = ['ANY', 'ICMP', 'TCP', 'UDP', 'ICMP6'];
                    if (allProtocol.indexOf(protocolValue) < 0) {
                        if (!isNumber(protocolValue)) {
                            return "Rule with invalid protocol " + protocolValue;
                        }
                        protocolValue = Number(protocolValue);
                        if (protocolValue % 1 != 0 || protocolValue < 0 || protocolValue > 225) {
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
            var sourceAddressArr = sourceAddress.split("~");
            var destAddressArr = destAddress.split("~");
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
            var addressArr = address.split("~");
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
                virtualNetwork = getValueByJsonPath(address, "virtual_network", "");
            if (virtualNetwork != "") {
                var vnText = virtualNetwork;
                if (vnText == "any") {
                    vnText = "ANY (All Networks in Current Project)";
                } else if (vnText == "local") {
                    vnText = "LOCAL (All Networks to which this policy is associated)";
                }
                var value = virtualNetwork + "~virtual_network";
                var netText = policyFormatters.formatCurrentFQNameValue(domain,
                             project,
                             vnText);
                var customValue = {
                    'text': netText,
                    'value':value,
                    'id':value,
                    'groupName': 'Networks'};

                returnObject.addres = value;
                returnObject.address = value;
                returnObject.customValue = customValue;
                return returnObject;
            }
            var networkPolicy = getValueByJsonPath(address, "network_policy", "");
            if (networkPolicy != "") {
                var value = networkPolicy + "~network_policy",
                    text = policyFormatters.formatCurrentFQNameValue(domain,
                           project, networkPolicy),
                    customValue = {
                        'text':text,
                        'value':value,
                        'id':value,
                        'groupName': 'Policies'
                    };
                returnObject.addres = value;
                returnObject.address = value;
                returnObject.customValue = customValue;
                return returnObject;
            }
            var prefix = getValueByJsonPath(address, "subnet;ip_prefix", ""),
                prefixLen = getValueByJsonPath(address, "subnet;ip_prefix_len", "");
            if (prefix != "") {
                var subnet = prefix + "/" + prefixLen;
                returnObject.addres = subnet + '~' + 'subnet';
                returnObject.address = subnet;
                returnObject.customValue = {'text':subnet, 'groupName': 'CIDR'};
                return returnObject;
            }
        },
        validateAddressFormat: function(val, srcOrDesString) {
            if (val == "") {
                return "Enter a valid "+srcOrDesString+" Address";
            }
            var address = val.split("~");
            if (address.length == 2) {
                var value = address[0].trim();
                var group = address[1];
                if (group == 'subnet') {
                    if (!isValidIP(value) ||
                        value.split("/").length != 2) {
                        return "Enter valid Subnet/Mask";
                    }
                }
                var addValue = value.split(":");
                if (addValue.length != 1 && addValue.length != 3) {
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
