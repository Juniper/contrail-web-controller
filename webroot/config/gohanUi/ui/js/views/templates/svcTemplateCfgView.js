/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var svcTemplateCfgView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderSvcTemplateCfg: function (viewConfig) {
            this.renderView4Config(this.$el, null,
                    getSvcTemplateCfgViewConfig(viewConfig));
        }
    });
    function getSvcTemplateCfgViewConfig(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CFG_IPAM_PAGE_ID]),
                view: "svcTemplateCfgListView",
                viewPathPrefix:
                    "config/gohanUi/ui/js/views/templates/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
    };
    return svcTemplateCfgView;
});
