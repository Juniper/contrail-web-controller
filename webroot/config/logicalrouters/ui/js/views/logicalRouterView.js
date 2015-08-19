/*
* Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
*/

define([
   'underscore',
   'backbone',
    'contrail-view'
], function (_, Backbone, ContrailView) {
        var self;
    var logicalRouterView = ContrailView.extend({
        el: $(contentContainer),
        renderLogicalRouter: function (viewConfig) {
            self = this,
            cowu.renderDomainProjectBreadcrumbDropDown
                                           (self.initProjectBreadCrumbCB);
        },
        initProjectBreadCrumbCB: function (selectedValueData) {
            self.renderProjectLRCB();
        },

        renderProjectLRCB: function() {
            self.renderView4Config
                 (this.$el, null, this.getLogicalRouter());
            return;
        },

        getLogicalRouter: function () {
            return {
                elementId: cowu.formatElementId(
                                [ctwl.CONFIG_LOGICAL_ROUTER_PAGE_ID]),
                view: "logicalRouterListView",
                viewPathPrefix : ctwc.URL_LR_VIEW_PATH_PREFIX,
                app: cowc.APP_CONTRAIL_CONTROLLER,
            }
        }
    });
    return logicalRouterView;
});