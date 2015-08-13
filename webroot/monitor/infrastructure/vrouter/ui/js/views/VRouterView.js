/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterView = ContrailView.extend({
        el: $(contentContainer),
        renderVRouter: function (viewConfig) {
            this.renderView4Config(this.$el, null, getVRouterConfig());
        }
    });

    function getVRouterConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.VROUTER_SUMMARY_PAGE_ID]),
            view: "VRouterListView",
            viewPathPrefix: "monitor/infrastructure/vrouter/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return VRouterView;
});
