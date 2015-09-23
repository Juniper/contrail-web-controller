/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var PolicyFormatters = function() {
        var self = this;
        //Formating the result from api//
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
        /*this.formAddedRule = function() {
            $('th.wrap').each(function(i, item) {
                cIndex=item.cellIndex + 1;
                var headerString = $(item).html();
                var element = $( this ).parent().parent().parent().find('td:nth-child('+cIndex +')');
                var idVal = element[0].id;
                var className = element.attr('class');
                var bodyString= element.html();
                var hideElement = $(this).parent().parent().parent().find('td:nth-child('+cIndex+')').hide();
                if(hideElement != true) {
                    var rowCount=($(item).closest('tr').parent().parent().find('tbody tr.data-row').length);
                    $(item).closest('tr').parent().parent().find('tbody tr.data-row.nowrap').after("<tr><td colspan='2'><label style='text-align:left;padding-right:10px' >"+headerString+"</label></td><td colspan="+cIndex+" id='"+idVal+"' class='"+className+"'>"+bodyString+"</td></tr>");
//                  $(item).closest('tr').parent().parent().find('tbody tr.data-row').removeClass('nowrap');
                    $(item).hide();
                }
            });
            $('th.wrap').closest('tr').parent().parent().find('tbody tr.data-row').removeClass('nowrap');
        }*/

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
                           self.formatSrcDestAddresses(rule["src_addresses"],
                           domain, project);
                    rule_display += src_addr;
                    if(isSet(rule["direction"]))
                        rule_display += self.policyRuleFormat(rule["direction"]);
                    var dest_addr =
                            self.formatSrcDestAddresses(rule["dst_addresses"],
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
                           self.formatSrcDestAddresses(rule["src_addresses"],
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
                            self.formatSrcDestAddresses(rule["dst_addresses"],
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
        this.formatCurrentFQNameValue = function(domain, project, net) {
            var net_disp = '';
            if(isSet(domain) && isSet(project) && isString(domain) &&
                isString(project)) {
                var splits = net.split(":");
                if(domain === splits[0] && project === splits[1]) {
                    if(splits.length === 3) {
                        if(splits[2].toLowerCase() === "any"
                            || splits[2].toLowerCase() === "local"){
                            net_disp = net.toString();
                        } else {
                            net_disp = splits[2];
                        }
                    } else {
                        net_disp = splits[0];
                    }
                } else {
                    //prepare network display format
                    var netArry = net.toString().split(':');
                    if(netArry.length === 3) {
                        if(netArry[0].toLowerCase() != 'any' &&
                           netArry[0].toLowerCase() != 'local') {
                            netArry = self.policyRuleFormat(netArry[2]
                                      + ' (' + netArry[0] + ':'
                                             + netArry[1] + ')');
                            net_disp = netArry;
                        } else {
                            net_disp = netArry[0];
                        }
                    } else {
                        net_disp = netArry[0];
                    }
                }
            } else {
                net_disp = net.toString();
            }
            return net_disp;
        }
        this.prepareFQN = function(domain, project, net) {
            var net_disp = '';
            if(isSet(domain) && isSet(project) && isString(domain) &&
                isString(project)) {
                var splits = net.split(":");
                if(domain === splits[0] && project === splits[1]) {
                    if(splits.length === 3) {
                        if(splits[2].toLowerCase() === "any"
                            || splits[2].toLowerCase() === "local"){
                            net_disp = self.policyRuleFormat(net.toString());
                        } else {
                            net_disp = self.policyRuleFormat(splits[2]);
                        }
                    } else {
                        net_disp = self.policyRuleFormat(splits[0]);
                    }
                } else {
                    //prepare network display format
                    var netArry = net.toString().split(':');
                    if(netArry.length === 3) {
                        if(netArry[0].toLowerCase() != 'any' &&
                           netArry[0].toLowerCase() != 'local') {
                            netArry = self.policyRuleFormat(netArry[2]
                                      + ' (' + netArry[0] + ':'
                                             + netArry[1] + ')');
                            net_disp = netArry;
                        } else {
                            net_disp = self.policyRuleFormat(netArry[0]);
                        }
                    } else {
                        net_disp = self.policyRuleFormat(netArry[0]);
                    }
                }
            } else {
                net_disp = self.policyRuleFormat(net.toString());
            }
            return net_disp;
        };

        this.formatSrcDestAddresses = function(rule, domain, project) {
            var rule_display = '';
            var addrSrcDest = self.policy_net_display(rule, domain, project);
            if(isSet(addrSrcDest.value)) {
                rule_display = addrSrcDest.label + addrSrcDest.value;
            }
            return rule_display;
        };

        this.policy_net_display = function(nets, domain, project) {
            var net_disp_all = "";
            var labelName = ' network ';
            if (isSet(nets) && nets.length > 0) {
                for (var i = 0; i < nets.length; i++) {
                    var net_disp = "";
                    var net = nets[i];
                    if (isSet(net)) {
                        if (isSet(net["security_group"])) {
                            net_disp += net["security_group"].toString();
                        }
                        if (isSet(net["subnet"]) &&
                            isSet(net["subnet"]["ip_prefix"]) &&
                            isSet(net["subnet"]["ip_prefix_len"])) {
                            labelName = ' ';
                            net_disp +=
                                self.policyRuleFormat(
                                    net["subnet"]["ip_prefix"] + "/" +
                                    net["subnet"]["ip_prefix_len"]);
                        }
                        if (isSet(net["virtual_network"])) {
                            labelName = ' network ';
                            net_disp += self.prepareFQN(domain, project,
                                             net["virtual_network"]);
                        }
                        if(isSet(net["network_policy"])) {
                            labelName = ' policy ';
                            net_disp += self.prepareFQN(domain, project,
                                                        net["network_policy"]);
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
        this.policy_services_display = function(action_list, domain, project) {
            var service_str = "";
            if (isSet(action_list)) {
                var as = action_list.apply_service;
                var mt = action_list.mirror_to;
                if (isSet(as) && as.length > 0 && as[0] != null) {
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
                var domainName = ctwu.getGlobalVariable('domain').name;
                var projectName = ctwu.getGlobalVariable('project').name;
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
                var domainName = ctwu.getGlobalVariable('domain').name;
                var projectName = ctwu.getGlobalVariable('project').name;
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

        this.PolicyRulesExpandFormatter = function(r, c, v, cd, dc) {
            var returnString = "";
            if("network_policy_entries" in dc &&
               "policy_rule" in dc["network_policy_entries"] &&
               dc["network_policy_entries"]["policy_rule"].length > 0) {
                var rule = dc["network_policy_entries"]["policy_rule"];
                var ruleLen = rule.length
                var domainName = ctwu.getGlobalVariable('domain').name;
                var projectName = ctwu.getGlobalVariable('project').name;
                for(var i=0; i < ruleLen; i++) {
                    var ruleString = self.formatPolicyRule(
                                          rule[i],
                                          domainName,
                                          projectName);
                        returnString += ruleString + "<br>";
                }
            }
            if(dc["network_policy_entries"].length == 0) {
                 returnString = "-";
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
                if(portSplit.length == 1) {
                    portSplit[0] = portSplit[0];
                    portSplit[1] = portSplit[0];
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
