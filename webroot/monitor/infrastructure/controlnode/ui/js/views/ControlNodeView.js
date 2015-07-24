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
            this.renderView4Config(this.$el, null, getControlNodeListConfig());
        },
        renderControlNodeDetails : function (viewConfig) {
            this.renderView4Config(this.$el, null, getControlNodeDetails());
        }
    });

    function getControlNodeListConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.CONTROLNODE_SUMMARY_PAGE_ID]),
            view: "ControlNodeListView",
            viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    function getControlNodeDetails() {
        return {
            elementId: cowu.formatElementId([ctwl.CONTROLNODE_DETAILS_PAGE_ID]),
            view: "ControlNodeDetailsView",
            viewPathPrefix: ctwl.CONTROLNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return ControlNodeView;
});