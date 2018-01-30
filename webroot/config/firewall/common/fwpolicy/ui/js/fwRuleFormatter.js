/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "moment"], function(_, moment){
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
                   policyId = currentHashParams.focusedElement.uuid;

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
            this.serviceFormatter = function(r, c, v, cd, dc, global) {
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
                        var startPort = getValueByJsonPath(service, 'dst_ports;start_port', '');
                        var endPort = getValueByJsonPath(service, 'dst_ports;end_port', '');
                        if(startPort !== '' && endPort !== ''){
                            if(startPort === endPort){
                                serviceStr += ':'  +
                                    (endPort === -1 ? ctwl.FIREWALL_POLICY_ANY : endPort);
                            } else{
                                if(startPort === 0 && endPort === 65535){
                                    serviceStr += ':any';
                                }else{
                                    serviceStr += ':' + (service && service.dst_ports ?
                                            startPort + '-' +
                                            endPort : '-');
                                }
                            }
                        }
                        return serviceStr ? serviceStr : '-';
                }else if(dc['service_group_refs'] !== undefined){
                    var serviceGrpRef = getValueByJsonPath(dc,
                            "service_group_refs",[]);
                    var protocol = '';
                    if(serviceGrpRef.length > 0){
                        for(var i = 0; i < serviceGrpRef.length; i++){
                            var to = serviceGrpRef[i].to;
                            var serviceGrpInfo = getValueByJsonPath(serviceGrpRef[i],
                                    "service-group-info;firewall_service",[]);
                            if(serviceGrpInfo.length > 0){
                                for(var j = 0; j < serviceGrpInfo.length; j++){
                                    protocol += "<div style='font-weight:bold;width:60px !important;display:inline-block;'>Protocol:</div>"+
                                    "<div style='width:50px !important;display:inline-block;'>"+serviceGrpInfo[j].protocol+"</div>"+
                                    "<div style='font-weight:bold;width:50px !important;display:inline-block;'>Ports:</div>"+
                                    "<div style='width:50px !important;display:inline-block;'>"+serviceGrpInfo[j].dst_ports.end_port+" - "+
                                    serviceGrpInfo[j].dst_ports.start_port+"</div><br />";
                                }
                                if(serviceGrpInfo.length > 2){
                                    protocol = protocol.split("<br />");
                                    protocol = protocol[0]+"<br />"+protocol[1]+"  ...";
                                }
                            }
                            if(isGlobal){
                                serviceStr = to[to.length - 1] + "<br />" + protocol;
                            }else{
                               if(to.length < 3){
                                 serviceStr = 'global:' + to[to.length - 1] +"<br />" + protocol;
                               } else{
                                 serviceStr = to[to.length - 1];
                               }
                            }
                        }
                        return serviceStr;
                    }else{
                        return '-';
                    }

                }else{
                    return '-';
                }

            };

            this.serviceExpandFormatter = function(r, c, v, cd, dc, global) {
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
                        var startPort = getValueByJsonPath(service, 'dst_ports;start_port', '');
                        var endPort = getValueByJsonPath(service, 'dst_ports;end_port', '');
                        if(startPort !== '' && endPort !== ''){
                            if(startPort === endPort){
                                serviceStr += ':'  +
                                    (endPort === -1 ? ctwl.FIREWALL_POLICY_ANY : endPort);
                            } else{
                                if(startPort === 0 && endPort === 65535){
                                    serviceStr += ':any';
                                }else{
                                    serviceStr += ':' + (service && service.dst_ports ?
                                            startPort + '-' +
                                            endPort : '-');
                                }
                            }
                        }
                        return serviceStr ? serviceStr : '-';
                }else if(dc['service_group_refs'] !== undefined){
                    var serviceGrpRef = getValueByJsonPath(dc,
                            "service_group_refs",[]);
                    var protocol = '';
                    if(serviceGrpRef.length > 0){
                        for(var i = 0; i < serviceGrpRef.length; i++){
                            var to = serviceGrpRef[i].to;
                            var serviceGrpInfo = getValueByJsonPath(serviceGrpRef[i],
                                    "service-group-info;firewall_service",[]);
                            protocol += "<div style='width:100px;float:left;font-weight:bold;'>Protocol</div>" +
                            "<div style='width:100px;float:left;font-weight:bold;'>Ports</div><br />";
                            if(serviceGrpInfo.length > 0){
                                for(var j = 0; j < serviceGrpInfo.length; j++){
                                    protocol += "<div style='width:100px;float:left;'>"+serviceGrpInfo[j].protocol+"</div>"+
                                    "<div style='width:100px;float:left;'>"+serviceGrpInfo[j].dst_ports.end_port+" - "+
                                    serviceGrpInfo[j].dst_ports.start_port+"</div><br />";
                                }
                            }
                            if(isGlobal){
                                serviceStr = to[to.length - 1] + "<br />" + protocol;
                            }else{
                               if(to.length < 3){
                                 serviceStr = 'global:' + to[to.length - 1] +"<br />" + protocol;
                               } else{
                                 serviceStr = to[to.length - 1];
                               }
                            }
                        }
                        return serviceStr;
                    }else{
                        return '-';
                    }

                }else{
                    return '-';
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