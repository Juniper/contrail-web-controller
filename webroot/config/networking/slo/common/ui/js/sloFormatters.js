/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"],
     function(_){
     var sloFormatters = function(){
          this.formatSloRules = function(r, c, v, cd, dc) {
              var sloRuleList = [], returnString = '', sloRules = [];
              var policyRefs = getValueByJsonPath(dc, 'network_policy_refs',[]);
              var secGrpRefs = getValueByJsonPath(dc, 'security_group_refs',[]);
              var refs = policyRefs.concat(secGrpRefs);
              if(refs.length > 0){
                  for(var k = 0; k < refs.length; k++){
                      var rule = getValueByJsonPath(refs[k], 'attr;rule',[]);
                      sloRules = sloRules.concat(rule);
                  }
                  for(var i = 0; i < sloRules.length; i++){
                      var newObj = sloRules[i].rule_uuid + ' : ' + sloRules[i].rate;
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
              var sloRuleList = [], returnString = '', sloRules = [];
              var policyRefs = getValueByJsonPath(dc, 'network_policy_refs',[]);
              var secGrpRefs = getValueByJsonPath(dc, 'security_group_refs',[]);
              var refs = policyRefs.concat(secGrpRefs);
              sloRuleList.push('<span class="rule-format" style="width: 300px !important;display:inline-block;">UUID</span><span class="rule-format">Rate</span>');
              if(refs.length > 0){
                  for(var k = 0; k < refs.length; k++){
                      var rule = getValueByJsonPath(refs[k], 'attr;rule',[]);
                      sloRules = sloRules.concat(rule);
                  }
                  for(var i = 0; i < sloRules.length; i++){
                      var sloRule = '<span style="width: 300px !important;display:inline-block;">'+ sloRules[i].rule_uuid +'</span><span>'+ sloRules[i].rate +'</span>';
                      sloRuleList.push(sloRule);
                  }
              }

              if(sloRuleList.length > 1){
                  for(var j = 0; j< sloRuleList.length; j++){
                      returnString += sloRuleList[j] + "<br>";
                  }
              }else{
                  sloRuleList.push('<span style="width: 300px !important;display:inline-block;">-</span><span>-</span>');
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
     };
     return sloFormatters;
 });