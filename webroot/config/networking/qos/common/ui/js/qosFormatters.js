/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "config/networking/qos/common/ui/js/qosUtils",
         "config/infra/globalconfig/ui/js/globalConfig.utils"],
     function(_, QOSUtils, globalConfigUtils){
     var qosUtils = new QOSUtils(), gcUtils = new globalConfigUtils(), self;
     var qosFormatters = function(){
         self = this;

         /*
          * qosTypeFormatter
          */
         self.qosTypeFormatter = function(r, c, v, cd, dc) {
              var qosType = getValueByJsonPath(dc,
                          "qos_config_type", null, false),
                  formattedQOSType;
              if(qosType === "vhost") {
                  formattedQOSType = "vHost";
              } else if(qosType === "fabric") {
                  formattedQOSType = "Fabric";
              } else if(qosType === "project") {
                  formattedQOSType = "Project";
              } else {
                  formattedQOSType = "-";
              }
              return formattedQOSType;
         };

         /*
          * dscpEntriesFormatter
          */
         self.dscpEntriesFormatter = function(r, c, v, cd, dc) {
             var formattedDSCP = "", dscpStr;
             var dscp =  getValueByJsonPath(dc,
                 "dscp_entries;qos_id_forwarding_class_pair", []);
             var i, dscpCnt = dscp.length;
             if(dscpCnt) {
                 for(i = 0; i < dscpCnt; i++) {
                     if(i > 1 && cd) {
                         break;
                     }
                     dscpStr = dscp[i] ?
                        gcUtils.getTextByValue(
                                ctwc.QOS_DSCP_VALUES, dscp[i].key) + " : " +
                                dscp[i].forwarding_class_id : "";
                     if(i === 0) {
                         formattedDSCP = dscpStr;
                     } else {
                         formattedDSCP += "<br>" + dscpStr;
                     }
                 }
                 if (dscpCnt > 2 && cd) {
                     formattedDSCP += '<br><span class="moredataText">(' +
                        (dscpCnt - 2) + ' more)</span><span class="moredata"' +
                        ' style="display:none;"></span>';
                 }
             } else {
                 formattedDSCP = "-";
             }
             return formattedDSCP;
         };

         /*
          * dscpEntriesExpFormatter
          */
         self.dscpEntriesExpFormatter = function(r, c, v, cd, dc) {
             var formattedDSCP = "", dscpStr = "";
             var dscp =  getValueByJsonPath(dc,
                 "dscp_entries;qos_id_forwarding_class_pair", []);
             var i, dscpCnt = dscp.length;
             if(dscpCnt) {
                 for(i = 0; i < dscpCnt; i++) {
                     if(dscp[i]) {
                         dscpStr += "<tr style='vertical-align:top'><td>";
                         dscpStr += gcUtils.getTextByValue(
                              ctwc.QOS_DSCP_VALUES, dscp[i].key) + "</td><td>";
                         dscpStr +=
                             dscp[i].forwarding_class_id + "</td><td>";
                         dscpStr += "</tr>";
                     }
                 }
                 if(dscpStr) {
                     formattedDSCP =
                         "<table style='width:100%'><thead><tr>\
                         <th style='width:50%'>DSCP bits</th>\
                         <th style='width:50%'>Forwarding Class ID</th>\
                         </tr></thead><tbody>";
                     formattedDSCP += dscpStr;
                     formattedDSCP += "</tbody></table>";
                 }
             } else {
                 formattedDSCP = "-";
             }
             return formattedDSCP;
          };


         /*
          * vlanPriorityEntriesFormatter
          */
         self.vlanPriorityEntriesFormatter = function(r, c, v, cd, dc) {
             var formattedVLAN = "", vlanStr = "";
             var vlan =  getValueByJsonPath(dc,
                 "vlan_priority_entries;qos_id_forwarding_class_pair", []);
             var i, vlanCnt = vlan.length;
             if(vlanCnt) {
                 for(i = 0; i < vlanCnt; i++) {
                     if(i > 1 && cd) {
                         break;
                     }
                     vlanStr = vlan[i] ?
                         gcUtils.getTextByValue(
                           ctwc.QOS_VLAN_PRIORITY_VALUES,vlan[i].key) + " : " +
                           vlan[i].forwarding_class_id : "";
                     if(i === 0) {
                         formattedVLAN = vlanStr;
                     } else {
                         formattedVLAN += "<br>" + vlanStr;
                     }
                 }
                 if (vlanCnt > 2 && cd) {
                     formattedVLAN += '<br><span class="moredataText">(' +
                        (vlanCnt - 2) + ' more)</span><span class="moredata"' +
                        ' style="display:none;"></span>';
                 }
             } else {
                 formattedVLAN = "-";
             }
             return formattedVLAN;
         };

         /*
          * vlanPriorityEntriesExpFormatter
          */
         self.vlanPriorityEntriesExpFormatter = function(r, c, v, cd, dc) {
             var formattedVLAN = "", vlanStr = "";
             var vlan =  getValueByJsonPath(dc,
                 "vlan_priority_entries;qos_id_forwarding_class_pair", []);
             var i, vlanCnt = vlan.length;
             if(vlanCnt) {
                 for(i = 0; i < vlanCnt; i++) {
                     if(vlan[i]) {
                         vlanStr += "<tr style='vertical-align:top'><td>";
                         vlanStr += gcUtils.getTextByValue(
                             ctwc.QOS_VLAN_PRIORITY_VALUES,vlan[i].key) +
                             "</td><td>";
                         vlanStr +=
                             vlan[i].forwarding_class_id + "</td><td>";
                         vlanStr += "</tr>";
                     }
                 }
                 if(vlanStr) {
                     formattedVLAN =
                         "<table style='width:100%'><thead><tr>\
                         <th style='width:50%'>VLAN Priority bits</th>\
                         <th style='width:50%'>Forwarding Class ID</th>\
                         </tr></thead><tbody>";
                     formattedVLAN += vlanStr;
                     formattedVLAN += "</tbody></table>";
                 }
             } else {
                 formattedVLAN = "-";
             }
             return formattedVLAN;
          };

         /*
          * mplsExpEntriesFormatter
          */
         self.mplsExpEntriesFormatter = function(r, c, v, cd, dc) {
             var formattedMPLS = "", mplsStr = "";
             var mpls =  getValueByJsonPath(dc,
                 "mpls_exp_entries;qos_id_forwarding_class_pair", []);
             var i, mplsCnt = mpls.length;
             if(mplsCnt) {
                 for(i = 0; i < mplsCnt; i++) {
                     if(i > 1 && cd) {
                         break;
                     }
                     mplsStr = mpls[i] ?
                        gcUtils.getTextByValue(
                                ctwc.QOS_MPLS_EXP_VALUES, mpls[i].key) + " : "
                                + mpls[i].forwarding_class_id : "";
                     if(i === 0) {
                         formattedMPLS = mplsStr;
                     } else {
                         formattedMPLS += "<br>" + mplsStr;
                     }
                 }
                 if (mplsCnt > 2 && cd) {
                     formattedMPLS += '<br><span class="moredataText">(' +
                        (mplsCnt - 2) + ' more)</span><span class="moredata"' +
                        ' style="display:none;"></span>';
                 }
             } else {
                 formattedMPLS = "-";
             }
             return formattedMPLS;
         };

         /*
          * mplsEntriesExpandFormatter
          */
         self.mplsEntriesExpandFormatter = function(r, c, v, cd, dc) {
             var formattedMPLS = "", mplsStr = "";
             var mpls =  getValueByJsonPath(dc,
                 "mpls_exp_entries;qos_id_forwarding_class_pair", []);
             var i, mplsCnt = mpls.length;
             if(mplsCnt) {
                 for(i = 0; i < mplsCnt; i++) {
                     if(mpls[i]) {
                         mplsStr += "<tr style='vertical-align:top'><td>";
                         mplsStr += gcUtils.getTextByValue(
                          ctwc.QOS_MPLS_EXP_VALUES, mpls[i].key) + "</td><td>";
                         mplsStr +=
                             mpls[i].forwarding_class_id + "</td><td>";
                         mplsStr += "</tr>";
                     }
                 }
                 if(mplsStr) {
                     formattedMPLS =
                         "<table style='width:100%'><thead><tr>\
                         <th style='width:50%'>MPLS EXP bits</th>\
                         <th style='width:50%'>Forwarding Class ID</th>\
                         </tr></thead><tbody>";
                     formattedMPLS += mplsStr;
                     formattedMPLS += "</tbody></table>";
                 }
             } else {
                 formattedMPLS = "-";
             }
             return formattedMPLS;
          };

          self.fcComboboxFormatter = function(result) {
              var fwdClassDataSrc = [],
              fwdClasss = getValueByJsonPath(result,
                  "0;forwarding-classs",
                  [], false);
              _.each(fwdClasss, function(fwdClass) {
                  if("forwarding-class" in fwdClass) {
                      fwdClass = fwdClass["forwarding-class"];
                      fwdClassDataSrc.push({text: fwdClass.forwarding_class_id,
                          value: fwdClass.forwarding_class_id});
                  }
              });

              //sort the items by forwarding_class_id
              fwdClassDataSrc = _(fwdClassDataSrc).sortBy(function(fwdClass){
                 return fwdClass.text;
             });

              return fwdClassDataSrc;
          };
     };

     this.QOSTypeFormatter = function(v, dc) {
         return self.qosTypeFormatter("", "", v, "", dc);
     };

     this.TrustedFormatter = function(v, dc) {
         return self.trustedFormatter("", "", v, "", dc);
     }

     this.DSCPEntriesExpFormatter = function(v, dc) {
         return self.dscpEntriesExpFormatter("", "", v, "", dc);
     }

     this.VLANPriorityEntriesExpFormatter = function(v, dc) {
         return self.vlanPriorityEntriesExpFormatter("", "", v, "", dc);
     }

     this.MPLSEntriesExpandFormatter = function(v, dc) {
         return self.mplsEntriesExpandFormatter("", "", v, "", dc);
     }

     return qosFormatters;
 });

