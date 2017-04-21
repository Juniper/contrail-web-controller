/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var PolicyFormatters = function() {
        var self = this;
        this.formatPolicyRule = function(rule, viewConfig) {
            var rule_display = "";
            if (isSet(rule) && !rule.hasOwnProperty("length")) {
                if (isSet(rule["action_list"]) &&
                    isSet(rule["action_list"]["simple_action"])) {
                        rule_display +=
                    self.policyRuleFormat(rule["action_list"]["simple_action"]);
                }
                if (isSet(rule["action_list"]) && isSet(rule["action_list"]["log"]) &&
                    true === rule["action_list"]["log"])
                    rule_display += policyRuleFormat(" log ");

                if (isSet(rule["application"]) &&
                    rule["application"].length > 0) {
                    rule_display += " application " +
                       self.policyRuleFormat(rule["application"].toString());
                    var src_addr =
                           self.formatSrcDestAddresses(rule["src_addresses"], viewConfig);
                    rule_display += src_addr;
                    if(isSet(rule["direction"]))
                        rule_display += self.policyRuleFormat(rule["direction"]);
                    var dest_addr =
                            self.formatSrcDestAddresses(rule["dst_addresses"], viewConfig);
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
                           self.formatSrcDestAddresses(rule["src_addresses"], viewConfig);
                    rule_display += src_addr;

                    var src_ports = policy_ports_display(rule["src_ports"]);
                    if(isSet(src_ports))
                        rule_display += " ports " +
                             self.policyRuleFormat(src_ports);

                    if(isSet(rule["direction"]))
                        rule_display += ' ' +
                             self.policyRuleFormat(rule["direction"]);

                    var dest_addr =
                            self.formatSrcDestAddresses(rule["dst_addresses"], viewConfig);
                    rule_display += dest_addr;

                    var dst_ports = policy_ports_display(rule["dst_ports"]);
                    if(isSet(dst_ports))
                        rule_display += ' ports ' +
                            self.policyRuleFormat(dst_ports);

                    var action_list =
                              self.policy_services_display(rule["action_list"], viewConfig);
                    if(isSet(action_list))
                        rule_display += action_list;
                }
            }
            return rule_display;
        };

        this.prepareFQN = function( net) {
            var net_disp = '';
            net_disp = self.policyRuleFormat(net.toString());
            return net_disp;
        };

        this.formatSrcDestAddresses = function(rule, viewConfig) {
            var rule_display = '';
            var addrSrcDest = self.policy_net_display(rule, viewConfig);
            if(isSet(addrSrcDest.value)) {
                rule_display = addrSrcDest.label + addrSrcDest.value;
            }
            return rule_display;
        };

       this.policy_net_display = function(nets, viewConfig) {
            var net_disp_all = "";
            var labelName = ' network ';
            if (isSet(nets) && nets.length > 0) {
                for (var i = 0; i < nets.length; i++) {
                    var net_disp = "", networkStr;
                    var net = nets[i];
                    if (isSet(net)) {
                        if (isSet(net["security_group"])) {
                            labelName = " security-group ";
                            net_disp += self.prepareFQN(net["security_group"]);
                        }
                        if (isSet(net["subnet"]) &&
                            isSet(net["subnet"]["ip_prefix"]) &&
                            isSet(net["subnet"]["ip_prefix_len"]) &&
                            isSet(net["virtual_network"])) {
                            labelName = ' ';
                            networkStr =  net["virtual_network"].split(":");
                            if(networkStr.length === 3) {
                                networkStr = networkStr[0] + ":" +
                                        networkStr[1] + ":" + networkStr[2];
                            }
                            net_disp +=
                                self.policyRuleFormat(networkStr +
                                    ctwc.VN_SUBNET_DELIMITER +
                                    net["subnet"]["ip_prefix"] + "/" +
                                    net["subnet"]["ip_prefix_len"]);
                        } else if (isSet(net["virtual_network"])){
                            labelName = ' network ';
                            var net = net["virtual_network"],network;
                            for(var i = 0; i < viewConfig.networkList.length; i++){
                                if(net === viewConfig.networkList[i].id){
                                    network = viewConfig.networkList[i].name;
                                    break;
                                }
                            }
                            if(network === undefined){
                                network = net;
                            }
                            net_disp += self.prepareFQN(network);
                        } else if(isSet(net["subnet"]) &&
                            isSet(net["subnet"]["ip_prefix"]) &&
                            isSet(net["subnet"]["ip_prefix_len"])) {
                            labelName = ' ';
                            net_disp +=
                                self.policyRuleFormat(
                                    net["subnet"]["ip_prefix"] + "/" +
                                    net["subnet"]["ip_prefix_len"]);
                        }
                        if(isSet(net["network_policy"])) {
                            labelName = ' policy ';
                            net_disp += self.prepareFQN(net["network_policy"]);
                        }
                    }
                    net_disp_all += net_disp;
                }
            }
            return {value : net_disp_all, label : labelName};
        };

       this.policyRuleFormat = function(text) {
            return '<span class="rule-format">' + text  + '</span>';
       };

        this.policy_services_display = function(action_list, viewConfig) {
            var service_str = "";
            if (isSet(action_list)) {
                var as = action_list.apply_service;
                var mt = action_list.mirror_to;
                var qos = action_list.qos_action;
                if (isSet(as) && as.length > 0 && as[0] != null) {
                    var services_value = "";
                    for (var i = 0; i < as.length; i++) {
                        var item = as[i];
                        var inst = viewConfig.instanceList;
                        for(var j = 0; j < viewConfig.instanceList.length; j++){
                            if(as[i] === viewConfig.instanceList[j].id){
                                item = viewConfig.instanceList[j].name;
                                break;
                            }
                        }
                        services_value += item;
                        if (i != (as.length - 1)) {
                            services_value += ",";
                        }
                    }
                    service_str += ' services ' +
                                   self.policyRuleFormat(services_value);
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
                    service_str += ' mirror ' + self.policyRuleFormat(mt_txt);
                }

                if (isSet(qos)) {
                    var qos_arr = qos.split(':');
                    var qos_txt = "";
                    if(qos_arr.length === 3) {
                        if(qos_arr[0] === domain &&
                                qos_arr[1] === project) {
                            qos_txt = qos_arr[2];
                        } else {
                            qos_txt = qos_arr[2] + ' (' +
                            qos_arr[0] + ':' +
                            qos_arr[1] + ')';
                        }
                    } else {
                        qos_txt = qos_arr[0];
                    }
                    service_str += ' qos ' + self.policyRuleFormat(qos_txt);
                }
            }
            return service_str;
        };

        this.PolicyRulesFormatter = function(r, c, v, cd, dc,viewConfig) {
            var showAll = true;
                count = 0;
            if (!(isNumber(cd))) {
                showAll = false;
                count = cd = 2;
            }
            var returnString = "";
            var policyRule = getValueByJsonPath(dc, "entries", []);
            if (policyRule.length > 0) {
                var rule = policyRule;
                var ruleLen = rule.length;
                if (showAll == true || count > ruleLen) {
                    count = ruleLen;
                }
                for (var i = 0; i < count; i++) {
                    var ruleString = self.formatPolicyRule(rule[i], viewConfig);
                        returnString += ruleString + "<br>";
                }
               if (showAll == false && ruleLen > cd) {
               returnString += '<span class="moredataText">('
                   + (ruleLen - cd) + ' more)</span>' +
                   '<span class="moredata" style="display:none;" ></span>';
               }
            }
            if(policyRule.length == 0) {
                returnString = "-";
            }
            return returnString;
        };
    }
    return PolicyFormatters;
});
