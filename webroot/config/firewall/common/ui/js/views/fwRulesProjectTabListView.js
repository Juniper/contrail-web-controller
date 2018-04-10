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
                viewConfig = self.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig;
            if(viewConfig.dataType === ctwc.FW_DRAFTED) {
                listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: "/api/tenants/config/get-config-details",
                                type: "POST",
                                data: JSON.stringify(
                                    {data: [{type: 'firewall-rules',
                                        parent_type: 'policy-management',
                                        fields: ["firewall_policy_back_refs"],
                                        parent_fq_name_str:
                                            contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                            currentProject.name + ':' +
                                            ctwc.DRAFT_POLICY_MANAGEMENT }]})
                            },
                            dataParser: self.parseFWRuleGlobalData,
                        }
                    };
            } else {
                listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: "/api/tenants/config/get-config-details",
                            type: "POST",
                            data: JSON.stringify(
                                {data: [{type: 'firewall-rules',
                                    fields: ["firewall_policy_back_refs"],
                                    parent_id: currentProject.value}]})
                        },
                        dataParser: self.parseFWRuleGlobalData,
                    }
                };
            }
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
                                    isProject: true,
                                    isGlobal: false,
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

