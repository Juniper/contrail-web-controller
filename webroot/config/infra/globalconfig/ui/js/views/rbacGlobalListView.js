/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var rbacGlobalListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig;

            self.rbacData = {};
            self.rbacData.configData = {};
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "api-access-lists",
                            parent_fq_name_str: "default-global-system-config",
                            parent_type: "global-system-config"}]})
                    },
                    dataParser: self.parseRBACGlobalData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getRBACGlobalGridViewConfig());
        },

        parseRBACGlobalData: function(result) {
            var rbacRules;
            self.rbacData.configData = getValueByJsonPath(result,
                "0;api-access-lists;0",
                {}, false);
            rbacRules = getValueByJsonPath(self.rbacData.configData,
                "api-access-list;api_access_list_entries;rbac_rule", [], false);
            return rbacRules;
        },

        getRBACGlobalGridViewConfig: function() {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_RBAC_GLOBAL_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_RBAC_GLOBAL_ID,
                                view: "rbacGridView",
                                viewPathPrefix:
                                    "config/rbac/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    rbacData : self.rbacData,
                                    isProject: false,
                                    isGlobal: true
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return rbacGlobalListView;
});

