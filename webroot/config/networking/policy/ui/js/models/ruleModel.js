/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, ContrailModel, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var popupData = [];
    var self;
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
                project = ctwu.getGlobalVariable('project').name;
            modelConfig["action_list"]["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["protocol"] = (modelConfig["protocol"]).toUpperCase();
            if (modelConfig["action_list"]["apply_service"] != null &&
               modelConfig["action_list"]["apply_service"].length > 0) {
                modelConfig["service_instance"] =
                       modelConfig["action_list"]["apply_service"].join(",");
            } else {
                modelConfig["service_instance"] = null;
            }
            modelConfig["mirror"] = modelConfig["action_list"]["mirror_to"];
            modelConfig["log_checked"] = modelConfig["action_list"]["log"];
            if (modelConfig["service_instance"] == null)
                modelConfig["apply_service_check"] = false;
            else
                modelConfig["apply_service_check"] = true;
            if (modelConfig["action_list"]["mirror_to"] == null ||
               (modelConfig["action_list"]["mirror_to"] != null &&
                "analyzer_name" in modelConfig["action_list"]["mirror_to"] &&
                modelConfig["action_list"]["mirror_to"]["analyzer_name"] == null))
                {
                modelConfig["mirror"] = null;
                modelConfig["mirror_to_check"] = false;
            } else {
                modelConfig["mirror"] =
                     modelConfig["action_list"]["mirror_to"]["analyzer_name"];
                modelConfig["mirror_to_check"] = true;
            }
            popupData = modelConfig["popupData"];
            if (modelConfig["src_addresses"][0] != null) {
                modelConfig["src_addresses_arr"] =
                           modelConfig["src_addresses"][0];
            } else {
                modelConfig["src_addresses"][0] =
                           modelConfig["src_addresses_arr"];
            }
            if (modelConfig["src_addresses"][0]["virtual_network"] != null) {
                var vnText = modelConfig["src_addresses"][0]["virtual_network"];
                if (modelConfig["src_addresses"][0]["virtual_network"] == "any") {
                    vnText = "ANY (All Networks in Current Project)";
                } else if (modelConfig["src_addresses"][0]["virtual_network"] == "local") {
                    vnText = "LOCAL (All Networks to which this policy is associated)";
                }
                var src_addresses =
                           modelConfig["src_addresses"][0]["virtual_network"]+
                           "~virtual_network";
                           //modelConfig["src_addresses"][0]["virtual_network"];
                var netText = policyFormatters.formatCurrentFQNameValue(domain,
                             project,
                             vnText);
                modelConfig["src_address"] =  src_addresses;
                modelConfig["src_customValue"] = {
                    'text': netText,
                    'value':src_addresses,
                    'id':src_addresses,
                    'groupName': 'Networks'};
                modelConfig["src_addresses"] = src_addresses;
            } else if (modelConfig["src_addresses"][0]["network_policy"] != null) {
                var src_addresses =
                           modelConfig["src_addresses"][0]["network_policy"]+
                           "~network_policy";
                           //modelConfig["src_addresses"][0]["network_policy"];
                var text = policyFormatters.formatCurrentFQNameValue(domain,
                             project,
                             modelConfig["src_addresses"][0]["network_policy"]);
                modelConfig["src_address"] =  src_addresses;
                modelConfig["src_customValue"] = {
                    'text':text,
                    'value':src_addresses,
                    'id':src_addresses,
                    'groupName': 'Policies'};
                modelConfig["src_addresses"] = src_addresses;
            } else if (modelConfig["src_addresses"][0]["subnet"] != null) {
                var subnet =
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix"]
                    + "/" +
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix_len"];
                modelConfig["src_addresses"] = subnet;
                modelConfig["src_address"] =  subnet + '~' + 'subnet';
                modelConfig["src_customValue"] = {'text':subnet,
                                                  'groupName': 'CIDR'}
            }

            if (modelConfig["dst_addresses"][0] != null) {
                modelConfig["dst_addresses_arr"] = modelConfig["dst_addresses"][0];
            } else {
                modelConfig["dst_addresses"][0] = modelConfig["dst_addresses_arr"];
            }
            if (modelConfig["dst_addresses"][0]["virtual_network"] != null) {
                var vnText = modelConfig["dst_addresses"][0]["virtual_network"];
                if (modelConfig["dst_addresses"][0]["virtual_network"] == "any") {
                    vnText = "ANY (All Networks in Current Project)";
                } else if (modelConfig["dst_addresses"][0]["virtual_network"] == "local") {
                    vnText = "LOCAL (All Networks to which this policy is associated)";
                }
                var dst_addresses =
                           modelConfig["dst_addresses"][0]["virtual_network"]+
                           "~virtual_network";
                           //modelConfig["dst_addresses"][0]["virtual_network"];
                modelConfig['dst_address'] = dst_addresses;
                var dstAddText = "";
                dstAddText = policyFormatters.formatCurrentFQNameValue(domain,
                             project,
                             vnText);
                modelConfig["dst_customValue"] = {
                    'text':dstAddText,
                    'value':dst_addresses,
                    'id':dst_addresses,
                    'groupName': 'Networks'};
                modelConfig["dst_addresses"] = dst_addresses;
            } else if (modelConfig["dst_addresses"][0]["network_policy"] != null) {
                var dst_addresses =
                           modelConfig["dst_addresses"][0]["network_policy"]+
                           "~network_policy";
                           //modelConfig["dst_addresses"][0]["network_policy"];
                modelConfig['dst_address'] = dst_addresses;
                var policyTxt =  policyFormatters.formatCurrentFQNameValue(domain, project,
                             modelConfig["dst_addresses"][0]["network_policy"]);
                modelConfig["dst_customValue"] = {
                    'text': policyTxt,
                    'value':dst_addresses,
                    'id':dst_addresses,
                    'groupName': 'Policies'};
                modelConfig["dst_addresses"] = dst_addresses;
            } else if (modelConfig["dst_addresses"][0]["subnet"] != null) {
                var subnet =
                    modelConfig["dst_addresses"][0]["subnet"]["ip_prefix"]
                    + "/" +
                    modelConfig["dst_addresses"][0]["subnet"]["ip_prefix_len"];
                modelConfig["dst_addresses"] = subnet;
                modelConfig['dst_address'] = subnet + '~' + 'subnet';
                modelConfig["dst_customValue"] = {'text':subnet,
                                                  'groupName': 'CIDR'}
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
                    var SIValue = valArr[valArrLen-1].split(" ");
                    if (SIValue.length >= 2 && SIValue[1] != "in-network-nat") {
                        return "Last instance should be of 'in-network-nat'\
                                service mode while applying services."
                    }
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
                    if (val == "") {
                        return "Select a valid Protocol.";
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
                }
            }
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
                        return "Enter a valid CIDR in \
                            xxx.xxx.xxx.xxx/xx format for "+srcOrDesString;
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
