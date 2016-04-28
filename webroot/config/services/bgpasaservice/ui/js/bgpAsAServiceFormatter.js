/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var bgpAsASSvcFormatter = function(){

         /*
          * ipAddressFormatter
          */
          this.ipAddressFormatter = function(r, c, v, cd, dc) {
              return getValueByJsonPath(dc,
                  "bgpaas_ip_address", "-");
          };


         /*
          *  parseVMIDetails
          */
         this.parseVMIDetails = function(response) {
             var parsedData = [];
             var vmiDetail, displayText, actValue, instIPs, instIPStr;
             if(response) {
                 _.each(response, function(vmi){
                     vmiDetail =
                         getValueByJsonPath(vmi, "virtual-machine-interface", null);
                         if(vmiDetail) {
                             displayText = vmiDetail.name;
                             instIPStr = "";
                             instIPs = getValueByJsonPath(vmiDetail,
                                 "instance_ip_address", []);
                             if(vmiDetail.fq_name &&
                                 vmiDetail.fq_name.length === 3) {
                                 actValue = vmiDetail.uuid +
                                     cowc.DROPDOWN_VALUE_SEPARATOR + vmiDetail.fq_name[0] +
                                     cowc.DROPDOWN_VALUE_SEPARATOR + vmiDetail.fq_name[1] +
                                     cowc.DROPDOWN_VALUE_SEPARATOR + vmiDetail.fq_name[2];
                             } else {
                                 actValue = vmiDetail.uuid;
                             }
                             instIPStr = instIPs.join(", ");
                             if(instIPStr) {
                                 displayText += " (" + instIPStr + ")";
                             }
                             parsedData.push({
                                 text : displayText,
                                 value : actValue
                             });
                         }
                 });
             }
             return parsedData;
         };

         /*
          * vmiFormatter
          */
         this.vmiFormatter = function(r, c, v, cd, dc) {
             var formattedVMIStr = "", vmiStr;
             var vmiRefs = getValueByJsonPath(dc,
                 "virtual_machine_interface_refs", []);
             var i, vmi, vmiRefsCnt = vmiRefs.length, instIPs, instIPStr;
             if(vmiRefsCnt) {
                 for(i = 0; i < vmiRefsCnt; i++) {
                     if(i > 1 && cd) {
                         break;
                     }
                     instIPStr = "";
                     vmi = getValueByJsonPath(vmiRefs[i],
                         "to;2", {});
                     vmiStr = vmi;
                     instIPs = getValueByJsonPath(vmiRefs[i],
                         "instance_ip_address", []);
                     instIPStr = instIPs.join(", ");
                     if(instIPStr) {
                         vmiStr += " (" +  instIPStr + ")";
                     }
                     if(i === 0) {
                         formattedVMIStr = vmiStr;
                     } else {
                         formattedVMIStr += "<br>" + vmiStr;
                     }
                 }
                 if (vmiRefsCnt > 2 && cd) {
                     formattedVMIStr += '<br><span class="moredataText">(' +
                        (vmiRefsCnt - 2) + ' more)</span><span class="moredata"' +
                        ' style="display:none;"></span>';
                 }
             } else {
                 formattedVMIStr = "-";
             }
             return formattedVMIStr;
         };

         /*
          * adminStateFormatter
          */
          this.adminStateFormatter = function(r, c, v, cd, dc) {
              var adminState;
              var adminDown =  getValueByJsonPath(dc,
                  "bgpaas_session_attributes;admin_down", "-");
              if(adminDown !== "-") {
                  adminState = adminDown ? "False" : "True";
              } else {
                  adminState = "-";
              }
              return adminState;
          };

         /*
          * passiveFormatter
          */
          this.passiveFormatter = function(r, c, v, cd, dc) {
              var passive =  getValueByJsonPath(dc,
                  "bgpaas_session_attributes;passive", "-");
              if(passive !== "-") {
                  passive = passive ? "True" : "False";
              }
              return passive;
          };

         /*
          * holdTimeFormatter
          */
          this.holdTimeFormatter = function(r, c, v, cd, dc) {
              var holdTime =  getValueByJsonPath(dc,
                  "bgpaas_session_attributes;hold_time", "-");
              if(holdTime !== "-") {
                  holdTime = holdTime + " (seconds)";
              }
              return holdTime;
          };

         /*
          * loopCountFormatter
          */
          this.loopCountFormatter = function(r, c, v, cd, dc) {
              return getValueByJsonPath(dc,
                  "bgpaas_session_attributes;loop_count", "-");
          };

         /*
          * addressFamiliesFormatter
          */
          this.addressFamiliesFormatter = function(r, c, v, cd, dc) {
              var formattedAddressfamilies = "";
              var addressFamilies =  getValueByJsonPath(dc,
                  "bgpaas_session_attributes;address_families;family", []);
              if(addressFamilies.length) {
                  for(var i = 0; i < addressFamilies.length; i++) {
                      if(i === 0) {
                          formattedAddressfamilies = addressFamilies[i];
                      } else {
                          formattedAddressfamilies += ", " + addressFamilies[i];
                      }
                  }
              } else {
                  formattedAddressfamilies = "-";
              }
              return formattedAddressfamilies;
          };

         /*
          * authModeFormatter
          */
          this.authModeFormatter = function(r, c, v, cd, dc) {
              return getValueByJsonPath(dc,
                  "bgpaas_session_attributes;auth_data;key_type", "-");
          };

         /*
          * familyAttrsFormatter
          */
          this.familyAttrsFormatter = function(r, c, v, cd, dc) {
              var formattedFamilyAttr = "";
              var familyAttrs = getValueByJsonPath(dc,
                  "bgpaas_session_attributes;family_attributes", "[]");
               if(familyAttrs.length) {
                   for(var i = 0; i < familyAttrs.length; i++) {
                        var familyAttr = familyAttrs[i];
                       formattedFamilyAttr +=
                           "Address Family : " + getValueByJsonPath(familyAttr, "address_family", "-");
                       formattedFamilyAttr +=
                           ", Loop Count : " + getValueByJsonPath(familyAttr, "loop_count", "-");
                       formattedFamilyAttr +=
                           ", Prefix Limit : " + getValueByJsonPath(familyAttr, "prefix_limit;maximum", "-");
                       if(i !== familyAttrs.length - 1) {
                            formattedFamilyAttr +="</br>";
                       }
                   }
               } else {
                   formattedFamilyAttr = "-";
               }
               return formattedFamilyAttr;
          };
     };
     return bgpAsASSvcFormatter
 });

