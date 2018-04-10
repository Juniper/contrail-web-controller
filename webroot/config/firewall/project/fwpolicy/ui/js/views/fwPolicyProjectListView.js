/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var fwPolicyProjectListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig;
            if(viewConfig.dataType === ctwc.FW_DRAFTED) {
                listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: "/api/tenants/config/get-config-details",
                                type: "POST",
                                data: JSON.stringify(
                                    {data: [{type: 'firewall-policys',
                                        fields: ['application_policy_set_back_refs'],
                                        parent_type: 'policy-management',
                                        parent_fq_name_str:
                                            contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                            currentProject.name + ':' +
                                            ctwc.DRAFT_POLICY_MANAGEMENT }]})
                            },
                            dataParser: self.parseFWPolicyData,
                        }
                    };
            } else {
                listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: "/api/tenants/config/get-config-details",
                            type: "POST",
                            data: JSON.stringify(
                                {data: [{type: 'firewall-policys',
                                    fields: ['application_policy_set_back_refs'],
                                    parent_id: currentProject.value}]})
                        },
                        dataParser: self.parseFWPolicyData,
                    }
                };
            }
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getfwPolicyGridViewConfig(viewConfig));
        },
        parseFWPolicyData : function(response){
            var dataItems = [],
                fwPolicyData =
                    getValueByJsonPath(response, "0;firewall-policys", []);
                _.each(fwPolicyData, function(val){
                        if('firewall-policy' in val) {
                            dataItems.push(val['firewall-policy']);
                        }
                });
            return dataItems;
        }
    });

    var getfwPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId:
                cowu.formatElementId([ctwc.CONFIG_FW_POLICY_GLOBAL_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
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
                                    viewConfig: viewConfig,
                                    isWizard: false,
                                    isGlobal: false,
                                    viewMode: viewConfig.dataType,
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fwPolicyProjectListView;
});

