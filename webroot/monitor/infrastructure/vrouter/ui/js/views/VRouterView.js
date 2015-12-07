/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterView = ContrailView.extend({
        el: $(contentContainer),
        renderVRouter: function (viewConfig) {
            this.renderView4Config(this.$el, null, getVRouterListConfig());
        },
        renderVRouterDetails : function (viewConfig) {
            this.renderView4Config(this.$el, null, getVRouterDetails());
        }
    });

    function getVRouterListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.VROUTER_SUMMARY_PAGE_ID]),
            view: "VRouterListView",
            viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    function getVRouterDetails() {
        return {
            elementId: cowu.formatElementId([ctwl.VROUTER_DETAILS_PAGE_ID]),
            view: "VRouterDetailsView",
            viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    return VRouterView;
});
