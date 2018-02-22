/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["lodash", "moment"], function(_, moment){
     var fwRuleFormatter = function(){

         /*
          * actionFormatter
          */
          this.actionFormatter = function(r, c, v, cd, dc) {
              var action = getValueByJsonPath(dc,
                  "action_list;simple_action", '', false);
              return action ? action : '-';
          };

          /*
           * squenceFormatter
           */
           this.sequenceFormatter = function(r, c, v, cd, dc) {
               var sequence = '', policies = getValueByJsonPath(dc,
                   "firewall_policy_back_refs", [], false),
                   currentHashParams = layoutHandler.getURLHashParams(),
                   policyId = getValueByJsonPath(currentHashParams,
                           'focusedElement.uuid', '');

               for(var i = 0; i < policies.length; i++) {
                   if(policies[i].uuid === policyId) {
                       sequence = getValueByJsonPath(policies[i],
                               'attr;sequence', '', false);
                       break;
                   }
               }
               return sequence ? sequence : (cd ? '-' : '');
           };

           /*
            * Wizard Rule List squenceFormatter
            */
            this.ruleListSequenceFormatter = function(r, c, v, cd, dc) {
                var sequence = '', policies = getValueByJsonPath(dc,
                    "firewall_policy_back_refs", [], false);
                for(var i = 0; i < policies.length; i++) {
                    for(var j = 0; j < policyUuidList.length; j++){
                        if(policies[i].uuid === policyUuidList[j]) {
                            sequence = getValueByJsonPath(policies[i],
                                    'attr;sequence', '', false);
                            break;
                        }
                    }
                }
                return sequence ? sequence : (cd ? '-' : '');
            };

            /*
             * Member Of Firewall Policy
             */
             this.fwPolicyMemberFormatter = function(r, c, v, cd, dc) {
                 var policyName, policies = getValueByJsonPath(dc,
                     "firewall_policy_back_refs", [], false);
                 for(var i = 0; i < policies.length; i++) {
                     var to = policies[i].to;
                     var policyName = to[to.length - 1];
                 }
                 return policyName;
             };

           /*
            * enabledFormatter
            */
            this.enabledFormatter = function(r, c, v, cd, dc) {
                var enabled = getValueByJsonPath(dc,
                        'id_perms;enabled', true, false);
                return enabled ? 'Enabled' : 'Disabled';
            };

          /*
           * serviceFormatter
           */
            this.serviceFormatter = function(r, c, v, cd, dc, global, isCollapse) {
                var serviceStr = "", isGlobal;
                if(global === undefined){
                  isGlobal = this.isGlobal;
                } else{
                    isGlobal = global;
                }
                if(dc['service'] !== undefined && Object.keys(dc['service']).length > 0){
                    var service = getValueByJsonPath(dc,
                            "service", {}, false);
                        serviceStr += service.protocol ? service.protocol : '';
                        var srcStartPort = _.get(service, 'src_ports.start_port', '');
                        var srcEndPort = _.get(service, 'src_ports.end_port', '');
                        var dstStartPort = _.get(service, 'dst_ports.start_port', '');
                        var dstEndPort = _.get(service, 'dst_ports.end_port', '');
                        if(srcStartPort !== '' && srcEndPort !== ''){
                            if(srcStartPort === srcEndPort){
                                serviceStr += ':'  +
                                    (srcEndPort === -1 ? ctwl.FIREWALL_POLICY_ANY : srcEndPort);
                            } else{
                                if(srcStartPort === 0 && srcEndPort === 65535){
                                    serviceStr += ':any';
                                }else{
                                    serviceStr += ':' + (service && service.src_ports ?
                                            srcStartPort + '-' +
                                            srcEndPort : '-');
                                }
                            }
                        }
                        if(dstStartPort !== '' && dstEndPort !== ''){
                            if(dstStartPort === dstEndPort){
                                serviceStr += ':'  +
                                    (dstEndPort === -1 ? ctwl.FIREWALL_POLICY_ANY : dstEndPort);
                            } else{
                                if(dstStartPort === 0 && dstEndPort === 65535){
                                    serviceStr += ':any';
                                }else{
                                    serviceStr += ':' + (service && service.dst_ports ?
                                            dstStartPort + '-' +
                                            dstEndPort : '-');
                                }
                            }
                        }
                        return serviceStr ? serviceStr : '-';
                }else if(dc['service_group_refs'] !== undefined){
                    var serviceGrpRef = getValueByJsonPath(dc,
                            "service_group_refs",[]);
                    var protocol = '';
                    var stringSpan = '';
                    if(serviceGrpRef.length > 0){
                            for(var i = 0; i < serviceGrpRef.length; i++){
                                var to = serviceGrpRef[i].to;
                                var serviceGrpInfo = _.get(serviceGrpRef[i],
                                        "service-group-info.firewall_service",[]);
                            if(isCollapse === true){
                                if(serviceGrpInfo.length > 0){
                                    _.each(serviceGrpInfo, function(item,index){
                                        if(serviceGrpInfo.length-1 === index){
                                            stringSpan = "</span>";
                                        }
                                        else{
                                            stringSpan = "</span> , ";
                                        }
                                        if(item.src_ports.start_port === 0 && item.src_ports.end_port === 65535){
                                            protocol += "<span class='rule-formatter-txt'>"+item.protocol+": </span>"+
                                            "<span class='rule-formatter-txt'>"+item.dst_ports.start_port+"-"+
                                            item.dst_ports.end_port+ stringSpan;
                                        }
                                        else{
                                            protocol += "<span class='rule-formatter-txt'>"+item.protocol+": </span>"+
                                            "<span class='rule-formatter-txt'>"+item.src_ports.start_port+"-"+
                                            item.src_ports.end_port+ stringSpan+
                                            "<span class='rule-formatter-txt'>"+item.dst_ports.start_port+"-"+
                                            item.dst_ports.end_port+ stringSpan;
                                        }
                                    });
                                    if(serviceGrpInfo.length > 2){
                                        protocol = protocol.split(",");
                                        protocol = protocol[0]+ "," +protocol[1] + "...";
                                    }
                                }
                                if(protocol != ''){
                                    protocol = " ("+ protocol + ")";
                                }
                                else{
                                    protocol = '';
                                }
                                if(isGlobal){
                                    serviceStr = to[to.length - 1] + protocol;
                                }else{
                                   if(to.length < 3){
                                     serviceStr = 'global:' + to[to.length - 1] + protocol;
                                   } else{
                                     serviceStr = to[to.length - 1] + protocol;
                                   }
                                  }
                                }
                                else{
                                    if(serviceGrpInfo.length > 0){
                                        var srcPortsStart = '';
                                        var srcPorstsEnd = ''
                                       protocol += "<table><tr>" +
                                       "<th style='width:30%;'>Protocol</th><th style='width:30%;'>Source Ports</th><th style='width:30%;'>Destination Ports</th></tr>";
                                      _.each(serviceGrpInfo, function(item,index){
                                          if(item.src_ports.start_port != 0 && item.src_ports.end_port != 65535){
                                              srcPortsStart = item.src_ports.start_port;
                                              srcPorstsEnd = item.src_ports.end_port;
                                          }
                                          protocol += "<tr>"
                                          protocol += "<td>"+item.protocol+"</td>"
                                          protocol += "<td>"+srcPortsStart+"-"+
                                          srcPorstsEnd+"</td>"
                                          protocol += "<td>"+item.dst_ports.start_port+"-"+
                                          item.dst_ports.end_port+"</td>"
                                          protocol += "</tr>"
                                      });
                                      protocol += "</table>";
                                  }
                                  if(isGlobal){
                                      serviceStr = to[to.length - 1] + "<br />" + protocol;
                                  }else{
                                     if(to.length < 3){
                                       serviceStr = 'global:' + to[to.length - 1] +"<br />" + protocol;
                                     } else{
                                       serviceStr = to[to.length - 1] + "<br />" + protocol;
                                     }
                                  }
                                }
                            }
                            return serviceStr;
                    }else{
                        return '-';
                    }
                }
            };
          /*
           * endPoint1Formatter
           */
           this.endPoint1Formatter = function(r, c, v, cd, dc) {
               return formatEndPoints(dc, 'endpoint_1');

           };

           var formatEndPoints =  function(dc, endpointTarget) {
               var rule_display = '';
               var tags = ctwu.getGlobalVariable(ctwc.RULE_DATA_TAGS);
               var addressGrps = ctwu.getGlobalVariable(ctwc.RULE_DATA_ADDRESS_GROUPS);
               var endpoint = getValueByJsonPath(dc, endpointTarget, {}, false);
               if(endpoint.subnet) {
                   return endpoint.subnet;
               } else if(endpoint.address_group) {
                   var addGrp = endpoint.address_group.split(":");
                   return "Address Group: " + addGrp[addGrp.length - 1];
               } else if(endpoint.tags.length > 0) {
                   return endpoint.tags.join(' &&</br>');
               } else if(endpoint.security_group) {
                   return endpoint.security_group;
               } else if(endpoint.virtual_network) {
                   return "Network: " + endpoint.virtual_network.split(":")[2];
               } else if(endpoint.any) {
                   return 'any';
               } else {
                   return '-';
               }
           }

           /*
            * endPoint2Formatter
            */
            this.endPoint2Formatter = function(r, c, v, cd, dc) {
                return formatEndPoints(dc, 'endpoint_2');
            };

            /*
             * matchFormatter
             */
            this.matchFormatter = function(r, c, v, cd, dc) {
                var  formattedMatch ='', matches = getValueByJsonPath(dc,
                    "match_tags;tag_list", [], false);
                if(matches.length > 0) {
                    _.each(matches, function(match, i){
                        var matchStr  = getFormattedMatchTags(match)
                        if(i === 0) {
                            formattedMatch += matchStr;
                        } else {
                            formattedMatch += '<br>' + matchStr;
                        }
                    });
                } else {
                    formattedMatch = '-';
                }
                return formattedMatch;
            };

            var getFormattedMatchTags = function (key) {
                if(!key){
                    return '';
                }
                key = key.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                    return letter.toUpperCase();
                });
                return key;
            };

            /*
             * dirFormatter
             */
            this.dirFormatter = function(r, c, v, cd, dc) {
                var dir = getValueByJsonPath(dc,
                    "direction", '', false);
                if(dir) {
                    dir = cowu.deSanitize(dir);
                } else {
                    dir = '-';
                }
                return dir;
            };

            /*
             * simpleActionFormatter
             */
            this.simpleActionFormatter = function(r, c, v, cd, dc) {
                var simpleActionStr  = '',
                simpleAction = getValueByJsonPath(dc,
                    "action_list;apply_service", [], false);
                return simpleAction.length > 0 ? simpleAction.join(',') : '-';
            };
     };
     return fwRuleFormatter
 });