/*
* Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
*/

define([
   'underscore',
   'backbone',
    'contrail-view'
], function (_, Backbone, ContrailView) {
        var self;
    var portView = ContrailView.extend({
        el: $(contentContainer),

        renderPort: function (viewConfig) {
            self = this,
            this.renderView4Config(this.$el, null,
                                   this.getPortConfig(viewConfig));
        },
        getPortConfig: function (viewConfig) {
            var hashParams = viewConfig.hashParams,
                customProjectDropdownOptions = {
                    config: true,
                    childView: {
                        init: this.getPort(viewConfig),
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
        getPort: function (viewConfig) {
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
                                    [ctwl.CONFIG_PORT_PAGE_ID]),
                    view: "portListView",
                    viewPathPrefix : ctwc.URL_PORT_VIEW_PATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                }
            }
        }
    });
    return portView;
});
