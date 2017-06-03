/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fwPolicyProjectView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null,
                                   getFWPolicyProjectConfig(viewConfig));
        },
        renderFWRule: function(viewConfig) {
            var self = this;
            this.renderView4Config(self.$el, null,
                getFWRuleProjectConfig(viewConfig));
        }
    });

    function getFWRuleProjectConfig(viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_FW_RULE_LIST_VIEW_ID]),
            view: "fwRuleTabView",
            viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    };

    function getFWPolicyProjectConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getFWPolicyProject(viewConfig),
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

    function getFWPolicyProject(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
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
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_FW_POLICY_LIST_VIEW_ID]),
                view: "fwPolicyProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return fwPolicyProjectView;
});

