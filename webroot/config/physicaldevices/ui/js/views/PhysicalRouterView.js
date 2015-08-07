/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigPhysicalRoutersView = ContrailView.extend({
        el: $(contentContainer),
        render : function (viewConfig) {
            this.renderView4Config(this.$el, null,
            getPhysicalRoutersListConfig());
        }
    });

    function getPhysicalRoutersListConfig() {
        return {
            elementId: cowu.formatElementId(
                [ctwl.CONFIG_PHYSICAL_ROUTERS_LIST_ID]),
            view: "PhysicalRouterListView",
            viewPathPrefix: "config/physicaldevices/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return ConfigPhysicalRoutersView;
});