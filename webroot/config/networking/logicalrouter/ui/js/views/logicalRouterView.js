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
            this.renderView4Config(this.$el, null,
                                   this.getLogicalRouterConfig(viewConfig));
        },
        getLogicalRouterConfig: function (viewConfig) {
            var hashParams = viewConfig.hashParams,
                customProjectDropdownOptions = {
                    config: true,
                    childView: {
                        init: this.getLogicalRouter(viewConfig),
                    }
                },
                customDomainDropdownOptions = {
                    childView: {
                        init: ctwvc.getProjectBreadcrumbDropdownViewConfig(
                                                hashParams,
                                                customProjectDropdownOptions)
                    }
                };
            return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                customDomainDropdownOptions)
        },
        getLogicalRouter: function (viewConfig) {
            return function (projectSelectedValueData) {
                var domain = {
                    'name':projectSelectedValueData.parentSelectedValueData.name,
                    'uuid':projectSelectedValueData.parentSelectedValueData.value,
                }
                var project = {
                    'name':projectSelectedValueData.name,
                    'uuid':projectSelectedValueData.value,
                }
                ctwu.setGlobalVariable("domain", domain);
                ctwu.setGlobalVariable("project", project);
                return {
                    elementId: cowu.formatElementId(
                                    [ctwl.CONFIG_LOGICAL_ROUTER_PAGE_ID]),
                    view: "logicalRouterListView",
                    viewPathPrefix : ctwc.URL_LOGICAL_ROUTER_VIEW_PATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                }
            }
        }
    });
    return logicalRouterView;
});
