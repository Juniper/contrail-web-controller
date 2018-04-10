/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var applicationPolicyGlobalListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var parentFqNameStr = viewConfig.dataType === ctwc.FW_DRAFTED ?
                    ctwc.DRAFT_POLICY_MANAGEMENT : ctwc.DEFAULT_POLICY_MANAGEMENT;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'application-policy-sets',
                                parent_type: "policy-management",
                                parent_fq_name_str: parentFqNameStr}]})
                    },
                    dataParser: self.parseApplicationPolicyData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                 contrailListModel, getApplicationPolicyGridViewConfig(viewConfig));
        },
        parseApplicationPolicyData : function(response){
            var dataItems = [],
                addressGroupData = getValueByJsonPath(response, "0;application-policy-sets", []);
                _.each(addressGroupData, function(val){
                    dataItems.push(val['application-policy-set']);
                });
            return dataItems;
        }
    });

    var getApplicationPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.FIREWALL_APPLICATION_POLICY_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FIREWALL_APP_POLICY_ID,
                                view: "applicationPolicyGridView",
                                viewPathPrefix: "config/firewall/common/applicationpolicy/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    viewConfig: viewConfig,
                                    isGlobal: true,
                                    viewMode: viewConfig.dataType
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return applicationPolicyGlobalListView;
});

