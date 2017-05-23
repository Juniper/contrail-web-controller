/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var addressGroupProjectListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'address-groups',
                                parent_id: currentProject.value}]})
                    },
                    dataParser: self.parseAddressGroupsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getAddressGroupGridViewConfig());
        },
        parseAddressGroupsData : function(response){
            var dataItems = [],
                tagData = getValueByJsonPath(response, "0;address-groups", []);
                _.each(tagData, function(val){
                        if("address-group" in val) {
                            dataItems.push(val["address-group"]);
                        }
                }); 
            return dataItems;
        }
    });

    var getAddressGroupGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_TAG_ID,
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
                                    isGlobal: false                            
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return addressGroupProjectListView;
});

