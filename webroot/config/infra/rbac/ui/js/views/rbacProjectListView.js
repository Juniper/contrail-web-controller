/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var rbacProjectListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig,
                currentDomain = viewConfig["domainSelectedValueData"];

            self.rbacData = {};
            self.rbacData.configData = {};
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type:
                            "api-access-lists"}]})
                    },
                    dataParser: self.parseRBACProjectData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getRBACProjectGridViewConfig());
        },

        parseRBACProjectData: function(result) {
            var rbacRules = [], rbacData;
            rbacData = getValueByJsonPath(result,
                "0;api-access-lists",
                [], false);

            self.rbacData.configData = _.filter(rbacData, function(apiAccess){
                return apiAccess["api-access-list"].parent_type === "project";
            });

            _.each(self.rbacData.configData, function(item){
                var tempRules = getValueByJsonPath(item,
                    "api-access-list;api_access_list_entries;rbac_rule",
                    [], false),
                    projectFQN = getValueByJsonPath(item,
                            "api-access-list;fq_name", [], false),
                    projectId = getValueByJsonPath(item,
                            "api-access-list;parent_uuid", "", false);
                projectFQN = projectFQN.length === 3 ?
                        projectFQN[0] + ":" + projectFQN[1] +
                        ":" + projectId : "";
                _.each(tempRules, function(rule, index){
                    rule.project = projectFQN;
                    rule.subIndex = index;
                    rbacRules.push(rule);
                });
            });
            //sort the items by domain name
            rbacRules = _(rbacRules).sortBy(function(rbacRule){
                return rbacRule.project;
            });
            return rbacRules;
        },

        getRBACProjectGridViewConfig: function() {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_RBAC_PROJECT_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_RBAC_PROJECT_ID,
                                view: "rbacProjectGridView",
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
                                    isProject: true,
                                    isGlobal: false,
                                    isDomain: false
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return rbacProjectListView;
});

