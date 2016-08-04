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
             var uve_keys = getValueByJsonPath(dc,'uve_keys;uve_key',[]);
             return uve_keys.length > 0 ? uve_keys.join(',</br>') : '-';
         };
         /*
          * Severity formatter
          */
         self.severityFormatter = function (r, c, v, cd, dc) {
             var template = contrail.getTemplate4Id(ctwc.CONFIG_ALARM_SEVERITY_TEMPLATE);
             if (ctwl.CONFIG_ALARM_TEXT_MAP[getValueByJsonPath(dc, 'alarm_severity', null)] != null) {
                 var color = 'red';
                 if (dc['alarm_severity'] == '2') {
                     color = 'orange';
                 }
                 return template({
                     showText : true,
                     color : color,
                     text : ctwl.CONFIG_ALARM_TEXT_MAP[getValueByJsonPath(dc, 'alarm_severity', null)],
                 });
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
             return returnString != "" ? returnString: '-';
         };

         self.getRuleFormat = function (alarmObj) {
             var returnString = "";
             returnString += alarmObj['operand1'] + " ";
             returnString += '<span class="rule-format">'+ alarmObj['operation'] +'</span>';
             returnString += " "+getValueByJsonPath(alarmObj,'operand2;uve_attribute',getValueByJsonPath(alarmObj,'operand2;json_value'));
             if (ifNull(alarmObj['variables'], []).length) {
                 returnString += ", <span class='rule-format'>variables</span> " +alarmObj['variables'];
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
             return alarmRules.sort(function (ruleA, ruleB) {
                 if(ruleA.name > ruleB.name) {
                     return 1;
                 } else if (ruleA.name < ruleB.name) {
                     return -1
                 }
             });
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

