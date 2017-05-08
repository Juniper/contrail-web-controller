/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var vnCfgView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderNetwork: function (viewConfig) {
            this.renderView4Config(this.$el, null, getVNCfgViewConfig(viewConfig));
        }
    });

    function getVNCfgViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_VN_PAGE_ID]),
                view: "gcVnCfgListView",
                viewPathPrefix:
                    "config/gohanUi/networks/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return vnCfgView;
});
