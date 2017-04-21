/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var idPoolView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderIdPool: function (viewConfig) {
            this.renderView4Config(this.$el, null, getIdPoolViewConfig(viewConfig));
        }
    });

    function getIdPoolViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_ID_POOL_PAGE_ID]),
                view: "gcIdPoolListView",
                viewPathPrefix:
                    "config/gohanUi/idpool/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return idPoolView;
});
