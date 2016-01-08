/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var bgpAsASSvcFormatter = function(){

         /*
          *  parseVMIDetails
          */
         this.parseVMIDetails = function(response) {
             var parsedData = [];
             var vmis = getValueByJsonPath(response, "0;virtual-machine-interfaces", null);
             if(vmis) {
                 _.each(vmis, function(vmi){
                     var vmiDetail =
                         getValueByJsonPath(vmi, "virtual-machine-interface", null);
                         if(vmiDetail) {
                             var displayText, actValue;
                             var vnName = getValueByJsonPath(vmiDetail,
                                 "virtual_network_refs;0;to", []);
                             if(vmiDetail.fq_name &&
                                 vmiDetail.fq_name.length === 3) {
                                 actValue = vmiDetail.uuid + " " + vmiDetail.fq_name[0]
                                     + " " + vmiDetail.fq_name[1] + " " + vmiDetail.fq_name[2];
                             } else {
                                 actValue = vmiDetail.uuid;
                             }
                             if(vnName.length == 3) {
                                 vnName = vnName[1] + ":" + vnName[2];
                                 displayText = vmiDetail.name + " (" + vnName + ")";
                             } else {
                                 displayText = vmiDetail.name;
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
             var vmiStr = "";
             var vmiRefs = getValueByJsonPath(dc,
                 "virtual_machine_interface_refs", []);
             if(vmiRefs.length > 0) {
                 for(var i = 0; i < vmiRefs.length; i++) {
                     var vmi = vmiRefs[i]["virtual-machine-interface"];
                     var vnTo = getValueByJsonPath(vmi,
                         "virtual_network_refs;0;to", {});
                     if(vnTo) {
                         vmiStr += vmi.name + " (" + vnTo[1] + ":" + vnTo[2] + ")";
                     } else {
                         vmiStr += vmi.name;
                     }
                     if(i != vmiRefs.length-1) {
                         vmiStr += "</br>";
                     }
                 };
             } else {
                 vmiStr = "-";
             }
             return vmiStr;
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

