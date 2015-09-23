/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var PolicyFormatters = function() {
        var self = this;

        this.PolicyDataParser = function(response) {
            var policyData = [];
            var policies = response.data;
            if(policies != null &&
                policies != undefined){
                var policiesLen = policies.length;
                for(var j=0; j < policiesLen; j++) {
                    var policy = policies[j]['network-policy'];
                    if(this.check4DynamicPolicy(policy)) {
                        continue;
                    }
                    policyData.push(policy);
                }
            }
            return policyData;
        };

        this.check4DynamicPolicy = function(policy) {
            var isDynamicPolicy = false;
            try {
                if("virtual_network_back_refs" in policy) {
                    var vn = policy.virtual_network_back_refs;
                    if(vn.length > 0) {
                        for(var i = 0; i < vn.length; i++) {
                            if("attr" in vn[i] && "timer" in vn[i].attr &&
                               vn[i].attr.timer != null &&
                               "start_time" in vn[i].attr.timer &&
                               vn[i].attr.timer.start_time != null) {
                                isDynamicPolicy = true;
                                break;
                            }
                        }
                    }
                }
            } catch (error){
                console.log(error.stack);
            }
            return isDynamicPolicy;
        };

        this.formatPolicyRule = function(rule, domain, project) {
            var rule_display = "";
            if (isSet(rule) && !rule.hasOwnProperty("length")) {
                if (isSet(rule["action_list"]) &&
                    isSet(rule["action_list"]["simple_action"])) {
                        rule_display +=
                    self.policyRuleFormat(rule["action_list"]["simple_action"]);
                }

                if (isSet(rule["application"]) &&
                    rule["application"].length > 0) {
                    rule_display += " application " +
                       self.policyRuleFormat(rule["application"].toString());
                    var src_addr =
                           formatSrcDestAddresses(rule["src_addresses"],
                           domain, project);
                    rule_display += src_addr;
                    if(isSet(rule["direction"]))
                        rule_display += self.policyRuleFormat(rule["direction"]);
                    var dest_addr =
                            policy_net_display(rule["dst_addresses"],
                            domain, project);
                    var dest_addr =
                            formatSrcDestAddresses(rule["dst_addresses"],
                            domain, project);
                    rule_display += dest_addr;
                    if (isSet(rule["action_list"]))
                        rule_display += " action" +
                            self.policyRuleFormat(rule["action_list"].toString());
                } else {
                    if(null !== rule["simple_action"] &&
                       typeof rule["simple_action"] !== "undefined")
                        rule_display +=
                             self.policyRuleFormat(rule["simple_action"]);
                    if (isSet(rule["protocol"]))
                          rule_display += ' protocol ' +
                              self.policyRuleFormat(rule["protocol"].toString());

                    var src_addr =
                           formatSrcDestAddresses(rule["src_addresses"],
                           domain, project);
                    rule_display += src_addr;

                    var src_ports = policy_ports_display(rule["src_ports"]);
                    if(isSet(src_ports))
                        rule_display += " ports " +
                             self.policyRuleFormat(src_ports);

                    if(isSet(rule["direction"]))
                        rule_display += ' ' +
                             self.policyRuleFormat(rule["direction"]);

                    var dest_addr =
                            formatSrcDestAddresses(rule["dst_addresses"],
                            domain, project);
                    rule_display += dest_addr;

                    var dst_ports = policy_ports_display(rule["dst_ports"]);
                    if(isSet(dst_ports))
                        rule_display += ' ports ' +
                            self.policyRuleFormat(dst_ports);

                    var action_list =
                              self.policy_services_display(rule["action_list"],
                              domain, project);
                    if(isSet(action_list))
                        rule_display += action_list;
                }
            }
            return rule_display;
        };

        this.policyRuleFormat = function(text) {
            return '<span class="rule-format">' + text  + '</span>';
        };
        this.policy_services_display = function(action_list, domain, project) {
            var service_str = "";
            if (isSet(action_list)) {
                var as = action_list.apply_service;
                var mt = action_list.mirror_to;
                if (isSet(as) && as.length > 0) {
                    var services_value = "";
                    for (var i = 0; i < as.length; i++) {
                        var item = as[i].split(':');
                        if(item.length === 3) {
                            if(item[0] === domain &&
                                item[1] === project) {
                                item = item[2];
                            } else {
                                item = item[2] + ' (' +
                                       item[0] + ':' +
                                       item[1] + ')';
                            }
                        } else {
                            item = item[0];
                        }
                        services_value += item;
                        if (i != (as.length - 1)) {
                            services_value += ",";
                        }
                    }
                    service_str += ' services ' +
                                   policyRuleFormat(services_value);
                }
                if (isSet(mt) && isSet(mt.analyzer_name)) {
                    analyzer_name_arr = mt.analyzer_name.split(':');
                    var mt_txt = "";
                    if(analyzer_name_arr.length === 3) {
                        if(analyzer_name_arr[0] === domain &&
                            analyzer_name_arr[1] === project) {
                            mt_txt = analyzer_name_arr[2];
                        } else {
                            mt_txt = analyzer_name_arr[2] + ' (' +
                                     analyzer_name_arr[0] + ':' +
                                     analyzer_name_arr[1] + ')';
                        }
                    } else {
                        mt_txt = analyzer_name_arr[0];
                    }
                    service_str += ' mirror ' + policyRuleFormat(mt_txt);
                }
            }
            return service_str;
        };

        this.PoliceyNameFormatter = function(d, c, v, cd, dc) {
            var policyName = "-";
            if(dc["fq_name"] != "" &&
               dc["fq_name"] != undefined &&
               dc["fq_name"] != null){
                var policyName = dc["fq_name"][2];
            }
            return policyName;
        };
        this.AssociatedNetworksFormatter = function(r, c, v, cd, dc) {
            var returnString = "";
            if("virtual_network_back_refs" in dc &&
               dc["virtual_network_back_refs"].length > 0) {
                var vnLen = dc["virtual_network_back_refs"].length
                var domainName = breadcrumbSelectedObj.domain.name;
                var projectName = breadcrumbSelectedObj.project.name;
                for(var i=0; i < 2; i++) {
                    if(i < vnLen) {
                    if("to" in dc["virtual_network_back_refs"][i] &&
                       dc["virtual_network_back_refs"][i]["to"].length >= 2) {
                        var network_to =
                            dc["virtual_network_back_refs"][i]["to"];
                        if (network_to[0] == domainName &&
                           network_to[1] == projectName) {
                           returnString += network_to[2] + "<br>";
                        } else {
                           returnString += network_to[2]+
                                                " (" +network_to[0] +":"+
                                                network_to[1] +") <br>";
                        }
                    }
                    }
                }
               if(vnLen > 2) {
               returnString += '<span class="moredataText">('
                   + (vnLen-2) + ' more)</span>' +
                   '<span class="moredata" style="display:none;" ></span>';
               }if(dc["virtual_network_back_refs"].length == 0) {
                   returnString = "-";
               }
            }
            return returnString;
        };
        this.PolicyRulesFormatter = function(r, c, v, cd, dc) {
            var returnString = "";
            if("network_policy_entries" in dc &&
               "policy_rule" in dc["network_policy_entries"] &&
               dc["network_policy_entries"]["policy_rule"].length > 0) {
                var rule = dc["network_policy_entries"]["policy_rule"];
                var ruleLen = rule.length

                var domainName = breadcrumbSelectedObj.domain.name;
                var projectName = breadcrumbSelectedObj.project.name;
                for(var i=0; i < ruleLen, i < 2; i++) {
                    var ruleString = self.formatPolicyRule(
                                          rule[i],
                                          domainName,
                                          projectName);
                        returnString += ruleString + "<br>";
                }
               if(ruleLen > 2) {
               returnString += '<span class="moredataText">('
                   + (ruleLen-2) + ' more)</span>' +
                   '<span class="moredata" style="display:none;" ></span>';
               }if(dc["network_policy_entries"].length == 0) {
                   returnString = "-";
               }
            }
            return returnString;
        };

        this.formatPort = function(port) {
            var result = [];
            if(port == "" || port == "ANY" || port == "any" || port == null
               || port == undefined || port == "-1") {
                port = "";
            }
            if(port != "") {
            var portArr = port.split(",");
            for(var i = 0; i < portArr.length; i++) {
                var portSplit = portArr[i].split("-");
                if(portSplit.length < 0) {
                    portSplit[0] = "-1";
                    portSplit[1] = "-1";
                }
                result[i] = {};
                result[i]["start_port"] = parseInt(portSplit[0]);
                result[i]["end_port"] = parseInt(portSplit[1]);
            }
            } else {
                result[0] = {};
                result[0]["start_port"] = parseInt("-1");
                result[0]["end_port"] = parseInt("-1");
            }
            return result;
        };
    }
    return PolicyFormatters;
});
