/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore","lodashv4", "config/infra/globalconfig/ui/js/globalConfig.utils"],
     function(_,lodashv4 , GlobalConfigUtils){
     var gcUtils = new GlobalConfigUtils();
     
     var globalConfigFormatters = function(){
    	 	 var self = this;
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
                if('enable_security_logging' === rowData['key']) {
                    if ((undefined === val) || (null === val) || ('' === val) || (false === val)) {
                        return 'Disable';
                    } else if(val){
                        return 'Enable';
                    }
                }
                if('bgpaas_parameters' === rowData['key']) {
                    if ((undefined === val) || (null === val) || ({} === val)) {
                        return '-';
                    } else {
                        return val.port_start + ' - ' + val.port_end;
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
                if ('bgp_always_compare_med' == rowData['key']) {
                    if (!val) {
                        return 'Disabled';
                    }
                    return 'Enabled';
                }
                if('encryption_tunnel_endpoints' === rowData['key']) {
                	   if(val == undefined || val.length == 0 || val == null ){
                        return '-';
                    }else{
                        var endPoints = getValueByJsonPath(val, 'endpoint', []);
                        
                        if(endPoints.length > 0){
                        	// vrouter variable is defined in vrouterEncryptionGridView 
                          endPoints =  lodashv4.orderBy(endPoints, 'tunnel_remote_ip_address', 'asc');
                            return self.endPointRemoteIPFormatter(endPoints,vrouter.vRouterList);
                        }else{
                           return '-';
                        }
                    }
               }
               if("graceful_restart_parameters" == rowData["key"]) {
                    var grTime = getValueByJsonPath(val,
                            "restart_time", "-"),
                        llgTime = getValueByJsonPath(val,
                            "long_lived_restart_time", "-"),
                        eorRecTime = getValueByJsonPath(val,
                            "end_of_rib_timeout", "-"),
                        grEnable = getValueByJsonPath(val, "enable", "-"),
                        bgpHelperEnable = getValueByJsonPath(val,
                                "bgp_helper_enable", false),
                        xmppHelperEnable = getValueByJsonPath(val,
                                        "xmpp_helper_enable", false),
                        formattedGR='', grStr='';
                    bgpHelperEnable = bgpHelperEnable === true ?
                            "Enabled" : "Disabled";
                    xmppHelperEnable = xmppHelperEnable === true ?
                            "Enabled" : "Disabled";
                    dispStr = "";
                    if(grEnable == false || grEnable == "false" || grEnable == '-') {
                        dispStr = "Disabled";
                        return dispStr;
                    }
                    dispStr = "Enabled<br><br>";
                    grStr += "<tr style='vertical-align:top'><td>";
                    grStr += bgpHelperEnable + "</td><td>";
                    grStr += xmppHelperEnable + "</td><td>";
                    grStr += grTime + "</td><td>";
                    grStr += llgTime + "</td><td>";
                    grStr += eorRecTime + "</td></tr>";

                    formattedGR = "<table style='width:100%'><thead><tr>" +
                    "<th style='width:20%'>BGP Helper</th>" +
                    "<th style='width:20%'>XMPP Helper</th>" +
                    "<th style='width:20%'>Restart Time (secs)</th>" +
                    "<th style='width:20%'>LLGR Time (secs)</th>" +
                    "<th style='width:20%'>End of RIB (secs)</th>" +
                    "</tr></thead><tbody>";

                    formattedGR += grStr;
                    formattedGR +="</tbody></table>";

                    dispStr += formattedGR;
                    return dispStr;
                }
                if ('port_translation_pools' == rowData['key']) {
                    var pools = getValueByJsonPath(val, "port_translation_pool", []);
                    if(pools.length > 0){
                        var poolString = "", protocol, portRange, portCount, returnString = '';
                        _.each(pools, function(obj) {
                            if(obj.protocol != undefined){
                                protocol = obj.protocol.toUpperCase();
                            }else{
                                protocol = '-';
                            }
                            if(obj.port_range != undefined){
                                var startPort = obj.port_range.start_port;
                                var endPort = obj.port_range.end_port;
                                portRange = startPort + '-' + endPort;
                            }else{
                                portRange = '-';
                            }
                            if(obj.port_count != undefined){
                                portCount = obj.port_count;
                            }else{
                                portCount = '-';
                            }
                            poolString += "<tr style='vertical-align:top'><td>";
                            poolString += protocol + "</td><td>";
                            poolString += portRange + "</td><td>";
                            poolString += portCount + "</td>";
                            poolString += "</tr>";
                        });
                        returnString =
                            "<table style='width:70%'><thead><tr>\
                            <th style='width:30%'>Protocol</th>\
                            <th style='width:30%'>Port Range</th>\
                            <th style='width:30%'>Port Count</th>\
                            </tr></thead><tbody>";
                        returnString += poolString;
                        returnString += "</tbody></table>";
                        return returnString;
                    }else{
                        return '-';
                    }
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

          this.formatQoSQueueExp = function(r, c, v, cd, dc) {
              return qosQueue = getValueByJsonPath(dc,
                      "qos_queue_refs;0;to;2", "-");
          };
          
          this.endPointRemoteIPFormatter = function(endPoint, vRouterList){
              var subnetString = "", tunnel_remote_ip_address
              _.each(endPoint, function(obj) {
                  if(obj.tunnel_remote_ip_address != undefined){
                	  	tunnel_remote_ip_address = obj.tunnel_remote_ip_address;
                  }else{
                	  	tunnel_remote_ip_address = '-';
                  }
                  var ipName="-"
                  if(vRouterList != undefined || vRouterList.length > 0  ){
	                	  _.each(vRouterList, function(vRouter) {
	                		  if(obj.tunnel_remote_ip_address ==  vRouter.key){
	                			  var nodeHash = '/#p=config_infra_nodes';
	                			  var nodeUrl = window.location.origin + nodeHash;
	                			  ipName = '<a href="'+ nodeUrl + '" style="color: #3184c5">' + vRouter.value + '</a>' ;
	                		  }
	                	  });
                  }
                  subnetString += "<tr style='vertical-align:top; border-bottom:1pt solid #F1F1F1;'><td>";
                  subnetString += tunnel_remote_ip_address + "</td><td>";
                  subnetString += ipName + "</td>";
                  subnetString += "</tr>";
              });
              returnString =
                  "<table style='width:32%'><thead style='background-color:#f9f9f9;'><tr>\
                  <th style='width:40%'>Endpoint</th>\
                   <th style='width:60%'>Virtual Router</th>\
                  </tr></thead><tbody>";
              returnString += subnetString;
              returnString += "</tbody></table>";
              return returnString;
          };
          this.formatQoSQueueData = function(result) {
              var qosQueueDS = [], queueId,
                  queues = getValueByJsonPath(result, "0;qos-queues", [], false);
              _.each(queues, function(queue) {
                  queueId = getValueByJsonPath(queue,
                          "qos-queue;qos_queue_identifier", 0, false);
                  qosQueueDS.push({text: queueId, value: queueId});
              });
              return qosQueueDS;
          };
     };
     return globalConfigFormatters;
 });

