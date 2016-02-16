/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "config/networking/policy/ui/js/views/policyFormatters"],
     function(_, PolicyFormatter){
     var policyFormatter = new PolicyFormatter();
     var packerCaptureFormatter = function(){

         /*
          * displayNameFormatter
          */
          this.displayNameFormatter = function(r, c, v, cd, dc) {
              return dc.display_name ? dc.display_name : dc.name;
          };

         /*
          * vnFormatter
          */
          this.vnFormatter = function(r, c, v, cd, dc) {
              var formattedVN = "";
              var virtualNetwork = getValueByJsonPath(dc,
                  "service_instance_properties;left_virtual_network", null);
              if(virtualNetwork) {
                  virtualNetwork = virtualNetwork.split(":");
                  formattedVN =
                      virtualNetwork.length === 3 ? virtualNetwork[2] : "-";
              } else if (virtualNetwork === "") {
                  formattedVN = "Automatic";
              } else {
                  formattedVN = "-";
              }
              return formattedVN;
          };

         /*
          * associateVNFormatter
          */
          this.associateVNFormatter = function(r, c, v, cd, dc) {
              var formattedVN = "";
              var associtaedVN = getValueByJsonPath(dc,
                  "network_policy;virtual_network_back_refs", []),
                  associtaedVNCnt = associtaedVN.length;
              if(associtaedVNCnt) {
                  _.each(associtaedVN, function(vn, index) {
                     if(index > 1 && cd) {
                         return true;
                     }
                      vn = vn.to && vn.to.length == 3 ? vn.to[2] : "";
                      if(index == 0) {
                          formattedVN = vn;
                      } else {
                          formattedVN += "<br>" + vn;
                      }
                  });
                 if (associtaedVNCnt > 2 && cd) {
                     formattedVN += '<br><span class="moredataText">(' +
                        (associtaedVNCnt - 2) + ' more)</span><span class="moredata"' +
                        ' style="display:none;"></span>';
                 }
              } else {
                  formattedVN = "-";
              }
              return formattedVN;
          };

         /*
          * analyzerRuleFormatter
          */
          this.analyzerRuleFormatter = function(r, c, v, cd, dc) {
              var formattedRules = "-";
              var policy = getValueByJsonPath(dc, "network_policy", null);
                  if(policy) {
                      formattedRules =
                          policyFormatter.PolicyRulesFormatter(r, c, v, cd, policy);
                  }
              return formattedRules;
          };

         /*
          * formatPortAddress
          */
         this.formatPortAddress =  function(portArr) {
             var ports_text = "";
             if (portArr != "" && portArr.length > 0) {
                 var ports_len = portArr.length;
                 for (var i=0;i< ports_len; i++) {
                     if (ports_text != "") ports_text += ", ";
                     if (portArr[i]["start_port"] == -1 &&
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
             if (ports_text == "") {
                 ports_text = "ANY";
             }
             return ports_text;
         };
         /* vmStatusFormatter
          *
          */
        this.vmStatusFormatter = function(r, c, v, cd, dc) {
            var vmStatus = getValueByJsonPath(dc, "vmDetails;0;server;status", "Spawning");
            vmStatus = vmStatus.toLowerCase().replace(/\b[a-z]/g,
                function (letter) {
                    return letter.toUpperCase();
                });
            return '<span class="status-badge-rounded status-' +
                vmStatus.toLowerCase().split(' ').join('-') + '"></span>' + vmStatus;
        }
     };
     return packerCaptureFormatter
 });

