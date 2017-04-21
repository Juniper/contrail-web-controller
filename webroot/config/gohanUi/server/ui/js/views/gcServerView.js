/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var serverView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderServer: function (viewConfig) {
            this.renderView4Config(this.$el, null, getServerViewConfig(viewConfig));
        }
    });

    function getServerViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_SERVER_PAGE_ID]),
                view: "gcServerListView",
                viewPathPrefix:
                    "config/gohanUi/server/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return serverView;
});
