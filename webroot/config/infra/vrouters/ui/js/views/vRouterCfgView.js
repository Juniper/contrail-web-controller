/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var vRouterCfgView = ContrailView.extend({
        el: $(contentContainer),
        rendervRouterCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null, getvRouterCfgViewConfig());
        }
    });

    function getvRouterCfgViewConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VROUTER_PAGE_ID]),
            view: "vRouterCfgListView",
            viewPathPrefix:
                    "config/infra/vrouters/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return vRouterCfgView;
});
