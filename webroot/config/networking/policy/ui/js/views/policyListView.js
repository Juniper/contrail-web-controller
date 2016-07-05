/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'config/networking/policy/ui/js/models/policyModel',
    'contrail-view',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, Backbone, ContrailListModel, PolicyModel, ContrailView,
             PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var PoliciesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var selectedProjectVal = ctwu.getGlobalVariable('project').uuid;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_POLICIES_IN_CHUNKS,
                                      50, selectedProjectVal),
                        type: "GET"
                    },
                    dataParser: function(response){
                        return policyFormatters.PolicyDataParser(response);
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel,
                                   getPoliciesListViewConfig(selectedProjectVal));
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
                                viewPathPrefix :
                                      ctwc.URL_POLICIES_VIEW_PATH_PREFIX,
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