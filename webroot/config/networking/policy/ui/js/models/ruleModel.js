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
    var RuleModel = ContrailModel.extend({
        defaultConfig: {
            'action_list':{'simple_action':'pass',
                'apply_service':null,
                'gateway_name':null,
                'mirror_to':{'analyzer_name':null}},
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
            var domain = ctwu.getGlobalVariable('domain').name,
                project = ctwu.getGlobalVariable('project').name;
            modelConfig["action_list"]["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["protocol"] = (modelConfig["protocol"]).toUpperCase();
            if(modelConfig["action_list"]["apply_service"] != null &&
               modelConfig["action_list"]["apply_service"].length > 0) {
                modelConfig["service_instance"] =
                       modelConfig["action_list"]["apply_service"].join(",");
            } else {
                modelConfig["service_instance"] = null;
            }
            modelConfig["mirror"] = modelConfig["action_list"]["mirror_to"];
            if(modelConfig["service_instance"] == null)
                modelConfig["apply_service_check"] = false;
            else
                modelConfig["apply_service_check"] = true;
            if(modelConfig["action_list"]["mirror_to"] == null ||
               (modelConfig["action_list"]["mirror_to"] != null &&
                "analyzer_name" in modelConfig["action_list"]["mirror_to"] &&
                modelConfig["action_list"]["mirror_to"]["analyzer_name"] == null))
                {
                modelConfig["mirror"] = null;
                modelConfig["mirror_to_check"] = false;
            } else {
                modelConfig["mirror"] =
                     [modelConfig["action_list"]["mirror_to"]["analyzer_name"]];
                modelConfig["mirror_to_check"] = true;
            }
            popupData = modelConfig["popupData"];
            if(modelConfig["src_addresses"][0] != null) {
                modelConfig["src_addresses_arr"] =
                           modelConfig["src_addresses"][0];
            } else {
                modelConfig["src_addresses"][0] =
                           modelConfig["src_addresses_arr"];
            }
            if(modelConfig["src_addresses"][0]["virtual_network"] != null){
                var vnText = modelConfig["src_addresses"][0]["virtual_network"];
                if(modelConfig["src_addresses"][0]["virtual_network"] == "any") {
                    vnText = "ANY (All Networks in Current Project)";
                } else if(modelConfig["src_addresses"][0]["virtual_network"] == "local") {
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
            } else if(modelConfig["src_addresses"][0]["network_policy"] != null) {
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
            } else if(modelConfig["src_addresses"][0]["subnet"] != null) {
                var subnet =
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix"]
                    + "/" +
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix_len"];
                modelConfig["src_addresses"] = subnet;
                modelConfig["src_address"] =  subnet + '~' + 'subnet';
                modelConfig["src_customValue"] = {'text':subnet,
                                                  'groupName': 'CIDR'}
            }

            if(modelConfig["dst_addresses"][0] != null) {
                modelConfig["dst_addresses_arr"] = modelConfig["dst_addresses"][0];
            } else {
                modelConfig["dst_addresses"][0] = modelConfig["dst_addresses_arr"];
            }
            if(modelConfig["dst_addresses"][0]["virtual_network"] != null){
                var vnText = modelConfig["dst_addresses"][0]["virtual_network"];
                if(modelConfig["dst_addresses"][0]["virtual_network"] == "any") {
                    vnText = "ANY (All Networks in Current Project)";
                } else if(modelConfig["dst_addresses"][0]["virtual_network"] == "local") {
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
            } else if(modelConfig["dst_addresses"][0]["network_policy"] != null) {
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
            } else if(modelConfig["dst_addresses"][0]["subnet"] != null) {
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
               /*'service_instance': function(val, attr, data) {
                    if(val != "") {
                        if(data.src_ports != "ANY") {
                             return "Source Port has to be ANY if Service\
                                    Instance is enabled.";
                        }
                        if(data.dst_ports != "ANY") {
                             return "Destination Port has to be ANY if Service\
                                     Instance is enabled.";
                        }
                    }
                },*/
                'src_addresses': function(val, attr, data) {
                    if(val != "") {
                        var address = val.split("~");
                        if(address.length == 1) {
                            if(!validateIPAddress(address[0].trim()) ||
                                address[0]("/").length != 2) {
                                return "Enter a valid CIDR in \
                                       xxx.xxx.xxx.xxx/xx format for Source";
                            }
                        }
                    }
                },
                'dst_addresses': function(val, attr, data) {
                    if(val != "") {
                        var address = val.split("~");
                        if(address.length == 1) {
                            if(!validateIPAddress(address[0].trim()) ||
                                address[0]("/").length != 2) {
                                return "Enter a valid CIDR in \
                                    xxx.xxx.xxx.xxx/xx format for Destination";
                            }
                        }
                    }
                },
                'mirror_to_check': function(val, attr, data) {
                    if(val == true) {
                        if(data.mirror.length == 0) {
                            return "Select atleast one instance to mirror.";
                        }
                        if(data.mirror.length > 0) {
                            return "Select only one instance to mirror.";
                        }
                        // Only Protocol ANY is allowed when service chaining is selected.
                        if(data.apply_service_check === true &&
                           data.protocol !== "any") {
                           return "Only 'ANY' protocol allowed while mirroring services."
                        }
                    }
                },
                'apply_service_check': function(val, attr, data) {
                    if(val == true) {
                        if(data.service_instance.length == 0) {
                            return "Select atleast one service to apply.";
                        }
                        if(data.src_addresses == "any" ||
                          data.src_addresses == "local") {
                            return "Source network cannot be 'any' or 'local' \
                                   while applying services."
                        }
                        if(data.dst_addresses == "any" ||
                          data.dst_addresses == "local") {
                            return "Destination network cannot be 'any' or\
                                    'local' while applying services."
                        }
                    }
                    /* need to be done
                    var allTemplates =
                        jsonPath(configObj, "$.service_templates[*].service-template")
                    for(var j=0; j<applyServices.length; j++) {
                        var as = [];
                        if(applyServices[j].indexOf(":") === -1) {
                            as = [selectedDomain,
                                  selectedProject,
                                  applyServices[j]];
                        } else {
                            as = applyServices[j].split(":");
                        }
                        for(tmplCount = 0; tmplCount < allTemplates.length;
                              tmplCount++) {
                            var template = allTemplates[tmplCount];
                            var insts = template.service_instance_back_refs;
                            if(null !== insts &&
                                typeof insts !== "undefined" &&
                                insts.length > 0) {
                                for(var instCount=0; instCount < insts.length;
                                instCount++) {
                                    if(insts[instCount]["to"][0] == as[0] &&
                                        insts[instCount]["to"][1] == as[1] &&
                                        insts[instCount]["to"][2] == as[2]) {
                                        var smode =
                                         template.service_template_properties.service_mode;
                                        if(typeof smode === "undefined" ||
                                            null === smode)
                                            smode = "transparent";
                                        allTypes[allTypes.length] = smode;
                                        asArray[asArray.length] = as.join(":");
                                        allInterface.push(
                                                   {"mode":smode,"inst":as[2]});
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    var inNetworkCount = 0;
                    for(var temp = 0;temp < allInterface.length;temp++){
                        if(allInterface[temp].mode == "in-network-nat")
                            inNetworkCount++;
                        if(inNetworkCount >= 2){
                             return "Cannot have more than one 'in-network-nat'\
                                     services.";
                        }
                    }
                    if(inNetworkCount >= 1 &&
                       allInterface[allInterface.length-1].mode
                       != "in-network-nat"){
                        return "Last instance should be of 'in-network-nat'\
                                service mode while applying services.";
                        return false;
                    }*/
                }
            }
        },
        formatPortAddress: function(portArr) {
            var ports_text = "";
            if(portArr != "" && portArr.length > 0) {
                var ports_len = portArr.length;
                for(var i=0;i< ports_len; i++) {
                    if(ports_text != "") ports_text += ", ";
                    if(portArr[i]["start_port"] == -1 &&
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
            if(ports_text == "") {
                ports_text = "ANY";
            }
            return ports_text;
        }
    });
    return RuleModel;
});
