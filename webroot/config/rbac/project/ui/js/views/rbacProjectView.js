/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var rbacProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderRBACProject: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getRBACProjectConfig(viewConfig));
        }
    });

    function getRBACProjectConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getRBACProjectListViewConfig(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(
                            hashParams, customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
            customDomainDropdownOptions)
    };

    function getRBACProjectListViewConfig(viewConfig) {
        return function (projectSelectedValueData) {
            return {
                elementId: cowu.formatElementId(
                        [ctwc.CONFIG_ROUTE_AGGREGATE_LIST_ID]),
                view: "rbacProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/rbac/project/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return rbacProjectView;
});

