/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"],
     function(_){
     var self;
     var configAlarmFormatters = function(){
         self = this;
         /*
          * uve_keys formatter
          */
         self.uveKeysFormatter = function(r, c, v, cd, dc) {
             var uve_keys = getValueByJsonPath(dc,'uve_keys',[]);
             return uve_keys.join(',</br>');
         };
         /*
          * Severity formatter
          */
         self.severityFormatter = function (r, c, v, cd, dc) {
             var statusTmpl = contrail.getTemplate4Id('statusTemplate');
             if (ctwl.CONFIG_ALARM_MSG_MAP[dc['alarm_severity']] != null) {
                 return statusTmpl({sevLevel: dc['alarm_severity'], sevLevels: sevLevels, msg:
                     ctwl.CONFIG_ALARM_MSG_MAP[dc['alarm_severity']]});
             } else {
                 return dc['alarm_severity'];
             }
         }
         /*
          * Rule formatter
         */
         self.rulesFormatter = function(r, c, v, cd, dc, details) {
             var returnString = "";
             details = details != null ? details : false;
             details = true;
             if (typeof dc.alarm_rules === "object") {
                 var alarmRules = dc.alarm_rules;
                 var orList = getValueByJsonPath(alarmRules, 'or_list',[]);
                 var orListLen = orList.length;
                 for (var i = 0; i < orListLen; i++) {
                     var andList = getValueByJsonPath(orList, i+";and_list", []);
                     var andListLen = andList.length;
                     for (var j = 0; j < andListLen; j++) {
                         returnString += self.getRuleFormat(andList[j]);
                         if (j < andListLen - 1) {
                             returnString += ' <span class="rule-format"> AND </span>';
                             if (details == false) {
                                 returnString += '</br>';
                             }
                         } else {
                             returnString += '</br>';
                         }
                     }
                     if (i < (orListLen - 1)) {
                         returnString += '<span class="rule-format"> OR </span>';
                         returnString += '</br>';
                     }
                 }
             }
             return returnString;
         };

         self.getRuleFormat = function (alarmObj) {
             var returnString = "";
             returnString += alarmObj['operand1'] + " ";
             returnString += '<span class="rule-format">'+ alarmObj['operation'] +'</span>';
             returnString += " "+alarmObj['operand2'];
             if (ifNull(alarmObj['vars'], []).length) {
                 returnString += ", <span class='rule-format'>vars</span> " +alarmObj['vars'];
             }
             return returnString;
         };
         self.parseAlarmDetails = function (response) {
             var alarmRules = [];
             response = getValueByJsonPath(response,'0;alarms', []);
             var alarmRulesLen = response.length;
             for (var i = 0; i < alarmRulesLen; i++) {
                 var alarmObj = response[i];
                 if (alarmObj!= null && alarmObj['alarm'] != null) {
                     alarmRules.push(alarmObj['alarm']);
                 }
             }
             return alarmRules;
         };
     };
     this.description = function(v, dc) {
         return getValueByJsonPath(dc, 'id_perms;description', '-');
     };
     this.enable = function(v, dc) {
         return getValueByJsonPath(dc, 'id_perms;enable', true).toString();
     };
     this.uveKeysFormatter = function(v, dc) {
         return self.uveKeysFormatter("", "", v, "", dc);
     };
     this.rulesFormatter = function(v, dc) {
         return self.rulesFormatter("", "", v, "", dc, true);
     };
     this.severityFormatter = function(v, dc) {
         return self.severityFormatter("", "", v, "", dc);
     };

     return configAlarmFormatters;
 });

