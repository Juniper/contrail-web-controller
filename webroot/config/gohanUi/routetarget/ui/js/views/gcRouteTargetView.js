/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var routeTargetView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderRouteTarget: function (viewConfig) {
            this.renderView4Config(this.$el, null, getRouteTargetViewConfig(viewConfig));
        }
    });

    function getRouteTargetViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_ROUTE_TARGET_PAGE_ID]),
                view: "gcRouteTargetListView",
                viewPathPrefix:
                    "config/gohanUi/routetarget/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return routeTargetView;
});
