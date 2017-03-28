/*
* Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
*/

define([
   'underscore',
   'backbone',
    'contrail-view'
], function (_, Backbone, ContrailView) {
        var self;
    var policyView = ContrailView.extend({
        el: $('#gohanGrid'),
        renderPolicies: function (viewConfig) {
            self = this;
            $('#gohan-config-role').show();
            self.renderView4Config(self.$el, null,
                                   this.getPolicies(viewConfig));
        },

        getPolicies: function (viewConfig) {
            return {
                elementId: cowu.formatElementId(
                                [ctwl.CONFIG_POLICIES_PAGE_ID]),
                view: "policyListView",
                viewPathPrefix : "config/gohanUi/ui/js/views/networkpolicy/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
        }
    });
    return policyView;
});
