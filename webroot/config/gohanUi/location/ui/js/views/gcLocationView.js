/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var locationView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderLocation: function (viewConfig) {
            this.renderView4Config(this.$el, null, getLocationViewConfig(viewConfig));
        }
    });

    function getLocationViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_LOCATION_PAGE_ID]),
                view: "gcLocationListView",
                viewPathPrefix:
                    "config/gohanUi/location/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return locationView;
});
