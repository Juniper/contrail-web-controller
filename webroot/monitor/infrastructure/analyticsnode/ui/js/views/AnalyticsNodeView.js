/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var AnalyticsNodeView = ContrailView.extend({
        el: $(contentContainer),
        renderAnalyticsNode: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getAnalyticsNodeConfig());
        }
    });

    function getAnalyticsNodeConfig() {
        return {
            elementId: cowu.formatElementId([
                ctwl.ANALYTICSNODE_SUMMARY_PAGE_ID]),
            view: "AnalyticsNodeListView",
            viewPathPrefix: "monitor/infrastructure/" +
                "analyticsnode/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return AnalyticsNodeView;
});