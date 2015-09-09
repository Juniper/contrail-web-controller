/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var GlobalConfigView = ContrailView.extend({
        el: $(contentContainer),
        renderGlobalConfig: function () {
            var self = this;
            self.renderView4Config(self.$el, null, getGlobalConfig());
        }
    });

    function getGlobalConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_GLOBAL_CONFIG_PAGE_ID]),
            view: "GlobalConfigListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
            viewConfig: {}
        }
    };
    return GlobalConfigView;
});
