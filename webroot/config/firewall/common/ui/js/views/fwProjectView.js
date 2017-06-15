/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var fwProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderFirewall: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getDomainProjectDetails(viewConfig));
        },
        renderProjectPolicyDetails: function(viewConfig) {
            var self = this,
            currentHashParams = layoutHandler.getURLHashParams(),
            policyName = currentHashParams.focusedElement.policy,
            projectDisplayName = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
            policyNameFormat;
            if(currentHashParams.focusedElement.isGlobal === "false"){
                policyNameFormat = policyName + " ("+projectDisplayName+")";
            }
            else{
                policyNameFormat = policyName;
            }
            console.log(currentHashParams.focusedElement.isGlobal);
            self.renderView4Config(self.$el, null,
                    getProjectPolicyDetails(viewConfig,policyNameFormat));
        }
    });

    function getDomainProjectDetails (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getSecurityTabsConfig(viewConfig),
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

    function getSecurityTabsConfig(viewConfig) {
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
            var newViewConfig =
                $.extend(true, {}, viewConfig,
                         {projectSelectedValueData: projectSelectedValueData});
            return {
                elementId: 'fw_project_tab_section_view',
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwc.GLOBAL_SECURITY_POLICY_TAB_ID,
                            view: 'TabsView',
                            viewConfig: getSecurityPolicyTabs(newViewConfig)
                        }]
                    }]
                }
            };
        }
    };

    function getProjectPolicyDetails(viewConfig,policyNameFormat){
        return {
            elementId: "fwrule-project-policy-page-id",
            view: "SectionView",
            viewConfig: {
                title: ctwc.FIREWALL_POLICY_HEADING + " : " + policyNameFormat,
                elementId: "fwrule-project-policy-page-tabs",
                rows: [{
                    columns: [{
                        elementId: "fwrule-project-policy-tab-id",
                        view: 'TabsView',
                        viewConfig: getfwRulePolicyTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getfwRulePolicyTabs(viewConfig){
        return {
            theme: 'default',
            active: 1,
            tabs: [{
               elementId: 'project_policy_info_tab',
               title: 'Policy Info',
               view: "fwPolicyInfoView",
               viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'fw-policy-Project-info');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           }, {
               elementId: 'project_policy_rules',
               title: 'Rules',
               view: "fwRuleProjectListView",
               viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
               app: cowc.APP_CONTRAIL_CONTROLLER,
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'Project_policy_rules_grid_id');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'project_permissions',
               title: 'Permissions',
               view: "fwPermissionView",
               viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + 'Project_permissions_grid_id');
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: false
               }
           }]
        };
    };
    function getSecurityPolicyTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
                elementId: 'fw_policy_tab',
                title: 'Firewall Policies',
                view: "fwPolicyProjectListView",
                viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                        var gridId = $('#' + ctwc.FW_POLICY_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                }
            },
            {
                elementId: 'application_policy_tab',
                title: 'Application Policy Sets',
                view: "applicationPolicyProjectListView",
                viewPathPrefix: "config/firewall/project/applicationpolicy/ui/js/views/",
                viewConfig: viewConfig,
                tabConfig: {
                    activate: function(event, ui) {
                        var gridId = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate: true
                }
            },
            {
               elementId: 'service_group_tab',
               title: 'Service Groups',
               view: "serviceGroupProjectListView",
               viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.SECURITY_POLICY_SERVICE_GRP_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }, {
               elementId: 'address_group_tab',
               title: 'Address Groups',
               view: "addressGroupProjectListView",
               viewPathPrefix: "config/firewall/project/addressgroup/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return fwProjectView;
});
