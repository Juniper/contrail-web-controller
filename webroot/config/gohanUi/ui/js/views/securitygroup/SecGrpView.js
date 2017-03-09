/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SecGrpView = ContrailView.extend({
        el: $('#main-content'),
        renderSecGrp: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getSecGrp(viewConfig));
        }
    });

    function getSecGrp(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_PAGE_ID]),
                view: "SecGrpListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/gohanUi/ui/js/views/securitygroup/",
                viewConfig: viewConfig
            }
    };
    return SecGrpView;
});

