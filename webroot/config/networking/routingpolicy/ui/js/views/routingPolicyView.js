/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var SecGrpView = ContrailView.extend({
        el: $(contentContainer),
        renderRoutingPolicy: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getRoutingPolicyConfig(viewConfig));
        }
    });

    function getRoutingPolicyConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getRoutingPolicy(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(
                                                hashParams,
                                                customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(
                                                hashParams,
                                                customDomainDropdownOptions)
    };

    function getRoutingPolicy(viewConfig) {
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
                                         [ctwl.CONFIG_ROUTING_POLICY_PAGE_ID]
                                        ),
                view: "routingPolicyListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: ctwc.URL_ROUTING_POLICY_PATH_PREFIX,
                viewConfig: viewConfig
            }
        }
    };
    return SecGrpView;
});