/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigNodeView = ContrailView.extend({
        el: $(contentContainer),
        renderConfigNode: function (viewConfig) {
            this.renderView4Config(this.$el, null, getConfigNodeConfig());
        },
        renderConfigNodeDetails : function (viewConfig) {
            this.renderView4Config(this.$el, null, getConfigNodeDetails());
        }
    });

    function getConfigNodeConfig() {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIGNODE_SUMMARY_PAGE_ID]),
            view: "ConfigNodeListView",
            viewPathPrefix: ctwl.CONFIGNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    function getConfigNodeDetails() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIGNODE_DETAILS_PAGE_ID]),
            view: "ConfigNodeDetailsView",
            viewPathPrefix: ctwl.CONFIGNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };

    return ConfigNodeView;
});