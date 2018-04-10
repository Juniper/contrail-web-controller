/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwPolicyGlobalListView = ContrailView.extend({
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
                        data: JSON.stringify({data: [{type: "firewall-policys",
                            fields: ['application_policy_set_back_refs'],
                            parent_fq_name_str: parentFqNameStr,
                            parent_type: "policy-management"}]})
                    },
                    dataParser: self.parseFWPolicyGlobalData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWPolicyGlobalGridViewConfig(viewConfig));
        },

        parseFWPolicyGlobalData: function(result) {
            var fwPolicies = getValueByJsonPath(result,
                "0;firewall-policys", [], false),
                fwPolicyList = [];
            _.each(fwPolicies, function(fwPolicy) {
                if("firewall-policy" in fwPolicy)
                fwPolicyList.push(fwPolicy["firewall-policy"]);
            });
            return fwPolicyList;
        },

        getFWPolicyGlobalGridViewConfig: function(viewConfig) {
            return {
                elementId:
                cowu.formatElementId([ctwc.CONFIG_FW_POLICY_GLOBAL_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_FW_POLICY_GLOBAL_ID,
                                view: "fwPolicyGridView",
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

    return fwPolicyGlobalListView;
});

