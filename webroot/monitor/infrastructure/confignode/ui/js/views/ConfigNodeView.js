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
        }
    });

    function getConfigNodeConfig() {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIGNODE_SUMMARY_PAGE_ID]),
            view: "ConfigNodeListView",
            viewPathPrefix: "monitor/infrastructure/confignode/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        };
    };
    return ConfigNodeView;
});