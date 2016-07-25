/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "config/infra/globalconfig/ui/js/globalConfig.utils"],
     function(_, GlobalConfigUtils){
     var gcUtils = new GlobalConfigUtils();
     var globalConfigFormatters = function(){

         /*
          * valueFormatter
          */
          this.valueFormatter = function(row, col, val, d, rowData) {
                var dispStr = "";
                if ('forwarding_mode' == rowData['key']) {
                    if (("" == val) || (undefined == val)) {
                        return 'Default';
                    }
                    if ('l2' == val) {
                        return 'L2 Only';
                    }
                    if ('l3' == val) {
                        return 'L3 Only';
                    }
                    if ('l2_l3' == val) {
                        return 'L2 and L3';
                    }
                }
                if ('flow_export_rate' == rowData['key']) {
                    if ((undefined === val) || (null === val) || ("" === val)) {
                        return "-";
                    } else {
                        return val;
                    }
                }
                if ('flow_aging_timeout_list' == rowData['key']) {
                    var list = getValueByJsonPath(val, 'flow_aging_timeout', []);
                    if (!list.length) {
                        return "-";
                    }
                    var cnt = list.length;
                    for (var i = 0; i < cnt; i++) {
                        dispStr += "Protocol: " +
                            list[i]['protocol'].toUpperCase();
                        dispStr += ", Port: " + list[i]['port'];
                        dispStr += ", Timeout: " + list[i]['timeout_in_seconds']
                            + ' seconds';
                        dispStr += '<br>';
                    }
                    return dispStr;
                }
                if ('vxlan_network_identifier_mode' == rowData['key']) {
                    if ("automatic" == val) {
                        return 'Auto Configured';
                    } else if ("configured" == val) {
                        return "User Configured";
                    }
                    return val;
                }
                if ('ibgp_auto_mesh' == rowData['key']) {
                    if (false == val) {
                        return 'Disabled';
                    }
                    return 'Enabled';
                }
                if ('encapsulation_priorities' == rowData['key']) {
                    if (null == val) {
                        return '-';
                    }
                    val = val['encapsulation'];
                    var uiEncap = gcUtils.mapConfigEncapToUIEncap(val);
                    if ((null == uiEncap) || (!uiEncap.length)) {
                        return '-';
                    }
                    var len = uiEncap.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += uiEncap[i] + '<br>';
                    }
                    return dispStr;
                }
                if ('ip_fabric_subnets' == rowData['key']) {
                    dispStr = '-';
                    val =  getValueByJsonPath(val, 'subnet', []);
                    var len = val.length, subnet;
                    for (var i = 0; i < len; i++) {
                        if (0 == i) {
                            dispStr = "";
                        }
                        subnet = val[i].ip_prefix + "/" + val[i].ip_prefix_len;
                        dispStr += subnet + "<br>";
                    }
                    return dispStr;
                }
                if ('ecmp_hashing_include_fields' == rowData['key']) {
                    dispStr = '-';
                    var fields = [];
                    for (var key in val) {
                        if ('hashing_configured' == key) {
                            continue;
                        }
                        if (true == val[key]) {
                            key = key.replace('_', '-');
                            fields.push(key);
                        }
                    }
                    if (fields.length > 0) {
                        return fields.join(', ');
                    }
                    return dispStr;
                }

                if("graceful_restart_params" == rowData["key"]) {
                    var grTime = getValueByJsonPath(val,
                            "graceful_restart_time", "-"),
                        llgTime = getValueByJsonPath(val,
                            "long_lived_graceful_restart_time", "-"),
                        eorRecTime = getValueByJsonPath(val,
                            "end_of_rib_receive_time", "-"),
                            dispStr = "";

                    dispStr += "Restart Time : " +
                        (grTime === "-" ? grTime : grTime + " (seconds)");
                    dispStr += "<br>Long Lived Restart Time : " +
                        (llgTime === "-" ? llgTime : llgTime + " (seconds)");
                    dispStr += "<br>End of RIB Receive Time : " +
                        (eorRecTime === "-" ? eorRecTime :
                            eorRecTime + " (seconds)");

                    return dispStr;
                }
                return val;
          };

          this.formatForwardingClassId = function(r, c, v, cd, dc) {
              var fwdClass = getValueByJsonPath(dc, "forwarding_class_id", "");
              if(fwdClass === ""){
                  fwdClass = getValueByJsonPath(dc, "name", "-");
              }
              return fwdClass;
          };

          this.formatForwardingClassDSCP = function(r, c, v, cd, dc) {
              var dscp = getValueByJsonPath(dc, "forwarding_class_dscp", "-");
              return gcUtils.getTextByValue(ctwc.QOS_DSCP_VALUES, dscp);
          };

          this.formatForwardingClassVLAN = function(r, c, v, cd, dc) {
              var vlan = getValueByJsonPath(dc,
                      "forwarding_class_vlan_priority", "-");
              return gcUtils.getTextByValue(ctwc.QOS_VLAN_PRIORITY_VALUES,
                      vlan);
          };

          this.formatForwardingClassMPLS = function(r, c, v, cd, dc) {
              var mpls = getValueByJsonPath(dc,
                      "forwarding_class_mpls_exp", "-");
              return gcUtils.getTextByValue(ctwc.QOS_MPLS_EXP_VALUES,
                      mpls);
          };
     };
     return globalConfigFormatters;
 });

