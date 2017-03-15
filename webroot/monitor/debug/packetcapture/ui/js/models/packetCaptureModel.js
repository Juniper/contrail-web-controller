/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'monitor/debug/packetcapture/ui/js/models/analyzerRulesModel',
    'monitor/debug/packetcapture/ui/js/packetCaptureFormatter'
], function (_, ContrailModel, AnalyzerRulesModel, PacketCaptureFormatter) {
    var packetCaptureFormatter = new PacketCaptureFormatter();
    var packetCaptureModel = ContrailModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": null,
            "parent_type": "project",
            "service_instance_properties": {
                "interface_list": [
                    {"virtual_network": null}
                ]
            },
            "user_created_associate_networks": null
        },
        formatModelConfig : function(modelConfig) {
            var rulesModel, rulesModelCol = [], rules,
                associatedVNs, associatedVNStr = "", leftVN;
            // populate  user_created_associate_networks
            associatedVNs = getValueByJsonPath(modelConfig,
                "network_policy;virtual_network_back_refs", []);
            _.each(associatedVNs, function(vn, i){
                vn = vn.to[0] + "~" + vn.to[1] + "~" + vn.to[2] + "~" + vn.uuid;
                if(i === 0) {
                    associatedVNStr = vn;
                } else {
                    associatedVNStr += "," + vn;
                }
            });
            leftVN = getValueByJsonPath(modelConfig,
                "service_instance_properties;interface_list;0;virtual_network", "");
            if(!leftVN) {
                modelConfig["service_instance_properties"]["interface_list"]
                    [0]["virtual_network"] = "automatic";
            }
            modelConfig["user_created_associate_networks"] = associatedVNStr;
            //prepare rule collection
            rules = getValueByJsonPath(modelConfig,
                "network_policy;network_policy_entries;policy_rule", []);
            _.each(rules, function(rule){
                var srcNetwork = getValueByJsonPath(rule,
                    "src_addresses;0;virtual_network", "");
                var dstNetwork = getValueByJsonPath(rule,
                    "dst_addresses;0;virtual_network", "");
                rulesModel = new AnalyzerRulesModel({
                    protocol: rule.protocol,
                    src_network: srcNetwork,
                    src_port: packetCaptureFormatter.formatPortAddress(rule["src_ports"]),
                    direction: cowu.deSanitize(rule["direction"]),
                    dst_network: dstNetwork,
                    dst_port: packetCaptureFormatter.formatPortAddress(rule["dst_ports"])
                });
                rulesModelCol.push(rulesModel);
            });
            modelConfig["rules"] =
                new Backbone.Collection(rulesModelCol);
            return modelConfig;
        },
        addRule: function() {
            var rules = this.model().attributes["rules"];
            rules.add([new AnalyzerRulesModel()]);
        },
        deleteRule: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },
        getRules: function(attr) {
            var self = this, rules = attr.rules.toJSON();
            var mirrorTo =
                getCookie("domain") + ":" + getCookie("project") + ":" + attr.name.trim();
            var actRules = [], rule;
            _.each(rules, function(r, i){
                rule = {};
                rule["application"] = [];
                rule["rule_sequence"] = {};
                rule["rule_sequence"]["major"] = -1;
                rule["rule_sequence"]["minor"] = -1;
                rule["direction"] = r.direction();
                rule["protocol"] = r.protocol().toLowerCase();

                rule["action_list"] = {};
                rule["action_list"]["simple_action"] = null;
                rule["action_list"]["gateway_name"] = null;
                rule["action_list"]["apply_service"] = null;

                if (mirrorTo && "" !== mirrorTo.trim()) {
                    rule["action_list"]["mirror_to"] = {};
                    rule["action_list"]["mirror_to"]["analyzer_name"] = mirrorTo;
                } else {
                    rule["action_list"]["mirror_to"] = null;
                }
                populateAddressesInRule("src", rule, r.src_network());
                populateAddressesInRule("dst", rule, r.dst_network());
                populatePortsInRule("src", rule, r.src_port);
                populatePortsInRule("dst", rule, r.dst_port);
                actRules.push(rule);
            });
            return actRules;
        },
        configPacketCapture: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false,
                attr,
                self  = this,
                validations = [
                {
                    key: null,
                    type: cowc.OBJECT_TYPE_MODEL,
                    getValidation: "configureValidation"
                },
                {
                    key: "rules",
                    type: cowc.COLLECTION_TYPE_MODEL,
                    getValidation: "ruleValidation"
                }
            ];

            if (this.isDeepValid(validations)) {
                attr = this.model().attributes;
                ajaxConfig.type  = ajaxMethod;
               if(ajaxMethod === "POST") {
                    ajaxConfig.data  = JSON.stringify(self.getAnalyzer(attr));
                    ajaxConfig.url   = "/api/tenants/config/service-instances";
                    contrail.ajaxHandler(ajaxConfig, function () {
                        if (contrail.checkIfFunction(callbackObj.init)) {
                            callbackObj.init();
                        }
                    }, function (response) {
                        if (contrail.checkIfFunction(callbackObj.success)) {
                             self.createUpdateNetworkPolicy(attr, callbackObj, ajaxMethod);
                        }
                        returnFlag = true;
                    }, function (error) {
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                        returnFlag = false;
                    });
               } else {
                   self.createUpdateNetworkPolicy(attr, callbackObj, ajaxMethod);
               }
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                            (ctwl.ERROR_LABEL_PACKET_CAPTURE));
                }
            }

            return returnFlag;
        },
        createUpdateNetworkPolicy: function(attr, callbackObj, ajaxMethod) {
            var ajaxConfig = {}, self = this;
            ajaxConfig.type = ajaxMethod
            ajaxConfig.data  = JSON.stringify(self.getAnalyzerPolicy(attr));
            ajaxConfig.url   = ajaxMethod === "PUT" ? "/api/tenants/config/policy/"
                + attr.policyuuid : "/api/tenants/config/policys";
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        getAnalyzer: function(attr) {
            var self = this, leftVN, analyzerInstance = {};
            var selectedDomain = getCookie("domain");
            var selectedProject = getCookie("project");

            analyzerInstance["ui_analyzer_flag"] = true;
            leftVN = getValueByJsonPath(attr,
                "service_instance_properties;interface_list;0;virtual_network", "");
            leftVN = getFormatVNName(leftVN) !== "" ? leftVN : "";
            analyzerInstance["service-instance"] = {};
            analyzerInstance["service-instance"]["parent_type"] = "project";
            analyzerInstance["service-instance"]["fq_name"] = [];
            analyzerInstance["service-instance"]["fq_name"] = [selectedDomain, selectedProject, attr.name];
            analyzerInstance["service-instance"]["display_name"] =
                attr.display_name ? attr.display_name : attr.name;
            analyzerInstance["service-instance"]["service_template_refs"] = [];
            analyzerInstance["service-instance"]["service_template_refs"][0] = {};
            analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [];
            analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [selectedDomain, "analyzer-template"];

            analyzerInstance["service-instance"]["service_instance_properties"] = {};

            analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"] = {};
            analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"]["max_instances"] = 1;

            analyzerInstance["service-instance"]["service_instance_properties"]["right_virtual_network"] = "";
            analyzerInstance["service-instance"]["service_instance_properties"]["management_virtual_network"] = "";
            analyzerInstance["service-instance"]["service_instance_properties"]["left_virtual_network"] = leftVN;
            analyzerInstance["service-instance"]["service_instance_properties"]["interface_list"] =
                [{virtual_network:leftVN}];
            return analyzerInstance;
        },
        getAnalyzerPolicy: function(attr) {
            var selectedDomain = getCookie("domain"),
                selectedProject = getCookie("project"),
                self = this,
                ruleTuples, networks, validNetwork,
                analyzerPolicy = {},
                analyzerPolicyName = getValueByJsonPath(attr,
                    "network_policy_entries;name", null, false);
            analyzerPolicyName = analyzerPolicyName ?  analyzerPolicyName :
                (getDefaultAnalyzerPolicyName(attr.name ? attr.name.trim() : ""))
            analyzerPolicy["ui_analyzer_flag"] = true;
            analyzerPolicy["network-policy"] = {};
            analyzerPolicy["network-policy"]["parent_type"] = "project";

            analyzerPolicy["network-policy"]["fq_name"] = [];
            analyzerPolicy["network-policy"]["fq_name"][0] = selectedDomain;
            analyzerPolicy["network-policy"]["fq_name"][1] = selectedProject;
            analyzerPolicy["network-policy"]["fq_name"][2] = analyzerPolicyName;

            networks = attr.user_created_associate_networks ?
                attr.user_created_associate_networks.split(",") : [];
            if (networks && networks.length > 0) {
                analyzerPolicy["network-policy"]["virtual_network_back_refs"] = [];
                for (var i = 0; i < networks.length; i++) {
                    analyzerPolicy["network-policy"]["virtual_network_back_refs"][i] = {};
                    analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"] = {};
                    analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"]["timer"] = {"start_time":""};
                    analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"]["sequence"] = null;
                    if(networks[i] && networks[i].split("~").length === 4) {
                        validNetwork = networks[i].split("~");
                        analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["uuid"] =
                            validNetwork[3];
                        analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"] = [];
                        analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][0] =
                            validNetwork[0];
                        analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][1] =
                            validNetwork[1];
                        analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][2] =
                            validNetwork[2];
                    }
                }
            }
            ruleTuples = self.getRules(attr);
            if (ruleTuples && ruleTuples.length > 0) {
                analyzerPolicy["network-policy"]["network_policy_entries"] = {};
                analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"] = ruleTuples;
            } else {
                analyzerPolicy["network-policy"]["network_policy_entries"] = null;
            }
            return analyzerPolicy;
        },
        deletePacketCapture : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [], uuidPolicyList = [], deleteObjsList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
                uuidPolicyList.push(checkedRowsValue.policyuuid);
                deleteObjsList.push(JSON.parse(JSON.stringify({'type': 'service-analyzer',
                                    'deleteIDs': [checkedRowsValue.uuid],
                                    'userData': {policyuuid : checkedRowsValue.policyuuid}})));
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(deleteObjsList);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations: {
            configureValidation: {
                'name': {
                    required: true,
                    msg: 'Enter Analyzer Name'
                }
            }
        },
    });
    return packetCaptureModel;
});
