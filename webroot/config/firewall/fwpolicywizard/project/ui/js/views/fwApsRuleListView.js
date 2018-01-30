/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter'
], function (_, ContrailView, ContrailListModel, FWRuleFormatter) {
    var fwRuleFormatter = new FWRuleFormatter();
    var fwApsRuleListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            policyUuidList = [];
            policyUuidList = viewConfig.uuidList;
             var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'firewall-policys', obj_uuids:viewConfig.uuidList},
                                    {type: 'firewall-rules',
                                fields: ['firewall_policy_back_refs']}]})
                    },
                    dataParser: self.parseFWRuleData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getfwRuleListGridViewConfig(viewConfig));
        },
        parseFWRuleData : function(response) {
            var firewallPolicies = getValueByJsonPath(response, "0;firewall-policys", [], false), policyList = [];  
            _.each(firewallPolicies, function(policy){
                policyList.push(policy['firewall-policy']);
            });
            var currentPolicyRuleIds = getFWRuleIds(policyList),
            dataItems = [],
           rulesData = getValueByJsonPath(response,
                  "1;firewall-rules", [], false);
          _.each(rulesData, function(rule){
                  var currentRuleID = getValueByJsonPath(rule,
                          'firewall-rule;uuid', '', false);
                  if($.inArray(currentRuleID,
                          currentPolicyRuleIds) !== -1) {
                      let policyName = getValueByJsonPath(rule,
                              'firewall-rule;firewall_policy_back_refs;0;to;1', '', undefined);
                      if(policyName != undefined){
                          rule['firewall-rule']['policy_name'] = policyName;
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

