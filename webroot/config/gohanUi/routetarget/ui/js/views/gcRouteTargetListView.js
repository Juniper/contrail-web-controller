/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var routeTargetListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_ROUTE_TARGET + ctwc.GOHAN_PARAM,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanRouteTargetParser
                    }
             };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getRouteTargetListViewConfig());
        }
    });
    var getRouteTargetListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_ROUTE_TARGET_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_ROUTE_TARGET_LIST_ID,
                                title: ctwl.CFG_ROUTE_TARGET_TITLE,
                                view: "gcRouteTargetGridView",
                                viewPathPrefix:
                                    "config/gohanUi/routetarget/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return routeTargetListView;
});
