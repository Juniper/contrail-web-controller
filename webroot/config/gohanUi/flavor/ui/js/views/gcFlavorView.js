/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var flavorView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderFlavor: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlavorViewConfig(viewConfig));
        }
    });

    function getFlavorViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_FLAVOR_PAGE_ID]),
                view: "gcFlavorListView",
                viewPathPrefix:
                    "config/gohanUi/flavor/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return flavorView;
});
