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
            var allRbacRules = [];
            var apiAccessLists = getValueByJsonPath(result, "0;api-access-lists", [], false);
            apiAccessLists = _.sortBy(apiAccessLists, function(apiAccessList) {
                return apiAccessList["api-access-list"].name;
            });
            self.rbacData.configData = apiAccessLists;

            _.each(apiAccessLists, function(apiAccessList) {
                var apiAccessListRbacRules = getValueByJsonPath(apiAccessList,
                    "api-access-list;api_access_list_entries;rbac_rule",
                    [], false),
                    apiAccessListName = getValueByJsonPath(apiAccessList,
                            "api-access-list;fq_name;1", "", false);
                _.each(apiAccessListRbacRules, function(rule, index){
                    rule.apiAccessListName = apiAccessListName;
                    rule.subIndex = index;
                    allRbacRules.push(rule);
                });
            });
            
            return allRbacRules;
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
                                view: "rbacGlobalGridView",
                                viewPathPrefix:
                                    "config/infra/rbac/ui/js/views/",
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

