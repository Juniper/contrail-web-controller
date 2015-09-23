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
            'dst_ports':[],
            'dst_ports_text':"ANY",
            'src_addresses':[],
            'src_ports':[],
            'src_ports_text': 'ANY',
            'simple_action': 'pass',
            'service_instance':'',
            'mirror':'',
            'analyzer_name':'',
            'src_customValue':{},
            'dst_customValue':{},
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
            modelConfig["action_list"]["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["simple_action"] =
                    (modelConfig["action_list"]["simple_action"]).toUpperCase();
            modelConfig["protocol"] = (modelConfig["protocol"]).toUpperCase();
            modelConfig["service_instance"] =
                       modelConfig["action_list"]["apply_service"];
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
                modelConfig["src_addresses"] =
                           modelConfig["src_addresses"][0]["virtual_network"]+
                           "~virtual_network";
            } else if(modelConfig["src_addresses"][0]["network_policy"] != null) {
                modelConfig["src_addresses"] =
                           modelConfig["src_addresses"][0]["network_policy"]+
                           "~network_policy";
            } else if(modelConfig["src_addresses"][0]["subnet"] != null) {
                var subnet =
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix"]
                    + "/" +
                    modelConfig["src_addresses"][0]["subnet"]["ip_prefix_len"];
                modelConfig["src_addresses"] = subnet;

                var srcNw = modelConfig["src_addresses"];
                //var srcDropdown =  $('#src_addresses_dropdown').data('contrailDropdown');
                //var srcDropdownData = $('#src_addresses_dropdown').data('contrailDropdown').getAllData();
                //var srcDropdownData = [];
                //policyFormatters.verifySrcDestSelectedItem(srcNw, srcDropdown, '',  'CIDR', '' ,srcDropdownData);
            }

            if(modelConfig["dst_addresses"][0] != null) {
                modelConfig["dst_addresses_arr"] = modelConfig["dst_addresses"][0];
            } else {
                modelConfig["dst_addresses"][0] = modelConfig["dst_addresses_arr"];
            }
            if(modelConfig["dst_addresses"][0]["virtual_network"] != null){
                modelConfig["dst_addresses"] =
                           modelConfig["dst_addresses"][0]["virtual_network"]+
                           "~virtual_network";
            } else if(modelConfig["dst_addresses"][0]["network_policy"] != null) {
                modelConfig["dst_addresses"] =
                           modelConfig["dst_addresses"][0]["network_policy"]+
                           "~network_policy";
            } else if(modelConfig["dst_addresses"][0]["subnet"] != null) {
                var subnet =
                    modelConfig["dst_addresses"][0]["subnet"]["ip_prefix"]
                    + "/" +
                    modelConfig["dst_addresses"][0]["subnet"]["ip_prefix_len"];
                modelConfig["dst_addresses"] = subnet;
                var dstNw = modelConfig["dst_addresses"];
                //var dstDropdown =  $('#dst_addresses_dropdown').data('contrailDropdown');
                //var dstDropdownData = $('#dst_addresses_dropdown').data('contrailDropdown').getAllData();
                //policyFormatters.verifySrcDestSelectedItem(dstNw, dstDropdown, '',  'CIDR', '' ,dstDropdownData);
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
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        validations: {
            ruleValidation: {
               'service_instance': function(val, attr, data) {
                    if(val != "") {
                        if(data.src_ports != "ANY") {
                            return "Source Port has to be ANY if Service Instance is enabled.";
                        }
                        if(data.dst_ports != "ANY") {
                            return "Destination Port has to be ANY if Service Instance is enabled.";
                        }
                    }
                },
                'src_ports_text': {}
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
