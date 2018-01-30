/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"],
     function(_){
     var sloFormatters = function(){
          this.formatSloRules = function(r, c, v, cd, dc) {
              var sloRuleList = [], returnString = '', sloRules = [], newObj;
              var policyRefs = getValueByJsonPath(dc, 'network_policy_refs',[]);
              var secGrpRefs = getValueByJsonPath(dc, 'security_group_refs',[]);
              var refs = policyRefs.concat(secGrpRefs);
              if(refs.length > 0){
                  for(var k = 0; k < refs.length; k++){
                      var rule = getValueByJsonPath(refs[k], 'attr;rule',[]);
                      var to = refs[k].to;
                      var objName = to[to.length - 1];
                      _.each(rule, function(obj) {
                          obj.objName = objName;
                      });
                      if(rule.length === 0){
                          rule.push({rule_uuid: '', objName: objName});
                          sloRules = sloRules.concat(rule);
                      }else{
                         sloRules = sloRules.concat(rule);
                      }
                  }
                  for(var i = 0; i < sloRules.length; i++){
                      if(sloRules[i].rule_uuid === ''){
                         newObj = '* ('+ sloRules[i].objName + ')';
                      }else{
                         newObj = sloRules[i].rule_uuid + ' ('+ sloRules[i].objName + ')';
                      }
                      var sloRule = '<span>'+ newObj +'</span>';
                      sloRuleList.push(sloRule);
                  }
              }
              if(sloRuleList.length > 0){
                  for(var j = 0; j< sloRuleList.length,j < 2; j++){
                      if(sloRuleList[j]) {
                          returnString += sloRuleList[j] + "<br>";
                      }
                  }
                  if (sloRuleList.length > 2) {
                      returnString += '<span class="moredataText">(' +
                          (sloRuleList.length-2) + ' more)</span> \
                          <span class="moredata" style="display:none;" ></span>';
                  }
              }else{
                  returnString = '-';
              }
              return  returnString;
          };

          this.formatSloRuleDetails = function(r, c, v, cd, dc) {
              var sloRuleList = [], returnString = '', sloRules = [], ruleUUID, sloRule;
              var policyRefs = getValueByJsonPath(dc, 'network_policy_refs',[]);
              var secGrpRefs = getValueByJsonPath(dc, 'security_group_refs',[]);
              var refs = policyRefs.concat(secGrpRefs);
              sloRuleList.push('<span class="rule-format" style="width: 400px !important;display:inline-block;">UUID</span><span class="rule-format">Rate</span>');
              if(refs.length > 0){
                  for(var k = 0; k < refs.length; k++){
                      var rule = getValueByJsonPath(refs[k], 'attr;rule',[]);
                      var to = refs[k].to;
                      var objName = to[to.length - 1];
                      _.each(rule, function(obj) {
                          obj.objName = objName;
                      });
                      if(rule.length === 0){
                          rule.push({rule_uuid: '', objName: objName});
                          sloRules = sloRules.concat(rule);
                      }else{
                         sloRules = sloRules.concat(rule);
                      }
                  }
                  for(var i = 0; i < sloRules.length; i++){
                      if(sloRules[i].rule_uuid === ''){
                          ruleUUID = '* (' + sloRules[i].objName + ')';
                          sloRule = '<span style="width: 400px !important;display:inline-block;">'+ ruleUUID +'</span><span></span>';
                      }else{
                          ruleUUID = sloRules[i].rule_uuid + ' (' + sloRules[i].objName + ')';
                          sloRule = '<span style="width: 400px !important;display:inline-block;">'+ ruleUUID +'</span><span>'+ sloRules[i].rate +'</span>';
                      }
                      sloRuleList.push(sloRule);
                  }
              }

              if(sloRuleList.length > 1){
                  for(var j = 0; j< sloRuleList.length; j++){
                      returnString += sloRuleList[j] + "<br>";
                  }
              }else{
                  sloRuleList.push('<span style="width: 400px !important;display:inline-block;">-</span><span>-</span>');
                  for(var k = 0; k< sloRuleList.length; k++){
                      returnString += sloRuleList[k] + "<br>";
                  }
              }
              return  returnString;
          };

          this.networkPolicyFormatter = function(response) {
              var polResponse = getValueByJsonPath(response,
                      'data', []);
              var polList = [];

              $.each(polResponse, function (i, obj) {
                  var objVal = obj['network-policy'];
                  var policyRule = getValueByJsonPath(objVal, 'network_policy_entries;policy_rule', []);
                  if(policyRule.length > 0){
                      var fqName = objVal.fq_name.join(':');
                      var text = objVal.fq_name[objVal.fq_name.length - 1] + ' (' + objVal.fq_name[objVal.fq_name.length - 2] + ')';
                      polList.push({id: fqName, text: text, value: objVal.uuid});
                  }
              });
              return polList;
          };

          this.securityGroupFormatter = function(response) {
              var secGrpResponse = getValueByJsonPath(response,
                      'security-groups', []);
              var secGrpList = [];

              $.each(secGrpResponse, function (i, obj) {
                  var objVal = obj['security-group'];
                  var secGrpRule = getValueByJsonPath(objVal, 'security_group_entries;policy_rule', []);
                  if(secGrpRule.length > 0){
                      var fqName = objVal.fq_name.join(':');
                      var text = objVal.fq_name[objVal.fq_name.length - 1] + ' (' + objVal.fq_name[objVal.fq_name.length - 2] + ')';
                      secGrpList.push({id: fqName, text: text, value: objVal.uuid}); 
                  }
              });
              return secGrpList;
          };

          this.FormatFirewallPolicy = function(r, c, v, cd, dc){
              var returnString = '', policyList = [];
              var policyRefs = getValueByJsonPath(dc, 'firewall_policy_back_refs',[]);
              for(var i = 0; i < policyRefs.length; i++){
                  var to = policyRefs[i].to;
                  var name = to[to.length - 1];
                  var policyName = '<span>'+ name +'</span>';
                  policyList.push(policyName);
              }
              if(policyList.length > 0){
                  for(var j = 0; j < policyList.length; j++){
                       returnString += policyList[j] + "<br>";
                  }
                  return returnString;
              }else{
                 return '-';
              }
          };

          this.FormatFirewallRule = function(r, c, v, cd, dc){
              var returnString = '', ruleList = [];
              var ruleRefs = getValueByJsonPath(dc, 'firewall_rule_back_refs',[]);
              for(var i = 0; i < ruleRefs.length; i++){
                  var to = ruleRefs[i].to;
                  var name = to[to.length - 1];
                  var ruleName = '<span>'+ name +'</span>';
                  ruleList.push(ruleName);
              }
              if(ruleList.length > 0){
                  for(var j = 0; j < ruleList.length; j++){
                       returnString += ruleList[j] + "<br>";
                  }
                  return returnString;
              }else{
                 return '-';
              }
          };

          this.adminStateFormatter = function(d, c, v, cd, dc) {
              var  adminState =
                  getValueByJsonPath(dc, 'id_perms;enable', false);

              return adminState ? 'Up' : 'Down';
          };
     };
     return sloFormatters;
 });