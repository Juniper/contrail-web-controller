/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter',
    'knockback'
], function (_, ContrailView, ContrailListModel, FWRuleFormatter,Knockback) {
    var fwRuleFormatter = new FWRuleFormatter();
    var fwApsRuleListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            policyUuidList = [];
            policyUuidList = viewConfig.uuidList;
            var listModelConfigArray = [];
            var ajaxConfig = {};
            var data;
            if(viewConfig.isGlobal === false && viewConfig.projectSelectedValueData){
                data = JSON.stringify(
                        {data: [{type: 'service-groups',
                            parent_id: viewConfig["projectSelectedValueData"].value}]})
            }
            else{
                data = JSON.stringify(
                        {data: [{type: 'service-groups',
                            parent_type: "policy-management",
                            parent_fq_name_str:"default-policy-management"}]})
            }
            ajaxConfig.type = "POST";
            ajaxConfig.url = "/api/tenants/config/get-config-details"
            ajaxConfig.data  = JSON.stringify(
                        {data: [{type: 'firewall-policys', obj_uuids:viewConfig.uuidList},
                                {type: 'firewall-rules',
                            fields: ['firewall_policy_back_refs']}]});
            contrail.ajaxHandler(ajaxConfig, function () {
            }, function (response) {
                self.fwPolicy = response;
                listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: "/api/tenants/config/get-config-details",
                                type: "POST",
                                data: data
                            },
                            dataParser: function(response){
                                return self.parseFWRuleData(self.fwPolicy, response);
                            }
                        }
                    };
                var contrailListModel = new ContrailListModel(listModelConfig);
               // Knockback.ko.cleanNode($("#configure-firepolicyrulelist")[0]);
                self.renderView4Config(self.$el,
                contrailListModel, getfwRuleListGridViewConfig(viewConfig));
            },
            function (error) {
               console.log(error);
           });
        },
        parseFWRuleData : function(data, response) {
            var firewallPolicies = getValueByJsonPath(data, "0;firewall-policys", [], false), policyList = []; 
            var serviceGroupInfo = getValueByJsonPath(response, "0;service-groups", []);

            _.each(firewallPolicies, function(policy){
                policyList.push(policy['firewall-policy']);
            });
            var currentPolicyRuleIds = getFWRuleIds(policyList),
            dataItems = [],serviceGrpName,
           rulesData = getValueByJsonPath(data,
                  "1;firewall-rules", [], false);
          _.each(rulesData, function(rule){
                  var currentRuleID = getValueByJsonPath(rule,
                          'firewall-rule;uuid', '', false);
                  if($.inArray(currentRuleID,
                          currentPolicyRuleIds) !== -1) {
                      let policyName = getValueByJsonPath(rule,
                              'firewall-rule;firewall_policy_back_refs;0;to;1', undefined);
                      if(policyName != undefined){
                          rule['firewall-rule']['policy_name'] = policyName;
                      }
                      var serviceGrp = getValueByJsonPath(rule, 'firewall-rule;service_group_refs;0;to', []);
                      var serviceGrpLen = serviceGrp.length;
                      if(serviceGrpLen > 0){
                          serviceGrpName = serviceGrp[serviceGrpLen-1];
                      }
                      if(serviceGroupInfo.length > 0 && serviceGrpName != undefined){
                          _.each(serviceGroupInfo, function(item){
                              if(serviceGrpName === item['service-group'].name){
                                  if(rule['firewall-rule'].service_group_refs){
                                      rule['firewall-rule'].service_group_refs[0]['service-group-info'] = 
                                          item['service-group'].service_group_firewall_service_list;
                                  }
                              }
                          });
                      }
                      dataItems.push(rule['firewall-rule']);
                  }
          });
          return dataItems.sort(ruleComparator);
        }
    });

    function ruleComparator (a,b) {
        // get the sequence for each and compare
        if(Number(fwRuleFormatter.ruleListSequenceFormatter(null,null,null,null,a)) >
                Number(fwRuleFormatter.ruleListSequenceFormatter(null,null,null,null,b))) {
            return 1;
        } else {
            return -1;
        }
    }
    function getFWRuleIds(policyList) {
        var ruleIds = [];
        _.each(policyList, function(policy){
            var rules = getValueByJsonPath(policy, 'firewall_rule_refs', [], false);
            _.each(rules, function(rule){
                ruleIds.push(rule.uuid);
            });
        });
        return ruleIds;
    }

    var getfwRuleListGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.APS_FW_RULE_LIST_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_APS_FW_RULE_LIST,
                                view: "fwApsFwRuleListGridView",
                                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: viewConfig.isGlobal
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fwApsRuleListView;
});

