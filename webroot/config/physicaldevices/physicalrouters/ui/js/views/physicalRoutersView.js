/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigPhysicalRoutersView = ContrailView.extend({
        el: $(contentContainer),
        renderPhysicalRouters : function (viewConfig) {
            this.renderView4Config(this.$el, null,
            getPhysicalRoutersListConfig());
        }
    });

    function getPhysicalRoutersListConfig() {
        return {
            elementId: cowu.formatElementId(
                [ctwl.CONFIG_PHYSICAL_ROUTERS_LIST_ID]),
            view: "physicalRoutersListView",
            viewPathPrefix:
                "config/physicaldevices/physicalrouters/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return ConfigPhysicalRoutersView;
});

