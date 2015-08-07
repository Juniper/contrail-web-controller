/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var PhysicalDevicesView = ContrailView.extend({
        el: $(contentContainer),
        renderPhysicalRouters: function () {
            this.renderView4Config(this.$el, null, getPhysicalRoutersConfig());
        }
    });
    function getPhysicalRoutersConfig() {
        return {
            elementId:
                cowu.formatElementId([ctwl.CONFIG_PHYSICAL_ROUTERS_PAGE_ID]),
            view: "PhysicalRouterView",
            viewPathPrefix: "config/physicaldevices/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return PhysicalDevicesView;
});