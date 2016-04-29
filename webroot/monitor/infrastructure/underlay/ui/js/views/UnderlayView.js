/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UnderlayView = ContrailView.extend({
        el: $(contentContainer),
        renderUnderlayPage: function (viewConfig) {
            this.renderView4Config(this.$el, null, getUnderlayConfig());
        }
    });
    function getUnderlayConfig() {
        return {
            elementId:
                cowu.formatElementId([ctwl.UNDERLAY_TOPOLOGY_PAGE_ID]),
            view: "UnderlayListView",
            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
            }
        };
    };
    return UnderlayView;
});
