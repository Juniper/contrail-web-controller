/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var serviceGroupGlobalListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                elementId;
                if(viewConfig.isWizard === true){
                    elementId = ctwc.FW_WZ_ID_PREFIX;
                }else{
                    elementId = ctwc.STANDALONE_ID_PREFIX;
                }
                var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: "/api/tenants/config/get-config-details",
                            type: "POST",
                            data: JSON.stringify(
                                {data: [{type: 'service-groups',
                                    parent_type: "policy-management",
                                    parent_fq_name_str:"default-policy-management"}]})
                        },
                        dataParser: self.parseServiceData,
                    }
                };
                var contrailListModel = new ContrailListModel(listModelConfig);
                this.renderView4Config(this.$el,
                        contrailListModel, getServiceGroupGridViewConfig(viewConfig,elementId));
        },
        parseServiceData : function(response){
            var dataItems = [],
                serviceGroupData = getValueByJsonPath(response, "0;service-groups", []);
                _.each(serviceGroupData, function(val){
                    dataItems.push(val['service-group']);
                });
            return dataItems;
        }
    });

    var getServiceGroupGridViewConfig = function (viewConfig,elementId) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_SERVICE_GRP_SECTION_ID.concat(elementId)]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_SERVICE_GRP_ID.concat(elementId),
                                view: "serviceGroupGridView",
                                viewPathPrefix: "config/firewall/common/servicegroup/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: true,
                                    elementIdPrefix:elementId,
                                    isWizard: viewConfig.isWizard
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return serviceGroupGlobalListView;
});

