/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var applicationPolicyListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'application-policy-sets',
                                parent_id: currentProject.value}]})
                    },
                    dataParser: self.parseApplicationPolicyData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                   contrailListModel, getApplicationPolicyGridViewConfig());
        },
        parseApplicationPolicyData : function(response){
            var dataItems = [],
                appPolicyData = getValueByJsonPath(response, "0;application-policy-sets", []);
                _.each(appPolicyData, function(val){
                	if("application-policy-set" in val) {
                        dataItems.push(val['application-policy-set']);
                    }
                }); 
            return dataItems;
        }
    });

    var getApplicationPolicyGridViewConfig = function () {
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
                                    isGlobal: false                            
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return applicationPolicyListView;
});

