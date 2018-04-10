/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwRulesGlobalListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig;
            var parentFqNameStr = viewConfig.dataType === ctwc.FW_DRAFTED ?
                    "draft-policy-management" : "default-policy-management";
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "firewall-rules",
                            fields: "firewall_policy_back_refs",
                            parent_fq_name_str: parentFqNameStr,
                            parent_type: "policy-management"}]})
                    },
                    dataParser: self.parseFWRuleGlobalData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWRuleGlobalGridViewConfig(viewConfig));
        },

        parseFWRuleGlobalData: function(result) {
            var fwRules = getValueByJsonPath(result,
                "0;firewall-rules", [], false),
                fwRuleList = [];
            _.each(fwRules, function(fwRule) {
                if("firewall-rule" in fwRule)
                    fwRuleList.push(fwRule["firewall-rule"]);
            });
            return fwRuleList;
        },

        getFWRuleGlobalGridViewConfig: function(viewConfig) {
            return {
                elementId:
                cowu.formatElementId([ctwc.CONFIG_FW_RULE_GLOBAL_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_FW_RULE_GLOBAL_ID,
                                view: "fwRuleGridView",
                                viewPathPrefix:
                                    "config/firewall/common/fwpolicy/ui/js/views/",
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
                                    viewMode: viewConfig.dataType,
                                    viewConfig: viewConfig
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return fwRulesGlobalListView;
});

