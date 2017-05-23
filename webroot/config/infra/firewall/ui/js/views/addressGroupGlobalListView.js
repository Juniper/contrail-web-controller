/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var addressGroupGlobalListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'address-groups',
                                parent_type: "policy-management",
                                parent_fq_name_str:"default-policy-management"}]})
                    },
                    dataParser: self.parseAddressData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                 contrailListModel, getAddressGroupGridViewConfig());
        },
        parseAddressData : function(response){
            var dataItems = [],
                addressGroupData = getValueByJsonPath(response, "0;address-groups", []);
                _.each(addressGroupData, function(val){
                    dataItems.push(val['address-group']);
                });
            return dataItems;
        }
    });

    var getAddressGroupGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_ADDRESS_GRP_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_ADDRESS_GRP_ID,
                                view: "addressGroupGridView",
                                viewPathPrefix: "config/firewall/common/addressgroup/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: true
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return addressGroupGlobalListView;
});

