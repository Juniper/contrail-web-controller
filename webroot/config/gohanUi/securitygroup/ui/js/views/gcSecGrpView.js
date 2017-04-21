/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SecGrpView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderSecGrp: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getSecGrp(viewConfig));
        }
    });

    function getSecGrp(viewConfig) {
        return {
                elementId: cowu.formatElementId([ctwl.CONFIG_SEC_GRP_PAGE_ID]),
                view: "gcSecGrpListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/gohanUi/securitygroup/ui/js/views/",
                viewConfig: viewConfig
            }
    };
    return SecGrpView;
});

