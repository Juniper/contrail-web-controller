/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/firewall/common/tag/ui/js/tagUtils'
], function (_, ContrailView, ContrailListModel, tagUtils) {
    var tagGlobalListView = ContrailView.extend({
        el: $(contentContainer),
        renderTagView: function () {
            var self = this;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'tags',fields: ['application_policy_set_back_refs','virtual_DNS_back_refs','service_instance_back_refs',
                                'logical_router_back_refs','virtual_machine_interface_back_refs','virtual_network_back_refs',
                                'network_policy_back_refs','route_table_back_refs',
                                'bgp_as_a_service_back_refs','security_group_back_refs','bgp_router_back_refs','service_template_back_refs']}]})
                    },
                    dataParser: self.parseTagData.bind(this),
                }
            };
            this.contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, this.contrailListModel, getTagGridViewConfig());
        },
        parseTagData : function(response){
            var dataItems = [],
                tagData = getValueByJsonPath(response, "0;tags", []);
                _.each(tagData, function(val){
                    if(val.tag.parent_uuid === undefined){
                        dataItems.push(val.tag);
                    }
                });
            dataItems = dataItems.sort(tagsComparator);
            tagUtils.fetchVMIDetails(dataItems, this.contrailListModel);
            return [];
        }
    });

    function tagsComparator(a,b) {
        return (a.name > b.name)? 1: -1;
    }

    var getTagGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_TAG_ID,
                                view: "tagGridView",
                                viewPathPrefix: "config/firewall/common/tag/ui/js/views/",
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

    return tagGlobalListView;
});

