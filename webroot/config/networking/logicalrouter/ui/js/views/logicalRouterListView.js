/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'contrail-view',
    'config/networking/logicalrouter/ui/js/models/logicalRouterModel',
    'config/networking/logicalrouter/ui/js/views/logicalRouterFormatters'
], function (_, Backbone, ContrailListModel, ContrailView, LogicalRouterModel,
             logicalRouterFormatters) {
    var lRFormatters = new logicalRouterFormatters();
    var logicalRouterListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                selectedProjectValue = ctwu.getGlobalVariable('project').uuid;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_LOGICAL_ROUTER_IN_CHUNKS,
                                      50, selectedProjectValue),
                        type: "GET"
                    },
                    dataParser: lRFormatters.LogicalRouterDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel,
                                   getLogicalRouterListViewConfig());
        }
    });

    var getLogicalRouterListViewConfig = function () {
        return {
            elementId:
              cowu.formatElementId([ctwl.CONFIG_LOGICAL_ROUTER_FORMAT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    ctwl.CONFIG_LOGICAL_ROUTER_LIST_VIEW_ID,
                                title: ctwl.CONFIG_LOGICAL_ROUTER_TITLE,
                                view: "logicalRouterGridView",
                                viewPathPrefix :
                                       ctwc.URL_LOGICAL_ROUTER_VIEW_PATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                             parentType: 'project',
                                             pagerOptions: {
                                               options: {
                                                  pageSize: 10,
                                                  pageSizeSelect: [10, 50, 100]
                                                  }}
                                            }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return logicalRouterListView;
});