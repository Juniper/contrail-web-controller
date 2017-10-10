/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var applicationPolicyView = ContrailView.extend({
        el: $(contentContainer),
        renderApplicationPolicy: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getApplicationPolicyConfig(viewConfig));
        }
    });

    function getApplicationPolicyConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getApplicationPolicy(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                                 customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getApplicationPolicy(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId:
                    cowu.formatElementId([ctwc.APPLICATION_POLICY_LIST_VIEW_ID]),
                view: "applicationPolicyProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/applicationpolicy/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return applicationPolicyView;
});

