/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var vRouterCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_CFG_VROUTER_DETAILS),
                        type: "GET"
                    },
                    dataParser: ctwp.vRouterCfgDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getvRouterCfgListViewConfig());
        }
    });

    var getvRouterCfgListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VROUTER_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VROUTER_LIST_ID,
                                title: ctwl.CFG_VROUTER_TITLE,
                                view: "vRouterCfgGridView",
                                viewPathPrefix:
                                        "config/infra/vrouters/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return vRouterCfgListView;
});
