/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'contrail-view',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter'
], function (_, Backbone, ContrailListModel, ContrailView,
             RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var selectedProjectVal = ctwu.getGlobalVariable('project').uuid;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_ROUTING_POLICY_IN_CHUNKS,
                                      selectedProjectVal),
                        type: "GET"
                    },
                    dataParser: function(response){
                        return routingPolicyFormatter.routingPolicyDataParser(response);
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel,
                                   getRoutingPolicyListViewConfig());
        }
    });

    var getRoutingPolicyListViewConfig = function () {
        return {
            elementId:
              cowu.formatElementId([ctwl.CONFIG_ROUTING_POLICY_FORMAT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    ctwl.CONFIG_ROUTING_POLICY_LIST_VIEW_ID,
                                title: ctwl.CONFIG_ROUTING_POLICY_TITLE,
                                view: "routingPolicyGridView",
                                viewPathPrefix :
                                      ctwc.URL_ROUTING_POLICY_PATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentType: 'project',
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return RoutingPolicyListView;
});