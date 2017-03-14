/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'config/gohanUi/ui/js/models/policyModel',
    'contrail-view'
], function (_, Backbone, ContrailListModel, PolicyModel, ContrailView ) {
    var PoliciesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanRole');
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: './gohan_contrail/v1.0/tenant/network_policies?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                           type: "GET"
                       },
                       dataParser: ctwp.gohanNetworkPolicyDataParser
                   }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getPoliciesListViewConfig());
        }
    });

    var getPoliciesListViewConfig = function (selectedProjectVal) {
        return {
            elementId:
              cowu.formatElementId([ctwl.CONFIG_POLICY_FORMAT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    ctwl.CONFIG_POLICIES_LIST_VIEW_ID,
                                title: ctwl.CONFIG_POLICIES_TITLE,
                                view: "policyGridView",
                                viewPathPrefix : "config/gohanUi/ui/js/views/networkpolicy/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                             parentType: 'project',
                                             pagerOptions: {
                                               options: {
                                                  pageSize: 10,
                                                  pageSizeSelect: [10, 50, 100]
                                                  }},
                                             selectedProjId: selectedProjectVal
                                            }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return PoliciesListView;
});