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
            var policies = getValueByJsonPath(response, "data", []);
            if(policies.length > 0){
                var policiesLen = policies.length;
                for(var j=0; j < policiesLen; j++) {
                    var policy = getValueByJsonPath(policies[j],
                                 "network-policy", "");
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
                            var startTime = getValueByJsonPath(vn[i],
                                            "attr;timer;start_time" , "");
                            if(startTime != "") {
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
                if (isSet(rule["action_list"]) && isSet(rule["action_list"]["log"]) &&
                    true === rule["action_list"]["log"])
                    rule_display += policyRuleFormat(" log ");

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
                            net_disp = splits[2]
                                   + ' (' + splits[0] + ':'
                                   + splits[1] + ')';
                            //net_disp = net.toString();
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
                            netArry = netArry[2]
                                      + ' (' + netArry[0] + ':'
                                             + netArry[1] + ')';
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
                            net_disp = self.policyRuleFormat(splits[2]
                                      + ' (' + splits[0] + ':'
                                             + splits[1] + ')');
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
                    var net_disp = "", networkStr;
                    var net = nets[i];
                    if (isSet(net)) {
                        if (isSet(net["security_group"])) {
                            labelName = " security-group ";
                            net_disp += self.prepareFQN(domain, project,
                                    net["security_group"]);
                        }
                        if (isSet(net["subnet"]) &&
                            isSet(net["subnet"]["ip_prefix"]) &&
                            isSet(net["subnet"]["ip_prefix_len"]) &&
                            isSet(net["virtual_network"])) {
                            labelName = ' ';
                            networkStr =  net["virtual_network"].split(":");
                            if(networkStr.length === 3) {
                                if(networkStr[0] === domain &&
                                    networkStr[1] === project) {
                                    networkStr = networkStr[2];
                                } else {
                                    networkStr = networkStr[0] + ":" +
                                        networkStr[1] + ":" + networkStr[2];
                                }
                            }
                            net_disp +=
                                self.policyRuleFormat(networkStr +
                                    ctwc.VN_SUBNET_DELIMITER +
                                    net["subnet"]["ip_prefix"] + "/" +
                                    net["subnet"]["ip_prefix_len"]);
                        } else if (isSet(net["virtual_network"])){
                            labelName = ' network ';
                            net_disp += self.prepareFQN(domain, project,
                                             net["virtual_network"]);
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
                var qos = action_list.qos_action;
                if (isSet(as) && as.length > 0 && as[0] != null) {
                    var services_value = "";
                    //if(as[0].length > 0) as = as[0];
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

        this.PoliceyNameFormatter = function(d, c, v, cd, dc) {
            var policyName = getValueByJsonPath(dc, "fq_name;2", "");
            if (policyName == ""){
                policyName = "-";
            }
            return policyName;
        };
        this.AssociatedNetworksFormatter = function(r, c, v, cd, dc) {
            var showAll = true;
                count = 0;
            if (!(isNumber(cd))) {
                showAll = false;
                count = cd = 2;
            }
            var returnString = "";
            var vnBackRef = getValueByJsonPath(dc, "virtual_network_back_refs", []);
            if (vnBackRef.length > 0) {
                var vnLen = vnBackRef.length,
                    domainName = ctwu.getGlobalVariable('domain').name,
                    projectName = ctwu.getGlobalVariable('project').name;
                if (showAll == true || count > vnLen) {
                    count = vnLen;
                }
                for(var i = 0; i < count; i++) {
                    var network_to = getValueByJsonPath(vnBackRef[i], "to", []);
                    if(network_to.length >= 2) {
                        returnString += self.prepareFQN(domainName, projectName,
                                             network_to.join(":"));
                        returnString += "<br>";
                    }
                }
               if (showAll == false && vnLen > cd) {
               returnString += '<span class="moredataText">('
                   + (vnLen - cd) + ' more)</span>' +
                   '<span class="moredata" style="display:none;" ></span>';
               }
            }
            if(vnBackRef.length == 0) {
                returnString = "-";
            }
            return returnString;
        };

        this.PolicyRulesFormatter = function(r, c, v, cd, dc) {
            var showAll = true;
                count = 0;
            if (!(isNumber(cd))) {
                showAll = false;
                count = cd = 2;
            }
            var returnString = "";
            var policyRule = getValueByJsonPath(dc,
                         "network_policy_entries;policy_rule", []);
            if (policyRule.length > 0) {
                var rule = policyRule;
                var ruleLen = rule.length
                var domainName = ctwu.getGlobalVariable('domain').name;
                var projectName = ctwu.getGlobalVariable('project').name;
                if (showAll == true || count > ruleLen) {
                    count = ruleLen;
                }
                for (var i = 0; i < count; i++) {
                    var ruleString = self.formatPolicyRule(
                                          rule[i],
                                          domainName,
                                          projectName);
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

        this.formatPort = function(port, objType) {
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
                if(objType === 'rule'){
                    result[0]["start_port"] = parseInt("0");
                    result[0]["end_port"] = parseInt("65535");
                }else{
                    result[0]["start_port"] = parseInt("-1");
                    result[0]["end_port"] = parseInt("-1");
                }
            }
            return result;
        };

        this.parseVNSubnet =  function(vnSubnetStr) {
            var vnSubnetObj = { vn: "", subnet: "", recursiveCnt: 0, mode: ""};
            if(vnSubnetStr) {
                if(isIPv4(vnSubnetStr) || isIPv6(vnSubnetStr)) {
                    vnSubnetObj.subnet = vnSubnetStr;
                    vnSubnetObj.mode = ctwc.SUBNET_ONLY;
                    vnSubnetObj.vn = null;
                } else {
                    this.parseVNSubnetRecursive(vnSubnetStr, vnSubnetObj);
                }
            }
            return vnSubnetObj
        };

        this.parseVNSubnetRecursive =  function(vnSubnetStr, vnSubnetObj) {
            var vnSubnetArr1, vnSubnetArr2, vnSubnetArr2Str;
            vnSubnetArr1 = vnSubnetStr.split(ctwc.VN_SUBNET_DELIMITER);
            if(vnSubnetArr1.length > 1 && vnSubnetObj.recursiveCnt < 3) {
                vnSubnetObj.recursiveCnt = vnSubnetObj.recursiveCnt + 1;
                if(vnSubnetObj.vn === ""){
                    vnSubnetObj.vn = vnSubnetArr1[0];
                } else {
                    vnSubnetObj.vn +=
                        ctwc.VN_SUBNET_DELIMITER + vnSubnetArr1[0];
                }
                vnSubnetArr2 = vnSubnetArr1.slice(1, vnSubnetArr1.length);
                vnSubnetArr2Str = vnSubnetArr2.join(ctwc.VN_SUBNET_DELIMITER);
                if(isIPv4(vnSubnetArr2Str) || isIPv6(vnSubnetArr2Str)) {
                    vnSubnetObj.subnet = vnSubnetArr2Str;
                } else {
                    this.parseVNSubnetRecursive(vnSubnetArr2Str, vnSubnetObj)
                }
            }
        };

        /*
         * @qosDropDownFormatter
         */
        this.qosDropDownFormatter = function(response) {
            var ddQoSDataSrc = [], qos,
            qosConfigs = getValueByJsonPath(response,
                "0;qos-configs",
                [], false);
            _.each(qosConfigs, function(qosConfig) {
                if("qos-config" in qosConfig) {
                    qos = qosConfig["qos-config"];
                    ddQoSDataSrc.push({
                        text: qos.name,
                        id: qos.fq_name && qos.fq_name.length === 3 ?
                                (qos.fq_name[0] +
                                ":" + qos.fq_name[1]
                                + ":" +
                                qos.fq_name[2]) : ""
                    });
                }
            });
            return ddQoSDataSrc;
        };

        this.routingInstDDFormatter = function(response) {
            var routingInstList = [],
                routingInst = getValueByJsonPath(response,
                    "0;routing-instances", [], false),
                responseLen = routingInst.length,
                routingInstResponseVal = "";
            for(var i = 0; i < responseLen; i++) {
                var routingInstResponse = getValueByJsonPath(routingInst[i],
                        'fq_name', '', false);
                if(routingInstResponse != '') {
                    routingInstResponseVal = routingInstResponse.join(":");
                    var objArr = routingInstResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(routingInstResponse,
                            ctwu.getCurrentDomainProject());
                    routingInstList.push({
                        value: routingInstResponseVal, text: text});
                }
            }
            return routingInstList;
        };
    }
    return PolicyFormatters;
});
