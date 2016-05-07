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
        el: $(contentContainer),
        renderPolicies: function (viewConfig) {
            self = this,
            self.renderView4Config(self.$el, null,
                                   this.getPoliciesConfig(viewConfig));
        },
        getPoliciesConfig: function (viewConfig) {
            var hashParams = viewConfig.hashParams,
                customProjectDropdownOptions = {
                    config: true,
                    childView: {
                        init: this.getPolicies(viewConfig),
                    }/*,
                    allDropdownOption: ctwc.ALL_PROJECT_DROPDOWN_OPTION*/
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
        getPolicies: function (viewConfig) {
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
                                [ctwl.CONFIG_POLICIES_PAGE_ID]),
                view: "policyListView",
                viewPathPrefix : ctwc.URL_POLICIES_VIEW_PATH_PREFIX,
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: viewConfig
            }
            }
        }
    });
    return policyView;
});
