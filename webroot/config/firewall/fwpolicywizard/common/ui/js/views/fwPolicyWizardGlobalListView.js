/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwPolicyWizardGlobalListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,headerText
                viewConfig = self.attributes.viewConfig;
                self.mode = viewConfig.mode;
                $("#aps-save-button").hide();
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "firewall-policys",
                            fields: ['application_policy_set_back_refs'],
                            parent_fq_name_str: "default-policy-management",
                            parent_type: "policy-management"}]})
                    },
                    dataParser: function(response, mode){
                        return self.parseFWPolicyGlobalData(response, self.mode);
                    }
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWPolicyGlobalGridViewConfig(self.mode));
        },
        parseFWPolicyGlobalData: function(result, mode) {
            var fwPolicies = getValueByJsonPath(result,
                "0;firewall-policys", [], false),
                fwPolicyList = [];
          if(mode === "grid_firewall_policies"){
                _.each(fwPolicies, function(fwPolicy) {
                    if("firewall-policy" in fwPolicy)
                    fwPolicyList.push(fwPolicy["firewall-policy"]);
                });
            }
          else if(mode === "grid_stand_alone"){
              _.each(fwPolicies, function(fwPolicy) {
                  if("firewall-policy" in fwPolicy){
                      var appPolicyBackRefsArray = getValueByJsonPath(fwPolicy, "firewall-policy;application_policy_set_back_refs", []);
                      if(appPolicyBackRefsArray.length === 0)
                       fwPolicyList.push(fwPolicy["firewall-policy"]);
                  }
              });
           }
            return fwPolicyList;
        },

        getFWPolicyGlobalGridViewConfig: function(mode) {
            return {
                elementId: cowu.formatElementId([ctwc.FW_STANDALONE_ALL_POLICY_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.FW_STANDALONE_ALL_POLICY_ID,
                                view: "fwStandalonsAndAllPolicyGridView",
                                viewPathPrefix:
                                    "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isProject: false,
                                    isGlobal: true,
                                    isWizard: true,
                                    mode: mode
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return fwPolicyWizardGlobalListView;
});

