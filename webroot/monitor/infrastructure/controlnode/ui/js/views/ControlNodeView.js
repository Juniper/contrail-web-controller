/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ControlNodeView = ContrailView.extend({
        el: $(contentContainer),
        renderControlNode: function (viewConfig) {
            this.renderView4Config(this.$el, null, getControlNodeConfig());
        }
    });

    function getControlNodeConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.CONTROLNODE_SUMMARY_PAGE_ID]),
            view: "ControlNodeListView",
            viewPathPrefix: "monitor/infrastructure/controlnode/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return ControlNodeView;
});